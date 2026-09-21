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

// Mock HTMLCanvasElement for environments without canvas npm package installed (e.g., JSDOM in Vitest/CI)
if (typeof window !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = () => ({
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (x, y, w, h) => ({
            data: new Uint8ClampedArray(w * h * 4)
        }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
    });
    HTMLCanvasElement.prototype.toDataURL = () => '';
}
