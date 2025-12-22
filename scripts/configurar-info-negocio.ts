/**
 * 📝 Configurar Información del Negocio
 * 
 * Actualiza la tabla BotSettings con la información actualizada del negocio
 */

import { db } from '../src/lib/db'

async function configurarInfoNegocio() {
  console.log('📝 Configurando información del negocio...\n')

  try {
    // Obtener todos los usuarios
    const users = await db.user.findMany()

    if (users.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos')
      return
    }

    console.log(`✅ Encontrados ${users.length} usuario(s)\n`)

    // Información actualizada del negocio
    const businessInfo = {
      businessHours: `📅 Lunes a Viernes: 9:00 AM - 6:00 PM
📅 Sábados: 9:00 AM - 2:00 PM
📅 Domingos: Cerrado`,

      businessAddress: `Centro Comercial El Diamante 2
San Nicolás, Cali
Colombia`,

      whatsappNumber: '+57 304 274 8687',

      shippingInfo: `✅ Envíos a toda Colombia
📦 Tiempo de entrega: 2-5 días hábiles
💰 Costo: Depende de la ciudad

📍 Cali: Envío gratis en compras mayores a $100.000
🌎 Otras ciudades: Coordinadora, Servientrega, Interrapidísimo`,

      warrantyInfo: `✅ Garantía de 30 días en todos los productos
🔄 Cambios y devoluciones sin problema
📦 Productos nuevos y sellados

Condiciones:
• Producto en perfecto estado
• Empaque original
• Factura de compra`
    }

    // Actualizar cada usuario
    for (const user of users) {
      console.log(`📝 Actualizando configuración para: ${user.email}`)

      // Verificar si ya tiene configuración
      let settings = await db.botSettings.findUnique({
        where: { userId: user.id }
      })

      if (settings) {
        // Actualizar configuración existente
        await db.botSettings.update({
          where: { userId: user.id },
          data: businessInfo
        })
        console.log('   ✅ Configuración actualizada')
      } else {
        // Crear nueva configuración
        await db.botSettings.create({
          data: {
            userId: user.id,
            businessPhone: businessInfo.whatsappNumber,
            ...businessInfo
          }
        })
        console.log('   ✅ Configuración creada')
      }
    }

    console.log('\n🎉 Información del negocio configurada correctamente\n')

    // Mostrar resumen
    console.log('📊 Resumen de la configuración:\n')
    console.log('🕐 Horarios:')
    console.log(businessInfo.businessHours)
    console.log('\n📍 Ubicación:')
    console.log(businessInfo.businessAddress)
    console.log('\n📞 WhatsApp:')
    console.log(businessInfo.whatsappNumber)
    console.log('\n🚚 Envíos:')
    console.log(businessInfo.shippingInfo)
    console.log('\n🛡️ Garantía:')
    console.log(businessInfo.warrantyInfo)

    console.log('\n✅ Ahora las respuestas directas usarán esta información actualizada')

  } catch (error) {
    console.error('❌ Error configurando información:', error)
  } finally {
    await db.$disconnect()
  }
}

configurarInfoNegocio()
