/**
 * Bundle copilot-proxy into a single JS file using esbuild.
 * This replaces the bun --compile approach and produces a ~1-2MB JS bundle
 * that can be run by Electron's built-in Node.js runtime.
 *
 * Usage: node scripts/bundle-proxy.cjs
 */
const esbuild = require('esbuild')
const path = require('path')
const fs = require('fs')

const proxyDir = path.resolve(__dirname, '..', 'copilot-proxy')
const outFile = path.resolve(__dirname, '..', 'build', 'copilot-proxy-bundle.mjs')

// Ensure build dir exists
const buildDir = path.dirname(outFile)
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true })
}

async function main() {
  console.log('Bundling copilot-proxy...')
  console.log(`  Source: ${proxyDir}/src/main.ts`)
  console.log(`  Output: ${outFile}`)

  const result = await esbuild.build({
    entryPoints: [path.join(proxyDir, 'src', 'main.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    outfile: outFile,
    sourcemap: true,
    minify: false,
    // Resolve modules from copilot-proxy's node_modules
    nodePaths: [path.join(proxyDir, 'node_modules')],
    // clipboardy uses native bindings; keep it external
    // undici is built into Node.js 18+ and has CJS/ESM interop issues when bundled
    external: ['clipboardy', 'undici'],
    // Handle the ~ path alias used in copilot-proxy
    alias: {
      '~': path.join(proxyDir, 'src'),
    },
    // No shebang banner needed – ESM files don't support it inline
    logLevel: 'info',
  })

  if (result.errors.length > 0) {
    console.error('Build failed with errors:', result.errors)
    process.exit(1)
  }

  const stat = fs.statSync(outFile)
  const sizeMB = (stat.size / 1024 / 1024).toFixed(2)
  console.log(`\n✅ Bundle created: ${outFile} (${sizeMB} MB)`)

  if (result.warnings.length > 0) {
    console.warn('\nWarnings:', result.warnings.length)
  }
}

main().catch((err) => {
  console.error('Bundle failed:', err)
  process.exit(1)
})
