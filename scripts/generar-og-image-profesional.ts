/**
 * Script para generar imagen Open Graph profesional
 * Tamaño: 1200x630px (recomendado por Facebook, WhatsApp, etc.)
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

async function generarOGImage() {
  console.log('🎨 Generando imagen Open Graph profesional...\n')

  const width = 1200
  const height = 630

  try {
    // Crear SVG con diseño profesional
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Fondo degradado -->
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          
          <!-- Patrón de puntos -->
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        
        <!-- Fondo -->
        <rect width="${width}" height="${height}" fill="url(#grad1)"/>
        <rect width="${width}" height="${height}" fill="url(#dots)"/>
        
        <!-- Contenedor principal -->
        <g>
          <!-- Icono de WhatsApp estilizado -->
          <circle cx="200" cy="315" r="80" fill="rgba(255,255,255,0.2)"/>
          <circle cx="200" cy="315" r="60" fill="#25D366"/>
          <path d="M 200 285 L 200 315 L 220 315" stroke="white" stroke-width="8" stroke-linecap="round" fill="none"/>
          <circle cx="225" cy="310" r="5" fill="white"/>
          
          <!-- Icono de IA/Robot -->
          <circle cx="1000" cy="315" r="80" fill="rgba(255,255,255,0.2)"/>
          <rect x="960" y="285" width="80" height="60" rx="10" fill="rgba(255,255,255,0.9)"/>
          <circle cx="980" cy="305" r="8" fill="#667eea"/>
          <circle cx="1020" cy="305" r="8" fill="#667eea"/>
          <rect x="975" y="325" width="50" height="4" rx="2" fill="#667eea"/>
          
          <!-- Texto principal -->
          <text x="600" y="240" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">
            Smart Sales Bot Pro
          </text>
          
          <!-- Subtítulo -->
          <text x="600" y="300" font-family="Arial, sans-serif" font-size="36" fill="rgba(255,255,255,0.95)" text-anchor="middle">
            Automatización de Ventas con IA
          </text>
          
          <!-- Características -->
          <g transform="translate(300, 380)">
            <!-- WhatsApp -->
            <circle cx="0" cy="0" r="8" fill="white"/>
            <text x="20" y="6" font-family="Arial, sans-serif" font-size="24" fill="white">
              WhatsApp Real
            </text>
            
            <!-- IA -->
            <circle cx="220" cy="0" r="8" fill="white"/>
            <text x="240" y="6" font-family="Arial, sans-serif" font-size="24" fill="white">
              IA Avanzada
            </text>
            
            <!-- 24/7 -->
            <circle cx="420" cy="0" r="8" fill="white"/>
            <text x="440" y="6" font-family="Arial, sans-serif" font-size="24" fill="white">
              24/7 Automático
            </text>
          </g>
          
          <!-- Footer -->
          <text x="600" y="580" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)" text-anchor="middle">
            Tecnovariedades D&amp;S
          </text>
        </g>
      </svg>
    `

    // Convertir SVG a PNG con sharp
    const outputPath = path.join(process.cwd(), 'public', 'og-image.png')
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath)

    console.log('✅ Imagen Open Graph generada exitosamente')
    console.log(`📁 Ubicación: ${outputPath}`)
    console.log(`📐 Tamaño: ${width}x${height}px`)
    console.log(`\n🌐 La imagen aparecerá cuando compartas el link en:`)
    console.log('   • WhatsApp')
    console.log('   • Facebook')
    console.log('   • Twitter/X')
    console.log('   • LinkedIn')
    console.log('   • Telegram')
    console.log('   • Etc.\n')

    // También generar versión para Twitter (más cuadrada)
    const twitterSvg = svg.replace(/height="630"/, 'height="600"')
    const twitterPath = path.join(process.cwd(), 'public', 'og-image-twitter.png')
    
    await sharp(Buffer.from(twitterSvg))
      .resize(1200, 600)
      .png()
      .toFile(twitterPath)

    console.log('✅ Imagen para Twitter generada')
    console.log(`📁 Ubicación: ${twitterPath}\n`)

  } catch (error) {
    console.error('❌ Error generando imagen:', error)
  }
}

// Ejecutar
generarOGImage()
