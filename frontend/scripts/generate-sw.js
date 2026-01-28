/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(currentDir, '../.env');
const envLocalPath = path.resolve(currentDir, '../.env.local');

dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.resolve(__dirname, '../public/firebase-messaging-sw.template.js');
const outputPath = path.resolve(__dirname, '../public/firebase-messaging-sw.js');

// Read template
let content = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders
const replacements = {
    '__FIREBASE_API_KEY__': process.env.VITE_FIREBASE_API_KEY,
    '__FIREBASE_AUTH_DOMAIN__': process.env.VITE_FIREBASE_AUTH_DOMAIN,
    '__FIREBASE_PROJECT_ID__': process.env.VITE_FIREBASE_PROJECT_ID,
    '__FIREBASE_STORAGE_BUCKET__': process.env.VITE_FIREBASE_STORAGE_BUCKET,
    '__FIREBASE_MESSAGING_SENDER_ID__': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    '__FIREBASE_APP_ID__': process.env.VITE_FIREBASE_APP_ID,
    '__FIREBASE_MEASUREMENT_ID__': process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let missingKeys = [];

for (const [placeholder, value] of Object.entries(replacements)) {
    if (!value) {
        missingKeys.push(placeholder);
    }
    content = content.replace(placeholder, value || '');
}

if (missingKeys.length > 0) {
    console.warn("⚠️  [generate-sw.js] Missing environment variables for:", missingKeys.join(", "));
}

// Add auto-generated warning
const warning = "// ⚠️ THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY. EDIT firebase-messaging-sw.template.js INSTEAD.\n";
content = warning + content;

// Write output
fs.writeFileSync(outputPath, content);

console.log('✅ Service Worker generated successfully at:', outputPath);
