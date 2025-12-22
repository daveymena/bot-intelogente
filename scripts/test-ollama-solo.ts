/**
 * Test de Ollama como IA Principal
 * Verifica que Ollama responda correctamente sin usar Groq
 */

import { AIMultiProvider } from '../src/lib/ai-multi-provider'

async function testOllama() {
  console.log('🦙 ========================================')
  console.log('🦙 TEST: OLLAMA COMO IA PRINCIPAL')
  console.log('🦙 ========================================\n')

  // Verificar configuración
  console.log('📋 Configuración:')
  console.log(`   OLLAMA_BASE_URL: ${process.env.OLLAMA_BASE_URL}`)
  console.log(`   OLLAMA_MODEL: ${process.env.OLLAMA_MODEL}`)
  console.log(`   AI_FALLBACK_ORDER: ${process.env.AI_FALLBACK_ORDER}`)
  console.log(`   DISABLE_LOCAL_RESPONSES: ${process.env.DISABLE_LOCAL_RESPONSES}`)
  console.log(`   AI_FALLBACK_ENABLED: ${process.env.AI_FALLBACK_ENABLED}\n`)

  // Test 1: Saludo simple
  console.log('📝 Test 1: Saludo simple')
  console.log('   Mensaje: "Hola"\n')
  
  try {
    const startTime = Date.now()
    
    const response = await AIMultiProvider.generateCompletion([
      {
        role: 'system',
        content: 'Eres un asistente de ventas amigable de Tecnovariedades D&S. Responde de forma breve y profesional.'
      },
      {
        role: 'user',
        content: 'Hola'
      }
    ], {
      temperature: 0.7,
      max_tokens: 150
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ Respuesta exitosa:`)
    console.log(`   Provider: ${response.provider}`)
    console.log(`   Model: ${response.model}`)
    console.log(`   Tiempo: ${duration}ms`)
    console.log(`   Respuesta: "${response.content}"\n`)
    
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`)
  }

  // Test 2: Pregunta sobre producto
  console.log('📝 Test 2: Pregunta sobre producto')
  console.log('   Mensaje: "Cuánto cuesta el curso de piano?"\n')
  
  try {
    const startTime = Date.now()
    
    const response = await AIMultiProvider.generateCompletion([
      {
        role: 'system',
        content: 'Eres un asistente de ventas de Tecnovariedades D&S. Tenemos un Curso de Piano Profesional por 20,000 COP.'
      },
      {
        role: 'user',
        content: 'Cuánto cuesta el curso de piano?'
      }
    ], {
      temperature: 0.7,
      max_tokens: 200
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ Respuesta exitosa:`)
    console.log(`   Provider: ${response.provider}`)
    console.log(`   Model: ${response.model}`)
    console.log(`   Tiempo: ${duration}ms`)
    console.log(`   Respuesta: "${response.content}"\n`)
    
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`)
  }

  // Test 3: Conversación con contexto
  console.log('📝 Test 3: Conversación con contexto')
  console.log('   Historial: "Hola" → "Hola! ¿En qué puedo ayudarte?"')
  console.log('   Mensaje: "Me interesa un computador"\n')
  
  try {
    const startTime = Date.now()
    
    const response = await AIMultiProvider.generateCompletion([
      {
        role: 'system',
        content: 'Eres un asistente de ventas de Tecnovariedades D&S. Vendemos laptops, cursos digitales y motos.'
      },
      {
        role: 'user',
        content: 'Hola'
      },
      {
        role: 'assistant',
        content: '¡Hola! 👋 Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte hoy?'
      },
      {
        role: 'user',
        content: 'Me interesa un computador'
      }
    ], {
      temperature: 0.7,
      max_tokens: 250
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ Respuesta exitosa:`)
    console.log(`   Provider: ${response.provider}`)
    console.log(`   Model: ${response.model}`)
    console.log(`   Tiempo: ${duration}ms`)
    console.log(`   Respuesta: "${response.content}"\n`)
    
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`)
  }

  console.log('🦙 ========================================')
  console.log('🦙 TEST COMPLETADO')
  console.log('🦙 ========================================')
}

// Ejecutar test
testOllama().catch(console.error)
