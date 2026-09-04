import { describe, it, expect } from 'vitest';
import en from '../locales/en.json';
import de from '../locales/de.json';

function getKeys(obj, prefix) {
    let keys = [];
    let currentPrefix = prefix ? prefix + '.' : '';
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getKeys(obj[key], currentPrefix + key));
        } else {
            keys.push(currentPrefix + key);
        }
    }
    return keys;
}

describe('Translation Keys Synchronization', () => {
    it('should have the exact same set of translation keys in English and German', () => {
        const enKeys = getKeys(en, '');
        const deKeys = getKeys(de, '');

        const missingInDe = enKeys.filter(function(key) { return !deKeys.includes(key); });
        const missingInEn = deKeys.filter(function(key) { return !enKeys.includes(key); });

        expect(missingInDe, 'Missing in DE: ' + missingInDe.join(', ')).toEqual([]);
        expect(missingInEn, 'Missing in EN: ' + missingInEn.join(', ')).toEqual([]);
    });
});
