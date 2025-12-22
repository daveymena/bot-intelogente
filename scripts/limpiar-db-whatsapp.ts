import { db } from '../src/lib/db'

async function limpiarDB() {
  console.log('🧹 Limpiando base de datos de WhatsApp...')
  
  try {
    await db.whatsAppConnection.deleteMany()
    console.log('✅ Base de datos limpiada')
  } catch (error) {
    console.error('❌ Error:', error)
  }
  
  process.exit(0)
}

limpiarDB()
