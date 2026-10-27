import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
    parseDependabotTitle,
    semverDiff,
    checksGreen,
    evaluatePr,
    selectMerges,
} from './security-merge-gate.mjs';

const greenChecks = [
    { __typename: 'CheckRun', name: 'Verify PR', status: 'COMPLETED', conclusion: 'SUCCESS' },
    { __typename: 'CheckRun', name: 'e2ee-audit', status: 'COMPLETED', conclusion: 'SUCCESS' },
    { __typename: 'CheckRun', name: 'review', status: 'COMPLETED', conclusion: 'SKIPPED' },
];

function pr(overrides = {}) {
    return {
        number: 101,
        title: 'Bump vite from 7.1.0 to 7.1.2 in /frontend',
        author: { login: 'app/dependabot', is_bot: true },
        isDraft: false,
        mergeable: 'MERGEABLE',
        headRefOid: 'abc123',
        statusCheckRollup: greenChecks,
        ...overrides,
    };
}

const ctx = {
    devDependencies: {
        '/frontend': ['eslint', 'vitest'],
        '/functions': ['eslint'],
    },
};

describe('parseDependabotTitle', () => {
    test('parses single dependency bumps with directory', () => {
        assert.deepEqual(parseDependabotTitle('Bump vite from 7.1.0 to 7.1.2 in /frontend'), {
            kind: 'single', dependency: 'vite', from: '7.1.0', to: '7.1.2', directory: '/frontend',
        });
    });

    test('parses root-level (github-actions) bumps without directory', () => {
        assert.deepEqual(parseDependabotTitle('Bump actions/checkout from 6 to 7'), {
            kind: 'single', dependency: 'actions/checkout', from: '6', to: '7', directory: '/',
        });
    });

    test('parses conventional-commit prefixed and scoped package titles', () => {
        assert.deepEqual(parseDependabotTitle('build(deps-dev): bump @eslint/js from 10.0.1 to 10.1.0 in /functions'), {
            kind: 'single', dependency: '@eslint/js', from: '10.0.1', to: '10.1.0', directory: '/functions',
        });
    });

    test('parses grouped updates', () => {
        assert.deepEqual(parseDependabotTitle('Bump the frontend-minor-patch group in /frontend with 5 updates'), {
            kind: 'group', group: 'frontend-minor-patch', directory: '/frontend',
        });
        assert.deepEqual(parseDependabotTitle('Bump the actions-minor-patch group across 1 directory with 2 updates'), {
            kind: 'group', group: 'actions-minor-patch', directory: null,
        });
        assert.deepEqual(parseDependabotTitle('Bump the actions-minor-patch group with 2 updates'), {
            kind: 'group', group: 'actions-minor-patch', directory: null,
        });
    });

    test('returns null for unrelated titles', () => {
        assert.equal(parseDependabotTitle('Fix: something'), null);
    });
});

describe('semverDiff', () => {
    test('classifies patch, minor, major', () => {
        assert.equal(semverDiff('7.1.0', '7.1.2'), 'patch');
        assert.equal(semverDiff('7.1.0', '7.2.0'), 'minor');
        assert.equal(semverDiff('7.1.0', '8.0.0'), 'major');
        assert.equal(semverDiff('6', '7'), 'major');
        assert.equal(semverDiff('v4.1', 'v4.2'), 'minor');
    });

    test('treats 0.x minor bumps as major (breaking by semver convention)', () => {
        assert.equal(semverDiff('0.14.0', '0.15.0'), 'major');
        assert.equal(semverDiff('0.14.0', '0.14.1'), 'patch');
    });

    test('returns unknown for downgrades, equal or unparsable versions', () => {
        assert.equal(semverDiff('7.1.2', '7.1.0'), 'unknown');
        assert.equal(semverDiff('7.1.0', '7.1.0'), 'unknown');
        assert.equal(semverDiff('abc', '1.0.0'), 'unknown');
        assert.equal(semverDiff('1.0.0', '1.0.1-rc.1'), 'unknown');
    });
});

