/**
 * Script de prueba para el sistema de auto-recuperación
 */

import { AutoRecoveryService } from '../src/lib/auto-recovery-service'

async function testAutoRecovery() {
  console.log('🧪 PRUEBA DEL SISTEMA DE AUTO-RECUPERACIÓN')
  console.log('='.repeat(60))
  console.log('')

  // Test 1: Diagnóstico con IA
  console.log('📋 Test 1: Diagnóstico de Error con IA')
  console.log('-'.repeat(60))
  try {
    const testError = new Error('ECONNREFUSED: Connection refused at localhost:5432')
    const diagnosis = await AutoRecoveryService.diagnoseError('Database', testError)
    console.log('✅ Diagnóstico recibido:')
    console.log(diagnosis)
  } catch (error) {
    console.log('❌ Error en diagnóstico:', error)
  }
  console.log('')

  // Test 2: Recuperación de WhatsApp
  console.log('📋 Test 2: Auto-Recuperación de WhatsApp')
  console.log('-'.repeat(60))
  try {
    const result = await AutoRecoveryService.recoverWhatsApp()
    console.log(result ? '✅ WhatsApp recuperado' : '⚠️  WhatsApp requiere atención manual')
  } catch (error) {
    console.log('❌ Error:', error)
  }
  console.log('')

  // Test 3: Recuperación de Base de Datos
  console.log('📋 Test 3: Auto-Recuperación de Base de Datos')
  console.log('-'.repeat(60))
  try {
    const result = await AutoRecoveryService.recoverDatabase()
    console.log(result ? '✅ Base de datos OK' : '⚠️  Base de datos requiere atención')
  } catch (error) {
    console.log('❌ Error:', error)
  }
  console.log('')

  // Test 4: Recuperación de Pagos
  console.log('📋 Test 4: Auto-Recuperación de Pagos')
  console.log('-'.repeat(60))
  try {
    const result = await AutoRecoveryService.recoverPayments()
    console.log(result ? '✅ Sistema de pagos OK' : '⚠️  Pagos requieren configuración')
  } catch (error) {
    console.log('❌ Error:', error)
  }
  console.log('')

  // Test 5: Recuperación de IA
  console.log('📋 Test 5: Auto-Recuperación de IA')
  console.log('-'.repeat(60))
  try {
    const result = await AutoRecoveryService.recoverAI()
    console.log(result ? '✅ IA funcionando' : '⚠️  IA requiere configuración')
  } catch (error) {
    console.log('❌ Error:', error)
  }
  console.log('')

  // Test 6: Recuperación Completa
  console.log('📋 Test 6: Recuperación Completa del Sistema')
  console.log('-'.repeat(60))
  try {
    await AutoRecoveryService.fullSystemRecovery()
  } catch (error) {
    console.log('❌ Error:', error)
  }
  console.log('')

  // Test 7: Ver Logs
  console.log('📋 Test 7: Logs de Recuperación')
  console.log('-'.repeat(60))
  const logs = AutoRecoveryService.getRecoveryLogs()
  console.log(`📝 Total de logs: ${logs.length}`)
  
  if (logs.length > 0) {
    console.log('\nÚltimos 3 logs:')
    logs.slice(-3).forEach((log, i) => {
      console.log(`\n${i + 1}. ${log.component} - ${log.success ? '✅' : '❌'}`)
      console.log(`   Timestamp: ${log.timestamp}`)
      console.log(`   Error: ${log.error}`)
      console.log(`   Acción: ${log.action}`)
    })
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('✅ PRUEBAS COMPLETADAS')
  console.log('='.repeat(60))
}

testAutoRecovery().catch(console.error)
