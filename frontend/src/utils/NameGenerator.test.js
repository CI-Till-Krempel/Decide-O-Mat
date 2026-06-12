import { describe, it, expect } from 'vitest';
import NameGenerator from './NameGenerator';

describe('NameGenerator', () => {
    it('generates a valid anonymous name', () => {
        const name = NameGenerator.generate();
        expect(name).toMatch(/^Anonymous [A-Z]/);
        expect(NameGenerator.isGenerated(name)).toBe(true);
    });

    it('identifies valid generated names', () => {
        expect(NameGenerator.isGenerated('Anonymous Bear')).toBe(true);
        expect(NameGenerator.isGenerated('Anonymous Zebra')).toBe(true);
    });

    it('rejects invalid or non-anonymous names', () => {
        expect(NameGenerator.isGenerated('Anonymous')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous Dragonfruit')).toBe(false);
        expect(NameGenerator.isGenerated('Bear')).toBe(false);
        expect(NameGenerator.isGenerated('')).toBe(false);
        expect(NameGenerator.isGenerated(null)).toBe(false);
        expect(NameGenerator.isGenerated(undefined)).toBe(false);
    });
});
