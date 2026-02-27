/**
 * Generate static icon files for electron-builder from the programmatic icon.
 *
 * Outputs (in apps/gui/build/):
 *   - icon.png   (256x256 PNG for Linux / electron-builder)
 *   - icon.ico   (Windows multi-resolution ICO: 16, 32, 48, 64, 128, 256)
 *
 * Usage:
 *   node scripts/generate-icons.cjs
 */

const zlib = require('node:zlib')
const fs = require('node:fs')
const path = require('node:path')

// ─── Low-level pixel canvas ────────────────────────────────────────

function createCanvas(size) {
  return { data: Buffer.alloc(size * (1 + size * 4)), size }
}

function setPixel(c, x, y, r, g, b, a) {
  if (x < 0 || x >= c.size || y < 0 || y >= c.size) return
  const off = y * (1 + c.size * 4) + 1 + x * 4
  if (a >= 255) {
    c.data[off] = r; c.data[off + 1] = g; c.data[off + 2] = b; c.data[off + 3] = 255
    return
  }
  if (a <= 0) return
  const sa = a / 255, da = c.data[off + 3] / 255
  const oa = sa + da * (1 - sa)
  if (oa > 0) {
    c.data[off]     = Math.round((r * sa + c.data[off]     * da * (1 - sa)) / oa)
    c.data[off + 1] = Math.round((g * sa + c.data[off + 1] * da * (1 - sa)) / oa)
    c.data[off + 2] = Math.round((b * sa + c.data[off + 2] * da * (1 - sa)) / oa)
    c.data[off + 3] = Math.round(oa * 255)
  }
}

// ─── Drawing primitives ────────────────────────────────────────────

function fillRoundedRect(canvas, x, y, w, h, radius, r, g, b, a = 255) {
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      let dist = -Infinity
      if (px < radius && py < radius) dist = Math.sqrt((px - radius + 0.5) ** 2 + (py - radius + 0.5) ** 2) - radius
      else if (px >= w - radius && py < radius) dist = Math.sqrt((px - w + radius + 0.5) ** 2 + (py - radius + 0.5) ** 2) - radius
      else if (px < radius && py >= h - radius) dist = Math.sqrt((px - radius + 0.5) ** 2 + (py - h + radius + 0.5) ** 2) - radius
      else if (px >= w - radius && py >= h - radius) dist = Math.sqrt((px - w + radius + 0.5) ** 2 + (py - h + radius + 0.5) ** 2) - radius
      if (dist > 0.5) continue
      const coverage = dist > -0.5 ? Math.max(0, 0.5 - dist) : 1.0
      setPixel(canvas, x + px, y + py, r, g, b, Math.round(a * coverage))
    }
  }
}

function fillCircle(canvas, cx, cy, radius, r, g, b, a = 255) {
  const hiX = Math.ceil(cx + radius + 1)
  const hiY = Math.ceil(cy + radius + 1)
  for (let py = Math.floor(cy - radius - 1); py <= hiY; py++) {
    for (let px = Math.floor(cx - radius - 1); px <= hiX; px++) {
      const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
      if (dist > radius + 0.5) continue
      const coverage = dist > radius - 0.5 ? Math.max(0, radius + 0.5 - dist) : 1.0
      setPixel(canvas, px, py, r, g, b, Math.round(a * coverage))
    }
  }
}

function drawLine(canvas, x1, y1, x2, y2, thickness, r, g, b, a = 255) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return
  const halfT = thickness / 2
  const minX = Math.floor(Math.min(x1, x2) - halfT - 1)
  const maxX = Math.ceil(Math.max(x1, x2) + halfT + 1)
  const minY = Math.floor(Math.min(y1, y2) - halfT - 1)
  const maxY = Math.ceil(Math.max(y1, y2) + halfT + 1)
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)))
      const cx = x1 + t * dx, cy = y1 + t * dy
      const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
      if (dist > halfT + 0.5) continue
      const coverage = dist > halfT - 0.5 ? Math.max(0, halfT + 0.5 - dist) : 1.0
      setPixel(canvas, px, py, r, g, b, Math.round(a * coverage))
    }
  }
}

// ─── PNG encoder ───────────────────────────────────────────────────

