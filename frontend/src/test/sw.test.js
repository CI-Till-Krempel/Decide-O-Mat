import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSwContent, AUTO_GENERATED_HEADER } from '../../scripts/generate-sw.js';

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

    describe('generateSwContent placeholder replacement', () => {
        it('replaces all placeholders when all environment variables are present', () => {
            const template = 'apiKey: "__FIREBASE_API_KEY__", auth: "__FIREBASE_AUTH_DOMAIN__", project: "__FIREBASE_PROJECT_ID__", bucket: "__FIREBASE_STORAGE_BUCKET__", sender: "__FIREBASE_MESSAGING_SENDER_ID__", app: "__FIREBASE_APP_ID__", measure: "__FIREBASE_MEASUREMENT_ID__"';
            const mockEnv = {
                VITE_FIREBASE_API_KEY: 'test-api-key',
                VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
                VITE_FIREBASE_PROJECT_ID: 'test-project',
                VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
                VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
                VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef',
                VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST1234',
            };

            const result = generateSwContent(template, mockEnv);

            expect(result.missingKeys).toEqual([]);
            expect(result.content.startsWith(AUTO_GENERATED_HEADER)).toBe(true);
            expect(result.content).toContain('apiKey: "test-api-key"');
            expect(result.content).toContain('auth: "test.firebaseapp.com"');
            expect(result.content).toContain('project: "test-project"');
            expect(result.content).toContain('bucket: "test-project.appspot.com"');
            expect(result.content).toContain('sender: "123456789"');
            expect(result.content).toContain('app: "1:123456789:web:abcdef"');
            expect(result.content).toContain('measure: "G-TEST1234"');
            expect(result.content).not.toContain('__FIREBASE_');
        });

        it('replaces multiple occurrences of the same placeholder via replaceAll', () => {
            const template = 'project1: "__FIREBASE_PROJECT_ID__", project2: "__FIREBASE_PROJECT_ID__"';
            const mockEnv = {
                VITE_FIREBASE_PROJECT_ID: 'multi-test-project',
            };

            const result = generateSwContent(template, mockEnv);

            expect(result.content).toContain('project1: "multi-test-project", project2: "multi-test-project"');
            expect(result.content).not.toContain('__FIREBASE_PROJECT_ID__');
        });

        it('identifies missing environment variables and substitutes empty string', () => {
            const template = 'key: "__FIREBASE_API_KEY__", auth: "__FIREBASE_AUTH_DOMAIN__"';
            const mockEnv = {
                VITE_FIREBASE_API_KEY: 'present-key',
            };

            const result = generateSwContent(template, mockEnv);

            expect(result.missingKeys).toContain('__FIREBASE_AUTH_DOMAIN__');
            expect(result.missingKeys).toContain('__FIREBASE_PROJECT_ID__');
            expect(result.content).toContain('key: "present-key"');
            expect(result.content).toContain('auth: ""');
        });

        it('handles empty string environment values as missing keys', () => {
            const template = 'key: "__FIREBASE_API_KEY__"';
            const mockEnv = {
                VITE_FIREBASE_API_KEY: '',
            };

            const result = generateSwContent(template, mockEnv);

            expect(result.missingKeys).toContain('__FIREBASE_API_KEY__');
            expect(result.content).toContain('key: ""');
        });
    });
});
