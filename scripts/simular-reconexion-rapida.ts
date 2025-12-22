/**
 * Simula el escenario problemático: reconexión + envío inmediato
 * Verifica que el sistema de estabilización funciona correctamente
 */

import { WhatsAppWebService } from '../src/lib/whatsapp-web-service'

async function simulateQuickReconnection() {
  console.log('🧪 SIMULACIÓN: Reconexión Rápida + Envío Inmediato\n')
  console.log('Este script simula el escenario que causaba "Connection Closed"\n')

  try {
    const userId = 'test-user'
    const testPhone = '573042748687' // Número de prueba

    console.log('1️⃣ Verificando estado inicial...')
    let session = WhatsAppWebService.getConnectionStatus(userId)

    if (!session) {
      console.log('❌ No hay sesión activa')
      console.log('\n💡 Primero conecta WhatsApp con: npm run dev')
      return
    }

    console.log(`✅ Sesión encontrada: ${session.status}`)

    if (session.status !== 'CONNECTED') {
      console.log('❌ WhatsApp no está conectado')
      return
    }

    console.log('\n2️⃣ Simulando escenario problemático...')
    console.log('   (Antes esto causaba "Connection Closed")')

    // Simular que la conexión acaba de establecerse
    const timeSinceConnection = Date.now() - session.lastConnectionTime
    console.log(`\n   Tiempo desde última conexión: ${timeSinceConnection}ms`)
    console.log(`   isReady: ${session.isReady}`)

    if (session.isReady && timeSinceConnection > 3000) {
      console.log('\n⚠️  La conexión ya está estable (>3 segundos)')
      console.log('   Para simular el problema, necesitas:')
      console.log('   1. Desconectar WhatsApp Web en tu teléfono')
      console.log('   2. Esperar a que se reconecte automáticamente')
      console.log('   3. Ejecutar este script inmediatamente después')
      console.log('\n   O usa el monitor en tiempo real:')
      console.log('   npx tsx scripts/monitorear-estabilidad-conexion.ts')
      return
    }

    console.log('\n3️⃣ Intentando enviar mensaje inmediatamente...')
    console.log('   (El sistema debería esperar automáticamente)')

    const startTime = Date.now()
    const testMessage = '🧪 Mensaje de prueba - Sistema de estabilización'

    console.log(`\n   📤 Enviando a ${testPhone}...`)

    const success = await WhatsAppWebService.sendMessage(
      userId,
      testPhone,
      testMessage
    )

    const elapsed = Date.now() - startTime

    if (success) {
      console.log(`\n✅ ÉXITO: Mensaje enviado correctamente`)
      console.log(`   Tiempo total: ${elapsed}ms`)
      
      if (elapsed > 2000) {
        console.log(`   ✅ El sistema esperó a que la conexión se estabilizara`)
      } else {
        console.log(`   ✅ La conexión ya estaba estable`)
      }
    } else {
      console.log(`\n❌ FALLO: No se pudo enviar el mensaje`)
      console.log(`   Tiempo transcurrido: ${elapsed}ms`)
      console.log(`   El mensaje fue encolado para envío posterior`)
    }

    console.log('\n4️⃣ Verificando cola de mensajes...')
    const queueStats = await WhatsAppWebService.getQueueStats()
    console.log(`   - Pendientes: ${queueStats.pending}`)
    console.log(`   - Enviados: ${queueStats.sent}`)
    console.log(`   - Fallidos: ${queueStats.failed}`)

    console.log('\n✅ Simulación completada')
    console.log('\n💡 Resultado esperado:')
    console.log('   - NO debe haber error "Connection Closed"')
    console.log('   - El mensaje se envía correctamente')
    console.log('   - O se encola si la conexión no está lista')

  } catch (error) {
    console.error('\n❌ Error en simulación:', error)
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message)
    }
  }
}

// Ejecutar simulación
simulateQuickReconnection()
