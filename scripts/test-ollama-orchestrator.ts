/**
 * 🧪 TEST: Ollama Professional Orchestrator
 * 
 * Prueba el sistema orquestador con Ollama como principal
 */

import { OllamaProfessionalOrchestrator } from '../src/lib/ollama-orchestrator-professional'

async function testOrchestrator() {
  console.log('🧪 PROBANDO OLLAMA PROFESSIONAL ORCHESTRATOR\n')
  console.log('=' .repeat(60))

  // 1️⃣ Verificar disponibilidad
  console.log('\n1️⃣ VERIFICANDO DISPONIBILIDAD...\n')
  const stats = await OllamaProfessionalOrchestrator.getStats()
  console.log('📊 Estadísticas:')
  console.log(JSON.stringify(stats, null, 2))

  // 2️⃣ Pruebas de conversación
  const testCases = [
    {
      name: 'Saludo simple',
      message: 'Hola, buenos días',
      userId: 'test-user-1'
    },
    {
      name: 'Búsqueda de laptop',
      message: 'Busco una laptop para diseño gráfico',
      userId: 'test-user-1'
    },
    {
      name: 'Pregunta de precio',
      message: 'Cuánto cuesta?',
      userId: 'test-user-1'
    },
    {
      name: 'Métodos de pago',
      message: 'Cómo puedo pagar?',
      userId: 'test-user-1'
    },
    {
      name: 'Consulta de envío',
      message: 'Hacen envíos a Bogotá?',
      userId: 'test-user-1'
    }
  ]

  console.log('\n2️⃣ PROBANDO CASOS DE USO...\n')

  for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📝 TEST: ${testCase.name}`)
    console.log(`💬 Mensaje: "${testCase.message}"`)
    console.log(`${'─'.repeat(60)}\n`)

    try {
      const startTime = Date.now()
      
      const result = await OllamaProfessionalOrchestrator.processMessage(
        testCase.message,
        testCase.userId,
        [],
        '+573136174267'
      )

      const duration = Date.now() - startTime

      console.log(`✅ RESPUESTA (${duration}ms):`)
      console.log(`📍 Fuente: ${result.source.toUpperCase()}`)
      console.log(`📊 Confianza: ${result.confidence}%`)
      if (result.products && result.products.length > 0) {
        console.log(`📦 Productos: ${result.products.length}`)
      }
      console.log(`\n💬 Mensaje:\n${result.message}`)

    } catch (error: any) {
      console.error(`❌ ERROR: ${error.message}`)
    }

    // Esperar un poco entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ PRUEBAS COMPLETADAS')
  console.log('='.repeat(60))
}

// Ejecutar pruebas
testOrchestrator()
  .then(() => {
    console.log('\n✅ Script finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error)
    process.exit(1)
  })
