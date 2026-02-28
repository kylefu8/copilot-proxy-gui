/**
 * Build script for creating a standalone executable of Copilot Proxy GUI.
 *
 * Steps:
 *   0. Generate icon files              → build/icon.png, build/icon.ico
 *   1. Build the Vite frontend          → dist/
 *   2. Compile the proxy server via bun → build/copilot-proxy-server[.exe]
 *   3. Package with electron-builder    → release/
 *
 * Prerequisites:
 *   - copilot-proxy/ submodule must be initialized
 *   - bun must be installed
 *
 * Supported platforms: Windows (win32), macOS (darwin)
 *
 * Usage:
 *   npm run desktop:build
 */

const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const guiDir = path.resolve(__dirname, '..')
const buildDir = path.join(guiDir, 'build')

// ── Platform detection ──────────────────────────────────────────────

const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'

if (!isWin && !isMac) {
  console.error(`ERROR: Unsupported platform "${process.platform}". Only Windows and macOS are supported.`)
  process.exit(1)
}

const bunTarget = isWin
  ? 'bun-windows-x64'
  : `bun-darwin-${process.arch === 'arm64' ? 'arm64' : 'x64'}`

const proxyBinaryName = isWin ? 'copilot-proxy-server.exe' : 'copilot-proxy-server'
const electronBuilderFlag = isWin ? '--win' : '--mac'

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

// Ensure COMSPEC is set on Windows (can be lost in some environments)
if (!process.env.COMSPEC && isWin) {
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
console.log(`  Platform: ${process.platform}, Arch: ${process.arch}, Target: ${bunTarget}`)

const proxyOutPath = path.join(buildDir, proxyBinaryName)

run(
  `bun build --compile --target=${bunTarget} src/main.ts --outfile "${proxyOutPath}"`,
  { cwd: repoRoot },
)

if (!fs.existsSync(proxyOutPath)) {
  console.error('ERROR: Proxy binary was not created!')
  process.exit(1)
}

const sizeMB = (fs.statSync(proxyOutPath).size / 1024 / 1024).toFixed(1)
console.log(`  → ${proxyOutPath} (${sizeMB} MB)`)

// ── 3. Package with electron-builder ────────────────────────────────

console.log('\n═══ Step 3: Packaging with electron-builder ═══')

run(`npx electron-builder ${electronBuilderFlag} --config electron-builder.yml`, { cwd: guiDir })

console.log('\n═══ Build complete! Check release/ ═══')
