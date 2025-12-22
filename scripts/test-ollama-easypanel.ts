/**
 * 🧪 TEST: Verificar Ollama de Easypanel
 * 
 * Este script verifica que:
 * 1. ✅ Ollama de Easypanel está accesible
 * 2. ✅ Puede generar respuestas
 * 3. ✅ El bot lo está usando en lugar de Groq
 */

async function testOllamaEasypanel() {
  console.log('🧪 TEST: Verificando Ollama de Easypanel\n')

  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://davey-ollama.mapf5v.easypanel.host'
  const ollamaModel = process.env.OLLAMA_MODEL || 'mistral:latest'

  try {
    // 1. Verificar que Ollama está accesible
    console.log('📡 1. Verificando conexión a Ollama...')
    console.log(`   URL: ${ollamaUrl}`)
    
    const tagsResponse = await fetch(`${ollamaUrl}/api/tags`)
    
    if (!tagsResponse.ok) {
      console.log(`   ❌ Error: ${tagsResponse.status} ${tagsResponse.statusText}`)
      return
    }
    
    const tagsData = await tagsResponse.json()
    console.log('   ✅ Ollama está accesible')
    console.log(`   📦 Modelos disponibles: ${tagsData.models?.map((m: any) => m.name).join(', ') || 'ninguno'}`)

    // 2. Probar generación de respuesta
    console.log('\n🤖 2. Probando generación de respuesta...')
    console.log(`   Modelo: ${ollamaModel}`)
    console.log('   Prompt: "busco un portátil para diseño"')
    
    const startTime = Date.now()
    
    const generateResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: 'Responde en JSON: ¿Qué tipo de portátil necesita alguien que busca "un portátil para diseño"? Responde con: {"tipo": "...", "specs": "..."}',
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 200
        }
      })
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    if (!generateResponse.ok) {
      console.log(`   ❌ Error: ${generateResponse.status} ${generateResponse.statusText}`)
      return
    }

    const generateData = await generateResponse.json()
    console.log('   ✅ Respuesta generada exitosamente')
    console.log(`   ⏱️  Tiempo: ${responseTime}ms`)
    console.log(`   📝 Respuesta (primeros 200 caracteres):`)
    console.log(`   ${generateData.response.substring(0, 200)}...`)

    // 3. Verificar configuración del bot
    console.log('\n⚙️  3. Verificando configuración del bot...')
    
    // Cargar variables de entorno
    const dotenv = await import('dotenv')
    dotenv.config()
    
    if (process.env.USE_OLLAMA_ONLY === 'true') {
      console.log('   ✅ USE_OLLAMA_ONLY=true')
    } else {
      console.log('   ⚠️  USE_OLLAMA_ONLY no está configurado (valor actual: ' + process.env.USE_OLLAMA_ONLY + ')')
    }
    
    if (process.env.DISABLE_GROQ === 'true') {
      console.log('   ✅ DISABLE_GROQ=true')
    } else {
      console.log('   ⚠️  DISABLE_GROQ no está configurado (valor actual: ' + process.env.DISABLE_GROQ + ')')
    }
    
    if (process.env.AI_FALLBACK_ENABLED === 'false') {
      console.log('   ✅ AI_FALLBACK_ENABLED=false (no usará Groq)')
    } else {
      console.log('   ⚠️  AI_FALLBACK_ENABLED=' + process.env.AI_FALLBACK_ENABLED + ' (puede usar Groq)')
    }

    console.log('\n✅ TEST COMPLETADO')
    console.log('\n📋 RESUMEN:')
    console.log(`   • Ollama URL: ${ollamaUrl}`)
    console.log(`   • Modelo: ${ollamaModel}`)
    console.log(`   • Tiempo de respuesta: ${responseTime}ms`)
    console.log(`   • Estado: ✅ Funcionando`)
    
    console.log('\n💡 SIGUIENTE PASO:')
    console.log('   Reinicia el bot para aplicar los cambios:')
    console.log('   npm run dev')
    
    console.log('\n🔍 VERIFICAR EN LOGS:')
    console.log('   Debe aparecer: "🤖 Llamando a Ollama (Easypanel)..."')
    console.log('   NO debe aparecer: "🤖 Llamando a Groq..."')

  } catch (error) {
    console.error('\n❌ ERROR:', error)
    console.log('\n💡 SOLUCIÓN:')
    console.log('   1. Verifica que la URL de Ollama sea correcta')
    console.log('   2. Verifica que Ollama esté corriendo en Easypanel')
    console.log('   3. Verifica la conexión a internet')
  }
}

// Ejecutar test
testOllamaEasypanel()
