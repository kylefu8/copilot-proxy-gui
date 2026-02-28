/**
 * Programmatic icon generation for Copilot Proxy GUI.
 * Creates polished app icons and tray icons entirely in memory (no external files).
 *
 * Design: Dark navy rounded square with Copilot-inspired pilot goggles (twin lenses)
 *   - Two connected circular lenses in accent blue (representing GitHub Copilot)
 *   - A forward arrow below (representing the proxy relay concept)
 *   - Tray variant adds a colored status dot in the bottom-right corner
 */

const zlib = require('node:zlib')
const { nativeImage } = require('electron')

// ─── Low-level pixel canvas ────────────────────────────────────────

function createCanvas(size) {
  // PNG row format: 1 filter byte + (size * 4) RGBA bytes per row
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
  // Alpha-blend onto existing pixel
  const sa = a / 255, da = c.data[off + 3] / 255
  const oa = sa + da * (1 - sa)
  if (oa > 0) {
    c.data[off]     = Math.round((r * sa + c.data[off]     * da * (1 - sa)) / oa)
    c.data[off + 1] = Math.round((g * sa + c.data[off + 1] * da * (1 - sa)) / oa)
    c.data[off + 2] = Math.round((b * sa + c.data[off + 2] * da * (1 - sa)) / oa)
    c.data[off + 3] = Math.round(oa * 255)
  }
}

// ─── Drawing primitives (anti-aliased) ─────────────────────────────

