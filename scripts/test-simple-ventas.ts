/**
 * 🧪 TEST SIMPLE DE VENTAS
 * Prueba los casos más críticos
 */

import { Orchestrator } from '../src/agents/orchestrator'
import { SharedMemoryService } from '../src/agents/shared-memory'

async function testSimple() {
  console.log('🧪 PRUEBA SIMPLE DE VENTAS\n')

  const orchestrator = new Orchestrator()
  const chatId = `test-${Date.now()}`
  const userId = 'cmi6xj8q30000kme42q5fjk41' // Usuario real

  const pruebas = [
    { msg: 'Hola', debe: 'saludo sin productos' },
    { msg: 'Busco curso de piano', debe: 'info breve + foto' },
    { msg: 'Cuánto cuesta', debe: 'precio del piano (60.000)' },
    { msg: 'Quiero pagar por transferencia', debe: 'datos de transferencia' },
    { msg: 'Luego te envío el comprobante', debe: 'confirmación sin buscar productos' }
  ]

  for (const prueba of pruebas) {
    console.log(`\n💬 "${prueba.msg}"`)
    console.log(`📋 Debe: ${prueba.debe}`)
    
    try {
      const respuesta = await orchestrator.processMessage({
        chatId,
        userId,
        message: prueba.msg,
        userName: 'Test'
      })

      console.log(`🤖 Respuesta (${respuesta.text.length} chars):`)
      console.log(`   "${respuesta.text.substring(0, 80)}..."`)
      console.log(`✅ OK\n`)
      
      await new Promise(r => setTimeout(r, 1000))
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}\n`)
    }
  }

  console.log('✅ Pruebas completadas')
  process.exit(0)
}

testSimple().catch(console.error)
