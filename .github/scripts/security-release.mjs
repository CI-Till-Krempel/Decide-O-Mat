#!/usr/bin/env node
/**
 * Deterministic release helper for the Security Agent.
 *
 * Bumps the patch version of frontend + functions (package.json and
 * package-lock.json) and adds a CHANGELOG entry listing the merged security /
 * dependency PRs. Contains NO LLM logic on purpose: the release step must be
 * reproducible and must not be influenced by untrusted PR content beyond the
 * (sanitised) PR titles.
 *
 * Usage:
 *   node .github/scripts/security-release.mjs --merged merged.json [--root .] [--date YYYY-MM-DD]
 *
 * `merged.json` is an array of `{ "number": 123, "title": "..." }`.
 * Prints the new version (without leading "v") to stdout.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function bumpPatch(version) {
    const match = SEMVER.exec(String(version ?? ''));
    if (!match) {
        throw new Error(`Invalid version: "${version}"`);
    }
    const [, major, minor, patch] = match;
    return `${major}.${minor}.${Number(patch) + 1}`;
}

function detectIndent(text) {
    const match = /\n([ \t]+)"/.exec(text);
    return match ? match[1] : 2;
}

function serialize(obj, originalText) {
    const trailingNewline = originalText.endsWith('\n') ? '\n' : '';
    return JSON.stringify(obj, null, detectIndent(originalText)) + trailingNewline;
}

/**
 * Sets the top-level "version" of a package.json. Parsing + re-serialising
 * also collapses duplicate top-level keys (JSON.parse keeps the first key
 * position and the last value).
 */
export function setPackageVersion(text, newVersion) {
    const pkg = JSON.parse(text);
    pkg.version = newVersion;
    return serialize(pkg, text);
}

/** Sets the root version in a package-lock.json (top-level and packages[""]). */
export function setLockVersion(text, newVersion) {
    const lock = JSON.parse(text);
    lock.version = newVersion;
    if (lock.packages && lock.packages['']) {
        lock.packages[''].version = newVersion;
    }
    return serialize(lock, text);
}

/** Converts merged PRs into sanitised CHANGELOG bullet points. */
export function formatChangelogItems(prs) {
    return prs.map(({ number, title }) => {
        const n = Number(number);
        if (!Number.isInteger(n) || n <= 0) {
            throw new Error(`Invalid PR number: "${number}"`);
        }
        const cleanTitle = String(title ?? '')
            .replace(/[\r\n]+/g, ' ')
            .replace(/#{2,}/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return `- ${cleanTitle} (#${n})`;
    });
}

function trimEmptyLines(lines) {
    let start = 0;
    let end = lines.length;
    while (start < end && lines[start].trim() === '') start++;
    while (end > start && lines[end - 1].trim() === '') end--;
    return lines.slice(start, end);
}

/**
 * Creates a new release section from the current "Unreleased" section (everything
 * merged to main ships with the tag) and adds the given items under "### Security".
 */
export function addChangelogEntry(changelog, { version, date, items }) {
    if (!DATE.test(String(date))) {
        throw new Error(`Invalid date: "${date}"`);
    }
    const lines = changelog.split('\n');
    const unreleasedIdx = lines.findIndex((l) => /^## \[Unreleased\]\s*$/i.test(l));
    if (unreleasedIdx === -1) {
        throw new Error('No "## [Unreleased]" section found in CHANGELOG');
    }
    const escaped = version.replace(/\./g, '\\.');
    if (new RegExp(`^## \\[${escaped}\\]`, 'm').test(changelog)) {
        throw new Error(`Version ${version} already exists in CHANGELOG`);
    }

    let nextIdx = lines.findIndex((l, i) => i > unreleasedIdx && /^## \[/.test(l));
    if (nextIdx === -1) nextIdx = lines.length;

    const body = trimEmptyLines(lines.slice(unreleasedIdx + 1, nextIdx));
    const securityIdx = body.findIndex((l) => /^### Security\s*$/.test(l));

    if (securityIdx !== -1) {
        let end = securityIdx + 1;
        while (end < body.length && !/^### /.test(body[end])) end++;
        while (end > securityIdx + 1 && body[end - 1].trim() === '') end--;
        body.splice(end, 0, ...items);
    } else if (body.length > 0) {
        body.push('', '### Security', ...items);
    } else {
        body.push('### Security', ...items);
    }

    return [
        ...lines.slice(0, unreleasedIdx + 1),
        '',
        `## [${version}] - ${date}`,
        '',
        ...body,
        '',
        ...lines.slice(nextIdx),
    ].join('\n');
}

function main() {
    const { values } = parseArgs({
        options: {
            merged: { type: 'string' },
            root: { type: 'string', default: '.' },
            date: { type: 'string', default: new Date().toISOString().slice(0, 10) },
        },
    });
    if (!values.merged) {
        throw new Error('--merged <file> is required');
    }

    const merged = JSON.parse(readFileSync(values.merged, 'utf8'));
    if (!Array.isArray(merged) || merged.length === 0) {
        throw new Error('Merged PR list is empty – nothing to release');
    }

    const root = values.root;
    const frontendPkgPath = join(root, 'frontend', 'package.json');
    const currentVersion = JSON.parse(readFileSync(frontendPkgPath, 'utf8')).version;
    const newVersion = bumpPatch(currentVersion);

    for (const dir of ['frontend', 'functions']) {
        const pkgPath = join(root, dir, 'package.json');
        if (existsSync(pkgPath)) {
            writeFileSync(pkgPath, setPackageVersion(readFileSync(pkgPath, 'utf8'), newVersion));
        }
        const lockPath = join(root, dir, 'package-lock.json');
        if (existsSync(lockPath)) {
            writeFileSync(lockPath, setLockVersion(readFileSync(lockPath, 'utf8'), newVersion));
        }
    }

    const changelogPath = join(root, 'CHANGELOG.md');
    const changelog = readFileSync(changelogPath, 'utf8');
    writeFileSync(
        changelogPath,
        addChangelogEntry(changelog, {
            version: newVersion,
            date: values.date,
            items: formatChangelogItems(merged),
        }),
    );

    process.stdout.write(`${newVersion}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        main();
    } catch (err) {
        console.error(`security-release: ${err.message}`);
        process.exit(1);
    }
}
