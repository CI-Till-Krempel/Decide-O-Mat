/**
 * Utility functions for clipboard operations
 */

/**
 * Escapes HTML characters in a string to prevent XSS.
 * @param {string} unsafe The unsanitized string.
 * @returns {string} The sanitized HTML-safe string.
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Copies a link to the clipboard using rich text HTML, falling back to plain text URL.
 * It sanitizes the inputs to prevent XSS vulnerabilities.
 * 
 * @param {string} url The raw URL to be shared.
 * @param {string} title The decision title.
 * @param {string|null} creator The name of the creator (or null if unknown).
 * @returns {Promise<void>}
 */
export async function copyRichLink(url, title, creator) {
    try {
        const safeTitle = escapeHtml(title);
        const safeCreator = creator ? escapeHtml(creator) : null;
        
        const authorPartHtml = safeCreator ? ` (by ${safeCreator})` : '';
        const authorPartText = creator ? ` (by ${creator})` : '';
        
        const shareHtml = `<a href="${url}">${safeTitle}${authorPartHtml}</a>`;
        const shareText = `${title}${authorPartText}\n${url}`;

        const blobHtml = new Blob([shareHtml], { type: 'text/html' });
        const blobText = new Blob([shareText], { type: 'text/plain' });

        const data = [new window.ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
        })];

        await navigator.clipboard.write(data);
    } catch (err) {
        console.warn("Rich text copy failed, falling back to basic text copy.", err);
        await navigator.clipboard.writeText(url);
    }
}
