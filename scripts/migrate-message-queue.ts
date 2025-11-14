/**
 * 🔄 Migración: Agregar tabla de cola de mensajes
 */

import { execSync } from 'child_process'

async function migrate() {
  try {
    console.log('📦 Generando migración de Prisma...')
    
    // Generar migración
    execSync('npx prisma migrate dev --name add_message_queue', {
      stdio: 'inherit'
    })
    
    console.log('✅ Migración completada')
    console.log('\n📬 Sistema de cola de mensajes configurado:')
    console.log('- Los mensajes se guardarán en cola si el bot está desconectado')
    console.log('- Al reconectar, se procesarán automáticamente')
    console.log('- Máximo 3 intentos por mensaje')
    console.log('- Limpieza automática de mensajes antiguos (7 días)')
    
  } catch (error) {
    console.error('❌ Error en migración:', error)
    process.exit(1)
  }
}

migrate()
