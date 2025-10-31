// 🧪 Script para probar el sistema Multi-Provider de IA

// Cargar variables de entorno
import { config } from 'dotenv'
config()

import { AIMultiProvider } from '../src/lib/ai-multi-provider'

async function testMultiProvider() {
  console.log('🧪 Probando Sistema Multi-Provider de IA\n')
  console.log('=' .repeat(60))
  
  // 1. Probar conectividad de todos los providers
  console.log('\n📡 Paso 1: Probando conectividad de todos los providers...\n')
  
  const connectivity = await AIMultiProvider.testAllProviders()
  
  console.log('\n📊 Resultados de conectividad:')
  console.log('─'.repeat(60))
  Object.entries(connectivity).forEach(([provider, status]) => {
    const icon = status ? '✅' : '❌'
    const text = status ? 'FUNCIONANDO' : 'NO DISPONIBLE'
    console.log(`${icon} ${provider.toUpperCase()}: ${text}`)
  })
  
  // 2. Probar generación de respuesta con fallback automático
  console.log('\n\n🤖 Paso 2: Probando generación de respuesta con fallback...\n')
  
  const testMessages = [
    {
      role: 'system' as const,
      content: 'Eres un asistente de ventas amigable y profesional.'
    },
    {
      role: 'user' as const,
      content: 'Hola, ¿tienes laptops disponibles?'
    }
  ]
  
  try {
    console.log('📤 Enviando mensaje: "Hola, ¿tienes laptops disponibles?"')
    console.log('⏳ Esperando respuesta...\n')
    
    const response = await AIMultiProvider.generateCompletion(testMessages, {
      temperature: 0.7,
      max_tokens: 200
    })
    
    console.log('✅ RESPUESTA RECIBIDA:')
    console.log('─'.repeat(60))
    console.log(`Provider usado: ${response.provider.toUpperCase()}`)
    console.log(`Modelo: ${response.model}`)
    console.log(`\nContenido:\n${response.content}`)
    console.log('─'.repeat(60))
    
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message)
    console.log('\n💡 Posibles soluciones:')
    console.log('   1. Verifica que LM Studio esté ejecutándose')
    console.log('   2. Verifica que el servidor local esté en http://localhost:1234')
    console.log('   3. Verifica tu GROQ_API_KEY en el archivo .env')
    console.log('   4. Configura OPENAI_API_KEY si quieres usar OpenAI como respaldo')
  }
  
  // 3. Probar con diferentes órdenes de fallback
  console.log('\n\n🔄 Paso 3: Probando diferentes órdenes de fallback...\n')
  
  const orders = [
    'groq,lmstudio,openai',
    'lmstudio,groq,openai',
    'openai,groq,lmstudio'
  ]
  
  for (const order of orders) {
    console.log(`\n📋 Probando orden: ${order}`)
    process.env.AI_FALLBACK_ORDER = order
    
    try {
      const response = await AIMultiProvider.generateCompletion(
        [
          { role: 'system', content: 'Responde brevemente.' },
          { role: 'user', content: 'Di hola' }
        ],
        { max_tokens: 50 }
      )
      console.log(`   ✅ Funcionó con: ${response.provider}`)
    } catch (error: any) {
      console.log(`   ❌ Falló: ${error.message}`)
    }
  }
  
  console.log('\n\n' + '='.repeat(60))
  console.log('✅ Prueba completada!')
  console.log('='.repeat(60))
  
  // Resumen final
  console.log('\n📝 RESUMEN:')
  const workingProviders = Object.entries(connectivity)
    .filter(([_, status]) => status)
    .map(([provider]) => provider)
  
  if (workingProviders.length === 0) {
    console.log('   ⚠️  Ningún provider está funcionando')
    console.log('   💡 Configura al menos uno para usar el bot')
  } else {
    console.log(`   ✅ ${workingProviders.length} provider(s) funcionando: ${workingProviders.join(', ')}`)
    console.log('   🎉 Tu bot tiene respaldo automático!')
  }
  
  console.log('\n💡 RECOMENDACIONES:')
  console.log('   1. Mantén LM Studio ejecutándose para respaldo local sin límites')
  console.log('   2. Groq es el más rápido - úsalo como principal')
  console.log('   3. OpenAI es premium - úsalo como último respaldo')
  console.log('   4. El orden recomendado es: groq,lmstudio,openai')
}

// Ejecutar prueba
testMultiProvider()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
