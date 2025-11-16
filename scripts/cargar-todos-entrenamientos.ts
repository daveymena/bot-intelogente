/**
 * Script para cargar TODOS los datos de entrenamiento disponibles
 * Lee múltiples datasets y los carga en el modelo
 */

import fs from 'fs'
import path from 'path'

async function cargarTodosEntrenamientos() {
  console.log('📚 Cargando TODOS los datos de entrenamiento en IA Local...\n')

  try {
    const trainingDir = path.join(process.cwd(), 'data', 'training')

    // Archivos a procesar
    const datasets = [
      'dataset_completo_1763231606123.json',
      'dataset_ollama_1763232085718.json',
      'dataset_productos_1763232621999.json'
    ]

    const trainingData = {
      prompts: [] as string[],
      responses: [] as string[],
      intents: [] as string[],
      categories: [] as string[],
      conversaciones: [] as any[]
    }

    let totalProcesados = 0

    // Procesar cada dataset
    for (const dataset of datasets) {
      const datasetPath = path.join(trainingDir, dataset)

      if (!fs.existsSync(datasetPath)) {
        console.log(`⚠️ Dataset no encontrado: ${dataset}`)
        continue
      }

      console.log(`📖 Procesando: ${dataset}`)

      const content = fs.readFileSync(datasetPath, 'utf-8')
      const data = JSON.parse(content)

      // Procesar según formato
      if (data.flujos) {
        // Formato: dataset_completo
        for (const [flujoKey, flujoData] of Object.entries(data.flujos)) {
          const flujo = flujoData as any
          console.log(`   📝 Flujo: ${flujo.nombre}`)

          for (const conversation of flujo.conversaciones || []) {
            const messages = conversation.messages || []

            for (let i = 0; i < messages.length - 1; i += 2) {
              const userMsg = messages[i]
              const assistantMsg = messages[i + 1]

              if (userMsg?.role === 'user' && assistantMsg?.role === 'assistant') {
                trainingData.prompts.push(userMsg.content)
                trainingData.responses.push(assistantMsg.content)
                trainingData.intents.push(flujoKey)
                trainingData.categories.push(flujoKey)
                totalProcesados++
              }
            }

            trainingData.conversaciones.push({
              id: conversation.conversation_id,
              flujo: flujoKey,
              outcome: conversation.outcome
            })
          }
        }
      } else if (Array.isArray(data)) {
        // Formato: array de conversaciones
        console.log(`   📝 Conversaciones: ${data.length}`)

        for (const item of data) {
          const messages = item.messages || []
          const category = item.category || item.metadata?.intent || 'general'

          if (messages.length >= 2) {
            const userMsg = messages[0]
            const assistantMsg = messages[1]

            if (userMsg?.role === 'user' && assistantMsg?.role === 'assistant') {
              trainingData.prompts.push(userMsg.content)
              trainingData.responses.push(assistantMsg.content)
              trainingData.intents.push(item.metadata?.intent || category)
              trainingData.categories.push(category)
              totalProcesados++

              trainingData.conversaciones.push({
                id: item.id,
                category: category,
                intent: item.metadata?.intent
              })
            }
          }
        }
      }

      console.log(`   ✅ Procesados: ${totalProcesados} ejemplos\n`)
    }

    console.log(`\n✅ Total de ejemplos cargados: ${totalProcesados}\n`)

    // Crear modelo actualizado
    console.log('🔧 Creando modelo de IA Local...')

    const model = {
      version: '3.0',
      type: 'local-ai-trained-complete',
      createdAt: new Date().toISOString(),
      trainingMetadata: {
        totalPrompts: trainingData.prompts.length,
        totalResponses: trainingData.responses.length,
        totalIntents: new Set(trainingData.intents).size,
        totalCategories: new Set(trainingData.categories).size,
        totalConversaciones: trainingData.conversaciones.length,
        intents: [...new Set(trainingData.intents)],
        categories: [...new Set(trainingData.categories)]
      },
      trainingData: {
        prompts: trainingData.prompts,
        responses: trainingData.responses,
        intents: trainingData.intents,
        categories: trainingData.categories
      },
      config: {
        maxTokens: 500,
        temperature: 0.7,
        topP: 0.9,
        responseMode: 'trained',
        similarityThreshold: 0.6
      }
    }

    console.log(`✅ Modelo creado con ${trainingData.prompts.length} ejemplos\n`)

    // Guardar modelo
    console.log('💾 Guardando modelo...')

    const modelPath = path.join(process.cwd(), 'data', 'local-ai-model.json')
    fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')

    console.log(`✅ Modelo guardado\n`)

    // Crear índice de búsqueda
    console.log('🔍 Creando índice de búsqueda...')

    const index = {
      version: '2.0',
      createdAt: new Date().toISOString(),
      totalEntries: trainingData.prompts.length,
      entries: trainingData.prompts.map((prompt, idx) => ({
        id: idx,
        prompt: prompt.substring(0, 100),
        responseLength: trainingData.responses[idx]?.length || 0,
        intent: trainingData.intents[idx],
        category: trainingData.categories[idx],
        keywords: extractKeywords(prompt)
      }))
    }

    const indexPath = path.join(process.cwd(), 'data', 'training-index.json')
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8')

    console.log(`✅ Índice creado\n`)

    // Resumen
    console.log('=' .repeat(70))
    console.log('✅ TODOS LOS ENTRENAMIENTOS CARGADOS EXITOSAMENTE')
    console.log('=' .repeat(70))

    console.log('\n📊 Estadísticas Finales:')
    console.log(`   • Total de Prompts: ${trainingData.prompts.length}`)
    console.log(`   • Total de Respuestas: ${trainingData.responses.length}`)
    console.log(`   • Intenciones únicas: ${new Set(trainingData.intents).size}`)
    console.log(`   • Categorías únicas: ${new Set(trainingData.categories).size}`)
    console.log(`   • Conversaciones: ${trainingData.conversaciones.length}`)

    console.log('\n🎯 Intenciones Entrenadas:')
    const intentCounts: { [key: string]: number } = {}
    trainingData.intents.forEach(intent => {
      intentCounts[intent] = (intentCounts[intent] || 0) + 1
    })

    Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([intent, count]) => {
        console.log(`   • ${intent}: ${count} ejemplos`)
      })

    console.log('\n🎯 Categorías Entrenadas:')
    const categoryCounts: { [key: string]: number } = {}
    trainingData.categories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   • ${category}: ${count} ejemplos`)
      })

    console.log('\n🚀 Próximos pasos:')
    console.log('   1. Reiniciar bot: npm run dev')
    console.log('   2. Enviar mensajes de prueba')
    console.log('   3. Verificar que respuestas son mucho mejores')
    console.log('   4. Monitorear logs para ver respuestas entrenadas\n')

    console.log('=' .repeat(70))

  } catch (error) {
    console.error('❌ Error cargando entrenamientos:', error)
    process.exit(1)
  }
}

/**
 * Extraer palabras clave
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'por', 'con', 'su', 'para',
    'es', 'al', 'lo', 'como', 'más', 'o', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque',
    'esta', 'son', 'entre', 'está', 'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'también',
    'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'están', 'estado', 'desde', 'todo', 'nos',
    'durante', 'estados', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'fueron', 'ese',
    'eso', 'había', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos',
    'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada',
    'muchos', 'cual', 'sea', 'poco', 'ella', 'estar', 'haber', 'estas', 'estaba', 'estamos',
    'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras',
    'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas'
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))

  return [...new Set(words)].slice(0, 5)
}

// Ejecutar
cargarTodosEntrenamientos()
