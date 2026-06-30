import { describe, it, expect } from 'vitest';
import { generateUUID } from './uuid';

describe('generateUUID', () => {
    it('should generate a string', () => {
        const id = generateUUID();
        expect(id).toBeTypeOf('string');
    });

    it('should match the standard UUID v4 format pattern', () => {
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        for (let i = 0; i < 100; i++) {
            const id = generateUUID();
            expect(id).toMatch(uuidV4Regex);
        }
    });

    it('should generate unique IDs across multiple invocations', () => {
        const ids = new Set();
        const iterations = 1000;
        for (let i = 0; i < iterations; i++) {
            ids.add(generateUUID());
        }
        expect(ids.size).toBe(iterations);
    });
});
