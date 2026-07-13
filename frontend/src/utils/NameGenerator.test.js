import { describe, it, expect } from 'vitest';
import NameGenerator from './NameGenerator';

describe('NameGenerator', () => {
    it('generates a string starting with Anonymous', () => {
        const name = NameGenerator.generate();
        expect(name).toBeTypeOf('string');
        expect(name.startsWith('Anonymous ')).toBe(true);
    });

    it('identifies generated names correctly', () => {
        const name = NameGenerator.generate();
        expect(NameGenerator.isGenerated(name)).toBe(true);
    });

    it('rejects names that do not start with Anonymous', () => {
        expect(NameGenerator.isGenerated('John Doe')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous')).toBe(false);
        expect(NameGenerator.isGenerated('')).toBe(false);
    });

    it('rejects names that start with Anonymous but have an animal not in the list', () => {
        expect(NameGenerator.isGenerated('Anonymous Pokeball')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous Superbeast')).toBe(false);
    });

    it('safely handles null and undefined', () => {
        expect(NameGenerator.isGenerated(null)).toBe(false);
        expect(NameGenerator.isGenerated(undefined)).toBe(false);
    });

    it('safely handles non-string data types', () => {
        expect(NameGenerator.isGenerated(123)).toBe(false);
        expect(NameGenerator.isGenerated(true)).toBe(false);
        expect(NameGenerator.isGenerated({})).toBe(false);
        expect(NameGenerator.isGenerated([])).toBe(false);
    });
});
