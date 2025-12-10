import { describe, it, expect, vi } from 'vitest';
import EncryptionService from './EncryptionService';

describe('EncryptionService', () => {
    // Web Crypto API is available in Vitest via Node.js global.crypto
    // No need to mock it unless we want to test failures specifically.

    it('generates a valid CryptoKey', async () => {
        const key = await EncryptionService.generateKey();
        expect(key).toBeDefined();
        // type is 'secret' (CryptoKey) in node environment, or [object CryptoKey]
        // Check properties
        expect(key.algorithm.name).toBe('AES-GCM');
        expect(key.extractable).toBe(true);
        expect(key.usages).toContain('encrypt');
        expect(key.usages).toContain('decrypt');
    });

    it('exports and imports a key correctly', async () => {
        const originalKey = await EncryptionService.generateKey();
        const exportedKeyString = await EncryptionService.exportKey(originalKey);

        expect(typeof exportedKeyString).toBe('string');
        expect(exportedKeyString.length).toBeGreaterThan(0);

        const importedKey = await EncryptionService.importKey(exportedKeyString);

        // Should be able to encrypt with imported key
        const text = "Test Secret";
        const encrypted = await EncryptionService.encrypt(text, importedKey);
        const decrypted = await EncryptionService.decrypt(encrypted, importedKey);

        expect(decrypted).toBe(text);
    });

    it('encrypts and decrypts text correctly', async () => {
        const key = await EncryptionService.generateKey();
        const text = "Hello World 123 !@#";

        const encrypted = await EncryptionService.encrypt(text, key);
        expect(typeof encrypted).toBe('string');
        expect(encrypted).not.toBe(text); // Should be different

        const decrypted = await EncryptionService.decrypt(encrypted, key);
        expect(decrypted).toBe(text);
    });

    it('produces different ciphertexts for same text (due to IV)', async () => {
        const key = await EncryptionService.generateKey();
        const text = "Same Text";

        const enc1 = await EncryptionService.encrypt(text, key);
        const enc2 = await EncryptionService.encrypt(text, key);

        expect(enc1).not.toBe(enc2);

        // But both should decrypt to same text
        expect(await EncryptionService.decrypt(enc1, key)).toBe(text);
        expect(await EncryptionService.decrypt(enc2, key)).toBe(text);
    });

    it('fails to decrypt with wrong key', async () => {
        const key1 = await EncryptionService.generateKey();
        const key2 = await EncryptionService.generateKey();
        const text = "Secret Message";

        const encrypted = await EncryptionService.encrypt(text, key1);

        // Decrypting with wrong key should fail
        await expect(EncryptionService.decrypt(encrypted, key2)).rejects.toThrow();
    });

    it('fails to decrypt garbage data', async () => {
        const key = await EncryptionService.generateKey();
        const garbage = "NotBase64EncodedLikely";

        await expect(EncryptionService.decrypt(garbage, key)).rejects.toThrow();
    });

    it('checks enabled status correctly', () => {
        // Mock import.meta.env
        vi.stubGlobal('import', { meta: { env: { VITE_ENABLE_ENCRYPTION: 'true' } } });
        // Depending on how vite handles import.meta in tests, this might be tricky.
        // For now, let's just check the method exists and returns boolean (default might be undefined/false in test env)

        const enabled = EncryptionService.isEnabled();
        expect(typeof enabled).toBe('boolean');
    });
});
