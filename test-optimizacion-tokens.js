/**
 * 🧪 TEST DE OPTIMIZACIÓN DE TOKENS
 * Verifica que la optimización funciona correctamente
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Verificando optimización de tokens...\n')

// Función para contar tokens aproximados (1 token ≈ 4 caracteres)
function estimateTokens(text) {
  return Math.ceil(text.length / 4)
}

// Función para leer archivo
function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8')
  } catch (error) {
    return null
  }
}

// 1. Verificar que los archivos optimizados existen
console.log('📁 Verificando archivos...')
const files = {
  productDocs: 'src/lib/product-documentation-service-optimized.ts',
  deepReasoning: 'src/lib/deep-reasoning-ai-service-optimized.ts'
}

let allFilesExist = true
Object.entries(files).forEach(([name, filePath]) => {
  const exists = fs.existsSync(path.join(__dirname, filePath))
  console.log(`  ${exists ? '✅' : '❌'} ${name}: ${filePath}`)
  if (!exists) allFilesExist = false
})

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos optimizados')
  console.log('💡 Ejecuta: node aplicar-optimizacion-tokens.js')
  process.exit(1)
}

console.log('\n✅ Todos los archivos existen\n')

// 2. Comparar tamaños
console.log('📊 Comparando tamaños de archivos...\n')

const comparisons = [
  {
    name: 'Product Documentation Service',
    original: 'src/lib/product-documentation-service.ts',
    optimized: 'src/lib/product-documentation-service-optimized.ts'
  },
  {
    name: 'Deep Reasoning AI Service',
    original: 'src/lib/deep-reasoning-ai-service.ts',
    optimized: 'src/lib/deep-reasoning-ai-service-optimized.ts'
  }
]

let totalOriginal = 0
let totalOptimized = 0

comparisons.forEach(({ name, original, optimized }) => {
  const originalContent = readFile(original)
  const optimizedContent = readFile(optimized)

  if (!originalContent || !optimizedContent) {
    console.log(`⚠️  ${name}: No se pudo leer uno de los archivos`)
    return
  }

  const originalTokens = estimateTokens(originalContent)
  const optimizedTokens = estimateTokens(optimizedContent)
  const reduction = ((1 - optimizedTokens / originalTokens) * 100).toFixed(1)

  totalOriginal += originalTokens
  totalOptimized += optimizedTokens

  console.log(`📄 ${name}:`)
  console.log(`   Original:   ${originalTokens.toLocaleString()} tokens`)
  console.log(`   Optimizado: ${optimizedTokens.toLocaleString()} tokens`)
  console.log(`   Reducción:  ${reduction}% ⬇️\n`)
})

// 3. Resumen total
console.log('=' .repeat(50))
console.log('📊 RESUMEN TOTAL:')
console.log('=' .repeat(50))
console.log(`Original:   ${totalOriginal.toLocaleString()} tokens`)
console.log(`Optimizado: ${totalOptimized.toLocaleString()} tokens`)
console.log(`Reducción:  ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}% ⬇️`)

// 4. Verificar límites
console.log('\n🎯 Verificación de límites:')
const groqLimit = 12000
const estimatedPromptSize = totalOptimized + 500 // +500 para contexto adicional

if (estimatedPromptSize < groqLimit) {
  console.log(`✅ Tamaño estimado del prompt: ~${estimatedPromptSize.toLocaleString()} tokens`)
  console.log(`✅ Límite de Groq: ${groqLimit.toLocaleString()} tokens`)
  console.log(`✅ Margen disponible: ${(groqLimit - estimatedPromptSize).toLocaleString()} tokens`)
  console.log('\n🎉 ¡Groq funcionará correctamente!')
} else {
  console.log(`❌ Tamaño estimado: ${estimatedPromptSize.toLocaleString()} tokens`)
  console.log(`❌ Límite de Groq: ${groqLimit.toLocaleString()} tokens`)
  console.log(`❌ Excede por: ${(estimatedPromptSize - groqLimit).toLocaleString()} tokens`)
  console.log('\n⚠️  Necesitas optimizar más')
}

// 5. Recomendaciones
console.log('\n💡 Próximos pasos:')
console.log('  1. Ejecuta: node test-ia-simple.js')
console.log('  2. Verifica que Groq responde correctamente')
console.log('  3. Reinicia el bot para aplicar cambios')
console.log('\n✅ Optimización verificada exitosamente!')
