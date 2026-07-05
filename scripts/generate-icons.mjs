import sharp from 'sharp'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const logoPath = path.join(root, 'public', 'images', 'royal-foods-logo.png')
const bg = { r: 250, g: 247, b: 242, alpha: 1 }

async function writeSquareIcon(outputPath, size, logoScale = 1) {
  const logoSize = Math.round(size * logoScale)
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'contain', background: bg })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(outputPath)
}

async function main() {
  await writeSquareIcon(path.join(root, 'public', 'icon-192.png'), 192, 0.92)
  await writeSquareIcon(path.join(root, 'public', 'icon-512.png'), 512, 0.92)
  await writeSquareIcon(path.join(root, 'public', 'icon-maskable-512.png'), 512, 0.72)
  await writeSquareIcon(path.join(root, 'public', 'apple-touch-icon.png'), 180, 0.92)

  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: bg })
    .png()
    .toFile(path.join(root, 'public', 'favicon.png'))

  await mkdir(path.join(root, 'src', 'app'), { recursive: true })
  await copyFile(
    path.join(root, 'public', 'icon-512.png'),
    path.join(root, 'src', 'app', 'icon.png')
  )
  await copyFile(
    path.join(root, 'public', 'apple-touch-icon.png'),
    path.join(root, 'src', 'app', 'apple-icon.png')
  )

  console.log('Generated Royal Foods icons from royal-foods-logo.png')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
