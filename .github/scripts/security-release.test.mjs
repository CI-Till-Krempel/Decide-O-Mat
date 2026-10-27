import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
    bumpPatch,
    setPackageVersion,
    setLockVersion,
    formatChangelogItems,
    addChangelogEntry,
} from './security-release.mjs';

describe('bumpPatch', () => {
    test('increments the patch component', () => {
        assert.equal(bumpPatch('2.0.0'), '2.0.1');
        assert.equal(bumpPatch('1.6.9'), '1.6.10');
    });

    test('accepts a leading v and returns without it', () => {
        assert.equal(bumpPatch('v2.3.4'), '2.3.5');
    });

    test('rejects non-semver input', () => {
        assert.throws(() => bumpPatch('2.0'), /Invalid version/);
        assert.throws(() => bumpPatch('2.0.0-beta.1'), /Invalid version/);
        assert.throws(() => bumpPatch(''), /Invalid version/);
    });
});

describe('setPackageVersion', () => {
    test('updates the version and preserves 2-space indentation + trailing newline', () => {
        const input = '{\n  "name": "frontend",\n  "version": "2.0.0",\n  "private": true\n}\n';
        const out = setPackageVersion(input, '2.0.1');
        assert.equal(out, '{\n  "name": "frontend",\n  "version": "2.0.1",\n  "private": true\n}\n');
    });

    test('preserves 4-space indentation', () => {
        const input = '{\n    "name": "functions",\n    "version": "2.0.0"\n}\n';
        const out = setPackageVersion(input, '2.0.1');
        assert.equal(out, '{\n    "name": "functions",\n    "version": "2.0.1"\n}\n');
    });

    test('collapses duplicate top-level version keys into one', () => {
        const input = '{\n    "name": "functions",\n    "version": "2.0.0",\n    "private": true,\n    "version": "1.6.7"\n}\n';
        const out = setPackageVersion(input, '2.0.1');
        assert.equal((out.match(/"version"/g) || []).length, 1);
        assert.equal(JSON.parse(out).version, '2.0.1');
    });

    test('does not touch nested version fields', () => {
        const input = '{\n  "version": "1.0.0",\n  "engines": { "version": "x" }\n}\n';
        const parsed = JSON.parse(setPackageVersion(input, '1.0.1'));
        assert.equal(parsed.version, '1.0.1');
        assert.equal(parsed.engines.version, 'x');
    });
});

describe('setLockVersion', () => {
    test('updates top-level and root package version only', () => {
        const lock = {
            name: 'frontend',
            version: '2.0.0',
            lockfileVersion: 3,
            packages: {
                '': { name: 'frontend', version: '2.0.0' },
                'node_modules/foo': { version: '2.0.0' },
            },
        };
        const out = JSON.parse(setLockVersion(JSON.stringify(lock, null, 2) + '\n', '2.0.1'));
        assert.equal(out.version, '2.0.1');
        assert.equal(out.packages[''].version, '2.0.1');
        assert.equal(out.packages['node_modules/foo'].version, '2.0.0');
    });
});

describe('formatChangelogItems', () => {
    test('formats merged PRs as bullet points with PR references', () => {
        const items = formatChangelogItems([
            { number: 12, title: 'Bump vite from 7.1.0 to 7.1.2 in /frontend' },
            { number: 15, title: 'Bump actions/checkout from 6 to 7' },
        ]);
        assert.deepEqual(items, [
            '- Bump vite from 7.1.0 to 7.1.2 in /frontend (#12)',
            '- Bump actions/checkout from 6 to 7 (#15)',
        ]);
    });

    test('strips newlines and markdown headings from titles', () => {
        const items = formatChangelogItems([{ number: 1, title: 'Bump x\n## [9.9.9] evil' }]);
        assert.equal(items.length, 1);
        assert.ok(!items[0].includes('\n'));
        assert.ok(!items[0].includes('##'));
    });

    test('rejects invalid PR numbers', () => {
        assert.throws(() => formatChangelogItems([{ number: 'abc', title: 'x' }]), /Invalid PR number/);
    });
});

describe('addChangelogEntry', () => {
    const base = [
        '# Changelog',
        '',
        '## [Unreleased]',
        '',
        '## [2.0.0] - 2026-09-15',
        '',
        '### Added',
        '- Something',
        '',
    ].join('\n');

    test('inserts a new version section with a Security subsection below Unreleased', () => {
        const out = addChangelogEntry(base, {
            version: '2.0.1',
            date: '2026-10-28',
            items: ['- Bump vite (#12)'],
        });
        const expected = [
            '# Changelog',
            '',
            '## [Unreleased]',
            '',
            '## [2.0.1] - 2026-10-28',
            '',
            '### Security',
            '- Bump vite (#12)',
            '',
            '## [2.0.0] - 2026-09-15',
            '',
            '### Added',
            '- Something',
            '',
        ].join('\n');
        assert.equal(out, expected);
    });

    test('moves existing Unreleased content into the new release', () => {
        const withUnreleased = base.replace(
            '## [Unreleased]\n',
            '## [Unreleased]\n\n### Fixed\n- A bug (#9)\n',
        );
        const out = addChangelogEntry(withUnreleased, {
            version: '2.0.1',
            date: '2026-10-28',
            items: ['- Bump vite (#12)'],
        });
        assert.ok(out.includes('## [Unreleased]\n\n## [2.0.1] - 2026-10-28\n\n### Fixed\n- A bug (#9)\n\n### Security\n- Bump vite (#12)\n\n## [2.0.0]'));
    });

    test('appends to an existing Security subsection in Unreleased', () => {
        const withSecurity = base.replace(
            '## [Unreleased]\n',
            '## [Unreleased]\n\n### Security\n- Existing fix (#3)\n\n### Fixed\n- A bug (#9)\n',
        );
        const out = addChangelogEntry(withSecurity, {
            version: '2.0.1',
            date: '2026-10-28',
            items: ['- Bump vite (#12)'],
        });
        assert.ok(out.includes('### Security\n- Existing fix (#3)\n- Bump vite (#12)\n\n### Fixed\n- A bug (#9)\n'));
        assert.equal((out.match(/### Security/g) || []).length, 1);
    });

    test('throws if there is no Unreleased section', () => {
        assert.throws(
            () => addChangelogEntry('# Changelog\n', { version: '1.0.1', date: '2026-10-28', items: ['- x'] }),
            /Unreleased/,
        );
    });

    test('throws if the version already exists', () => {
        assert.throws(
            () => addChangelogEntry(base, { version: '2.0.0', date: '2026-10-28', items: ['- x'] }),
            /already exists/,
        );
    });

    test('rejects an invalid date', () => {
        assert.throws(
            () => addChangelogEntry(base, { version: '2.0.1', date: '28.10.2026', items: ['- x'] }),
            /Invalid date/,
        );
    });
});
