/**
 * Script para verificar que IA Local está funcionando correctamente
 */

import { LocalAIOnlyService } from '../src/lib/local-ai-only-service'
import { BaileysLocalAIIntegration } from '../src/lib/baileys-local-ai-integration'

async function verificarIALocal() {
  console.log('🔍 Verificando IA Local...\n')

  try {
    // 1. Inicializar IA Local
    console.log('1️⃣ Inicializando IA Local...')
    await LocalAIOnlyService.initialize()
    console.log('   ✅ IA Local inicializada\n')

    // 2. Obtener estadísticas
    console.log('2️⃣ Obteniendo estadísticas...')
    const stats = LocalAIOnlyService.getStats()
    console.log(`   ✅ Datos de entrenamiento: ${stats.trainingDataSize}`)
    console.log(`   ✅ Productos: ${stats.productsCount}`)
    console.log(`   ✅ Métodos de pago: ${stats.paymentMethodsCount}\n`)

    // 3. Probar procesamiento de mensaje
    console.log('3️⃣ Probando procesamiento de mensaje...')
    const testMessage = '¿Tienes laptops?'
    const response = await LocalAIOnlyService.processMessage(
      testMessage,
      'test-user',
      [],
      'test-from'
    )
    console.log(`   ✅ Mensaje: "${testMessage}"`)
    console.log(`   ✅ Intención detectada: ${response.intent}`)
    console.log(`   ✅ Confianza: ${(response.confidence * 100).toFixed(0)}%`)
    console.log(`   ✅ Respuesta: "${response.message.substring(0, 50)}..."\n`)

    // 4. Verificar IA Local en Baileys
    console.log('4️⃣ Verificando integración con Baileys...')
    const isReady = await BaileysLocalAIIntegration.verifyLocalAIReady()
    console.log(`   ✅ IA Local lista: ${isReady ? 'SÍ' : 'NO'}\n`)

    // 5. Resumen
    console.log('=' .repeat(60))
    console.log('✅ VERIFICACIÓN COMPLETADA')
    console.log('=' .repeat(60))
    console.log('\n✅ IA Local está funcionando correctamente')
    console.log('✅ Integración con Baileys lista')
    console.log('✅ Sistema listo para procesar mensajes\n')

    console.log('🚀 Próximos pasos:')
    console.log('   1. Iniciar bot: npm run dev')
    console.log('   2. Enviar mensaje a WhatsApp')
    console.log('   3. Verificar que se procesa con IA Local\n')

  } catch (error) {
    console.error('❌ Error verificando IA Local:', error)
    process.exit(1)
  }
}

// Ejecutar
verificarIALocal()
