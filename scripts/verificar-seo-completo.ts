/**
 * Script para verificar la configuración SEO completa
 * Ejecutar: npx tsx scripts/verificar-seo-completo.ts
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 Verificando configuración SEO...\n')

const publicDir = path.join(process.cwd(), 'public')
const srcDir = path.join(process.cwd(), 'src')

// Archivos requeridos
const requiredFiles = {
  'Configuración': [
    { path: 'public/manifest.json', name: 'PWA Manifest', required: true },
    { path: 'public/robots.txt', name: 'Robots.txt', required: true },
    { path: 'src/app/sitemap.ts', name: 'Sitemap dinámico', required: true },
  ],
  'Componentes SEO': [
    { path: 'src/components/StructuredData.tsx', name: 'Structured Data Component', required: true },
    { path: 'src/lib/seo-schema.ts', name: 'SEO Schemas', required: true },
  ],
  'Layouts con SEO': [
    { path: 'src/app/catalogo/layout.tsx', name: 'Catálogo Layout', required: true },
    { path: 'src/app/membresias/layout.tsx', name: 'Membresías Layout', required: true },
    { path: 'src/app/tienda/layout.tsx', name: 'Tienda Layout', required: true },
  ],
  'Imágenes (Pendientes)': [
    { path: 'public/favicon.ico', name: 'Favicon principal', required: false },
    { path: 'public/icon-192.png', name: 'Icono Android 192', required: false },
    { path: 'public/icon-512.png', name: 'Icono Android 512', required: false },
    { path: 'public/apple-icon.png', name: 'Icono Apple', required: false },
    { path: 'public/og-image.png', name: 'Imagen Open Graph', required: false },
  ],
  'Documentación': [
    { path: 'GUIA_LOGOS_FAVICON.md', name: 'Guía de Logos', required: true },
    { path: 'CONFIGURACION_SEO_COMPLETA.md', name: 'Config SEO', required: true },
    { path: 'PROMPTS_IA_LOGOS.md', name: 'Prompts IA', required: true },
    { path: 'ACCION_LOGOS_FAVICON.md', name: 'Acción Rápida', required: true },
  ],
}

let allGood = true
let pendingImages = 0

for (const [category, files] of Object.entries(requiredFiles)) {
  console.log(`\n📁 ${category}:`)
  
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file.path)
    const exists = fs.existsSync(fullPath)
    
    if (exists) {
      console.log(`  ✅ ${file.name}`)
    } else {
      if (file.required) {
        console.log(`  ❌ ${file.name} - FALTA (requerido)`)
        allGood = false
      } else {
        console.log(`  ⏳ ${file.name} - Pendiente de crear`)
        pendingImages++
      }
    }
  }
}

// Verificar variables de entorno
console.log('\n\n🔧 Variables de Entorno:')
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  
  const checkEnvVar = (varName: string, description: string, required: boolean = false) => {
    const hasVar = envContent.includes(varName)
    const hasValue = new RegExp(`${varName}=.+`).test(envContent)
    
    if (hasValue) {
      console.log(`  ✅ ${description}`)
    } else if (hasVar) {
      console.log(`  ⚠️  ${description} - Definida pero sin valor`)
    } else if (required) {
      console.log(`  ❌ ${description} - FALTA`)
      allGood = false
    } else {
      console.log(`  ⏳ ${description} - Opcional, no configurada`)
    }
  }
  
  checkEnvVar('NEXT_PUBLIC_APP_URL', 'URL de la aplicación', false)
  checkEnvVar('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION', 'Google Search Console', false)
  checkEnvVar('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'Google Analytics', false)
} else {
  console.log('  ⚠️  Archivo .env no encontrado')
}

// Resumen
console.log('\n\n' + '='.repeat(60))
console.log('📊 RESUMEN DE VERIFICACIÓN SEO')
console.log('='.repeat(60))

if (allGood && pendingImages === 0) {
  console.log('\n✅ ¡TODO PERFECTO! SEO completamente configurado.')
  console.log('   Tu sitio está listo para producción.')
} else if (allGood && pendingImages > 0) {
  console.log('\n✅ Configuración SEO: COMPLETA')
  console.log(`⏳ Imágenes pendientes: ${pendingImages}`)
  console.log('\n📝 ACCIÓN REQUERIDA:')
  console.log('   Crea los logos y favicons siguiendo la guía:')
  console.log('   → Lee: ACCION_LOGOS_FAVICON.md')
  console.log('   → O ejecuta: npm run seo:placeholder (temporal)')
} else {
  console.log('\n❌ Hay archivos requeridos faltantes.')
  console.log('   Revisa los errores arriba y corrige.')
}

console.log('\n' + '='.repeat(60))

// Información adicional
console.log('\n📚 DOCUMENTACIÓN DISPONIBLE:')
console.log('   • LISTO_SEO_PROFESIONAL.md - Resumen ejecutivo')
console.log('   • GUIA_LOGOS_FAVICON.md - Guía completa de logos')
console.log('   • PROMPTS_IA_LOGOS.md - Prompts para generar con IA')
console.log('   • ACCION_LOGOS_FAVICON.md - Acción rápida (15 min)')
console.log('   • CONFIGURACION_SEO_COMPLETA.md - Documentación técnica')

console.log('\n🚀 PRÓXIMOS PASOS:')
if (pendingImages > 0) {
  console.log('   1. Crea los logos (15 minutos)')
  console.log('      → Usa Canva: https://www.canva.com/')
  console.log('      → O IA: DALL-E, Midjourney, Leonardo.ai')
  console.log('   2. Genera favicons')
  console.log('      → Usa: https://favicon.io/')
  console.log('   3. Copia archivos a public/')
  console.log('   4. Reinicia: npm run dev')
  console.log('   5. Verifica: npm run seo:check')
} else {
  console.log('   1. Actualiza .env con URL de producción')
  console.log('   2. Verifica Open Graph: https://www.opengraph.xyz/')
  console.log('   3. Verifica Rich Results: https://search.google.com/test/rich-results')
  console.log('   4. Configura Google Search Console')
  console.log('   5. Configura Google Analytics (opcional)')
}

console.log('\n✨ ¡Tu bot tiene SEO profesional!')
console.log('')
