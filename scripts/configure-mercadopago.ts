import { db } from '../src/lib/db'
import * as readline from 'readline'

/**
 * Script interactivo para configurar MercadoPago
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function configureMercadoPago() {
  console.log('🔧 Configuración de MercadoPago\n')
  console.log('Para obtener tu Access Token:')
  console.log('1. Ve a https://www.mercadopago.com.co/developers/panel')
  console.log('2. Crea una aplicación o selecciona una existente')
  console.log('3. Ve a "Credenciales" y copia el "Access Token de producción"\n')

  try {
    // Obtener el usuario
    const users = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true }
    })

    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios admin')
      rl.close()
      return
    }

    console.log('\n📋 Usuarios disponibles:')
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email} (${user.id})`)
    })

    const userIdx = await question('\nSelecciona el número de usuario: ')
    const selectedUser = users[parseInt(userIdx) - 1]

    if (!selectedUser) {
      console.log('❌ Usuario no válido')
      rl.close()
      return
    }

    const accessToken = await question('\nPega tu Access Token de MercadoPago: ')

    if (!accessToken || accessToken.trim().length < 10) {
      console.log('❌ Access Token no válido')
      rl.close()
      return
    }

    // Guardar en la base de datos
    await db.paymentIntegration.upsert({
      where: { userId: selectedUser.id },
      create: {
        userId: selectedUser.id,
        mercadopagoEnabled: true,
        mercadopagoAccessToken: accessToken.trim(),
        autoGenerateLinks: true
      },
      update: {
        mercadopagoEnabled: true,
        mercadopagoAccessToken: accessToken.trim(),
        autoGenerateLinks: true
      }
    })

    console.log('\n✅ MercadoPago configurado exitosamente!')
    console.log(`Usuario: ${selectedUser.email}`)
    console.log(`Token guardado: ${accessToken.substring(0, 20)}...`)
    console.log('\n🎉 Ahora puedes generar links de pago desde la tienda!')

  } catch (error) {
    console.error('❌ Error configurando MercadoPago:', error)
  } finally {
    rl.close()
    await db.$disconnect()
  }
}

configureMercadoPago()
