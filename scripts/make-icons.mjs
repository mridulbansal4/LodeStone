// Generates the PWA icons as PNGs with no image dependencies.
// Run: node scripts/make-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const BG = [11, 15, 26]
const ACCENT = [77, 225, 193]
const WARM = [255, 180, 84]

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function png(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const o = y * (size * 4 + 1) + 1 + x * 4
      const p = pixels(x, y)
      raw[o] = p[0]
      raw[o + 1] = p[1]
      raw[o + 2] = p[2]
      raw[o + 3] = p[3] ?? 255
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// A zig-zag "remembered walk" with a warm dot at the car end.
function icon(size) {
  const s = size / 64
  const pts = [
    [14, 50],
    [14, 34],
    [32, 34],
    [32, 18],
    [50, 18],
  ].map(([x, y]) => [x * s, y * s])

  const distToPath = (px, py) => {
    let best = Infinity
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i]
      const [bx, by] = pts[i + 1]
      const dx = bx - ax
      const dy = by - ay
      const l2 = dx * dx + dy * dy
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
      best = Math.min(best, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)))
    }
    return best
  }

  return png(size, (x, y) => {
    const cx = x + 0.5
    const cy = y + 0.5
    const dCar = Math.hypot(cx - 14 * s, cy - 50 * s)
    if (dCar < 5 * s) return [...WARM, 255]
    const d = distToPath(cx, cy)
    if (d < 3.2 * s) return [...ACCENT, 255]
    if (d < 5.5 * s) {
      const a = Math.round(70 * (1 - (d - 3.2 * s) / (2.3 * s)))
      return [
        Math.round(BG[0] + ((ACCENT[0] - BG[0]) * a) / 255),
        Math.round(BG[1] + ((ACCENT[1] - BG[1]) * a) / 255),
        Math.round(BG[2] + ((ACCENT[2] - BG[2]) * a) / 255),
        255,
      ]
    }
    return [...BG, 255]
  })
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', icon(192))
writeFileSync('public/icons/icon-512.png', icon(512))
console.log('icons written')
