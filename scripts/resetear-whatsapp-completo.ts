/**
 * 🔄 RESETEO COMPLETO DE WHATSAPP
 * 
 * Este script limpia TODAS las sesiones y archivos de WhatsApp
 * para empezar completamente desde cero.
 * 
 * Uso: npx tsx scripts/resetear-whatsapp-completo.ts [email]
 */

import { db } from '../src/lib/db'
import { BaileysService } from '../src/lib/baileys-service'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  try {
    console.log('🔄 RESETEO COMPLETO DE WHATSAPP\n')
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODAS las sesiones y archivos de WhatsApp')
    console.log('⚠️  Tendrás que escanear el QR nuevamente\n')

    // Obtener email del usuario
    let email = process.argv[2]

    if (!email) {
      email = await question('📧 Email del usuario: ')
    }

    if (!email) {
      console.log('❌ Email requerido')
      process.exit(1)
    }

    // Buscar usuario
    const user = await db.user.findUnique({
      where: { email },
      include: {
        whatsappConnection: true
      }
    })

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`)
      process.exit(1)
    }

    console.log(`\n✅ Usuario encontrado: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    
    if (user.whatsappConnection) {
      console.log(`   Estado actual: ${user.whatsappConnection.status}`)
      console.log(`   Número: ${user.whatsappConnection.phoneNumber}`)
      console.log(`   Conectado: ${user.whatsappConnection.isConnected ? 'Sí' : 'No'}`)
    } else {
      console.log(`   Sin conexión de WhatsApp`)
    }

    // Confirmar
    const confirm = await question('\n⚠️  ¿Estás seguro de hacer el reseteo completo? (si/no): ')

    if (confirm.toLowerCase() !== 'si' && confirm.toLowerCase() !== 'sí') {
      console.log('❌ Reseteo cancelado')
      process.exit(0)
    }

    console.log('\n🔄 Iniciando reseteo completo...\n')

    // Ejecutar reseteo
    const result = await BaileysService.fullReset(user.id)

    if (result.success) {
      console.log('\n✅ RESETEO COMPLETO EXITOSO')
      console.log(`   ${result.message}`)
      console.log('\n📱 Ahora puedes:')
      console.log('   1. Ir al dashboard')
      console.log('   2. Hacer clic en "Conectar WhatsApp"')
      console.log('   3. Escanear el nuevo QR')
      console.log('\n💡 El QR debería generarse sin problemas ahora')
    } else {
      console.log('\n❌ ERROR EN RESETEO')
      console.log(`   ${result.message}`)
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    rl.close()
    await db.$disconnect()
  }
}

main()
