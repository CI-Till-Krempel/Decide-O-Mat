const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// Convert Base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};



const KEYS_STORAGE_KEY = 'dom_decision_keys';

const EncryptionService = {
    isEnabled: () => import.meta.env.VITE_ENABLE_ENCRYPTION === 'true',

    // Cache key for a decision (persisted locally)
    saveKey: async (decisionId, callback) => {
        // Key is CryptoKey, we need to export it to string to save
        if (!decisionId || !callback) return;
        try {
            // We assume the key is passed as cryptoKey. But wait, importKey returns CryptoKey.
            // Let's change signature: saveKey(decisionId, keyString)
            // Actually, better to save the RAW STRING from URL to avoid export overhead/issues.
            // Caller (Decision.jsx) has the string from URL.
        } catch (e) {
            console.error("Failed to save key", e);
        }
    },

    // Improved implementation below
    storeKey: (decisionId, keyString) => {
        try {
            const store = JSON.parse(localStorage.getItem(KEYS_STORAGE_KEY) || '{}');
            store[decisionId] = keyString;
            localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(store));
        } catch (e) {
            console.warn("Failed to store key", e);
        }
    },

    getStoredKey: async (decisionId) => {
        try {
            const store = JSON.parse(localStorage.getItem(KEYS_STORAGE_KEY) || '{}');
            const keyString = store[decisionId];
            if (keyString) {
                return await EncryptionService.importKey(keyString);
            }
        } catch (e) {
            console.warn("Failed to get stored key", e);
        }
        return null;
    },

    getStoredKeyString: (decisionId) => {
        try {
            const store = JSON.parse(localStorage.getItem(KEYS_STORAGE_KEY) || '{}');
            return store[decisionId] || null;
        } catch (e) {
            console.warn("Failed to get stored key string", e);
            return null;
        }
    },

    generateKey: async () => {
        try {
            return await window.crypto.subtle.generateKey(
                {
                    name: ALGORITHM,
                    length: KEY_LENGTH
                },
                true,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Error generating key:', error);
            throw error;
        }
    },

    exportKey: async (key) => {
        try {
            const exported = await window.crypto.subtle.exportKey('jwk', key);
            // We only need the 'k' parameter (the secret key material)
            // But 'k' is base64url encoded.
            // Let's just return the 'k' value as the key string
            // as it is compact.
            return exported.k;
        } catch (error) {
            console.error('Error exporting key:', error);
            throw error;
        }
    },

    importKey: async (keyString) => {
        try {
            if (!keyString) throw new Error("Key string is empty");

            return await window.crypto.subtle.importKey(
                'jwk',
                {
                    k: keyString,
                    alg: "A256GCM",
                    ext: true,
                    key_ops: ["encrypt", "decrypt"],
                    kty: "oct"
                },
                {
                    name: ALGORITHM,
                    length: KEY_LENGTH
                },
                true,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Error importing key:', error);
            throw error;
        }
    },

    encrypt: async (text, key) => {
        try {
            if (!text) return text;
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            // AES-GCM needs a unique IV (Initialization Vector) for each encryption
            // standard size is 12 bytes (96 bits)
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: ALGORITHM,
                    iv: iv
                },
                key,
                data
            );

            // Combine IV and Ciphertext: IV + Ciphertext
            const resultBuffer = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
            resultBuffer.set(iv, 0);
            resultBuffer.set(new Uint8Array(encryptedBuffer), iv.byteLength);

            return arrayBufferToBase64(resultBuffer.buffer);
        } catch (error) {
            console.error('Error encrypting data:', error);
            throw error;
        }
    },

    decrypt: async (encryptedBase64, key) => {
        try {
            if (!encryptedBase64) return encryptedBase64;

            // Check for unencrypted "Deleted" names from backend
            if (typeof encryptedBase64 === 'string' && encryptedBase64.startsWith('Deleted ')) {
                return encryptedBase64;
            }

            let fullBuffer;
            try {
                fullBuffer = base64ToArrayBuffer(encryptedBase64);
            } catch {
                // Not valid base64, likely plaintext
                return encryptedBase64;
            }

            const fullArray = new Uint8Array(fullBuffer);

            // Sanity check: IV (12) + Tag (16) = 28 bytes minimum
            if (fullArray.byteLength < 28) {
                return encryptedBase64; // Return as-is, likely plaintext
            }

            // Extract IV (first 12 bytes)
            const iv = fullArray.slice(0, 12);
            // Extract Ciphertext (rest)
            const ciphertext = fullArray.slice(12);

            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: ALGORITHM,
                    iv: iv
                },
                key,
                ciphertext
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Error decrypting data:', error);
            // If actual decryption (crypto.subtle) fails, it might be due to wrong key.
            // In that case, we probably SHOULD throw or return a fallback, 
            // but returning raw encrypted data is useless/ugly.
            // However, sticking to the requested behavior of not crashing:
            throw new Error("Decryption failed");
        }
    }
};

export default EncryptionService;
