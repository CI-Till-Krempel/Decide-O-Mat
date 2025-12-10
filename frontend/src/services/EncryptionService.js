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

// Helper to convert base64url to base64
const base64UrlToBase64 = (base64Url) => {
    return base64Url.replace(/-/g, '+').replace(/_/g, '/');
};

// Helper to convert base64 to base64url
const base64ToBase64Url = (base64) => {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const EncryptionService = {
    isEnabled: () => {
        return import.meta.env.VITE_ENABLE_ENCRYPTION === 'true';
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

            const fullBuffer = base64ToArrayBuffer(encryptedBase64);
            const fullArray = new Uint8Array(fullBuffer);

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
            // Fail safe: return null or throw?
            // If we can't decrypt, showing garbage is bad.
            // Throwing allows UI to handle "Decryption Failed"
            throw new Error("Decryption failed");
        }
    }
};

export default EncryptionService;
