import { describe, it, expect } from 'vitest';
import NameGenerator from './NameGenerator';

describe('NameGenerator', () => {
    it('generates a name starting with Anonymous followed by a valid animal name', () => {
        const name = NameGenerator.generate();
        expect(name).toMatch(/^Anonymous [A-Z]/);
        expect(NameGenerator.isGenerated(name)).toBe(true);
    });

    it('identifies generated names correctly', () => {
        expect(NameGenerator.isGenerated('Anonymous Alpaca')).toBe(true);
        expect(NameGenerator.isGenerated('Anonymous Zebra')).toBe(true);
    });

    it('returns false for non-generated names', () => {
        expect(NameGenerator.isGenerated('John Doe')).toBe(false);
        expect(NameGenerator.isGenerated('')).toBe(false);
        expect(NameGenerator.isGenerated(null)).toBe(false);
        expect(NameGenerator.isGenerated(undefined)).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous DragonSlayer')).toBe(false);
    });
});
