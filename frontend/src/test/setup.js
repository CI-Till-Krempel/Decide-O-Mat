import '@testing-library/jest-dom';

// Mock localStorage
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }

    get length() {
        return Object.keys(this.store).length;
    }

    key(index) {
        const keys = Object.keys(this.store);
        return keys[index] || null;
    }
}

globalThis.localStorage = new LocalStorageMock();

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: () => Promise.resolve(),
    },
    writable: true,
    configurable: true,
});
