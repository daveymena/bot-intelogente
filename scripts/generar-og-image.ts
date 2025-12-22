/**
 * Script para generar la imagen Open Graph (og-image.png)
 * Ejecutar: npx tsx scripts/generar-og-image.ts
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

console.log('🎨 Generando imagen Open Graph...\n')

const publicDir = path.join(process.cwd(), 'public')
const ogSvgPath = path.join(publicDir, 'og-image.svg')
const ogPngPath = path.join(publicDir, 'og-image.png')

if (!fs.existsSync(ogSvgPath)) {
  console.error('❌ Error: No se encontró public/og-image.svg')
  process.exit(1)
}

sharp(ogSvgPath)
  .resize(1200, 630)
  .png()
  .toFile(ogPngPath)
  .then(() => {
    console.log('✅ Generado: og-image.png (1200x630)')
    console.log('   Ubicación: public/og-image.png')
    console.log('')
    console.log('🎉 ¡Imagen Open Graph lista!')
    console.log('   Se mostrará al compartir en redes sociales')
  })
  .catch((err) => {
    console.error('❌ Error al generar og-image.png:', err.message)
  })
