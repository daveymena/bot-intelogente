// 🧪 Script para probar SOLO LM Studio

import { config } from 'dotenv'
config()

console.log('🎮 PRUEBA DE LM STUDIO\n')
console.log('=' .repeat(60))

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions'
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || 'phi-2'

console.log('\n📋 Configuración:')
console.log('─'.repeat(60))
console.log(`URL: ${LM_STUDIO_URL}`)
console.log(`Modelo: ${LM_STUDIO_MODEL}`)

async function testLMStudio() {
  console.log('\n\n🔍 Paso 1: Verificar que LM Studio esté ejecutándose...\n')
  
  try {
    // Probar endpoint de modelos
    console.log('📡 Conectando a LM Studio...')
    const modelsUrl = LM_STUDIO_URL.replace('/chat/completions', '/models')
    
    const modelsResponse = await fetch(modelsUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    
    if (!modelsResponse.ok) {
      throw new Error(`HTTP ${modelsResponse.status}: ${modelsResponse.statusText}`)
    }
    
    const modelsData = await modelsResponse.json()
    console.log('✅ LM Studio está ejecutándose!')
    console.log(`📦 Modelos disponibles: ${modelsData.data?.length || 0}`)
    
    if (modelsData.data && modelsData.data.length > 0) {
      console.log('\n📋 Lista de modelos:')
      modelsData.data.forEach((model: any, index: number) => {
        console.log(`   ${index + 1}. ${model.id}`)
      })
    }
    
  } catch (error: any) {
    console.error('❌ Error conectando a LM Studio:', error.message)
    console.log('\n💡 Soluciones:')
    console.log('   1. Abre LM Studio')
    console.log('   2. Ve a Settings (⚙️)')
    console.log('   3. Activa "Enable local REST API server"')
    console.log('   4. Verifica que el puerto sea 1234')
    console.log('   5. Carga un modelo en la pestaña Chat')
    console.log('\n⚠️  No se puede continuar sin LM Studio ejecutándose')
    process.exit(1)
  }
  
  console.log('\n\n🤖 Paso 2: Probar generación de respuesta...\n')
  
  const testMessages = [
    {
      role: 'system',
      content: 'Responde brevemente en español.'
    },
    {
      role: 'user',
      content: 'Di hola'
    }
  ]
  
  console.log('📤 Enviando mensaje simple: "Di hola"')
  console.log('⏳ Esperando respuesta de LM Studio...\n')
  
  try {
    const startTime = Date.now()
    
    const response = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LM_STUDIO_MODEL,
        messages: testMessages,
        temperature: 0.7,
        max_tokens: 50,
        stream: false
      }),
      signal: AbortSignal.timeout(60000) // 60 segundos
    })
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('LM Studio no devolvió contenido en la respuesta')
    }
    
    console.log('✅ RESPUESTA RECIBIDA:')
    console.log('─'.repeat(60))
    console.log(`⏱️  Tiempo: ${duration} segundos`)
    console.log(`📦 Modelo usado: ${data.model || LM_STUDIO_MODEL}`)
    console.log(`\n💬 Contenido:\n${content}`)
    console.log('─'.repeat(60))
    
  } catch (error: any) {
    console.error('\n❌ Error generando respuesta:', error.message)
    
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      console.log('\n💡 El modelo está tardando mucho:')
      console.log('   1. Usa un modelo más pequeño (phi-2 recomendado)')
      console.log('   2. Verifica que el modelo esté cargado en LM Studio')
      console.log('   3. Cierra otros programas pesados')
    } else {
      console.log('\n💡 Posibles soluciones:')
      console.log('   1. Verifica que el modelo esté cargado en LM Studio')
      console.log('   2. Ve a la pestaña Chat y selecciona un modelo')
      console.log('   3. Espera a que el modelo termine de cargar')
    }
    process.exit(1)
  }
  
  console.log('\n\n🔄 Paso 3: Probar múltiples respuestas...\n')
  
  const testQuestions = [
    '¿Cuánto cuesta?',
    'Dame más información',
    'Gracias'
  ]
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i]
    console.log(`\n📤 Pregunta ${i + 1}: "${question}"`)
    
    try {
      const startTime = Date.now()
      
      const response = await fetch(LM_STUDIO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: LM_STUDIO_MODEL,
          messages: [
            { role: 'system', content: 'Responde brevemente.' },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 100,
          stream: false
        }),
        signal: AbortSignal.timeout(20000)
      })
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        console.log(`   ✅ Respondió en ${duration}s: "${content?.substring(0, 50)}..."`)
      } else {
        console.log(`   ❌ Error HTTP ${response.status}`)
      }
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  console.log('\n\n' + '='.repeat(60))
  console.log('✅ PRUEBA COMPLETADA')
  console.log('='.repeat(60))
  
  console.log('\n📊 RESUMEN:')
  console.log('   ✅ LM Studio está funcionando correctamente')
  console.log('   ✅ Puede generar respuestas')
  console.log('   ✅ Listo para usar como respaldo')
  
  console.log('\n💡 PRÓXIMOS PASOS:')
  console.log('   1. Mantén LM Studio ejecutándose')
  console.log('   2. El bot usará LM Studio automáticamente si Groq falla')
  console.log('   3. Ejecuta: npm run dev')
  
  console.log('\n🎉 ¡Tu bot ahora tiene respaldo local sin límites!')
}

// Ejecutar prueba
testLMStudio()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
