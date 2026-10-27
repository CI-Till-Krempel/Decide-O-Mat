#!/usr/bin/env node
/**
 * Deterministic merge gate for the Security Agent.
 *
 * The Gemini agent only *proposes* which Dependabot PRs are simple fixes
 * (decisions.json). This gate re-validates every proposal against hard rules
 * before anything is merged, so a hallucination or a prompt injection hidden
 * in upstream release notes cannot cause an unsafe merge.
 *
 * Rules (all must hold):
 *  - authored by Dependabot, not a draft, mergeable, all checks green
 *  - title is a recognised Dependabot title
 *  - single update: patch/minor; major only for devDependencies (never for GitHub Actions)
 *  - grouped update: group name ends with "-minor-patch"
 *  - approved by the agent
 *  - at most `max` merges per run
 *
 * Usage:
 *   node .github/scripts/security-merge-gate.mjs --prs prs.json --decisions decisions.json [--root .] [--max 5]
 * Prints `{ "merge": [...], "skipped": [...] }` to stdout.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const DEPENDABOT_LOGINS = new Set(['app/dependabot', 'dependabot[bot]', 'dependabot']);
const OK_CONCLUSIONS = new Set(['SUCCESS', 'SKIPPED', 'NEUTRAL']);
const SAFE_DIR = /^\/[\w.-]+(\/[\w.-]+)*$/;

export function parseDependabotTitle(title) {
    const clean = String(title ?? '')
        .trim()
        .replace(/^\[Security\]\s*/i, '')
        .replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, '');

    const group = /^bump the (\S+) group (?:in (\S+) |across \d+ director(?:y|ies) )?with \d+ updates?$/i.exec(clean);
    if (group) {
        return { kind: 'group', group: group[1], directory: group[2] ?? null };
    }

    const single = /^bump (\S+) from (\S+) to (\S+?)(?: in (\S+))?$/i.exec(clean);
    if (single) {
        return {
            kind: 'single',
            dependency: single[1],
            from: single[2],
            to: single[3],
            directory: single[4] ?? '/',
        };
    }
    return null;
}

function parseVersion(v) {
    const clean = String(v ?? '').replace(/^v/i, '');
    if (!/^\d+(\.\d+){0,2}$/.test(clean)) return null;
    const parts = clean.split('.').map(Number);
    while (parts.length < 3) parts.push(0);
    return parts;
}

/** Returns 'major' | 'minor' | 'patch' | 'unknown'. 0.x minor bumps count as major. */
export function semverDiff(from, to) {
    const a = parseVersion(from);
    const b = parseVersion(to);
    if (!a || !b) return 'unknown';

    for (let i = 0; i < 3; i++) {
        if (b[i] > a[i]) {
            if (i === 0) return 'major';
            if (i === 1) return a[0] === 0 ? 'major' : 'minor';
            return 'patch';
        }
        if (b[i] < a[i]) return 'unknown';
    }
    return 'unknown';
}

export function checksGreen(rollup) {
    if (!Array.isArray(rollup) || rollup.length === 0) return false;
    return rollup.every((check) => {
        if (check.__typename === 'CheckRun') {
            return check.status === 'COMPLETED' && OK_CONCLUSIONS.has(check.conclusion);
        }
        if (check.__typename === 'StatusContext') {
            return check.state === 'SUCCESS';
        }
        return false;
    });
}

export function evaluatePr(pr, { approved = new Set(), devDependencies = {} } = {}) {
    const reasons = [];

    if (!DEPENDABOT_LOGINS.has(pr.author?.login)) reasons.push('author is not dependabot');
    if (pr.isDraft) reasons.push('is a draft');
    if (pr.mergeable !== 'MERGEABLE') reasons.push(`mergeable state is ${pr.mergeable}`);
    if (!checksGreen(pr.statusCheckRollup)) reasons.push('checks are not all green');

    const parsed = parseDependabotTitle(pr.title);
    if (!parsed) {
        reasons.push('unrecognised Dependabot title');
    } else if (parsed.kind === 'group') {
        if (!/-minor-patch$/.test(parsed.group)) {
            reasons.push(`group "${parsed.group}" is not a minor-patch group`);
        }
    } else {
        const diff = semverDiff(parsed.from, parsed.to);
        if (diff === 'unknown') {
            reasons.push(`unrecognised version change ${parsed.from} -> ${parsed.to}`);
        } else if (diff === 'major') {
            if (parsed.directory === '/') {
                reasons.push('major update in root directory (GitHub Actions)');
            } else if (!(devDependencies[parsed.directory] ?? []).includes(parsed.dependency)) {
                reasons.push('major update of a runtime dependency');
            }
        }
    }

    if (!approved.has(pr.number)) reasons.push('not approved by agent');

    return { number: pr.number, eligible: reasons.length === 0, reasons };
}

export function selectMerges(prs, { approved = new Set(), devDependencies = {}, max = 5 } = {}) {
    const merge = [];
    const skipped = [];
    const sorted = [...prs].sort((a, b) => a.number - b.number);

    for (const pr of sorted) {
        const result = evaluatePr(pr, { approved, devDependencies });
        if (!result.eligible) {
            skipped.push({ number: pr.number, title: pr.title, reasons: result.reasons });
        } else if (merge.length >= max) {
            skipped.push({ number: pr.number, title: pr.title, reasons: [`merge limit of ${max} reached`] });
        } else {
            merge.push({ number: pr.number, headRefOid: pr.headRefOid, title: pr.title });
        }
    }
    return { merge, skipped };
}

function readJson(path, fallback) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return fallback;
    }
}

function loadDevDependencies(root, prs) {
    const dirs = new Set();
    for (const pr of prs) {
        const parsed = parseDependabotTitle(pr.title);
        if (parsed?.directory && parsed.directory !== '/' && SAFE_DIR.test(parsed.directory)) {
            dirs.add(parsed.directory);
        }
    }
    const result = {};
    for (const dir of dirs) {
        const pkgPath = join(root, dir, 'package.json');
        if (existsSync(pkgPath)) {
            result[dir] = Object.keys(readJson(pkgPath, {}).devDependencies ?? {});
        }
    }
    return result;
}

function main() {
    const { values } = parseArgs({
        options: {
            prs: { type: 'string' },
            decisions: { type: 'string' },
            root: { type: 'string', default: '.' },
            max: { type: 'string', default: '5' },
        },
    });
    if (!values.prs) throw new Error('--prs <file> is required');

    const prs = readJson(values.prs, []);
    // Fail safe: a missing or malformed decisions file means "approve nothing".
    const decisions = values.decisions ? readJson(values.decisions, {}) : {};
    const approved = new Set(
        (Array.isArray(decisions.approve) ? decisions.approve : [])
            .map((d) => Number(typeof d === 'object' ? d?.number : d))
            .filter(Number.isInteger),
    );
    const max = Math.max(0, Number.parseInt(values.max, 10) || 0);

    const result = selectMerges(prs, {
        approved,
        devDependencies: loadDevDependencies(values.root, prs),
        max,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        main();
    } catch (err) {
        console.error(`security-merge-gate: ${err.message}`);
        process.exit(1);
    }
}
