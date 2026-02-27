/**
 * Build script for creating a standalone executable of Copilot Proxy GUI.
 *
 * Steps:
 *   0. Generate icon files              → build/icon.png, build/icon.ico
 *   1. Build the Vite frontend          → dist/
 *   2. Compile the proxy server via bun → build/copilot-proxy-server.exe
 *   3. Package with electron-builder    → release/
 *
 * Prerequisites:
 *   - copilot-proxy/ submodule must be initialized
 *   - bun must be installed
 *
 * Usage:
 *   npm run desktop:build
 */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const guiDir = path.resolve(__dirname, '..')
const buildDir = path.join(guiDir, 'build')

// Locate the proxy server source:
//   1. copilot-proxy/ submodule (standalone repo)
//   2. ../../ (apps/gui inside monorepo)
function findRepoRoot() {
  const submodule = path.resolve(guiDir, 'copilot-proxy')
  if (fs.existsSync(path.join(submodule, 'src', 'main.ts'))) return submodule
  const mono = path.resolve(guiDir, '..', '..')
  if (fs.existsSync(path.join(mono, 'src', 'main.ts'))) return mono
  console.error('ERROR: Cannot find proxy source (src/main.ts). Expected at copilot-proxy/ or ../../')
  process.exit(1)
}
const repoRoot = findRepoRoot()

// Ensure COMSPEC is set (can be lost in some environments)
if (!process.env.COMSPEC && process.platform === 'win32') {
  process.env.COMSPEC = path.join(process.env.SystemRoot || 'C:\\WINDOWS', 'system32', 'cmd.exe')
}

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', ...opts })
}

// ── 0. Ensure build dir exists ──────────────────────────────────────

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true })
}

// ── 0.5 Generate icon files ─────────────────────────────────────────

console.log('\n═══ Step 0: Generating icon files ═══')

run('node scripts/generate-icons.cjs', { cwd: guiDir })

// ── 1. Build the Vite frontend ──────────────────────────────────────

console.log('\n═══ Step 1: Building frontend (vite) ═══')

run('npx vite build', { cwd: guiDir })

// ── 2. Compile proxy server as standalone exe ───────────────────────

console.log('\n═══ Step 2: Compiling proxy server (bun build --compile) ═══')

const proxyOutPath = path.join(buildDir, 'copilot-proxy-server.exe')

run(
  `bun build --compile --target=bun-windows-x64 src/main.ts --outfile "${proxyOutPath}"`,
  { cwd: repoRoot },
)

if (!fs.existsSync(proxyOutPath)) {
  console.error('ERROR: Proxy exe was not created!')
  process.exit(1)
}

const sizeMB = (fs.statSync(proxyOutPath).size / 1024 / 1024).toFixed(1)
console.log(`  → ${proxyOutPath} (${sizeMB} MB)`)

// ── 3. Package with electron-builder ────────────────────────────────

console.log('\n═══ Step 3: Packaging with electron-builder ═══')

run('npx electron-builder --win --config electron-builder.yml', { cwd: guiDir })

console.log('\n═══ Build complete! Check release/ ═══')
