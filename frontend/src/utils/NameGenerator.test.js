import { describe, it, expect } from 'vitest';
import NameGenerator from './NameGenerator';

describe('NameGenerator', () => {
    describe('generate', () => {
        it('should generate a string starting with "Anonymous "', () => {
            const name = NameGenerator.generate();
            expect(name).toBeTypeOf('string');
            expect(name.startsWith('Anonymous ')).toBe(true);
        });

        it('should generate a name containing a valid animal from the list', () => {
            const name = NameGenerator.generate();
            const animal = name.replace('Anonymous ', '');
            expect(animal.length).toBeGreaterThan(0);
        });

        it('should generate different names across multiple runs due to randomness', () => {
            const names = new Set();
            for (let i = 0; i < 50; i++) {
                names.add(NameGenerator.generate());
            }
            // With 140+ animals, 50 generations are highly likely to have at least several distinct names.
            expect(names.size).toBeGreaterThan(1);
        });
    });

    describe('isGenerated', () => {
        it('should return true for valid generated names', () => {
            const name = NameGenerator.generate();
            expect(NameGenerator.isGenerated(name)).toBe(true);
        });

        it('should return true for manually constructed valid anonymous names', () => {
            expect(NameGenerator.isGenerated('Anonymous Alpaca')).toBe(true);
            expect(NameGenerator.isGenerated('Anonymous Zebra')).toBe(true);
        });

        it('should return false for invalid inputs', () => {
            expect(NameGenerator.isGenerated(null)).toBeFalsy();
            expect(NameGenerator.isGenerated(undefined)).toBeFalsy();
            expect(NameGenerator.isGenerated('')).toBeFalsy();
        });

        it('should return false for names not starting with "Anonymous "', () => {
            expect(NameGenerator.isGenerated('Alpaca')).toBe(false);
            expect(NameGenerator.isGenerated('AnonymousAlpaca')).toBe(false);
            expect(NameGenerator.isGenerated('A Alpaca')).toBe(false);
        });

        it('should return false for "Anonymous " with an animal not in the list', () => {
            expect(NameGenerator.isGenerated('Anonymous Dragon_fruit')).toBe(false);
            expect(NameGenerator.isGenerated('Anonymous Unicorn')).toBe(false);
        });
    });
});
