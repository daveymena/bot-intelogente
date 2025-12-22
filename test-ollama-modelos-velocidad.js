/**
 * 🧪 Test de Modelos de Ollama - Velocidad y Disponibilidad
 * Detecta qué modelos están disponibles y cuál es el más rápido
 */

require('dotenv').config()

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'https://davey-ollama2.mapf5v.easypanel.host'

console.log('🧪 TEST DE MODELOS DE OLLAMA')
console.log('='.repeat(70))
console.log(`📍 URL: ${OLLAMA_URL}`)
console.log('='.repeat(70))
console.log('')

async function testModels() {
  // Paso 1: Obtener modelos disponibles
  console.log('📦 Paso 1: Obteniendo modelos disponibles...')
  console.log('')
  
  let models = []
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) {
      console.log(`❌ Error obteniendo modelos: ${response.status}`)
      return
    }
    
    const data = await response.json()
    models = data.models || []
    
    console.log(`✅ Encontrados ${models.length} modelos:`)
    models.forEach((m, i) => {
      const size = m.size ? `(${(m.size / 1024 / 1024 / 1024).toFixed(1)} GB)` : ''
      console.log(`   ${i + 1}. ${m.name} ${size}`)
    })
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
    return
  }

  if (models.length === 0) {
    console.log('❌ No hay modelos disponibles')
    return
  }

  console.log('')
  console.log('='.repeat(70))
  console.log('⚡ Paso 2: Midiendo velocidad de cada modelo...')
  console.log('='.repeat(70))
  console.log('')

  const testPrompt = 'Responde en una palabra: ¿Cómo estás?'
  const results = []

  for (const model of models) {
    console.log(`🧪 Probando: ${model.name}`)
    
    try {
      const startTime = Date.now()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.name,
          prompt: testPrompt,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 20
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const elapsed = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        const responseText = data.response || ''
        
        results.push({
          name: model.name,
          time: elapsed,
          success: true,
          response: responseText.substring(0, 50)
        })
        
        console.log(`   ✅ Tiempo: ${elapsed}ms`)
        console.log(`   💬 Respuesta: "${responseText.substring(0, 50)}..."`)
        
        // Clasificar velocidad
        if (elapsed < 2000) {
          console.log(`   ⚡ MUY RÁPIDO`)
        } else if (elapsed < 5000) {
          console.log(`   🟢 RÁPIDO`)
        } else if (elapsed < 10000) {
          console.log(`   🟡 NORMAL`)
        } else {
          console.log(`   🔴 LENTO`)
        }
      } else {
        results.push({
          name: model.name,
          time: elapsed,
          success: false,
          error: `HTTP ${response.status}`
        })
        console.log(`   ❌ Error: HTTP ${response.status}`)
      }
    } catch (error) {
      results.push({
        name: model.name,
        time: 30000,
        success: false,
        error: error.message
      })
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('')
  }

  // Resultados finales
  console.log('='.repeat(70))
  console.log('📊 RESULTADOS FINALES')
  console.log('='.repeat(70))
  console.log('')

  // Ordenar por velocidad
  const successful = results.filter(r => r.success).sort((a, b) => a.time - b.time)
  const failed = results.filter(r => !r.success)

  if (successful.length > 0) {
    console.log('✅ MODELOS FUNCIONALES (ordenados por velocidad):')
    console.log('')
    successful.forEach((r, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '
      const speed = r.time < 2000 ? '⚡' : r.time < 5000 ? '🟢' : r.time < 10000 ? '🟡' : '🔴'
      console.log(`${medal} ${speed} ${r.name}`)
      console.log(`      Tiempo: ${r.time}ms`)
      console.log(`      Respuesta: "${r.response}"`)
      console.log('')
    })

    // Recomendación
    console.log('='.repeat(70))
    console.log('💡 RECOMENDACIÓN PARA TU .ENV')
    console.log('='.repeat(70))
    console.log('')
    
    const fastest = successful[0]
    const secondFastest = successful[1]
    
    console.log('Configuración óptima:')
    console.log('')
    console.log(`OLLAMA_MODEL=${fastest.name}  # ⚡ Más rápido (${fastest.time}ms)`)
    
    if (secondFastest) {
      console.log(`OLLAMA_MODEL_SECONDARY=${secondFastest.name}  # 🥈 Fallback (${secondFastest.time}ms)`)
    }
    
    console.log(`OLLAMA_TIMEOUT=${Math.max(fastest.time * 3, 30000)}  # 3x el tiempo promedio`)
    console.log('')
    
    // Análisis de velocidad
    if (fastest.time < 2000) {
      console.log('✅ Velocidad excelente - Respuestas casi instantáneas')
    } else if (fastest.time < 5000) {
      console.log('✅ Velocidad buena - Respuestas rápidas')
    } else if (fastest.time < 10000) {
      console.log('⚠️  Velocidad aceptable - Considera modelo más ligero')
    } else {
      console.log('❌ Velocidad lenta - Usa modelo más pequeño o Groq')
    }
  }

  if (failed.length > 0) {
    console.log('')
    console.log('❌ MODELOS CON ERRORES:')
    console.log('')
    failed.forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`)
    })
  }

  console.log('')
  console.log('='.repeat(70))
  
  return successful.length > 0
}

// Ejecutar test
testModels().then(success => {
  if (!success) {
    console.log('❌ No hay modelos funcionales')
    console.log('')
    console.log('🔧 SOLUCIONES:')
    console.log('1. Verifica que Ollama esté corriendo')
    console.log('2. Verifica la URL en .env')
    console.log('3. Instala modelos: ollama pull gemma2:2b')
    process.exit(1)
  }
  process.exit(0)
}).catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
