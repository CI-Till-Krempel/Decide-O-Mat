import { describe, it, expect } from 'vitest';
import NameGenerator from './NameGenerator';

describe('NameGenerator', () => {
    it('should generate a string starting with "Anonymous "', () => {
        const name = NameGenerator.generate();
        expect(name).toBeTypeOf('string');
        expect(name.startsWith('Anonymous ')).toBe(true);
    });

    it('should generate a name with a valid animal from the list', () => {
        const name = NameGenerator.generate();
        const animal = name.replace('Anonymous ', '');
        expect(animal).toBeTruthy();
        expect(NameGenerator.isGenerated(name)).toBe(true);
    });

    it('should return true for valid generated names in isGenerated', () => {
        expect(NameGenerator.isGenerated('Anonymous Bear')).toBe(true);
        expect(NameGenerator.isGenerated('Anonymous Zebra')).toBe(true);
    });

    it('should return false for invalid names in isGenerated', () => {
        expect(NameGenerator.isGenerated(null)).toBe(false);
        expect(NameGenerator.isGenerated(undefined)).toBe(false);
        expect(NameGenerator.isGenerated('')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous Dragon_fruit')).toBe(false);
        expect(NameGenerator.isGenerated('Bear')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous ')).toBe(false);
        expect(NameGenerator.isGenerated('Anonymous BEAR')).toBe(false);
    });

    it('should generate different random names across multiple runs', () => {
        const names = new Set();
        for (let i = 0; i < 50; i++) {
            names.add(NameGenerator.generate());
        }
        expect(names.size).toBeGreaterThan(1);
    });
});
