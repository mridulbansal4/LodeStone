/**
 * Builds the favicon and app-icon set from the brand mark.
 *
 * The supplied mark is a dark-mode asset: a white "P" with a yellow
 * exclamation on transparency. Dropped straight into a browser tab it would
 * disappear against light tab strips, so every icon here is composited onto a
 * solid ink tile. That also gives the PWA icons a real background instead of
 * the transparent edges Android would otherwise fill in itself.
 *
 * Run: node scripts/make-favicons.mjs
 */
import { inflateSync, deflateSync } from 'node:zlib'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const SRC = 'LOGO/PARKTRACE_LOGO.png'
const OUT_DIR = 'public/icons'
const INK = [0x14, 0x14, 0x13]

// size, filename, how much of the tile the mark fills, corner radius fraction
const TARGETS = [
  [32, 'favicon-32.png', 0.74, 0.22],
  [64, 'favicon-64.png', 0.74, 0.22],
  [180, 'apple-touch-icon.png', 0.68, 0.22],
  [192, 'icon-192.png', 0.7, 0.22],
  [512, 'icon-512.png', 0.7, 0.22],
  // Maskable icons get cropped to a circle by the launcher, so the mark has to
  // sit well inside the 80% safe zone and the tile must be square-edged.
  [512, 'icon-maskable-512.png', 0.52, 0.5],
]

// ---------- PNG decode ----------

function readChunks(buf) {
  let off = 8
  const out = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    out.push({ type: buf.toString('ascii', off + 4, off + 8), data: buf.subarray(off + 8, off + 8 + len) })
    off += 12 + len
  }
  return out
}

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

function unfilter(raw, w, h, bpp) {
  const stride = w * bpp
  const out = Buffer.alloc(stride * h)
  let pos = 0
  for (let y = 0; y < h; y++) {
    const type = raw[pos++]
    const line = raw.subarray(pos, pos + stride)
    pos += stride
    const cur = out.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= bpp ? prev[i - bpp] : 0
      let v = line[i]
      if (type === 1) v += a
      else if (type === 2) v += b
      else if (type === 3) v += (a + b) >> 1
      else if (type === 4) v += paeth(a, b, c)
      cur[i] = v & 0xff
    }
  }
  return out
}

function decode(path) {
  const buf = readFileSync(path)
  const chunks = readChunks(buf)
  const ihdr = chunks.find((c) => c.type === 'IHDR').data
  const w = ihdr.readUInt32BE(0)
  const h = ihdr.readUInt32BE(4)
  if (ihdr[8] !== 8 || (ihdr[9] !== 6 && ihdr[9] !== 2)) {
    throw new Error(`Unsupported PNG: depth ${ihdr[8]}, colorType ${ihdr[9]}`)
  }
  const bpp = ihdr[9] === 6 ? 4 : 3
  const idat = Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data))
  const s = unfilter(inflateSync(idat), w, h, bpp)
  const px = Buffer.alloc(w * h * 4)
  for (let i = 0, j = 0; i < w * h; i++, j += bpp) {
    px[i * 4] = s[j]
    px[i * 4 + 1] = s[j + 1]
    px[i * 4 + 2] = s[j + 2]
    px[i * 4 + 3] = bpp === 4 ? s[j + 3] : 255
  }
  return { w, h, px }
}

// ---------- PNG encode ----------

const TABLE = (() => {
  const t = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (const b of buf) crc = TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8)
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

function encode(w, h, px) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0
    px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- compose ----------

const src = decode(SRC)

// Trim the transparent margin: the source mark sits in a lot of empty space,
// and centring on the raw canvas would leave the icon looking off-centre.
let minX = src.w
let minY = src.h
let maxX = -1
let maxY = -1
for (let y = 0; y < src.h; y++) {
  for (let x = 0; x < src.w; x++) {
    if (src.px[(y * src.w + x) * 4 + 3] > 12) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}
const bw = maxX - minX + 1
const bh = maxY - minY + 1
console.log(`source ${src.w}x${src.h}, mark bounds ${bw}x${bh} at (${minX},${minY})`)

/** Bilinear sample of the trimmed mark, in its own 0..1 space. */
function sample(u, v) {
  const fx = minX + u * (bw - 1)
  const fy = minY + v * (bh - 1)
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(x0 + 1, src.w - 1)
  const y1 = Math.min(y0 + 1, src.h - 1)
  const tx = fx - x0
  const ty = fy - y0
  const out = [0, 0, 0, 0]
  for (let c = 0; c < 4; c++) {
    const a = src.px[(y0 * src.w + x0) * 4 + c]
    const b = src.px[(y0 * src.w + x1) * 4 + c]
    const d = src.px[(y1 * src.w + x0) * 4 + c]
    const e = src.px[(y1 * src.w + x1) * 4 + c]
    out[c] = a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + d * (1 - tx) * ty + e * tx * ty
  }
  return out
}

/** Coverage of a rounded square at (x,y), softened at the edge for antialiasing. */
function tileAlpha(x, y, size, radiusFrac) {
  const r = size * radiusFrac
  const cx = Math.min(Math.max(x, r), size - r)
  const cy = Math.min(Math.max(y, r), size - r)
  const d = Math.hypot(x - cx, y - cy)
  return Math.max(0, Math.min(1, r - d + 0.5))
}

mkdirSync(OUT_DIR, { recursive: true })

for (const [size, name, fill, radiusFrac] of TARGETS) {
  const px = Buffer.alloc(size * size * 4)
  // Fit the mark inside `fill` of the tile, preserving its aspect ratio.
  const scale = (size * fill) / Math.max(bw, bh)
  const dw = bw * scale
  const dh = bh * scale
  const ox = (size - dw) / 2
  const oy = (size - dh) / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4
      const ta = tileAlpha(x + 0.5, y + 0.5, size, radiusFrac)
      let r = INK[0]
      let g = INK[1]
      let b = INK[2]

      const u = (x + 0.5 - ox) / dw
      const v = (y + 0.5 - oy) / dh
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
        const s = sample(u, v)
        const a = s[3] / 255
        r = r * (1 - a) + s[0] * a
        g = g * (1 - a) + s[1] * a
        b = b * (1 - a) + s[2] * a
      }

      px[o] = Math.round(r)
      px[o + 1] = Math.round(g)
      px[o + 2] = Math.round(b)
      px[o + 3] = Math.round(ta * 255)
    }
  }
  writeFileSync(`${OUT_DIR}/${name}`, encode(size, size, px))
  console.log(`  ${name.padEnd(26)} ${size}x${size}`)
}
