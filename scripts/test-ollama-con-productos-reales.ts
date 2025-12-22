/**
 * 🧪 TEST: Ollama con productos REALES de la BD
 */

import { OllamaProfessionalOrchestrator } from '../src/lib/ollama-orchestrator-professional'
import { db } from '../src/lib/db'

async function testConProductosReales() {
  console.log('🧪 PROBANDO OLLAMA CON PRODUCTOS REALES\n')
  console.log('=' .repeat(60))

  // 1️⃣ Obtener un usuario real con productos
  console.log('\n1️⃣ BUSCANDO USUARIO CON PRODUCTOS...\n')
  
  const usuario = await db.user.findFirst({
    where: {
      products: {
        some: {}
      }
    },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  if (!usuario) {
    console.log('❌ No hay usuarios con productos en la BD')
    return
  }

  console.log(`✅ Usuario encontrado: ${usuario.email}`)
  console.log(`📦 Productos: ${usuario._count.products}`)

  // 2️⃣ Obtener algunos productos de ejemplo
  const productos = await db.product.findMany({
    where: { userId: usuario.id },
    take: 3,
    orderBy: { createdAt: 'desc' }
  })

  console.log(`\n📋 Productos disponibles:`)
  productos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP`)
  })

  // 3️⃣ Probar casos de uso con productos reales
  console.log('\n2️⃣ PROBANDO CASOS DE USO...\n')

  const testCases = [
    {
      name: 'Saludo',
      message: 'Hola'
    },
    {
      name: 'Búsqueda de laptop',
      message: 'Busco una laptop para diseño'
    },
    {
      name: 'Cliente pregunta por la opción 2',
      message: 'Cuéntame más de la opción 2'
    },
    {
      name: 'Objeción: Es muy caro',
      message: 'Me parece muy caro'
    },
    {
      name: 'Cliente pregunta métodos de pago',
      message: 'Cómo puedo pagar?'
    },
    {
      name: 'Cliente escoge MercadoPago',
      message: 'Quiero pagar con MercadoPago'
    },
    {
      name: 'Cliente pide generar link',
      message: 'Genérame el link de pago'
    }
  ]

  // Historial de conversación (memoria)
  const conversationHistory: any[] = []

  for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📝 TEST: ${testCase.name}`)
    console.log(`💬 Mensaje: "${testCase.message}"`)
    console.log(`${'─'.repeat(60)}\n`)

    try {
      const startTime = Date.now()
      
      const result = await OllamaProfessionalOrchestrator.processMessage(
        testCase.message,
        usuario.id,
        conversationHistory, // Pasar historial
        '+573136174267'
      )

      // Agregar al historial
      conversationHistory.push(
        { role: 'user', content: testCase.message },
        { role: 'assistant', content: result.message }
      )

      // Mantener solo últimos 12 mensajes (6 intercambios)
      if (conversationHistory.length > 12) {
        conversationHistory.splice(0, conversationHistory.length - 12)
      }

      // Mostrar historial actual
      console.log(`\n📝 Historial (${conversationHistory.length} mensajes):`);
      conversationHistory.slice(-4).forEach((msg, i) => {
        const role = msg.role === 'user' ? '👤' : '🤖'
        const preview = msg.content.substring(0, 60)
        console.log(`   ${role} ${preview}${msg.content.length > 60 ? '...' : ''}`)
      })

      const duration = Date.now() - startTime

      console.log(`✅ RESPUESTA (${duration}ms):`)
      console.log(`📍 Fuente: ${result.source.toUpperCase()}`)
      console.log(`📊 Confianza: ${result.confidence}%`)
      if (result.products && result.products.length > 0) {
        console.log(`📦 Productos encontrados: ${result.products.length}`)
      }
      console.log(`\n💬 Mensaje:\n${result.message}`)

    } catch (error: any) {
      console.error(`❌ ERROR: ${error.message}`)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ PRUEBAS COMPLETADAS')
  console.log('='.repeat(60))
}

testConProductosReales()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
