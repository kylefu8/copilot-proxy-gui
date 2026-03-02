/**
 * Build script for creating a standalone executable of Copilot Proxy GUI.
 *
 * Steps:
 *   0. Generate icon files              → build/icon.png, build/icon.ico
 *   1. Build the Vite frontend          → dist/
 *   2. Bundle the proxy server via esbuild → build/copilot-proxy-bundle.mjs
 *   3. Package with electron-builder    → release/
 *
 * Prerequisites:
 *   - copilot-proxy/ submodule must be initialized
 *   - esbuild must be installed (devDependency)
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

const electronBuilderFlag = isWin ? '--win' : '--mac'
const proxyBundlePath = path.join(buildDir, 'copilot-proxy-bundle.mjs')

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

// ── 2. Bundle proxy server as JS (replaces bun --compile) ────────────

console.log('\n═══ Step 2: Bundling proxy server (esbuild → JS bundle) ═══')

run('node scripts/bundle-proxy.cjs', { cwd: guiDir })

if (!fs.existsSync(proxyBundlePath)) {
  console.error('ERROR: Proxy bundle was not created!')
  process.exit(1)
}

const sizeMB = (fs.statSync(proxyBundlePath).size / 1024 / 1024).toFixed(1)
console.log(`  → ${proxyBundlePath} (${sizeMB} MB)`)

// ── 3. Package with electron-builder ────────────────────────────────

console.log('\n═══ Step 3: Packaging with electron-builder ═══')

if (isMac) {
  // macOS: build for each architecture (same JS bundle works for both)
  const archs = ['arm64', 'x64']
  for (const arch of archs) {
    console.log(`\n  Packaging ${arch} DMG...`)
    run(`npx electron-builder --mac --${arch} --config electron-builder.yml`, { cwd: guiDir })
  }
} else {
  run(`npx electron-builder ${electronBuilderFlag} --config electron-builder.yml`, { cwd: guiDir })
}

console.log('\n═══ Build complete! Check release/ ═══')

// ── 4. Generate update manifest ─────────────────────────────────────

console.log('\n═══ Step 4: Generating update manifest (for lightweight updates) ═══')

const nodeCrypto = require('node:crypto')

function sha256(filePath) {
  const data = fs.readFileSync(filePath)
  return nodeCrypto.createHash('sha256').update(data).digest('hex')
}

// Look for app.asar in built output
const appAsarLocations = [
  path.join(guiDir, 'release', 'win-unpacked', 'resources', 'app.asar'),
  path.join(guiDir, 'release', 'mac', 'Copilot Proxy GUI.app', 'Contents', 'Resources', 'app.asar'),
  path.join(guiDir, 'release', 'mac-arm64', 'Copilot Proxy GUI.app', 'Contents', 'Resources', 'app.asar'),
]

const appAsarPath = appAsarLocations.find(f => fs.existsSync(f))

if (appAsarPath && fs.existsSync(proxyBundlePath)) {
  const { version } = require(path.join(guiDir, 'package.json'))
  const electronPkg = require(path.join(guiDir, 'node_modules', 'electron', 'package.json'))

  const manifest = {
    version,
    minElectronVersion: electronPkg.version.split('.')[0] + '.0.0',
    assets: {
      'app.asar': {
        size: fs.statSync(appAsarPath).size,
        sha256: sha256(appAsarPath),
      },
      'copilot-proxy-bundle.mjs': {
        size: fs.statSync(proxyBundlePath).size,
        sha256: sha256(proxyBundlePath),
      },
    },
  }

  const manifestPath = path.join(guiDir, 'release', 'update-manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`  → ${manifestPath}`)

  // Copy lightweight update assets into release/ for upload
  const asarRelease = path.join(guiDir, 'release', 'app.asar')
  fs.copyFileSync(appAsarPath, asarRelease)
  console.log(`  → ${asarRelease} (${(fs.statSync(asarRelease).size / 1024).toFixed(0)} KB)`)

  const bundleRelease = path.join(guiDir, 'release', 'copilot-proxy-bundle.mjs')
  fs.copyFileSync(proxyBundlePath, bundleRelease)
  console.log(`  → ${bundleRelease} (${(fs.statSync(bundleRelease).size / 1024 / 1024).toFixed(1)} MB)`)

  console.log('\n  Manifest contents:')
  console.log(JSON.stringify(manifest, null, 2))
} else {
  console.warn('  ⚠ Could not find app.asar in build output — manifest not generated')
  if (!fs.existsSync(proxyBundlePath)) console.warn('    Missing: copilot-proxy-bundle.mjs')
  if (!appAsarPath) console.warn('    Missing: app.asar (looked in win-unpacked/ and mac/)')
}

console.log('\n═══ Done! ═══')
