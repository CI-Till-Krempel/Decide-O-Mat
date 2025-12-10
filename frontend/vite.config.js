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
    console.warn('Could not determine commit hash (git failed and VITE_COMMIT_HASH not set)')
    commitHash = 'unknown'
  }
}

// DEBUG: Log for troubleshooting App Hosting build environment
console.log('--- VITE BUILD DEBUG ---');
console.log('Available Env Keys:', Object.keys(process.env).sort().join(', '));
console.log('VITE_APP_ENV:', process.env.VITE_APP_ENV);
console.log('GCLOUD_PROJECT:', process.env.GCLOUD_PROJECT);
console.log('GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
console.log('Final commitHash:', commitHash);
console.log('------------------------');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  preview: {
    allowedHosts: true,
  },
})
