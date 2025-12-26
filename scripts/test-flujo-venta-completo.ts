/**
 * Test de flujo de venta completo: desde saludo hasta cierre
 */

import { SalesAgentSimple } from '@/lib/sales-agent-simple'

async function testFlujoCompleto() {
  console.log('🛒 TEST DE FLUJO DE VENTA COMPLETO')
  console.log('='.repeat(60))
  
  const agent = new SalesAgentSimple()
  const phone = 'test_venta_' + Date.now()
  
  // Esperar a que carguen los productos
  await new Promise(r => setTimeout(r, 1500))
  
  const conversacion = [
    { cliente: 'Hola', desc: '1. Saludo inicial' },
    { cliente: 'Tienes cursos de piano?', desc: '2. Pregunta por producto' },
    { cliente: 'Cuánto cuesta?', desc: '3. Pregunta precio' },
    { cliente: 'Qué incluye?', desc: '4. Más información' },
    { cliente: 'Es bueno?', desc: '5. Duda calidad' },
    { cliente: 'Sí lo quiero', desc: '6. Confirmación de compra' },
  ]
  
  for (const paso of conversacion) {
    console.log('\n' + '-'.repeat(60))
    console.log(`📍 ${paso.desc}`)
    console.log(`👤 Cliente: "${paso.cliente}"`)
    
    try {
      const result = await agent.processMessage(paso.cliente, phone)
      
      console.log(`🎯 Intent: ${result.intent}`)
      console.log(`📊 Stage: ${result.salesStage}`)
      console.log(`🤖 Bot: ${result.text.substring(0, 300)}${result.text.length > 300 ? '...' : ''}`)
      
      if (result.sendPhotos) {
        console.log(`📷 Envía foto: Sí`)
      }
      if (result.product) {
        console.log(`📦 Producto: ${result.product.name}`)
      }
      
      // Verificar que no haya error
      if (result.text.includes('tuve un problema')) {
        console.log('❌ ERROR: El bot devolvió mensaje de error')
        break
      }
      
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`)
      console.log(error.stack?.split('\n').slice(0, 3).join('\n'))
      break
    }
    
    // Pequeña pausa entre mensajes
    await new Promise(r => setTimeout(r, 500))
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Test de flujo completado')
  
  process.exit(0)
}

testFlujoCompleto().catch(e => {
  console.error('Error fatal:', e)
  process.exit(1)
})
