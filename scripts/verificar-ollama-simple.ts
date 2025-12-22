/**
 * 🔍 VERIFICAR OLLAMA - SIMPLE
 * 
 * Script para verificar que Ollama esté correctamente configurado
 */

async function verificarOllama() {
  console.log('🔍 VERIFICANDO CONFIGURACIÓN DE OLLAMA\n')
  console.log('=' .repeat(60))

  const ollamaUrl = process.env.OLLAMA_URL || 'https://davey-ollama2.mapf5v.easypanel.host'
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b'

  console.log(`\n📍 URL: ${ollamaUrl}`)
  console.log(`📦 Modelo: ${ollamaModel}\n`)

  // 1️⃣ Verificar conexión
  console.log('1️⃣ VERIFICANDO CONEXIÓN...\n')
  
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`)
      console.log('\n💡 SOLUCIÓN:')
      console.log('   - Verifica que la URL sea correcta')
      console.log('   - Verifica que Ollama esté corriendo en Easypanel')
      return
    }

    const data = await response.json()
    console.log('✅ Conexión exitosa!')
    console.log(`\n📦 Modelos disponibles:`)
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model: any) => {
        console.log(`   - ${model.name}`)
      })
    } else {
      console.log('   ⚠️ No hay modelos instalados')
    }

    // Verificar si el modelo configurado existe
    const modelExists = data.models?.some((m: any) => m.name === ollamaModel)
    
    if (modelExists) {
      console.log(`\n✅ Modelo "${ollamaModel}" está disponible`)
    } else {
      console.log(`\n❌ Modelo "${ollamaModel}" NO está disponible`)
      console.log('\n💡 SOLUCIÓN:')
      console.log(`   Instalar el modelo en Easypanel:`)
      console.log(`   ollama pull ${ollamaModel}`)
      return
    }

  } catch (error: any) {
    console.error(`❌ Error de conexión: ${error.message}`)
    console.log('\n💡 SOLUCIÓN:')
    console.log('   - Verifica que la URL sea correcta')
    console.log('   - Verifica que Ollama esté corriendo')
    console.log('   - Verifica tu conexión a internet')
    return
  }

  // 2️⃣ Probar generación de texto
  console.log('\n2️⃣ PROBANDO GENERACIÓN DE TEXTO...\n')

  try {
    const testPrompt = 'Responde en una sola palabra: ¿Cuál es la capital de Colombia?'
    
    console.log(`📝 Prompt: "${testPrompt}"`)
    console.log('⏳ Esperando respuesta (máximo 30s)...\n')

    const startTime = Date.now()
    
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: testPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 50
        }
      }),
      signal: AbortSignal.timeout(30000)
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`)
      
      if (response.status === 404) {
        console.log('\n💡 SOLUCIÓN:')
        console.log(`   El modelo "${ollamaModel}" no existe.`)
        console.log('   Opciones:')
        console.log('   1. Instalar el modelo: ollama pull llama3.2:3b')
        console.log('   2. Cambiar a un modelo disponible en .env')
      }
      return
    }

    const data = await response.json()
    
    console.log(`✅ Respuesta generada en ${duration}ms`)
    console.log(`\n💬 Respuesta de Ollama:`)
    console.log(`   "${data.response.trim()}"\n`)

    // Verificar calidad de respuesta
    if (data.response.toLowerCase().includes('bogotá') || data.response.toLowerCase().includes('bogota')) {
      console.log('✅ Respuesta correcta! Ollama está funcionando bien.')
    } else {
      console.log('⚠️ Respuesta inesperada, pero Ollama está funcionando.')
    }

  } catch (error: any) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      console.error('❌ Timeout: Ollama tardó más de 30 segundos')
      console.log('\n💡 SOLUCIÓN:')
      console.log('   - El modelo puede ser muy pesado')
      console.log('   - Prueba con un modelo más rápido: gemma2:2b')
      console.log('   - Aumenta el timeout en el código')
    } else {
      console.error(`❌ Error: ${error.message}`)
    }
    return
  }

  // 3️⃣ Resumen
  console.log('\n' + '='.repeat(60))
  console.log('✅ OLLAMA ESTÁ CORRECTAMENTE CONFIGURADO')
  console.log('='.repeat(60))
  console.log('\n📋 Configuración actual:')
  console.log(`   URL: ${ollamaUrl}`)
  console.log(`   Modelo: ${ollamaModel}`)
  console.log(`   Estado: ✅ Funcionando`)
  console.log('\n🚀 Puedes usar el orquestador ahora!')
}

// Ejecutar verificación
verificarOllama()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en verificación:', error)
    process.exit(1)
  })
