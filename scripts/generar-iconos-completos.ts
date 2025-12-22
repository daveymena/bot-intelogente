/**
 * Script para generar todos los iconos necesarios desde SVG
 * Requiere: npm install sharp
 * Ejecutar: npx tsx scripts/generar-iconos-completos.ts
 */

import fs from 'fs'
import path from 'path'

console.log('🎨 Generando iconos para Smart Sales Bot Pro...\n')

const publicDir = path.join(process.cwd(), 'public')
const svgPath = path.join(publicDir, 'icon.svg')

// Verificar que existe el SVG
if (!fs.existsSync(svgPath)) {
  console.error('❌ Error: No se encontró public/icon.svg')
  console.log('   Ejecuta primero el script para crear los SVG')
  process.exit(1)
}

console.log('✅ SVG encontrado: icon.svg')
console.log('')
console.log('📝 NOTA IMPORTANTE:')
console.log('   Para generar los PNG e ICO necesitas instalar Sharp:')
console.log('   npm install sharp')
console.log('')
console.log('   Luego ejecuta este script nuevamente.')
console.log('')
console.log('🎯 ALTERNATIVA RÁPIDA:')
console.log('   1. Ve a: https://favicon.io/favicon-converter/')
console.log('   2. Sube: public/icon.svg')
console.log('   3. Descarga el paquete')
console.log('   4. Extrae los archivos:')
console.log('      - favicon.ico → public/favicon.ico')
console.log('      - android-chrome-192x192.png → public/icon-192.png')
console.log('      - android-chrome-512x512.png → public/icon-512.png')
console.log('      - apple-touch-icon.png → public/apple-icon.png')
console.log('')

// Intentar usar Sharp si está instalado
try {
  const sharp = require('sharp')
  
  console.log('✅ Sharp detectado. Generando imágenes...\n')
  
  const svgBuffer = fs.readFileSync(svgPath)
  
  // Generar icon-192.png
  sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'))
    .then(() => console.log('✅ Generado: icon-192.png'))
    .catch((err: Error) => console.error('❌ Error icon-192:', err.message))
  
  // Generar icon-512.png
  sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'))
    .then(() => console.log('✅ Generado: icon-512.png'))
    .catch((err: Error) => console.error('❌ Error icon-512:', err.message))
  
  // Generar apple-icon.png
  sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-icon.png'))
    .then(() => console.log('✅ Generado: apple-icon.png'))
    .catch((err: Error) => console.error('❌ Error apple-icon:', err.message))
  
  // Generar logo.png
  sharp(path.join(publicDir, 'logo.svg'))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo.png'))
    .then(() => console.log('✅ Generado: logo.png'))
    .catch((err: Error) => console.error('❌ Error logo:', err.message))
  
  console.log('')
  console.log('⚠️  NOTA: favicon.ico debe generarse manualmente')
  console.log('   Usa: https://favicon.io/favicon-converter/')
  console.log('   O: https://realfavicongenerator.net/')
  
} catch (error) {
  console.log('ℹ️  Sharp no está instalado.')
  console.log('   Instala con: npm install sharp')
  console.log('   O usa la alternativa rápida arriba.')
}

console.log('')
console.log('🎨 Los SVG ya están listos en public/')
console.log('   - logo.svg')
console.log('   - icon.svg')
console.log('   - favicon.svg')
console.log('')
console.log('✨ ¡Logos creados exitosamente!')
