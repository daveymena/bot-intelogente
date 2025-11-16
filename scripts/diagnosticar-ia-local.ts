/**
 * Script de diagnóstico para verificar estado de IA Local
 */

import fs from 'fs'
import path from 'path'

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE IA LOCAL\n')
  console.log('=' .repeat(70))

  try {
    // 1. Verificar archivo del modelo
    console.log('\n1️⃣ Verificando archivo del modelo...')
    const modelPath = path.join(process.cwd(), 'data', 'local-ai-model.json')
    
    if (!fs.existsSync(modelPath)) {
      console.log('   ❌ Archivo NO encontrado:', modelPath)
      console.log('   ⚠️ Ejecuta: npx tsx scripts/cargar-todos-entrenamientos.ts')
      process.exit(1)
    }

    const modelContent = fs.readFileSync(modelPath, 'utf-8')
    const model = JSON.parse(modelContent)

    console.log('   ✅ Archivo encontrado')
    console.log(`   📦 Tamaño: ${(modelContent.length / 1024).toFixed(2)} KB`)

    // 2. Verificar estructura del modelo
    console.log('\n2️⃣ Verificando estructura del modelo...')
    
    if (!model.trainingData) {
      console.log('   ❌ No hay trainingData en el modelo')
      process.exit(1)
    }

    if (!model.trainingData.prompts) {
      console.log('   ❌ No hay prompts en trainingData')
      process.exit(1)
    }

    console.log('   ✅ Estructura correcta')

    // 3. Verificar datos de entrenamiento
    console.log('\n3️⃣ Verificando datos de entrenamiento...')
    
    const prompts = model.trainingData.prompts || []
    const responses = model.trainingData.responses || []
    const intents = model.trainingData.intents || []

    console.log(`   • Prompts: ${prompts.length}`)
    console.log(`   • Responses: ${responses.length}`)
    console.log(`   • Intents: ${intents.length}`)

    if (prompts.length === 0) {
      console.log('   ❌ NO HAY DATOS DE ENTRENAMIENTO')
      console.log('   ⚠️ Ejecuta: npx tsx scripts/cargar-todos-entrenamientos.ts')
      process.exit(1)
    }

    console.log('   ✅ Datos presentes')

    // 4. Verificar metadatos
    console.log('\n4️⃣ Verificando metadatos...')
    
    if (model.trainingMetadata) {
      console.log(`   • Total Prompts: ${model.trainingMetadata.totalPrompts}`)
      console.log(`   • Total Intents: ${model.trainingMetadata.totalIntents}`)
      console.log(`   • Total Categorías: ${model.trainingMetadata.totalCategories}`)
      console.log(`   • Total Conversaciones: ${model.trainingMetadata.totalConversaciones}`)
    }

    // 5. Mostrar ejemplos
    console.log('\n5️⃣ Ejemplos de entrenamiento...')
    
    for (let i = 0; i < Math.min(3, prompts.length); i++) {
      console.log(`\n   Ejemplo ${i + 1}:`)
      console.log(`   Q: "${prompts[i].substring(0, 60)}${prompts[i].length > 60 ? '...' : ''}"`)
      console.log(`   A: "${responses[i].substring(0, 60)}${responses[i].length > 60 ? '...' : ''}"`)
      console.log(`   Intent: ${intents[i]}`)
    }

    // 6. Verificar intenciones únicas
    console.log('\n6️⃣ Intenciones únicas...')
    
    const intentCounts: { [key: string]: number } = {}
    intents.forEach(intent => {
      intentCounts[intent] = (intentCounts[intent] || 0) + 1
    })

    Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([intent, count]) => {
        console.log(`   • ${intent}: ${count} ejemplos`)
      })

    // 7. Probar similitud
    console.log('\n7️⃣ Probando búsqueda de similitud...')
    
    const testMessage = 'Hola, busco un portátil'
    console.log(`   Mensaje de prueba: "${testMessage}"`)
    
    let bestMatch = { score: 0, prompt: '', response: '', intent: '' }
    
    for (let i = 0; i < prompts.length; i++) {
      const similarity = calculateSimilarity(testMessage.toLowerCase(), prompts[i].toLowerCase())
      if (similarity > bestMatch.score) {
        bestMatch = {
          score: similarity,
          prompt: prompts[i],
          response: responses[i],
          intent: intents[i]
        }
      }
    }

    console.log(`   ✅ Mejor coincidencia encontrada:`)
    console.log(`   Similitud: ${(bestMatch.score * 100).toFixed(0)}%`)
    console.log(`   Prompt: "${bestMatch.prompt.substring(0, 60)}..."`)
    console.log(`   Response: "${bestMatch.response.substring(0, 60)}..."`)
    console.log(`   Intent: ${bestMatch.intent}`)

    // Resumen
    console.log('\n' + '=' .repeat(70))
    console.log('✅ DIAGNÓSTICO COMPLETADO')
    console.log('=' .repeat(70))

    console.log('\n📊 RESUMEN:')
    console.log(`   ✅ Modelo: OK (${prompts.length} ejemplos)`)
    console.log(`   ✅ Estructura: OK`)
    console.log(`   ✅ Datos: OK`)
    console.log(`   ✅ Búsqueda: OK`)

    console.log('\n🚀 PRÓXIMOS PASOS:')
    console.log('   1. Reiniciar bot: npm run dev')
    console.log('   2. Enviar mensaje de prueba')
    console.log('   3. Verificar que respuesta es entrenada\n')

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
    process.exit(1)
  }
}

/**
 * Calcular similitud
 */
function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '').trim()
  const norm1 = normalize(text1)
  const norm2 = normalize(text2)

  if (norm1 === norm2) return 1.0

  const words1 = new Set(norm1.split(/\s+/).filter(w => w.length > 2))
  const words2 = new Set(norm2.split(/\s+/).filter(w => w.length > 2))

  if (words1.size === 0 || words2.size === 0) return 0

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

// Ejecutar
diagnosticar()
