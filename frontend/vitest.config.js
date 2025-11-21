import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                url: 'http://localhost:3000',
            },
        },
        setupFiles: './src/test/setup.js',
        include: ['**/*.test.{js,jsx,ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.config.js',
                '**/main.jsx',
            ],
        },
    },
    preview: {
        allowedHosts: true,
    },
});
