import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Service Worker & Notification Configuration (Issue #406)', () => {
    it('contains notificationclick handler and data url handling in sw template', () => {
        const templatePath = path.resolve(__dirname, '../../public/firebase-messaging-sw.template.js');
        const content = fs.readFileSync(templatePath, 'utf8');

        expect(content).toContain("self.addEventListener('notificationclick'");
        expect(content).toContain('event.notification.close()');
        expect(content).toContain('event.notification.data?.url');
        expect(content).toContain('clients.matchAll');
        expect(content).toContain('client.focus()');
        expect(content).toContain('clients.openWindow');
    });

    it('contains notificationclick handler in generated firebase-messaging-sw.js', () => {
        const swPath = path.resolve(__dirname, '../../public/firebase-messaging-sw.js');
        if (fs.existsSync(swPath)) {
            const content = fs.readFileSync(swPath, 'utf8');
            expect(content).toContain("self.addEventListener('notificationclick'");
            expect(content).toContain('event.notification.close()');
        }
    });
});
