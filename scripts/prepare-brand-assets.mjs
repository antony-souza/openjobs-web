import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const directory = new URL('../public/brand/', import.meta.url)
const symbol = fileURLToPath(
  new URL('../branding/openjobs-symbol-source.png', import.meta.url),
)
const logo = fileURLToPath(
  new URL('../branding/openjobs-logo-source.png', import.meta.url),
)
const transparent = { r: 0, g: 0, b: 0, alpha: 0 }

await mkdir(directory, { recursive: true })

// Export web sizes from the original artwork, preserving its transparency.
await sharp(symbol)
  .trim()
  .resize(256, 256, { fit: 'contain', background: transparent })
  .png()
  .toFile(fileURLToPath(new URL('openjobs-symbol.png', directory)))
await sharp(logo)
  .trim()
  .resize({ width: 1200 })
  .png()
  .toFile(
    fileURLToPath(new URL('../branding/openjobs-logo.png', import.meta.url)),
  )

const icons = []
for (const size of [16, 32, 48, 64, 180, 192, 512]) {
  const padding = Math.max(1, Math.round(size * 0.06))
  const buffer = await sharp(symbol)
    .trim()
    .resize(size - 2 * padding, size - 2 * padding, {
      fit: 'contain',
      background: transparent,
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: transparent,
    })
    .png()
    .toBuffer()

  const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`
  await writeFile(new URL(filename, directory), buffer)
  if (size <= 64) icons.push({ size, buffer })
}

// ICO supports embedded PNG images, keeping one consistent symbol at each size.
const header = Buffer.alloc(6)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(icons.length, 4)
let offset = header.length + icons.length * 16
const entries = icons.map(({ size, buffer }) => {
  const entry = Buffer.alloc(16)
  entry[0] = size
  entry[1] = size
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(buffer.length, 8)
  entry.writeUInt32LE(offset, 12)
  offset += buffer.length
  return entry
})
await writeFile(
  new URL('../favicon.ico', directory),
  Buffer.concat([header, ...entries, ...icons.map(({ buffer }) => buffer)]),
)

console.log('OpenJobs logo and favicon assets exported.')
