import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify('1.6.7'),
        __COMMIT_HASH__: JSON.stringify('test-hash'),
        __APP_ENV__: JSON.stringify('Test'),
    },
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
