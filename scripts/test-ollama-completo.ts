/**
 * 🧪 TEST COMPLETO DE OLLAMA
 * Prueba velocidad, respuesta y timeout
 */

async function testOllama() {
  console.log('🧪 TEST DE OLLAMA\n')
  console.log('=' .repeat(60))

  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://bot-whatsapp-ollama.sqaoeo.easypanel.host'
  const ollamaModel = process.env.OLLAMA_MODEL || 'gemma:2b'
  const timeout = 60000 // 60 segundos

  console.log(`\n📍 URL: ${ollamaUrl}`)
  console.log(`🤖 Modelo: ${ollamaModel}`)
  console.log(`⏱️  Timeout: ${timeout / 1000}s\n`)

  // Test 1: Verificar que el servidor responde
  console.log('1️⃣ Verificando conexión...')
  const startPing = Date.now()
  
  try {
    const pingResponse = await fetch(`${ollamaUrl}/api/tags`)
    const pingTime = Date.now() - startPing
    
    if (pingResponse.ok) {
      console.log(`   ✅ Servidor responde en ${pingTime}ms`)
      const data = await pingResponse.json()
      console.log(`   📦 Modelos disponibles: ${data.models?.length || 0}`)
      data.models?.forEach((m: any) => {
        console.log(`      - ${m.name}`)
      })
    } else {
      console.log(`   ❌ Error: ${pingResponse.status}`)
      return
    }
  } catch (error: any) {
    console.log(`   ❌ Error de conexión: ${error.message}`)
    return
  }

  // Test 2: Mensaje corto (debería ser rápido)
  console.log('\n2️⃣ Test con mensaje CORTO...')
  const shortMessage = 'Hola, ¿cómo estás?'
  console.log(`   📝 Mensaje: "${shortMessage}"`)
  
  const startShort = Date.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          { role: 'user', content: shortMessage }
        ],
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const shortTime = Date.now() - startShort

    if (response.ok) {
      const data = await response.json()
      const content = data.message?.content || 'Sin respuesta'
      
      console.log(`   ✅ Respuesta en ${shortTime}ms (${(shortTime / 1000).toFixed(1)}s)`)
      console.log(`   💬 Respuesta: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`)
      
      if (shortTime > 30000) {
        console.log(`   ⚠️  ADVERTENCIA: Respuesta lenta (>30s)`)
      }
    } else {
      console.log(`   ❌ Error: ${response.status}`)
    }
  } catch (error: any) {
    const shortTime = Date.now() - startShort
    if (error.name === 'AbortError') {
      console.log(`   ❌ TIMEOUT después de ${shortTime}ms`)
    } else {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  // Test 3: Mensaje con contexto (simula conversación real)
  console.log('\n3️⃣ Test con CONTEXTO (conversación)...')
  
  const conversationMessages = [
    { role: 'system', content: 'Eres un asistente de ventas amigable de Tecnovariedades D&S.' },
    { role: 'user', content: 'Hola' },
    { role: 'assistant', content: '¡Hola! Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte?' },
    { role: 'user', content: 'Busco una laptop' }
  ]
  
  console.log(`   📝 Mensajes en contexto: ${conversationMessages.length}`)
  
  const startContext = Date.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: conversationMessages,
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const contextTime = Date.now() - startContext

    if (response.ok) {
      const data = await response.json()
      const content = data.message?.content || 'Sin respuesta'
      
      console.log(`   ✅ Respuesta en ${contextTime}ms (${(contextTime / 1000).toFixed(1)}s)`)
      console.log(`   💬 Respuesta: "${content.substring(0, 150)}${content.length > 150 ? '...' : ''}"`)
      
      if (contextTime > 45000) {
        console.log(`   ⚠️  ADVERTENCIA: Respuesta muy lenta (>45s)`)
      }
    } else {
      console.log(`   ❌ Error: ${response.status}`)
    }
  } catch (error: any) {
    const contextTime = Date.now() - startContext
    if (error.name === 'AbortError') {
      console.log(`   ❌ TIMEOUT después de ${contextTime}ms`)
      console.log(`   💡 Sugerencia: Aumentar OLLAMA_TIMEOUT en .env`)
    } else {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  // Test 4: Mensaje largo (peor caso)
  console.log('\n4️⃣ Test con mensaje LARGO (peor caso)...')
  
  const longContext = [
    { role: 'system', content: 'Eres un asistente de ventas.' },
    ...Array(10).fill(null).map((_, i) => [
      { role: 'user', content: `Pregunta ${i + 1} sobre productos` },
      { role: 'assistant', content: `Respuesta detallada ${i + 1} con información sobre productos disponibles` }
    ]).flat()
  ]
  
  console.log(`   📝 Mensajes en contexto: ${longContext.length}`)
  
  const startLong = Date.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: longContext,
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const longTime = Date.now() - startLong

    if (response.ok) {
      const data = await response.json()
      const content = data.message?.content || 'Sin respuesta'
      
      console.log(`   ✅ Respuesta en ${longTime}ms (${(longTime / 1000).toFixed(1)}s)`)
      console.log(`   💬 Respuesta: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`)
      
      if (longTime > 60000) {
        console.log(`   ⚠️  ADVERTENCIA: Excede timeout recomendado`)
      }
    } else {
      console.log(`   ❌ Error: ${response.status}`)
    }
  } catch (error: any) {
    const longTime = Date.now() - startLong
    if (error.name === 'AbortError') {
      console.log(`   ❌ TIMEOUT después de ${longTime}ms`)
      console.log(`   💡 Sugerencia: Reducir historial de conversación`)
    } else {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN')
  console.log('='.repeat(60))
  console.log('\n✅ Tests completados')
  console.log('\n💡 Recomendaciones:')
  console.log('   - Mensaje corto: < 10s ✅')
  console.log('   - Con contexto: < 30s ✅')
  console.log('   - Mensaje largo: < 60s ⚠️')
  console.log('\n📝 Si hay timeouts frecuentes:')
  console.log('   1. Aumentar OLLAMA_TIMEOUT=90000 en .env')
  console.log('   2. Reducir historial a 10-15 mensajes')
  console.log('   3. Considerar modelo más rápido (tinyllama)')
}

// Ejecutar test
testOllama()
  .then(() => {
    console.log('\n✅ Test completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en test:', error)
    process.exit(1)
  })
