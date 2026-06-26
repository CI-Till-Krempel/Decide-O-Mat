import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateUUID } from './uuid';

describe('generateUUID', () => {
    let originalCrypto;

    beforeEach(() => {
        originalCrypto = globalThis.crypto;
    });

    afterEach(() => {
        try {
            Object.defineProperty(globalThis, 'crypto', {
                value: originalCrypto,
                configurable: true,
                writable: true
            });
        } catch {
            // Fallback if redefine fails
        }
        vi.restoreAllMocks();
    });

    it('generates a valid UUID v4 format', () => {
        const uuid = generateUUID();
        // Regex for UUID v4
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(uuid).toMatch(uuidV4Regex);
    });

    it('uses globalThis.crypto.randomUUID when available', () => {
        const mockRandomUUID = vi.fn().mockReturnValue('11111111-2222-4333-8444-555555555555');
        
        Object.defineProperty(globalThis, 'crypto', {
            value: { randomUUID: mockRandomUUID },
            configurable: true,
            writable: true
        });

        const result = generateUUID();
        expect(mockRandomUUID).toHaveBeenCalledTimes(1);
        expect(result).toBe('11111111-2222-4333-8444-555555555555');
    });

    it('falls back to crypto.getRandomValues when randomUUID is not available', () => {
        const mockGetRandomValues = vi.fn().mockImplementation((arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        });

        Object.defineProperty(globalThis, 'crypto', {
            value: { getRandomValues: mockGetRandomValues },
            configurable: true,
            writable: true
        });

        const result = generateUUID();
        expect(mockGetRandomValues).toHaveBeenCalled();
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(result).toMatch(uuidV4Regex);
    });

    it('falls back to Math.random when crypto is completely unavailable', () => {
        Object.defineProperty(globalThis, 'crypto', {
            value: undefined,
            configurable: true,
            writable: true
        });

        const spyMath = vi.spyOn(Math, 'random');

        const result = generateUUID();
        expect(spyMath).toHaveBeenCalled();
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(result).toMatch(uuidV4Regex);
    });
});
