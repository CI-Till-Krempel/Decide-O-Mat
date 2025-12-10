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
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
let appEnv = process.env.VITE_APP_ENV;

if (!appEnv && projectId) {
  if (projectId.includes('staging')) {
    appEnv = 'Staging';
  } else if (projectId.includes('prod') || projectId === 'decide-o-mat') {
    appEnv = 'Production';
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    'process.env.VITE_APP_ENV': JSON.stringify(appEnv || 'Local'), // Inject detected env
  },
  preview: {
    allowedHosts: true,
  },
})
