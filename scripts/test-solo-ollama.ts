/**
 * 🧪 TEST: SOLO OLLAMA
 * 
 * Prueba únicamente Ollama sin fallbacks
 */

async function testSoloOllama() {
  console.log('🧪 PROBANDO SOLO OLLAMA (SIN FALLBACKS)\n')
  console.log('=' .repeat(60))

  const ollamaUrl = process.env.OLLAMA_URL || 'https://davey-ollama2.mapf5v.easypanel.host'
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b'

  console.log(`\n📍 URL: ${ollamaUrl}`)
  console.log(`📦 Modelo: ${ollamaModel}\n`)

  const testCases = [
    {
      name: 'Saludo simple',
      prompt: `Sistema: Eres un asistente de ventas profesional de Tecnovariedades D&S.

Cliente: Hola, buenos días

Asistente:`
    },
    {
      name: 'Búsqueda de laptop',
      prompt: `Sistema: Eres un asistente de ventas profesional de Tecnovariedades D&S.

PRODUCTOS DISPONIBLES:
1. Laptop HP Pavilion
   Precio: $2,500,000 COP
   Ideal para diseño gráfico, 16GB RAM, SSD 512GB

2. Laptop Dell Inspiron
   Precio: $2,200,000 COP
   Para trabajo y estudio, 8GB RAM, SSD 256GB

Cliente: Busco una laptop para diseño gráfico

Asistente:`
    },
    {
      name: 'Pregunta de precio',
      prompt: `Sistema: Eres un asistente de ventas profesional de Tecnovariedades D&S.

Cliente: Cuánto cuesta?

Asistente:`
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📝 TEST: ${testCase.name}`)
    console.log(`${'─'.repeat(60)}\n`)

    try {
      const startTime = Date.now()
      
      console.log('⏳ Esperando respuesta de Ollama...')

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: testCase.prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 300,
            top_p: 0.9,
            top_k: 40
          }
        }),
        signal: AbortSignal.timeout(45000) // 45 segundos
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`)
        
        if (response.status === 404) {
          console.log('\n💡 El modelo no existe. Instalar con:')
          console.log(`   ollama pull ${ollamaModel}`)
        }
        continue
      }

      const data = await response.json()

      console.log(`✅ RESPUESTA (${duration}ms):\n`)
      console.log(data.response.trim())
      console.log(`\n📊 Tokens generados: ${data.eval_count || 'N/A'}`)
      console.log(`⚡ Velocidad: ${data.eval_count ? Math.round(data.eval_count / (duration / 1000)) : 'N/A'} tokens/s`)

    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.error('❌ Timeout: Ollama tardó más de 45 segundos')
        console.log('\n💡 SOLUCIÓN:')
        console.log('   - Prueba con un modelo más rápido: gemma2:2b')
        console.log('   - O aumenta el timeout')
      } else {
        console.error(`❌ Error: ${error.message}`)
      }
    }

    // Esperar entre pruebas
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ PRUEBAS COMPLETADAS')
  console.log('='.repeat(60))
}

// Ejecutar pruebas
testSoloOllama()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
