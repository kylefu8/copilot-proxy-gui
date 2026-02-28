/**
 * electron-builder afterPack hook
 * Ad-hoc signs the macOS .app bundle so Finder can open it without error -36.
 * This runs after the app is packed but before the DMG is created.
 * No Apple Developer certificate is required.
 */
const { execSync } = require('child_process')
const path = require('path')

exports.default = async function afterPack(context) {
  // Only sign on macOS builds
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)

  console.log(`  • Ad-hoc signing: ${appPath}`)
  execSync(
    `codesign --force --deep --sign - "${appPath}"`,
    { stdio: 'inherit' },
  )
  console.log(`  • Ad-hoc signing complete`)
}
