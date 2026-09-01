/**
 * Generates a light-background variant of the wordmark.
 *
 * The supplied logo is a dark-mode asset: the "P" mark and the word PARK are
 * white, and only TRACE is yellow. Dropped on the cream marketing canvas the
 * white half disappears completely.
 *
 * This recolours only the achromatic (white/grey) pixels to ink and leaves the
 * yellow untouched, preserving each pixel's alpha so anti-aliased edges stay
 * smooth. Run: node scripts/make-light-logo.mjs
 */
import { inflateSync, deflateSync } from 'node:zlib'
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'src/assets/PARKTRACE_LOGO_WITHTEXT.png'
const OUT = 'src/assets/PARKTRACE_LOGO_WITHTEXT_INK.png'
const INK = [0x14, 0x14, 0x13] // --mc-ink-black

// ---------- PNG decode ----------

function readChunks(buf) {
  let off = 8 // skip signature
  const chunks = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    chunks.push({ type, data: buf.subarray(off + 8, off + 8 + len) })
    off += 12 + len
  }
  return chunks
}

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

/** Reverse the per-scanline filters. Returns raw samples, bpp bytes per pixel. */
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

// ---------- PNG encode ----------

function crc32(buf) {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
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

function encodeRGBA(w, h, px) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RGBA
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

// ---------- recolour ----------

const buf = readFileSync(SRC)
const chunks = readChunks(buf)
const ihdr = chunks.find((c) => c.type === 'IHDR').data
const w = ihdr.readUInt32BE(0)
const h = ihdr.readUInt32BE(4)
const bitDepth = ihdr[8]
const colorType = ihdr[9]

if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
  throw new Error(`Unsupported PNG: bitDepth ${bitDepth}, colorType ${colorType}`)
}

const srcBpp = colorType === 6 ? 4 : 3
const idat = Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data))
const samples = unfilter(inflateSync(idat), w, h, srcBpp)

// Normalise to RGBA
const px = Buffer.alloc(w * 4 * h)
for (let i = 0, j = 0; i < w * h; i++) {
  px[i * 4] = samples[j]
  px[i * 4 + 1] = samples[j + 1]
  px[i * 4 + 2] = samples[j + 2]
  px[i * 4 + 3] = srcBpp === 4 ? samples[j + 3] : 255
  j += srcBpp
}

let recoloured = 0
let kept = 0
for (let i = 0; i < w * h; i++) {
  const o = i * 4
  const a = px[o + 3]
  if (a === 0) continue
  const r = px[o]
  const g = px[o + 1]
  const b = px[o + 2]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const chroma = max - min

  // Achromatic and light: the white mark and PARK wordmark. Yellow has a
  // chroma around 200, so this threshold separates them with a wide margin.
  if (chroma < 40 && max > 110) {
    px[o] = INK[0]
    px[o + 1] = INK[1]
    px[o + 2] = INK[2]
    recoloured++
  } else {
    kept++
  }
}

// Written to src/assets only. Anything dropped in public/ is precached by the
// service worker whether or not it is imported, so an unused copy would just
// inflate the offline bundle.
writeFileSync(OUT, encodeRGBA(w, h, px))
console.log(`${w}x${h} colorType=${colorType} -> ${OUT}`)
console.log(`recoloured ${recoloured} px to ink, kept ${kept} px (yellow/other)`)
