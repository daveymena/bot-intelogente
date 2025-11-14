import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function resetCompleto() {
  console.log('🔥 RESET COMPLETO DE BAILEYS')
  console.log('=' .repeat(70))

  try {
    // 1. Limpiar DB
    console.log('\n1️⃣ Limpiando base de datos...')
    await db.whatsAppConnection.deleteMany()
    console.log('   ✅ DB limpiada')

    // 2. Eliminar auth_sessions
    console.log('\n2️⃣ Eliminando auth_sessions...')
    const authDir = path.join(process.cwd(), 'auth_sessions')
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true })
      console.log('   ✅ auth_sessions eliminado')
    } else {
      console.log('   ℹ️  No existe auth_sessions')
    }

    // 3. Eliminar whatsapp-sessions
    console.log('\n3️⃣ Eliminando whatsapp-sessions...')
    const waDir = path.join(process.cwd(), 'whatsapp-sessions')
    if (fs.existsSync(waDir)) {
      fs.rmSync(waDir, { recursive: true, force: true })
      console.log('   ✅ whatsapp-sessions eliminado')
    } else {
      console.log('   ℹ️  No existe whatsapp-sessions')
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ RESET COMPLETO EXITOSO')
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Reinicia el servidor (Ctrl+C y npm run dev)')
    console.log('   2. Ve al dashboard: http://localhost:3000')
    console.log('   3. Haz clic en "Conectar WhatsApp"')
    console.log('   4. Escanea el QR')
    console.log('\n💡 O ejecuta: npx tsx scripts/conectar-baileys-y-mostrar-qr.ts')

  } catch (error) {
    console.error('\n❌ ERROR:', error)
  }
}

resetCompleto()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
  })