function fillRoundedRect(canvas, x, y, w, h, radius, r, g, b, a = 255) {
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      let dist = -Infinity
      if (px < radius && py < radius) {
        dist = Math.sqrt((px - radius + 0.5) ** 2 + (py - radius + 0.5) ** 2) - radius
      } else if (px >= w - radius && py < radius) {
        dist = Math.sqrt((px - w + radius + 0.5) ** 2 + (py - radius + 0.5) ** 2) - radius
      } else if (px < radius && py >= h - radius) {
        dist = Math.sqrt((px - radius + 0.5) ** 2 + (py - h + radius + 0.5) ** 2) - radius
      } else if (px >= w - radius && py >= h - radius) {
        dist = Math.sqrt((px - w + radius + 0.5) ** 2 + (py - h + radius + 0.5) ** 2) - radius
      }
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
      // Distance from pixel center to line segment (gives rounded caps)
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
    for (let i = 0; i < body.length; i++) {
      c ^= body[i]
      for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0)
    }
    crc.writeUInt32BE((c ^ 0xFFFFFFFF) >>> 0)
    return Buffer.concat([len, body, crc])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(canvas.size, 0)
  ihdr.writeUInt32BE(canvas.size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type: RGBA

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

// ─── Color constants ───────────────────────────────────────────────

const BG_OUTER  = [0x10, 0x15, 0x25]   // dark edge
const BG_INNER  = [0x1a, 0x22, 0x40]   // navy card
const BG_SHINE  = [0x22, 0x2e, 0x52]   // subtle top highlight
const ACCENT    = [0x6d, 0x8c, 0xff]   // blue accent
const WHITE     = [0xff, 0xff, 0xff]
const BORDER_HL = [0x3a, 0x4e, 0x7a]   // border highlight
const LENS_FILL = [0x15, 0x1d, 0x38]   // dark lens interior

// ─── App icon (window + taskbar) ───────────────────────────────────

function createAppIcon() {
  const size = 64
  const canvas = createCanvas(size)

  // ── Background ──
  fillRoundedRect(canvas, 0, 0, size, size, 16, ...BG_OUTER)
  fillRoundedRect(canvas, 1, 1, 62, 62, 15, ...BORDER_HL, 100)
  fillRoundedRect(canvas, 3, 3, 58, 58, 12, ...BG_INNER)
  fillRoundedRect(canvas, 4, 4, 56, 24, 10, ...BG_SHINE, 60)

  // ── Copilot goggles (twin connected lenses) ──
  const lensY = 24
  const lensR = 10

  // Left lens — accent ring with dark center
  fillCircle(canvas, 20, lensY, lensR, ...ACCENT)
  fillCircle(canvas, 20, lensY, lensR - 2.5, ...LENS_FILL)
  fillCircle(canvas, 17, lensY - 3, 2.5, ...WHITE, 50)     // glare highlight

  // Right lens — accent ring with dark center
  fillCircle(canvas, 44, lensY, lensR, ...ACCENT)
  fillCircle(canvas, 44, lensY, lensR - 2.5, ...LENS_FILL)
  fillCircle(canvas, 41, lensY - 3, 2.5, ...WHITE, 50)     // glare highlight

  // Bridge connecting the two lenses
  fillRoundedRect(canvas, 29, lensY - 2, 6, 4, 1.5, ...ACCENT)

  // Strap hints extending from outer edges (like pilot headgear)
  drawLine(canvas, 8, lensY - 2, 11, lensY, 2.5, ...ACCENT, 150)
  drawLine(canvas, 53, lensY, 56, lensY - 2, 2.5, ...ACCENT, 150)

  // ── Proxy forward arrow (below goggles) ──
  const arrowY = 46

  // Arrow shaft
  drawLine(canvas, 16, arrowY, 44, arrowY, 2.5, ...WHITE, 200)
  // Arrowhead
  drawLine(canvas, 40, arrowY - 5, 47, arrowY, 2.5, ...WHITE, 200)
  drawLine(canvas, 40, arrowY + 5, 47, arrowY, 2.5, ...WHITE, 200)
  // Subtle glow behind arrowhead tip
  fillCircle(canvas, 47, arrowY, 5, ...ACCENT, 30)

  return nativeImage.createFromBuffer(toPNG(canvas))
}

// ─── Tray icon (16x16 with status dot) ─────────────────────────────

function createTrayIcon(statusColor) {
  const size = 16
  const canvas = createCanvas(size)

  // Parse status hex color
  const hex = statusColor.replace('#', '')
  const sr = parseInt(hex.substring(0, 2), 16)
  const sg = parseInt(hex.substring(2, 4), 16)
  const sb = parseInt(hex.substring(4, 6), 16)

  // Background rounded square
  fillRoundedRect(canvas, 0, 0, 16, 16, 3, ...BG_OUTER)
  fillRoundedRect(canvas, 1, 1, 14, 14, 2.5, ...BG_INNER)

  // Subtle top highlight
  fillRoundedRect(canvas, 1, 1, 14, 6, 2.5, ...BG_SHINE, 50)

  // ── Simplified goggles (two small rings) ──
  // Left lens
  fillCircle(canvas, 5, 5.5, 3.2, ...ACCENT, 230)
  fillCircle(canvas, 5, 5.5, 1.6, ...LENS_FILL)

  // Right lens
  fillCircle(canvas, 11, 5.5, 3.2, ...ACCENT, 230)
  fillCircle(canvas, 11, 5.5, 1.6, ...LENS_FILL)

  // Bridge
  drawLine(canvas, 7.5, 5.5, 8.5, 5.5, 1.5, ...ACCENT, 220)

  // Small forward arrow
  drawLine(canvas, 2.5, 11, 7, 11, 1.2, ...WHITE, 180)
  drawLine(canvas, 5.5, 9.5, 7.5, 11, 1.2, ...WHITE, 180)
  drawLine(canvas, 5.5, 12.5, 7.5, 11, 1.2, ...WHITE, 180)

  // Status dot — dark outline ring then colored fill
  fillCircle(canvas, 12, 12.5, 3, ...BG_OUTER)      // dark outline
  fillCircle(canvas, 12, 12.5, 2, sr, sg, sb)        // colored status

  return nativeImage.createFromBuffer(toPNG(canvas))
}

/**
 * macOS menu-bar template icon (16x16, white-on-transparent).
 * Electron treats images with "Template" suffix or .setTemplateImage(true)
 * as template images that automatically adapt to light/dark menu bar.
 */
function createTrayIconTemplate() {
  const size = 22
  const canvas = createCanvas(size)

  // All drawing in white — macOS will invert for dark/light menu bar automatically
  const W = [0xff, 0xff, 0xff]

  // ── Simplified goggles (two small rings) ──
  // Left lens
  fillCircle(canvas, 7, 8, 4, ...W, 220)
  fillCircle(canvas, 7, 8, 2, 0, 0, 0, 0)  // transparent center (punch hole)

  // Right lens
  fillCircle(canvas, 15, 8, 4, ...W, 220)
  fillCircle(canvas, 15, 8, 2, 0, 0, 0, 0)  // transparent center

  // Bridge
  drawLine(canvas, 10, 8, 12, 8, 1.5, ...W, 200)

  // Small forward arrow below
  drawLine(canvas, 5, 16, 12, 16, 1.2, ...W, 200)
  drawLine(canvas, 10, 14, 13, 16, 1.2, ...W, 200)
  drawLine(canvas, 10, 18, 13, 16, 1.2, ...W, 200)

  const img = nativeImage.createFromBuffer(toPNG(canvas), { scaleFactor: 2 })
  img.setTemplateImage(true)
  return img
}

module.exports = { createAppIcon, createTrayIcon, createTrayIconTemplate }
