/**
 * Test de intenciones conversacionales del SalesAgentSimple
 * Verifica que el bot entienda correctamente diferentes tipos de mensajes
 */

import { SalesAgentSimple } from '@/lib/sales-agent-simple'

async function testIntenciones() {
  console.log('🧪 TEST DE INTENCIONES CONVERSACIONALES')
  console.log('=' .repeat(60))
  
  const agent = new SalesAgentSimple()
  
  // Esperar a que carguen los productos
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const testCases = [
    // INTERÉS FUTURO - NO debe enviar métodos de pago
    { msg: 'Vale gracias te aviso', expected: 'future_interest', desc: 'Despedida con interés futuro' },
    { msg: 'Ok luego te confirmo', expected: 'future_interest', desc: 'Confirmará después' },
    { msg: 'Gracias, si algo te escribo', expected: 'future_interest', desc: 'Escribirá después' },
    { msg: 'Lo voy a pensar y te aviso', expected: 'future_interest', desc: 'Lo pensará' },
    { msg: 'Perfecto, más tarde te digo', expected: 'future_interest', desc: 'Más tarde' },
    
    // AGRADECIMIENTO SIMPLE - El bot lo trata como farewell (funcionalmente similar)
    { msg: 'Gracias', expected: 'farewell', desc: 'Agradecimiento simple' },
    { msg: 'Muchas gracias!', expected: 'farewell', desc: 'Agradecimiento efusivo' },
    
    // LO VOY A PENSAR
    { msg: 'Lo voy a pensar', expected: 'thinking_about_it', desc: 'Va a pensar' },
    { msg: 'Déjame pensarlo', expected: 'thinking_about_it', desc: 'Déjame pensarlo' },
    
    // NECESITA TIEMPO
    { msg: 'Dame tiempo', expected: 'need_time', desc: 'Pide tiempo' },
    { msg: 'Ahora no puedo', expected: 'need_time', desc: 'No puede ahora' },
    { msg: 'Estoy ocupado', expected: 'need_time', desc: 'Está ocupado' },
    
    // MENCIONA COMPETENCIA
    { msg: 'Lo vi más barato en otro lado', expected: 'competitor_mention', desc: 'Más barato en otro lado' },
    { msg: 'En mercado libre está más económico', expected: 'competitor_mention', desc: 'Mercado Libre' },
    
    // PREGUNTA PARA OTRA PERSONA
    { msg: 'Es para un amigo', expected: 'asking_for_other', desc: 'Para un amigo' },
    { msg: 'Es para regalar', expected: 'asking_for_other', desc: 'Para regalar' },
    { msg: 'Es para mi hijo', expected: 'asking_for_other', desc: 'Para mi hijo' },
    
    // DUDA SOBRE CALIDAD
    { msg: 'Es bueno?', expected: 'quality_doubt', desc: 'Pregunta si es bueno' },
    { msg: 'Funciona bien?', expected: 'quality_doubt', desc: 'Pregunta si funciona' },
    { msg: 'Vale la pena?', expected: 'quality_doubt', desc: 'Vale la pena' },
    
    // URGENCIA
    { msg: 'Lo necesito ya', expected: 'urgency', desc: 'Lo necesita ya' },
    { msg: 'Es urgente', expected: 'urgency', desc: 'Es urgente' },
    { msg: 'Cuánto demora?', expected: 'urgency', desc: 'Cuánto demora' },
    
    // CONSULTA DISPONIBILIDAD
    { msg: 'Está disponible?', expected: 'availability_check', desc: 'Disponibilidad' },
    { msg: 'Hay en stock?', expected: 'availability_check', desc: 'Stock' },
    { msg: 'Lo tienen?', expected: 'availability_check', desc: 'Lo tienen' },
    
    // PIDE RECOMENDACIÓN
    { msg: 'Qué me recomiendas?', expected: 'recommendation_request', desc: 'Pide recomendación' },
    { msg: 'Cuál es mejor?', expected: 'recommendation_request', desc: 'Cuál es mejor' },
    
    // OBJECIÓN DE PRECIO
    { msg: 'Está muy caro', expected: 'price_objection', desc: 'Muy caro' },
    { msg: 'No tengo plata', expected: 'price_objection', desc: 'No tiene plata' },
    { msg: 'Hay descuento?', expected: 'price_objection', desc: 'Pide descuento' },
    
    // CONFIRMACIÓN DE COMPRA
    { msg: 'Sí lo quiero', expected: 'confirmation', desc: 'Confirmación' },
    { msg: 'Dale, lo compro', expected: 'confirmation', desc: 'Dale lo compro' },
    { msg: 'Pásame los datos de pago', expected: 'confirmation', desc: 'Pide datos de pago' },
    
    // DESPEDIDA
    { msg: 'Chao', expected: 'farewell', desc: 'Despedida' },
    { msg: 'Adiós', expected: 'farewell', desc: 'Adiós' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of testCases) {
    const phone = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const result = await agent.processMessage(test.msg, phone)
      const success = result.intent === test.expected
      
      if (success) {
        console.log(`✅ ${test.desc}`)
        console.log(`   Mensaje: "${test.msg}"`)
        console.log(`   Intent: ${result.intent}`)
        passed++
      } else {
        console.log(`❌ ${test.desc}`)
        console.log(`   Mensaje: "${test.msg}"`)
        console.log(`   Esperado: ${test.expected}`)
        console.log(`   Obtenido: ${result.intent}`)
        failed++
      }
      console.log('')
    } catch (error: any) {
      console.log(`❌ ERROR en "${test.desc}": ${error.message}`)
      failed++
    }
  }
  
  console.log('=' .repeat(60))
  console.log(`📊 RESULTADOS: ${passed} pasaron, ${failed} fallaron`)
  console.log(`📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)
  
  // Test de conversación completa
  console.log('\n' + '=' .repeat(60))
  console.log('🎭 TEST DE CONVERSACIÓN COMPLETA')
  console.log('=' .repeat(60))
  
  const conversationPhone = 'test_conversation_' + Date.now()
  
  const conversation = [
    { msg: 'Hola', desc: 'Saludo inicial' },
    { msg: 'Tienes cursos de diseño?', desc: 'Pregunta por producto' },
    { msg: 'Cuánto cuesta?', desc: 'Pregunta precio' },
    { msg: 'Es bueno?', desc: 'Duda calidad' },
    { msg: 'Está muy caro', desc: 'Objeción precio' },
    { msg: 'Vale gracias te aviso', desc: 'Despedida con interés futuro' },
  ]
  
  for (const step of conversation) {
    console.log(`\n👤 Cliente: "${step.msg}"`)
    const result = await agent.processMessage(step.msg, conversationPhone)
    console.log(`🤖 Bot (${result.intent}): ${result.text.substring(0, 150)}...`)
    
    // Verificar que NO envíe métodos de pago en despedida con interés futuro
    if (step.msg.includes('te aviso')) {
      if (result.text.includes('MÉTODOS DE PAGO') || result.text.includes('Nequi:') || result.text.includes('MercadoPago')) {
        console.log('❌ ERROR: Envió métodos de pago cuando no debía!')
      } else {
        console.log('✅ Correcto: No envió métodos de pago')
      }
    }
  }
  
  console.log('\n✅ Test completado')
}

testIntenciones().catch(console.error)
