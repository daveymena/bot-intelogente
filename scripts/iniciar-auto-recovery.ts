/**
 * Script para iniciar el sistema de auto-recuperación
 * Ejecutar con: npx tsx scripts/iniciar-auto-recovery.ts
 */

import { AutoRecoveryService } from '../src/lib/auto-recovery-service'

async function main() {
  console.log('🚀 SISTEMA DE AUTO-RECUPERACIÓN INTELIGENTE')
  console.log('='.repeat(60))
  console.log('')
  console.log('Este sistema monitorea y auto-repara:')
  console.log('  ✅ WhatsApp - Reconexión automática')
  console.log('  ✅ Base de Datos - Verificación de integridad')
  console.log('  ✅ Pagos - Validación de configuración')
  console.log('  ✅ IA - Prueba de conectividad')
  console.log('')
  console.log('='.repeat(60))
  console.log('')

  // Ejecutar recuperación inicial
  console.log('🔧 Ejecutando recuperación inicial...\n')
  await AutoRecoveryService.fullSystemRecovery()

  // Iniciar monitoreo continuo
  console.log('🔍 Iniciando monitoreo continuo...')
  console.log('⏰ Chequeos cada 5 minutos')
  console.log('💡 Presiona Ctrl+C para detener\n')
  
  await AutoRecoveryService.startMonitoring(5)
}

main().catch(console.error)
