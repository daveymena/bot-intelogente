/**
 * Script de debug para verificar qué está pasando con el modelo entrenado
 */

import fs from 'fs'
import path from 'path'

async function debug() {
  console.log('🔍 DEBUG: Verificando modelo entrenado\n')

  try {
    const modelPath = path.join(process.cwd(), 'data', 'local-ai-model.json')

    // 1. Verificar que el archivo existe
    if (!fs.existsSync(modelPath)) {
      console.log('❌ Archivo NO existe:', modelPath)
      process.exit(1)
    }

    console.log('✅ Archivo existe\n')

    // 2. Leer y parsear
    const content = fs.readFileSync(modelPath, 'utf-8')
    const model = JSON.parse(content)

    console.log('📊 Estructura del modelo:')
    console.log(`   • version: ${model.version}`)
    console.log(`   • type: ${model.type}`)
    console.log(`   • trainingData: ${model.trainingData ? 'SÍ' : 'NO'}`)

    if (!model.trainingData) {
      console.log('\n❌ NO HAY trainingData')
      process.exit(1)
    }

    console.log(`   • prompts: ${model.trainingData.prompts ? model.trainingData.prompts.length : 0}`)
    console.log(`   • responses: ${model.trainingData.responses ? model.trainingData.responses.length : 0}`)
    console.log(`   • intents: ${model.trainingData.intents ? model.trainingData.intents.length : 0}`)

    const prompts = model.trainingData.prompts || []
    const responses = model.trainingData.responses || []
    const intents = model.trainingData.intents || []

    if (prompts.length === 0) {
      console.log('\n❌ NO HAY PROMPTS - El modelo está vacío')
      process.exit(1)
    }

    console.log(`\n✅ Modelo tiene ${prompts.length} ejemplos\n`)

    // 3. Mostrar ejemplos
    console.log('📝 Primeros 5 ejemplos:')
    for (let i = 0; i < Math.min(5, prompts.length); i++) {
      console.log(`\n   ${i + 1}. Prompt: "${prompts[i].substring(0, 80)}${prompts[i].length > 80 ? '...' : ''}"`)
      console.log(`      Response: "${responses[i].substring(0, 80)}${responses[i].length > 80 ? '...' : ''}"`)
      console.log(`      Intent: ${intents[i]}`)
    }

    // 4. Buscar ejemplos de "piano"
    console.log('\n\n🎹 Buscando ejemplos de "piano":')
    let found = 0
    for (let i = 0; i < prompts.length; i++) {
      if (prompts[i].toLowerCase().includes('piano')) {
        console.log(`\n   Encontrado en índice ${i}:`)
        console.log(`   Q: "${prompts[i]}"`)
        console.log(`   A: "${responses[i]}"`)
        console.log(`   Intent: ${intents[i]}`)
        found++
        if (found >= 3) break
      }
    }

    if (found === 0) {
      console.log('   ❌ No hay ejemplos de "piano" en el modelo')
    }

    // 5. Buscar ejemplos de "curso"
    console.log('\n\n📚 Buscando ejemplos de "curso":')
    found = 0
    for (let i = 0; i < prompts.length; i++) {
      if (prompts[i].toLowerCase().includes('curso')) {
        console.log(`\n   Encontrado en índice ${i}:`)
        console.log(`   Q: "${prompts[i]}"`)
        console.log(`   A: "${responses[i]}"`)
        console.log(`   Intent: ${intents[i]}`)
        found++
        if (found >= 3) break
      }
    }

    if (found === 0) {
      console.log('   ❌ No hay ejemplos de "curso" en el modelo')
    }

    // 6. Contar intenciones
    console.log('\n\n🎯 Conteo de intenciones:')
    const intentCounts: { [key: string]: number } = {}
    intents.forEach(intent => {
      intentCounts[intent] = (intentCounts[intent] || 0) + 1
    })

    Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([intent, count]) => {
        console.log(`   • ${intent}: ${count}`)
      })

    // 7. Probar similitud
    console.log('\n\n🔍 Probando similitud con "Estoy interesado en el curso de piano":')
    
    const testMessage = 'Estoy interesado en el curso de piano'
    let bestMatch = { score: 0, idx: -1, prompt: '', response: '', intent: '' }

    for (let i = 0; i < prompts.length; i++) {
      const similarity = calculateSimilarity(testMessage.toLowerCase(), prompts[i].toLowerCase())
      if (similarity > bestMatch.score) {
        bestMatch = {
          score: similarity,
          idx: i,
          prompt: prompts[i],
          response: responses[i],
          intent: intents[i]
        }
      }
    }

    console.log(`   Mejor coincidencia (similitud: ${(bestMatch.score * 100).toFixed(0)}%):`)
    console.log(`   Q: "${bestMatch.prompt}"`)
    console.log(`   A: "${bestMatch.response}"`)
    console.log(`   Intent: ${bestMatch.intent}`)

    if (bestMatch.score < 0.5) {
      console.log(`\n   ⚠️ Similitud muy baja (${(bestMatch.score * 100).toFixed(0)}%)`);
      console.log('   Esto explica por qué no encuentra respuestas entrenadas')
    }

    console.log('\n' + '=' .repeat(70))
    console.log('✅ DEBUG COMPLETADO')
    console.log('=' .repeat(70))

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

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

debug()
