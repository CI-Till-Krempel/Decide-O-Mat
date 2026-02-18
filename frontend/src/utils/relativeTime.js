/**
 * Returns a simple relative time string (e.g. "2m", "3h").
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} Relative time string
 */
export function relativeTime(date) {
    const now = Date.now();
    const timestamp = date instanceof Date ? date.getTime() : date;
    const diffMs = now - timestamp;
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

    if (diffSeconds < 60) return `${diffSeconds}s`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
}
