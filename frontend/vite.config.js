import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
// Use env var if present (CI), otherwise git (local)
// Try to get commit hash from multiple sources including Cloud Build default vars
let commitHash = process.env.VITE_COMMIT_HASH || process.env.COMMIT_SHA || process.env.SHORT_SHA || process.env.GITHUB_SHA

// 1. Try version.json (generated in CI for Cloud Build - deprecated but kept for compat)
if (!commitHash) {
  try {
    const versionJson = JSON.parse(fs.readFileSync('./version.json', 'utf-8'))
    if (versionJson.commitHash) {
      commitHash = versionJson.commitHash
    }
  } catch {
    // version.json optional
  }
}

// 2. Try git (local dev)
if (!commitHash) {
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    // Git failed and no env var set. This happens in App Hosting remote builds.
    commitHash = 'unknown'
  }
}

// 3. Fallback Environment Detection
// App Hosting doesn't always inject VITE_APP_ENV from apphosting.staging.yaml if the env mapping is ambiguous.
// We fallback to inferring from the Project ID which IS available.
// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // 1. Local Development Override
  // If running via `vite` (dev server), explicitly set to Development
  if (command === 'serve') {
    return {
      plugins: [react()],
      define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
        __COMMIT_HASH__: JSON.stringify(commitHash),
        __APP_ENV__: JSON.stringify('Development'),
      },
      preview: { allowedHosts: true },
    }
  }

  // 2. Build / Production Logic
  // Fallback Environment Detection for App Hosting
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
  let appEnv = process.env.VITE_APP_ENV;

  if (!appEnv && projectId) {
    if (projectId.includes('staging')) {
      appEnv = 'Staging';
    } else if (projectId.includes('prod') || projectId === 'decide-o-mat') {
      appEnv = 'Production';
    }
  }

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __APP_ENV__: JSON.stringify(appEnv || 'Local'),
      // Enable encryption ONLY in Production
      'import.meta.env.VITE_ENABLE_ENCRYPTION': JSON.stringify(appEnv === 'Production' ? 'true' : 'false'),
    },
    preview: { allowedHosts: true },
  }
})
