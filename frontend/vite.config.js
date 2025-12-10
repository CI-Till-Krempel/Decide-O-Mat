import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
// Use env var if present (CI), otherwise git (local)
// Try to get commit hash from multiple sources including Cloud Build default vars
let commitHash = process.env.VITE_COMMIT_HASH || process.env.COMMIT_SHA || process.env.SHORT_SHA || process.env.GITHUB_SHA

// DEBUG: Log for troubleshooting App Hosting build environment
console.log('--- VITE BUILD DEBUG ---');
console.log('VITE_APP_ENV:', process.env.VITE_APP_ENV);
console.log('COMMIT_SHA:', process.env.COMMIT_SHA);
console.log('SHORT_SHA:', process.env.SHORT_SHA);
console.log('Detected commitHash:', commitHash);
console.log('------------------------');

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
