/**
 * 🧪 Test de Generación de Link de MercadoPago
 */

import { BotPaymentLinkGenerator } from '../src/lib/bot-payment-link-generator'
import { db } from '../src/lib/db'

async function testMercadoPagoLink() {
  console.log('🧪 Probando generación de link de MercadoPago\n')

  try {
    // Verificar variables de entorno
    console.log('📋 Verificando configuración...')
    const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN
    
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.log('❌ MERCADOPAGO_ACCESS_TOKEN no configurado')
      console.log('   Verifica tu archivo .env')
      return
    }
    
    console.log('✅ MERCADOPAGO_ACCESS_TOKEN configurado')
    console.log(`   Token: ${MERCADOPAGO_ACCESS_TOKEN.substring(0, 20)}...`)

    // Buscar un producto de prueba
    console.log('\n📦 Buscando producto de prueba...')
    const product = await db.product.findFirst({
      where: {
        status: 'AVAILABLE'
      }
    })

    if (!product) {
      console.log('❌ No hay productos disponibles')
      return
    }

    console.log(`✅ Producto encontrado: ${product.name}`)
    console.log(`   Precio: ${product.price.toLocaleString('es-CO')} COP`)

    // Generar links de pago
    console.log('\n💳 Generando links de pago...')
    const result = await BotPaymentLinkGenerator.generatePaymentLinks(
      product.id,
      product.userId,
      1
    )

    if (result.success) {
      console.log('✅ Links generados exitosamente\n')
      
      if (result.mercadoPagoLink) {
        console.log('💳 MercadoPago:')
        console.log(`   ${result.mercadoPagoLink}`)
      } else {
        console.log('⚠️  MercadoPago: No generado')
      }

      if (result.payPalLink) {
        console.log('\n💙 PayPal:')
        console.log(`   ${result.payPalLink}`)
      } else {
        console.log('\n⚠️  PayPal: No generado')
      }

      if (result.nequiInfo) {
        console.log('\n📱 Nequi:')
        console.log(`   ${result.nequiInfo}`)
      }

      if (result.daviplataInfo) {
        console.log('\n📱 Daviplata:')
        console.log(`   ${result.daviplataInfo}`)
      }

      console.log('\n📝 Mensaje completo:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(result.message)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    } else {
      console.log('❌ Error generando links:', result.message)
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await db.$disconnect()
  }
}

testMercadoPagoLink()