describe('checksGreen', () => {
    test('true when all checks succeeded or were skipped/neutral', () => {
        assert.equal(checksGreen(greenChecks), true);
        assert.equal(checksGreen([{ __typename: 'StatusContext', state: 'SUCCESS' }]), true);
    });

    test('false when empty, pending or failed', () => {
        assert.equal(checksGreen([]), false);
        assert.equal(checksGreen(undefined), false);
        assert.equal(checksGreen([{ __typename: 'CheckRun', status: 'IN_PROGRESS', conclusion: '' }]), false);
        assert.equal(checksGreen([{ __typename: 'CheckRun', status: 'COMPLETED', conclusion: 'FAILURE' }]), false);
        assert.equal(checksGreen([{ __typename: 'StatusContext', state: 'PENDING' }]), false);
    });
});

describe('evaluatePr', () => {
    test('accepts a green, mergeable patch bump approved by the agent', () => {
        const result = evaluatePr(pr(), { ...ctx, approved: new Set([101]) });
        assert.deepEqual(result, { number: 101, eligible: true, reasons: [] });
    });

    test('requires agent approval', () => {
        const result = evaluatePr(pr(), { ...ctx, approved: new Set() });
        assert.equal(result.eligible, false);
        assert.match(result.reasons.join(), /not approved by agent/);
    });

    test('rejects PRs not authored by dependabot', () => {
        const result = evaluatePr(pr({ author: { login: 'mallory', is_bot: false } }), { ...ctx, approved: new Set([101]) });
        assert.equal(result.eligible, false);
        assert.match(result.reasons.join(), /dependabot/);
    });

    test('accepts the dependabot[bot] login variant', () => {
        const result = evaluatePr(pr({ author: { login: 'dependabot[bot]' } }), { ...ctx, approved: new Set([101]) });
        assert.equal(result.eligible, true);
    });

    test('rejects drafts, non-mergeable and red PRs', () => {
        const approved = new Set([101]);
        assert.equal(evaluatePr(pr({ isDraft: true }), { ...ctx, approved }).eligible, false);
        assert.equal(evaluatePr(pr({ mergeable: 'CONFLICTING' }), { ...ctx, approved }).eligible, false);
        assert.equal(evaluatePr(pr({ mergeable: 'UNKNOWN' }), { ...ctx, approved }).eligible, false);
        assert.equal(evaluatePr(pr({ statusCheckRollup: [] }), { ...ctx, approved }).eligible, false);
    });

    test('rejects major bumps of runtime dependencies', () => {
        const result = evaluatePr(pr({ title: 'Bump react from 19.0.0 to 20.0.0 in /frontend' }), { ...ctx, approved: new Set([101]) });
        assert.equal(result.eligible, false);
        assert.match(result.reasons.join(), /major/);
    });

    test('accepts major bumps of dev dependencies', () => {
        const result = evaluatePr(pr({ title: 'Bump eslint from 10.10.0 to 11.0.0 in /frontend' }), { ...ctx, approved: new Set([101]) });
        assert.equal(result.eligible, true);
    });

    test('rejects major bumps of GitHub Actions', () => {
        const result = evaluatePr(pr({ title: 'Bump actions/checkout from 7 to 8' }), { ...ctx, approved: new Set([101]) });
        assert.equal(result.eligible, false);
    });

    test('accepts minor-patch groups and rejects other groups', () => {
        const approved = new Set([101]);
        assert.equal(evaluatePr(pr({ title: 'Bump the frontend-minor-patch group in /frontend with 5 updates' }), { ...ctx, approved }).eligible, true);
        assert.equal(evaluatePr(pr({ title: 'Bump the npm_and_yarn group across 1 directory with 3 updates' }), { ...ctx, approved }).eligible, false);
    });

    test('rejects unparsable titles', () => {
        const result = evaluatePr(pr({ title: 'Update stuff' }), { ...ctx, approved: new Set([101]) });
        assert.equal(result.eligible, false);
    });
});

describe('selectMerges', () => {
    test('returns eligible PRs in ascending order, capped by max', () => {
        const prs = [pr({ number: 5 }), pr({ number: 3 }), pr({ number: 4, mergeable: 'CONFLICTING' }), pr({ number: 7 })];
        const result = selectMerges(prs, { ...ctx, approved: new Set([3, 4, 5, 7]), max: 2 });
        assert.deepEqual(result.merge.map((m) => m.number), [3, 5]);
        assert.deepEqual(result.merge[0], { number: 3, headRefOid: 'abc123', title: pr().title });
        const skippedNumbers = result.skipped.map((s) => s.number).sort();
        assert.deepEqual(skippedNumbers, [4, 7]);
        assert.match(result.skipped.find((s) => s.number === 7).reasons.join(), /limit/);
    });
});
