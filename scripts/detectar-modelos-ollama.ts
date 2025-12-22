/**
 * 🔍 DETECTAR MODELOS DISPONIBLES EN OLLAMA
 * 
 * Detecta qué modelos están instalados y sugiere el mejor
 */

interface OllamaModel {
  name: string
  size: number
  modified_at: string
}

interface ModelRecommendation {
  name: string
  speed: string
  quality: string
  recommended: boolean
  reason: string
}

async function detectarModelos() {
  console.log('🔍 DETECTANDO MODELOS EN OLLAMA\n')
  console.log('=' .repeat(60))

  const ollamaUrl = process.env.OLLAMA_URL || 'https://davey-ollama2.mapf5v.easypanel.host'

  console.log(`\n📍 URL: ${ollamaUrl}\n`)

  // 1️⃣ Obtener modelos disponibles
  console.log('1️⃣ CONSULTANDO MODELOS DISPONIBLES...\n')

  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`)
      console.log('\n💡 SOLUCIÓN:')
      console.log('   - Verifica que Ollama esté corriendo en Easypanel')
      console.log('   - Verifica la URL en .env')
      return
    }

    const data = await response.json()

    if (!data.models || data.models.length === 0) {
      console.log('⚠️ NO HAY MODELOS INSTALADOS\n')
      console.log('💡 INSTALAR MODELOS RECOMENDADOS:')
      console.log('   ollama pull llama3.2:3b    # Recomendado (rápido y bueno)')
      console.log('   ollama pull gemma2:2b      # Alternativa (muy rápido)')
      console.log('   ollama pull mistral:7b     # Alta calidad (más lento)')
      return
    }

    console.log(`✅ Encontrados ${data.models.length} modelos:\n`)

    // Mostrar modelos disponibles
    data.models.forEach((model: OllamaModel, index: number) => {
      const sizeGB = (model.size / 1024 / 1024 / 1024).toFixed(2)
      console.log(`${index + 1}. ${model.name}`)
      console.log(`   Tamaño: ${sizeGB} GB`)
      console.log(`   Modificado: ${new Date(model.modified_at).toLocaleString('es-CO')}`)
      console.log()
    })

    // 2️⃣ Analizar y recomendar
    console.log('2️⃣ ANÁLISIS Y RECOMENDACIONES...\n')

    const recommendations: ModelRecommendation[] = []

    // Analizar cada modelo
    for (const model of data.models) {
      const modelName = model.name.toLowerCase()
      
      // Llama 3.2
      if (modelName.includes('llama3.2')) {
        if (modelName.includes('3b')) {
          recommendations.push({
            name: model.name,
            speed: '⚡⚡⚡⚡',
            quality: '⭐⭐⭐⭐',
            recommended: true,
            reason: 'Excelente balance velocidad/calidad'
          })
        } else if (modelName.includes('1b')) {
          recommendations.push({
            name: model.name,
            speed: '⚡⚡⚡⚡⚡',
            quality: '⭐⭐⭐',
            recommended: false,
            reason: 'Muy rápido pero calidad limitada'
          })
        }
      }
      
      // Gemma 2
      else if (modelName.includes('gemma2')) {
        if (modelName.includes('2b')) {
          recommendations.push({
            name: model.name,
            speed: '⚡⚡⚡⚡⚡',
            quality: '⭐⭐⭐',
            recommended: true,
            reason: 'Muy rápido para respuestas simples'
          })
        } else if (modelName.includes('9b')) {
          recommendations.push({
            name: model.name,
            speed: '⚡⚡',
            quality: '⭐⭐⭐⭐⭐',
            recommended: false,
            reason: 'Alta calidad pero lento'
          })
        }
      }
      
      // Mistral
      else if (modelName.includes('mistral')) {
        if (modelName.includes('7b')) {
          recommendations.push({
            name: model.name,
            speed: '⚡⚡⚡',
            quality: '⭐⭐⭐⭐⭐',
            recommended: true,
            reason: 'Excelente calidad, velocidad aceptable'
          })
        }
      }
      
      // Llama 3
      else if (modelName.includes('llama3') && !modelName.includes('llama3.2')) {
        if (modelName.includes('8b')) {
          recommendations.push({
            name: model.name,
            speed: '⚡⚡⚡',
            quality: '⭐⭐⭐⭐',
            recommended: true,
            reason: 'Buena calidad, velocidad moderada'
          })
        }
      }
      
      // Otros modelos
      else {
        recommendations.push({
          name: model.name,
          speed: '⚡⚡',
          quality: '⭐⭐⭐',
          recommended: false,
          reason: 'Modelo genérico'
        })
      }
    }

    // Mostrar recomendaciones
    console.log('📊 ANÁLISIS DE MODELOS:\n')

    recommendations.forEach((rec, index) => {
      const icon = rec.recommended ? '✅' : '⚪'
      console.log(`${icon} ${rec.name}`)
      console.log(`   Velocidad: ${rec.speed}`)
      console.log(`   Calidad: ${rec.quality}`)
      console.log(`   ${rec.reason}`)
      console.log()
    })

    // 3️⃣ Sugerencia final
    console.log('3️⃣ CONFIGURACIÓN RECOMENDADA...\n')

    const recommended = recommendations.filter(r => r.recommended)

    if (recommended.length === 0) {
      console.log('⚠️ No hay modelos recomendados instalados\n')
      console.log('💡 INSTALAR MODELOS RECOMENDADOS:')
      console.log('   ollama pull llama3.2:3b')
      console.log('   ollama pull gemma2:2b')
      return
    }

    // Encontrar el mejor modelo principal
    const mainModel = recommended.find(r => 
      r.name.includes('llama3.2:3b') || 
      r.name.includes('mistral:7b') ||
      r.name.includes('llama3:8b')
    ) || recommended[0]

    // Encontrar el mejor modelo rápido
    const fastModel = recommended.find(r => 
      r.name.includes('gemma2:2b') ||
      r.name.includes('llama3.2:1b')
    ) || recommended[0]

    console.log('✅ CONFIGURACIÓN SUGERIDA PARA .env:\n')
    console.log(`OLLAMA_MODEL=${mainModel.name}`)
    console.log(`OLLAMA_MODEL_FAST=${fastModel.name}`)
    console.log()

    console.log('📝 COPIAR ESTO A .env:')
    console.log('─'.repeat(60))
    console.log(`OLLAMA_URL=${ollamaUrl}`)
    console.log(`OLLAMA_MODEL=${mainModel.name}`)
    console.log(`OLLAMA_MODEL_FAST=${fastModel.name}`)
    console.log(`OLLAMA_TIMEOUT=45000`)
    console.log('─'.repeat(60))

    // 4️⃣ Probar modelo recomendado
    console.log('\n4️⃣ PROBANDO MODELO RECOMENDADO...\n')

    try {
      console.log(`🧪 Probando: ${mainModel.name}`)
      console.log('⏳ Generando respuesta...\n')

      const startTime = Date.now()

      const testResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: mainModel.name,
          prompt: 'Responde en una palabra: ¿Cuál es la capital de Colombia?',
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 50
          }
        }),
        signal: AbortSignal.timeout(30000)
      })

      const duration = Date.now() - startTime

      if (!testResponse.ok) {
        console.error(`❌ Error: ${testResponse.status}`)
        return
      }

      const testData = await testResponse.json()

      console.log(`✅ Respuesta en ${duration}ms:`)
      console.log(`   "${testData.response.trim()}"`)
      console.log()

      if (testData.response.toLowerCase().includes('bogotá') || 
          testData.response.toLowerCase().includes('bogota')) {
        console.log('✅ Respuesta correcta! El modelo funciona perfectamente.')
      } else {
        console.log('⚠️ Respuesta inesperada, pero el modelo está funcionando.')
      }

    } catch (error: any) {
      console.error(`❌ Error probando modelo: ${error.message}`)
    }

  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`)
    console.log('\n💡 SOLUCIÓN:')
    console.log('   - Verifica que Ollama esté corriendo')
    console.log('   - Verifica la URL en .env')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ DETECCIÓN COMPLETADA')
  console.log('='.repeat(60))
}

// Ejecutar
detectarModelos()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
