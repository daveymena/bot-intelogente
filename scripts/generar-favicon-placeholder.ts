/**
 * Script para generar favicons placeholder temporales
 * Usa este script mientras creas los logos profesionales
 * 
 * Ejecutar: npx tsx scripts/generar-favicon-placeholder.ts
 */

import fs from 'fs'
import path from 'path'

const publicDir = path.join(process.cwd(), 'public')

// SVG simple como placeholder
const placeholderSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="80"/>
  <g fill="white">
    <!-- Chat bubble -->
    <path d="M256 80c-88.4 0-160 64.5-160 144s71.6 144 160 144c17.7 0 34.7-2.4 50.6-6.8l69.4 34.7c4.4 2.2 9.6-.5 10.4-5.4l8.8-52.8c24.5-22.7 40.8-53.5 40.8-87.7 0-79.5-71.6-144-160-144z"/>
    <!-- Lightning bolt (AI symbol) -->
    <path d="M280 140l-40 80h30l-40 100 60-100h-30l20-80z"/>
  </g>
</svg>`

// Crear archivo SVG
const svgPath = path.join(publicDir, 'icon-placeholder.svg')
fs.writeFileSync(svgPath, placeholderSVG)

console.log('✅ Favicon placeholder SVG creado en:', svgPath)
console.log('')
console.log('📝 NOTA IMPORTANTE:')
console.log('Este es un placeholder temporal. Para producción:')
console.log('1. Diseña un logo profesional')
console.log('2. Usa https://favicon.io/ para generar todos los tamaños')
console.log('3. Reemplaza los archivos en public/')
console.log('')
console.log('Archivos necesarios:')
console.log('  - favicon.ico (32x32)')
console.log('  - icon-192.png (192x192)')
console.log('  - icon-512.png (512x512)')
console.log('  - apple-icon.png (180x180)')
console.log('  - og-image.png (1200x630)')
console.log('')
console.log('Lee GUIA_LOGOS_FAVICON.md para más detalles.')
