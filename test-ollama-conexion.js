/**
 * 🧪 Test de Conexión a Ollama
 * Verifica que Ollama esté funcionando correctamente
 */

require('dotenv').config()

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'https://davey-ollama2.mapf5v.easypanel.host'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b'
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '60000')

console.log('🧪 TEST DE CONEXIÓN A OLLAMA')
console.log('='.repeat(60))
console.log(`📍 URL: ${OLLAMA_URL}`)
console.log(`🤖 Modelo: ${OLLAMA_MODEL}`)
console.log(`⏱️  Timeout: ${OLLAMA_TIMEOUT}ms`)
console.log('='.repeat(60))
console.log('')

async function testOllama() {
  // Test 1: Verificar que el servidor responde
  console.log('📡 Test 1: Verificando servidor...')
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Servidor responde correctamente')
      console.log(`📦 Modelos disponibles: ${data.models?.length || 0}`)
      if (data.models) {
        data.models.forEach(m => {
          console.log(`   - ${m.name}`)
        })
      }
    } else {
      console.log(`❌ Servidor respondió con error: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error conectando al servidor: ${error.message}`)
    return false
  }

  console.log('')

  // Test 2: Generar respuesta simple
  console.log('🤖 Test 2: Generando respuesta de prueba...')
  try {
    const startTime = Date.now()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT)

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: 'Di "Hola" en una palabra',
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 10
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Respuesta generada en ${elapsed}ms`)
      console.log(`💬 Respuesta: "${data.response}"`)
      
      if (elapsed > 30000) {
        console.log(`⚠️  ADVERTENCIA: Respuesta muy lenta (${elapsed}ms)`)
        console.log(`   Considera aumentar OLLAMA_TIMEOUT o usar un modelo más rápido`)
      }
    } else {
      console.log(`❌ Error generando respuesta: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error generando respuesta: ${error.message}`)
    if (error.name === 'AbortError') {
      console.log(`⏰ Timeout alcanzado (${OLLAMA_TIMEOUT}ms)`)
      console.log(`   Aumenta OLLAMA_TIMEOUT en .env`)
    }
    return false
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('✅ TODOS LOS TESTS PASARON')
  console.log('='.repeat(60))
  return true
}

// Ejecutar tests
testOllama().then(success => {
  if (!success) {
    console.log('')
    console.log('❌ ALGUNOS TESTS FALLARON')
    console.log('')
    console.log('🔧 SOLUCIONES:')
    console.log('1. Verifica que la URL sea correcta')
    console.log('2. Verifica que Ollama esté corriendo')
    console.log('3. Aumenta OLLAMA_TIMEOUT en .env')
    console.log('4. Prueba con un modelo más rápido (gemma2:2b)')
    process.exit(1)
  }
  process.exit(0)
}).catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
