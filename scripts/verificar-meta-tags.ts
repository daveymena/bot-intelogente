/**
 * Script para verificar que los meta tags de Open Graph estén correctos
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 Verificando Meta Tags de Open Graph\n')
console.log('='.repeat(50))

// Verificar archivos de imagen
console.log('\n📁 Verificando Archivos de Imagen:')

const imagesToCheck = [
  'public/og-image.png',
  'public/logo.png',
  'public/icon-512.png',
  'public/apple-icon.png',
  'public/favicon.ico'
]

let allImagesExist = true

for (const imagePath of imagesToCheck) {
  const exists = fs.existsSync(imagePath)
  const status = exists ? '✅' : '❌'
  console.log(`${status} ${imagePath}`)
  
  if (exists) {
    const stats = fs.statSync(imagePath)
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`   Tamaño: ${sizeInMB} MB`)
  } else {
    allImagesExist = false
  }
}

// Verificar archivos de Open Graph
console.log('\n📄 Verificando Archivos de Open Graph:')

const ogFiles = [
  'src/app/opengraph-image.tsx',
  'src/app/landing/opengraph-image.tsx',
  'public/index.html'
]

let allOgFilesExist = true

for (const filePath of ogFiles) {
  const exists = fs.existsSync(filePath)
  const status = exists ? '✅' : '❌'
  console.log(`${status} ${filePath}`)
  
  if (!exists) {
    allOgFilesExist = false
  }
}

// Verificar .env
console.log('\n⚙️  Verificando Variables de Entorno:')

const envPath = '.env'
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  
  const hasAppUrl = envContent.includes('NEXT_PUBLIC_APP_URL')
  console.log(`${hasAppUrl ? '✅' : '❌'} NEXT_PUBLIC_APP_URL configurado`)
  
  if (hasAppUrl) {
    const match = envContent.match(/NEXT_PUBLIC_APP_URL=(.+)/)
    if (match) {
      console.log(`   URL: ${match[1]}`)
    }
  }
} else {
  console.log('❌ Archivo .env no encontrado')
}

// Verificar layout.tsx
console.log('\n📝 Verificando Layout Principal:')

const layoutPath = 'src/app/layout.tsx'
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
  
  const hasOpenGraph = layoutContent.includes('openGraph:')
  const hasImages = layoutContent.includes('images:')
  const hasOgImage = layoutContent.includes('opengraph-image')
  
  console.log(`${hasOpenGraph ? '✅' : '❌'} openGraph configurado`)
  console.log(`${hasImages ? '✅' : '❌'} images configurado`)
  console.log(`${hasOgImage ? '✅' : '❌'} opengraph-image referenciado`)
} else {
  console.log('❌ Layout no encontrado')
}

// Resumen
console.log('\n📊 Resumen:')
console.log('='.repeat(50))

if (allImagesExist && allOgFilesExist) {
  console.log('✅ Todos los archivos necesarios existen')
  console.log('\n🚀 Próximos pasos:')
  console.log('1. Desplegar cambios en Easypanel')
  console.log('2. Limpiar cache de WhatsApp:')
  console.log('   https://developers.facebook.com/tools/debug/')
  console.log('3. Verificar que aparezca el logo en WhatsApp')
} else {
  console.log('❌ Faltan algunos archivos')
  console.log('\n🔧 Acciones necesarias:')
  
  if (!allImagesExist) {
    console.log('- Crear/verificar imágenes en public/')
  }
  
  if (!allOgFilesExist) {
    console.log('- Crear archivos de Open Graph')
  }
}

console.log('\n📖 Ver guía completa: ARREGLAR_LOGO_WHATSAPP.md')