function toPNG(canvas) {
  const compressed = zlib.deflateSync(canvas.data)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    let c = 0xFFFFFFFF
    for (let i = 0; i < body.length; i++) { c ^= body[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0) }
    crc.writeUInt32BE((c ^ 0xFFFFFFFF) >>> 0)
    return Buffer.concat([len, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(canvas.size, 0); ihdr.writeUInt32BE(canvas.size, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

// ─── Color constants ───────────────────────────────────────────────

const BG_OUTER  = [0x10, 0x15, 0x25]
const BG_INNER  = [0x1a, 0x22, 0x40]
const BG_SHINE  = [0x22, 0x2e, 0x52]
const ACCENT    = [0x6d, 0x8c, 0xff]
const WHITE     = [0xff, 0xff, 0xff]
const BORDER_HL = [0x3a, 0x4e, 0x7a]
const LENS_FILL = [0x15, 0x1d, 0x38]

// ─── Draw icon at any size ─────────────────────────────────────────

function drawIcon(size) {
  const canvas = createCanvas(size)
  const s = size / 64 // scale factor (base design is 64px)

  // Background
  fillRoundedRect(canvas, 0, 0, size, size, Math.round(16 * s), ...BG_OUTER)
  fillRoundedRect(canvas, Math.round(1 * s), Math.round(1 * s), size - Math.round(2 * s), size - Math.round(2 * s), Math.round(15 * s), ...BORDER_HL, 100)
  fillRoundedRect(canvas, Math.round(3 * s), Math.round(3 * s), size - Math.round(6 * s), size - Math.round(6 * s), Math.round(12 * s), ...BG_INNER)
  fillRoundedRect(canvas, Math.round(4 * s), Math.round(4 * s), size - Math.round(8 * s), Math.round(24 * s), Math.round(10 * s), ...BG_SHINE, 60)

  // Goggles
  const lensY = 24 * s
  const lensR = 10 * s

  fillCircle(canvas, 20 * s, lensY, lensR, ...ACCENT)
  fillCircle(canvas, 20 * s, lensY, lensR - 2.5 * s, ...LENS_FILL)
  fillCircle(canvas, 17 * s, lensY - 3 * s, 2.5 * s, ...WHITE, 50)

  fillCircle(canvas, 44 * s, lensY, lensR, ...ACCENT)
  fillCircle(canvas, 44 * s, lensY, lensR - 2.5 * s, ...LENS_FILL)
  fillCircle(canvas, 41 * s, lensY - 3 * s, 2.5 * s, ...WHITE, 50)

  fillRoundedRect(canvas, Math.round(29 * s), Math.round(lensY - 2 * s), Math.round(6 * s), Math.round(4 * s), Math.round(1.5 * s), ...ACCENT)

  drawLine(canvas, 8 * s, lensY - 2 * s, 11 * s, lensY, 2.5 * s, ...ACCENT, 150)
  drawLine(canvas, 53 * s, lensY, 56 * s, lensY - 2 * s, 2.5 * s, ...ACCENT, 150)

  // Arrow
  const arrowY = 46 * s
  drawLine(canvas, 16 * s, arrowY, 44 * s, arrowY, 2.5 * s, ...WHITE, 200)
  drawLine(canvas, 40 * s, arrowY - 5 * s, 47 * s, arrowY, 2.5 * s, ...WHITE, 200)
  drawLine(canvas, 40 * s, arrowY + 5 * s, 47 * s, arrowY, 2.5 * s, ...WHITE, 200)
  fillCircle(canvas, 47 * s, arrowY, 5 * s, ...ACCENT, 30)

  return canvas
}

// ─── ICO encoder (multi-resolution) ────────────────────────────────

function toICO(pngBuffers) {
  // ICO header: 6 bytes
  const entryCount = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)           // reserved
  header.writeUInt16LE(1, 2)           // type: icon
  header.writeUInt16LE(entryCount, 4)  // number of entries

  // Each entry is 16 bytes; data follows all entries
  const entries = []
  let dataOffset = 6 + entryCount * 16

  for (const { size, png } of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry[0] = size >= 256 ? 0 : size  // width (0 = 256)
    entry[1] = size >= 256 ? 0 : size  // height
    entry[2] = 0                       // color palette
    entry[3] = 0                       // reserved
    entry.writeUInt16LE(1, 4)          // color planes
    entry.writeUInt16LE(32, 6)         // bits per pixel
    entry.writeUInt32LE(png.length, 8) // size of PNG data
    entry.writeUInt32LE(dataOffset, 12)// offset to PNG data
    entries.push(entry)
    dataOffset += png.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.png)])
}

// ─── Main ──────────────────────────────────────────────────────────

const buildDir = path.join(__dirname, '..', 'build')
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true })

// Generate PNG at 256px
const icon256 = drawIcon(256)
const png256 = toPNG(icon256)
fs.writeFileSync(path.join(buildDir, 'icon.png'), png256)
console.log(`  ✓ icon.png (256x256, ${(png256.length / 1024).toFixed(1)} KB)`)

// Generate ICO with multiple sizes
const icoSizes = [16, 32, 48, 64, 128, 256]
const pngBuffers = icoSizes.map(size => ({
  size,
  png: toPNG(drawIcon(size)),
}))
const ico = toICO(pngBuffers)
fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico)
console.log(`  ✓ icon.ico (${icoSizes.join(', ')}px, ${(ico.length / 1024).toFixed(1)} KB)`)

console.log(`\n  Output directory: ${buildDir}`)
