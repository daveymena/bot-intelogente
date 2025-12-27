import { db } from '../src/lib/db'

/**
 * Script para actualizar la configuración de pagos con los números correctos
 */
async function updatePaymentConfig() {
  try {
    console.log('🔄 Actualizando configuración de pagos...')

    // Actualizar todas las configuraciones existentes
    const result = await db.paymentConfig.updateMany({
      data: {
        nequiPhone: '3136174267',
        daviplataPhone: '3136174267',
        contactPhone: '+57 304 274 8687'
      }
    })

    console.log(`✅ ${result.count} configuraciones actualizadas`)

    // Verificar configuraciones
    const configs = await db.paymentConfig.findMany({
      select: {
        userId: true,
        nequiPhone: true,
        daviplataPhone: true,
        contactPhone: true
      }
    })

    console.log('\n📋 Configuraciones actuales:')
    configs.forEach(config => {
      console.log(`  Usuario: ${config.userId}`)
      console.log(`  Nequi: ${config.nequiPhone}`)
      console.log(`  Daviplata: ${config.daviplataPhone}`)
      console.log(`  Contacto: ${config.contactPhone}`)
      console.log('  ---')
    })

  } catch (error) {
    console.error('❌ Error actualizando configuración:', error)
  } finally {
    await db.$disconnect()
  }
}

updatePaymentConfig()
