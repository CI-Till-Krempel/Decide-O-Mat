import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AUTO_GENERATED_HEADER = '// ⚠️ THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY. EDIT firebase-messaging-sw.template.js INSTEAD.\n';

/**
 * Replaces Firebase config placeholders in the template with environment variables.
 * Uses replaceAll to ensure all occurrences of each placeholder are replaced.
 *
 * @param {string} template - The service worker template content
 * @param {Record<string, string | undefined>} [env=process.env] - Environment variable map
 * @returns {{ content: string, missingKeys: string[] }}
 */
export function generateSwContent(template, env = process.env) {
    const replacements = {
        '__FIREBASE_API_KEY__': env.VITE_FIREBASE_API_KEY,
        '__FIREBASE_AUTH_DOMAIN__': env.VITE_FIREBASE_AUTH_DOMAIN,
        '__FIREBASE_PROJECT_ID__': env.VITE_FIREBASE_PROJECT_ID,
        '__FIREBASE_STORAGE_BUCKET__': env.VITE_FIREBASE_STORAGE_BUCKET,
        '__FIREBASE_MESSAGING_SENDER_ID__': env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        '__FIREBASE_APP_ID__': env.VITE_FIREBASE_APP_ID,
        '__FIREBASE_MEASUREMENT_ID__': env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    const missingKeys = [];
    let content = template;

    for (const [placeholder, value] of Object.entries(replacements)) {
        if (!value) {
            missingKeys.push(placeholder);
        }
        content = content.replaceAll(placeholder, value || '');
    }

    return {
        content: AUTO_GENERATED_HEADER + content,
        missingKeys,
    };
}

export function generateServiceWorker() {
    const envPath = path.resolve(__dirname, '../.env');
    const envLocalPath = path.resolve(__dirname, '../.env.local');

    dotenv.config({ path: envPath });
    dotenv.config({ path: envLocalPath, override: true });

    const templatePath = path.resolve(__dirname, '../public/firebase-messaging-sw.template.js');
    const outputPath = path.resolve(__dirname, '../public/firebase-messaging-sw.js');

    const template = fs.readFileSync(templatePath, 'utf8');
    const { content, missingKeys } = generateSwContent(template, process.env);

    if (missingKeys.length > 0) {
        console.warn('⚠️  [generate-sw.js] Missing environment variables for:', missingKeys.join(', '));
    }

    fs.writeFileSync(outputPath, content);
    console.log('✅ Service Worker generated successfully at:', outputPath);
}

// Run when executed directly from CLI or npm script
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
    generateServiceWorker();
}
