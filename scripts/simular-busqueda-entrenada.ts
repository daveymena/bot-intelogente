/**
 * Script para simular exactamente lo que hace el bot
 */

import fs from 'fs'
import path from 'path'

async function simular() {
  console.log('🤖 SIMULANDO BÚSQUEDA DE RESPUESTA ENTRENADA\n')

  try {
    const modelPath = path.join(process.cwd(), 'data', 'local-ai-model.json')
    const modelContent = fs.readFileSync(modelPath, 'utf-8')
    const model = JSON.parse(modelContent)

    const prompts = model.trainingData.prompts || []
    const responses = model.trainingData.responses || []
    const intents = model.trainingData.intents || []

    console.log(`📊 Modelo cargado: ${prompts.length} ejemplos\n`)

    // Simular el mensaje del usuario
    const userMessage = 'Estoy interesado en el curso de piano'
    console.log(`👤 Mensaje del usuario: "${userMessage}"`)

    // Detectar intención (como lo hace el bot)
    const intent = detectIntent(userMessage)
    console.log(`🎯 Intención detectada: "${intent}"\n`)

    // Buscar respuesta entrenada
    console.log(`🔍 Buscando en ${prompts.length} ejemplos...\n`)

    let bestMatch = { score: 0, idx: -1, prompt: '', response: '', intent: '', strategy: '' }

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i].toLowerCase()
      const trainedIntent = intents[i]
      const response = responses[i]

      const similarity = calculateSimilarity(userMessage.toLowerCase(), prompt)

      // Estrategia 1
      if (similarity > 0.5 && trainedIntent === intent) {
        if (similarity > bestMatch.score) {
          bestMatch = {
            score: similarity,
            idx: i,
            prompt: prompts[i],
            response: response,
            intent: trainedIntent,
            strategy: 'Estrategia 1 (intención exacta + similitud > 50%)'
          }
        }
      }

      // Estrategia 2
      if (similarity > 0.7 && bestMatch.score < 0.5) {
        if (similarity > bestMatch.score) {
          bestMatch = {
            score: similarity,
            idx: i,
            prompt: prompts[i],
            response: response,
            intent: trainedIntent,
            strategy: 'Estrategia 2 (similitud > 70%)'
          }
        }
      }

      // Estrategia 3
      if (similarity > bestMatch.score) {
        bestMatch = {
          score: similarity,
          idx: i,
          prompt: prompts[i],
          response: response,
          intent: trainedIntent,
          strategy: 'Estrategia 3 (mejor coincidencia general)'
        }
      }
    }

    console.log(`🎯 Mejor coincidencia encontrada:`)
    console.log(`   Similitud: ${(bestMatch.score * 100).toFixed(0)}%`)
    console.log(`   Estrategia: ${bestMatch.strategy}`)
    console.log(`   Intención: ${bestMatch.intent}`)
    console.log(`   Prompt: "${bestMatch.prompt.substring(0, 80)}..."`)
    console.log(`   Response: "${bestMatch.response.substring(0, 80)}..."\n`)

    // Verificar umbral
    console.log(`📋 Verificación de umbral:`)
    console.log(`   Similitud: ${(bestMatch.score * 100).toFixed(0)}%`)
    console.log(`   Umbral: 20%`)

    if (bestMatch.score > 0.2) {
      console.log(`   ✅ PASA - Usar respuesta entrenada\n`)
      console.log(`📤 RESPUESTA FINAL:`)
      console.log(`${bestMatch.response}`)
    } else {
      console.log(`   ❌ NO PASA - Usar respuesta genérica\n`)
      console.log(`📤 RESPUESTA FINAL:`)
      console.log(`¡Claro! Te ayudo con gusto:`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.match(/buscar|mostrar|ver|qué tienes|qué hay|catálogo|productos/i)) {
    return 'search'
  }

  if (lowerMessage.match(/comprar|quiero|necesito|precio|cuánto cuesta|costo|interesado|interesa/i)) {
    return 'purchase'
  }

  if (lowerMessage.match(/pagar|pago|transferencia|nequi|daviplata|tarjeta|mercado pago/i)) {
    return 'payment'
  }

  if (lowerMessage.match(/información|detalles|especificaciones|características|descripción/i)) {
    return 'info'
  }

  if (lowerMessage.match(/ayuda|problema|error|no funciona|soporte|contacto/i)) {
    return 'support'
  }

  if (lowerMessage.match(/estado|pedido|orden|seguimiento|dónde está|cuándo llega/i)) {
    return 'tracking'
  }

  if (lowerMessage.match(/recomienda|sugerencia|qué me recomiendas|mejor|popular/i)) {
    return 'recommendation'
  }

  return 'general'
}

function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '').trim()
  const norm1 = normalize(text1)
  const norm2 = normalize(text2)

  if (norm1 === norm2) return 1.0

  const words1 = norm1.split(/\s+/).filter(w => w.length > 2)
  const words2 = norm2.split(/\s+/).filter(w => w.length > 2)

  if (words1.length === 0 || words2.length === 0) return 0

  const set1 = new Set(words1)
  const set2 = new Set(words2)
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  const jaccardSimilarity = intersection.size / union.size

  const importantKeywords = ['curso', 'piano', 'precio', 'comprar', 'quiero', 'necesito', 'busco', 'interesado', 'interesa']
  const commonKeywords = importantKeywords.filter(kw => norm1.includes(kw) && norm2.includes(kw))
  const keywordBonus = commonKeywords.length > 0 ? 0.3 : 0

  const actionWords = ['busco', 'quiero', 'necesito', 'interesado', 'interesa', 'precio', 'costo', 'cuánto']
  const hasActionWord1 = actionWords.some(w => norm1.includes(w))
  const hasActionWord2 = actionWords.some(w => norm2.includes(w))
  const actionBonus = (hasActionWord1 && hasActionWord2) ? 0.2 : 0

  const lengthRatio = Math.min(words1.length, words2.length) / Math.max(words1.length, words2.length)
  const lengthBonus = lengthRatio > 0.5 ? 0.1 : 0

  const finalSimilarity = Math.min(1.0, jaccardSimilarity + keywordBonus + actionBonus + lengthBonus)

  return finalSimilarity
}

simular()
