/**
 * Returns a localized relative time string (e.g. "2 min. ago", "3 hr. ago").
 * @param {Date|number|string} date - Date object, timestamp, or date string
 * @param {string} [locale] - BCP 47 locale string; defaults to browser locale
 * @returns {string} Relative time string
 */
export function relativeTime(date, locale) {
    if (date === null || date === undefined) return '';

    let timestamp;
    if (date instanceof Date) {
        timestamp = date.getTime();
    } else if (typeof date === 'string') {
        timestamp = new Date(date).getTime();
    } else {
        timestamp = Number(date);
    }

    if (isNaN(timestamp)) {
        return '';
    }

    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'narrow' });

    if (diffSeconds < 60) return rtf.format(-diffSeconds, 'second');

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');

    const diffDays = Math.floor(diffHours / 24);
    return rtf.format(-diffDays, 'day');
}
