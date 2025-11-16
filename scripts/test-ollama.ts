/**
 * Script para probar Ollama como fallback
 */

// Cargar variables de entorno
import dotenv from 'dotenv'
import path from 'path'

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { AIMultiProvider } from '@/lib/ai-multi-provider'

async function testOllama() {
  console.log('🧪 Probando Ollama como Fallback\n')
  console.log('='.repeat(50))

  // Test 1: Verificar configuración
  console.log('\n📋 Test 1: Configuración')
  console.log('OLLAMA_BASE_URL:', process.env.OLLAMA_BASE_URL || '❌ No configurado')
  console.log('OLLAMA_MODEL:', process.env.OLLAMA_MODEL || '❌ No configurado')
  console.log('OLLAMA_ENABLED:', process.env.OLLAMA_ENABLED || '❌ No configurado')
  console.log('OLLAMA_TIMEOUT:', process.env.OLLAMA_TIMEOUT || '❌ No configurado')
  console.log('AI_FALLBACK_ORDER:', process.env.AI_FALLBACK_ORDER || '❌ No configurado')
  console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Configurado' : '❌ No configurado')

  // Test 2: Probar respuesta simple
  console.log('\n\n💬 Test 2: Respuesta Simple')
  console.log('='.repeat(50))

  const testMessages = [
    {
      role: 'system' as const,
      content: 'Eres un asistente de ventas. Responde en español, máximo 3 líneas.'
    },
    {
      role: 'user' as const,
      content: 'Tienes laptops?'
    }
  ]

  try {
    console.log('\n👤 Cliente: "Tienes laptops?"')
    console.log('⏳ Esperando respuesta de Ollama...')
    
    const startTime = Date.now()
    
    const response = await AIMultiProvider.generateCompletion(testMessages, {
      max_tokens: 200,
      temperature: 0.7
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`\n✅ Respuesta recibida en ${duration}ms (${(duration/1000).toFixed(1)}s)`)
    console.log(`🤖 Provider: ${response.provider}`)
    console.log(`📦 Modelo: ${response.model}`)
    console.log(`\n💬 Respuesta:\n${response.content}`)

    // Verificar si usó Ollama
    if (response.provider === 'ollama') {
      console.log('\n✅ Ollama funcionando correctamente!')
    } else {
      console.log(`\n⚠️  Se usó ${response.provider} en lugar de Ollama`)
      console.log('   Esto es normal si Groq/OpenRouter están disponibles')
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error('\n🔧 Posibles soluciones:')
    console.error('   1. Verificar que Ollama esté corriendo')
    console.error('   2. Verificar OLLAMA_BASE_URL en .env')
    console.error('   3. Verificar que el modelo esté descargado')
    console.error('   4. Aumentar OLLAMA_TIMEOUT')
  }

  // Test 3: Forzar uso de Ollama
  console.log('\n\n🎯 Test 3: Forzar Uso de Ollama')
  console.log('='.repeat(50))

  try {
    // Temporalmente cambiar el orden de fallback
    const originalOrder = process.env.AI_FALLBACK_ORDER
    process.env.AI_FALLBACK_ORDER = 'ollama'

    console.log('\n👤 Cliente: "Cuánto cuesta?"')
    console.log('⏳ Forzando uso de Ollama...')
    
    const startTime = Date.now()
    
    const response = await AIMultiProvider.generateCompletion([
      {
        role: 'system' as const,
        content: 'Eres un asistente. Responde en español, máximo 2 líneas.'
      },
      {
        role: 'user' as const,
        content: 'Cuánto cuesta?'
      }
    ], {
      max_tokens: 150,
      temperature: 0.7
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`\n✅ Respuesta en ${duration}ms (${(duration/1000).toFixed(1)}s)`)
    console.log(`🤖 Provider: ${response.provider}`)
    console.log(`💬 Respuesta:\n${response.content}`)

    // Restaurar orden original
    process.env.AI_FALLBACK_ORDER = originalOrder

    if (response.provider === 'ollama') {
      console.log('\n✅ Ollama funciona correctamente como fallback!')
    }

  } catch (error: any) {
    console.error('\n❌ Error forzando Ollama:', error.message)
  }

  // Resumen
  console.log('\n\n📊 Resumen')
  console.log('='.repeat(50))
  console.log('\n✅ Configuración de Fallback:')
  console.log('   1. Groq (rápido, límite de tokens)')
  console.log('   2. Ollama (ilimitado, más lento)')
  console.log('\n💡 Ollama se usará cuando:')
  console.log('   - Groq se quede sin tokens')
  console.log('   - Groq falle por cualquier razón')
  console.log('   - Necesites respuestas ilimitadas 24/7')
  console.log('\n⏱️  Tiempos esperados:')
  console.log('   - Groq: 1-3 segundos')
  console.log('   - Ollama: 10-30 segundos')
  console.log('\n🚀 El bot nunca dejará de funcionar!')
}

// Ejecutar pruebas
testOllama().catch(console.error)
