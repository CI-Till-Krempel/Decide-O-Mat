import { describe, it, expect, vi, afterEach } from 'vitest';
import { relativeTime } from './relativeTime';

describe('relativeTime', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns seconds for recent timestamps', () => {
        vi.spyOn(Date, 'now').mockReturnValue(30_000);
        const result = relativeTime(0, 'en');
        expect(result).toMatch(/30/);
        expect(result).toMatch(/sec|s/i);
    });

    it('returns minutes for timestamps over 60s ago', () => {
        vi.spyOn(Date, 'now').mockReturnValue(150_000);
        const result = relativeTime(0, 'en');
        expect(result).toMatch(/2/);
        expect(result).toMatch(/min|m/i);
    });

    it('returns hours for timestamps over 60min ago', () => {
        vi.spyOn(Date, 'now').mockReturnValue(7_200_000);
        const result = relativeTime(0, 'en');
        expect(result).toMatch(/2/);
        expect(result).toMatch(/hr|h/i);
    });

    it('returns days for timestamps over 24h ago', () => {
        vi.spyOn(Date, 'now').mockReturnValue(172_800_000);
        const result = relativeTime(0, 'en');
        expect(result).toMatch(/2/);
        expect(result).toMatch(/day|d/i);
    });

    it('accepts Date objects', () => {
        const now = 60_000;
        vi.spyOn(Date, 'now').mockReturnValue(now);
        const result = relativeTime(new Date(0), 'en');
        expect(result).toMatch(/1/);
        expect(result).toMatch(/min|m/i);
    });

    it('clamps future dates to 0 seconds', () => {
        vi.spyOn(Date, 'now').mockReturnValue(0);
        const result = relativeTime(10_000, 'en');
        expect(result).toMatch(/0/);
        expect(result).toMatch(/sec|s/i);
    });

    it('handles exact minute boundary', () => {
        vi.spyOn(Date, 'now').mockReturnValue(60_000);
        const result = relativeTime(0, 'en');
        expect(result).toMatch(/1/);
        expect(result).toMatch(/min|m/i);
    });

    it('handles exact hour boundary', () => {
        vi.spyOn(Date, 'now').mockReturnValue(3_600_000);
        const result = relativeTime(0, 'en');
        expect(result).toMatch(/1/);
        expect(result).toMatch(/hr|h/i);
    });

    it('handles exact day boundary', () => {
        vi.spyOn(Date, 'now').mockReturnValue(86_400_000);
        const result = relativeTime(0, 'en');
        expect(result).toMatch(/1/);
        expect(result).toMatch(/day|d/i);
    });
});
