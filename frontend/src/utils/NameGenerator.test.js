import { describe, it, expect } from 'vitest';
import NameGenerator from './NameGenerator';

describe('NameGenerator', () => {
    describe('generate', () => {
        it('should generate a string starting with Anonymous', () => {
            const name = NameGenerator.generate();
            expect(typeof name).toBe('string');
            expect(name.startsWith('Anonymous ')).toBe(true);
        });

        it('should generate names that are recognized as generated', () => {
            const name = NameGenerator.generate();
            expect(NameGenerator.isGenerated(name)).toBe(true);
        });
    });

    describe('isGenerated', () => {
        it('should return true for generated names', () => {
            expect(NameGenerator.isGenerated('Anonymous Alpaca')).toBe(true);
            expect(NameGenerator.isGenerated('Anonymous Wolf')).toBe(true);
        });

        it('should return false for custom/unrecognized names', () => {
            expect(NameGenerator.isGenerated('John Doe')).toBe(false);
            expect(NameGenerator.isGenerated('Anonymous Human')).toBe(false);
            expect(NameGenerator.isGenerated('Anonymous ')).toBe(false);
            expect(NameGenerator.isGenerated('')).toBe(false);
            expect(NameGenerator.isGenerated(null)).toBe(false);
            expect(NameGenerator.isGenerated(undefined)).toBe(false);
        });
    });
});
