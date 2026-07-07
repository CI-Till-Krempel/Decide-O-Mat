import { describe, it, expect } from 'vitest';
import NameGenerator from './NameGenerator';

describe('NameGenerator', () => {
    describe('generate', () => {
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

        it('should generate multiple names and maintain randomness', () => {
            const names = new Set();
            for (let i = 0; i < 50; i++) {
                names.add(NameGenerator.generate());
            }
            // With 140+ animals, generating 50 names should result in several distinct names.
            expect(names.size).toBeGreaterThan(1);
        });
    });

    describe('isGenerated', () => {
        it('should return true for valid generated names', () => {
            expect(NameGenerator.isGenerated('Anonymous Alpaca')).toBe(true);
            expect(NameGenerator.isGenerated('Anonymous Zebra')).toBe(true);
        });

        it('should return false for names not starting with "Anonymous "', () => {
            expect(NameGenerator.isGenerated('Alpaca')).toBe(false);
            expect(NameGenerator.isGenerated('John Doe')).toBe(false);
            expect(NameGenerator.isGenerated('Anonymous')).toBe(false);
        });

        it('should return false for invalid animal names', () => {
            expect(NameGenerator.isGenerated('Anonymous Unicorn')).toBe(false);
            expect(NameGenerator.isGenerated('Anonymous Dragon')).toBe(false);
        });

        it('should return false for falsy or empty values', () => {
            expect(NameGenerator.isGenerated('')).toBe(false);
            expect(NameGenerator.isGenerated(null)).toBe(false);
            expect(NameGenerator.isGenerated(undefined)).toBe(false);
        });
    });
});
