import { describe, it, expect } from 'vitest';
import { generateUUID } from './uuid';

describe('generateUUID', () => {
    it('should generate a string', () => {
        const uuid = generateUUID();
        expect(typeof uuid).toBe('string');
    });

    it('should match UUID v4 pattern', () => {
        const uuid = generateUUID();
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(uuid).toMatch(uuidV4Regex);
    });

    it('should generate unique values', () => {
        const uuids = new Set();
        for (let i = 0; i < 100; i++) {
            uuids.add(generateUUID());
        }
        expect(uuids.size).toBe(100);
    });
});
