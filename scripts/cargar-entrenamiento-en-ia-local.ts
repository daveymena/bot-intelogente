/**
 * Script para cargar datos de entrenamiento en la IA Local
 * Lee los archivos de training y los carga en el modelo
 */

import fs from 'fs'
import path from 'path'

async function cargarEntrenamiento() {
  console.log('📚 Cargando datos de entrenamiento en IA Local...\n')

  try {
    // 1. Leer archivos de entrenamiento
    console.log('1️⃣ Leyendo archivos de entrenamiento...')

    const trainingDir = path.join(process.cwd(), 'data', 'training')
    const datasetPath = path.join(trainingDir, 'dataset_completo_1763231606123.json')

    if (!fs.existsSync(datasetPath)) {
      console.error('❌ Archivo de dataset no encontrado:', datasetPath)
      process.exit(1)
    }

    const datasetContent = fs.readFileSync(datasetPath, 'utf-8')
    const dataset = JSON.parse(datasetContent)

    console.log(`   ✅ Dataset cargado: ${dataset.metadata.total_flujos} flujos`)
    console.log(`   ✅ Total conversaciones: ${dataset.metadata.total_conversaciones}\n`)

    // 2. Extraer conversaciones
    console.log('2️⃣ Extrayendo conversaciones...')

    const trainingData = {
      prompts: [] as string[],
      responses: [] as string[],
      intents: [] as string[],
      conversaciones: [] as any[]
    }

    let totalConversaciones = 0

    for (const [flujoKey, flujoData] of Object.entries(dataset.flujos)) {
      const flujo = flujoData as any
      console.log(`   📝 Procesando flujo: ${flujo.nombre}`)

      for (const conversation of flujo.conversaciones || []) {
        const messages = conversation.messages || []

        // Extraer pares pregunta-respuesta
        for (let i = 0; i < messages.length - 1; i += 2) {
          const userMsg = messages[i]
          const assistantMsg = messages[i + 1]

          if (userMsg?.role === 'user' && assistantMsg?.role === 'assistant') {
            trainingData.prompts.push(userMsg.content)
            trainingData.responses.push(assistantMsg.content)
            trainingData.intents.push(flujoKey)
            totalConversaciones++
          }
        }

        trainingData.conversaciones.push({
          id: conversation.conversation_id,
          flujo: flujoKey,
          outcome: conversation.outcome,
          messageCount: messages.length
        })
      }
    }

    console.log(`   ✅ Total pares pregunta-respuesta: ${totalConversaciones}\n`)

    // 3. Crear modelo actualizado
    console.log('3️⃣ Creando modelo de IA Local...')

    const model = {
      version: '2.0',
      type: 'local-ai-trained',
      createdAt: new Date().toISOString(),
      trainingMetadata: {
        totalPrompts: trainingData.prompts.length,
        totalResponses: trainingData.responses.length,
        totalIntents: new Set(trainingData.intents).size,
        totalConversaciones: trainingData.conversaciones.length,
        flujos: Object.keys(dataset.flujos)
      },
      trainingData: {
        prompts: trainingData.prompts,
        responses: trainingData.responses,
        intents: trainingData.intents
      },
      config: {
        maxTokens: 500,
        temperature: 0.7,
        topP: 0.9,
        responseMode: 'trained' // Usar respuestas entrenadas
      }
    }

    console.log(`   ✅ Modelo creado con ${trainingData.prompts.length} ejemplos\n`)

    // 4. Guardar modelo
    console.log('4️⃣ Guardando modelo...')

    const modelPath = path.join(process.cwd(), 'data', 'local-ai-model.json')
    fs.writeFileSync(modelPath, JSON.stringify(model, null, 2), 'utf-8')

    console.log(`   ✅ Modelo guardado en: ${modelPath}\n`)

    // 5. Crear archivo de índice para búsqueda rápida
    console.log('5️⃣ Creando índice de búsqueda...')

    const index = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      totalEntries: trainingData.prompts.length,
      entries: trainingData.prompts.map((prompt, idx) => ({
        id: idx,
        prompt: prompt.substring(0, 100), // Primeros 100 caracteres
        responseLength: trainingData.responses[idx]?.length || 0,
        intent: trainingData.intents[idx],
        keywords: extractKeywords(prompt)
      }))
    }

    const indexPath = path.join(process.cwd(), 'data', 'training-index.json')
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8')

    console.log(`   ✅ Índice creado con ${index.totalEntries} entradas\n`)

    // 6. Resumen
    console.log('=' .repeat(60))
    console.log('✅ ENTRENAMIENTO CARGADO EXITOSAMENTE')
    console.log('=' .repeat(60))

    console.log('\n📊 Estadísticas:')
    console.log(`   • Prompts: ${trainingData.prompts.length}`)
    console.log(`   • Respuestas: ${trainingData.responses.length}`)
    console.log(`   • Intenciones únicas: ${new Set(trainingData.intents).size}`)
    console.log(`   • Conversaciones: ${trainingData.conversaciones.length}`)

    console.log('\n🎯 Flujos entrenados:')
    Object.keys(dataset.flujos).forEach(flujo => {
      const count = trainingData.intents.filter(i => i === flujo).length
      console.log(`   • ${flujo}: ${count} ejemplos`)
    })

    console.log('\n🚀 Próximos pasos:')
    console.log('   1. Reiniciar bot: npm run dev')
    console.log('   2. Enviar mensaje de prueba')
    console.log('   3. Verificar que respuestas son mejores\n')

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error cargando entrenamiento:', error)
    process.exit(1)
  }
}

/**
 * Extraer palabras clave de un texto
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
cargarEntrenamiento()
