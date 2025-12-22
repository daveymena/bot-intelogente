/**
 * 🧪 Script de prueba para el sistema de limpieza de sesiones
 */

import { SessionCleanupService } from '../src/lib/session-cleanup-service'

async function main() {
  console.log('🧪 Iniciando prueba del sistema de limpieza de sesiones\n')

  // 1. Generar reporte de diagnóstico
  console.log('📊 Generando reporte de diagnóstico...')
  const diagnostic = await SessionCleanupService.diagnosticReport()
  
  console.log('\n📋 REPORTE DE DIAGNÓSTICO:')
  console.log(`Total de sesiones: ${diagnostic.totalSessions}`)
  console.log(`Sesiones saludables: ${diagnostic.healthySessions}`)
  console.log(`Sesiones corruptas: ${diagnostic.corruptedSessions}`)
  
  if (diagnostic.details.length > 0) {
    console.log('\n📝 Detalles de sesiones:')
    for (const detail of diagnostic.details) {
      console.log(`\n  Usuario: ${detail.userId}`)
      console.log(`  Estado: ${detail.status}`)
      console.log(`  Saludable: ${detail.isHealthy ? '✅' : '❌'}`)
      if (detail.issues.length > 0) {
        console.log(`  Problemas:`)
        detail.issues.forEach(issue => console.log(`    - ${issue}`))
      }
      if (detail.shouldCleanup) {
        console.log(`  🧹 Requiere limpieza`)
      }
    }
  }

  // 2. Ejecutar auto-limpieza si hay sesiones corruptas
  if (diagnostic.corruptedSessions > 0) {
    console.log('\n🧹 Ejecutando auto-limpieza...')
    await SessionCleanupService.autoCleanup()
    await SessionCleanupService.cleanupExpiredLocks()
    
    // Generar nuevo reporte
    console.log('\n📊 Generando nuevo reporte después de limpieza...')
    const newDiagnostic = await SessionCleanupService.diagnosticReport()
    console.log(`Sesiones corruptas restantes: ${newDiagnostic.corruptedSessions}`)
  } else {
    console.log('\n✅ No hay sesiones corruptas para limpiar')
  }

  console.log('\n✅ Prueba completada')
}

main().catch(console.error)
