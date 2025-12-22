/**
 * Script para generar favicon.ico desde SVG
 * Ejecutar: npx tsx scripts/generar-favicon-ico.ts
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

console.log('🎨 Generando favicon.ico...\n')

const publicDir = path.join(process.cwd(), 'public')
const faviconSvgPath = path.join(publicDir, 'favicon.svg')
const faviconPngPath = path.join(publicDir, 'favicon-32.png')
const faviconIcoPath = path.join(publicDir, 'favicon.ico')

if (!fs.existsSync(faviconSvgPath)) {
  console.error('❌ Error: No se encontró public/favicon.svg')
  process.exit(1)
}

// Generar PNG de 32x32 primero
sharp(faviconSvgPath)
  .resize(32, 32)
  .png()
  .toFile(faviconPngPath)
  .then(() => {
    console.log('✅ Generado: favicon-32.png')
    
    // Copiar como favicon.ico (los navegadores modernos aceptan PNG renombrado)
    fs.copyFileSync(faviconPngPath, faviconIcoPath)
    console.log('✅ Generado: favicon.ico')
    
    // Limpiar archivo temporal
    fs.unlinkSync(faviconPngPath)
    
    console.log('')
    console.log('🎉 ¡Favicon generado!')
    console.log('   Ubicación: public/favicon.ico')
    console.log('')
    console.log('📝 NOTA: Para un .ico multi-resolución real, usa:')
    console.log('   https://favicon.io/favicon-converter/')
    console.log('   Pero este funciona perfectamente en navegadores modernos.')
  })
  .catch((err) => {
    console.error('❌ Error al generar favicon:', err.message)
  })
