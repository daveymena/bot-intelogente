/**
 * 💳 Configurar Links de Pago - Megapack y Piano
 */

import { db } from '../src/lib/db'

async function configurarLinks() {
  try {
    console.log('💳 Configurando links de pago...\n')

    // 1. Actualizar MegaSuperpack
    console.log('📦 Actualizando MegaSuperpack Completo...')
    const megapack = await db.product.findFirst({
      where: { name: { contains: 'MegaSuperpack' } }
    })

    if (megapack) {
      await db.product.update({
        where: { id: megapack.id },
        data: {
          autoResponse: `🎉 ¡EXCELENTE ELECCIÓN! El MegaSuperpack Completo es nuestro producto estrella.

📦 INCLUYE:
✅ 2,056 Flujos N8N Profesionales
✅ 1TB de Cursos Premium
✅ 20,000+ Templates
✅ 6H Curso N8N
✅ 17,000 Códigos Fuente
✅ 29,522+ Nodos

💻 FORMATO: Digital (100% Pregrabado)
📲 ENTREGA: Inmediata por Correo / Drive

💰 OPCIONES DE PAGO:

1️⃣ MercadoPago - $49.99 USD (Precio completo)
   🔗 https://mpago.li/32cJgK3

2️⃣ PayPal - $15.00 USD (Opción económica)
   🔗 https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG

🎁 BENEFICIOS:
• Contenido Descargable
• Actualizaciones gratuitas
• Soporte prioritario
• Comunidad privada
⚠️ No incluye certificado

Este pack tiene TODO lo que necesitas para dominar el mundo digital y empezar a generar ingresos desde hoy.

¿Con cuál método te gustaría pagar? 🚀`
        }
      })
      console.log('✅ MegaSuperpack actualizado')
      console.log('   💰 MercadoPago: https://mpago.li/32cJgK3 ($49.99)')
      console.log('   💰 PayPal: https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG ($15.00)')
    }

    // 2. Actualizar Curso de Piano
    console.log('\n🎹 Actualizando Curso de Piano...')
    const piano = await db.product.findFirst({
      where: { 
        OR: [
          { name: { contains: 'piano' } },
          { name: { contains: 'Piano' } }
        ]
      }
    })

    if (piano) {
      const pianoResponse = piano.autoResponse ? piano.autoResponse.split('💰 OPCIONES DE PAGO')[0] : ''
      
      // Agregar opciones de pago al final de la respuesta existente
      const updatedResponse = `${pianoResponse}

💻 FORMATO: Online (Pregrabado)
⚠️ No incluye certificado

💰 OPCIONES DE PAGO:

1️⃣ MercadoPago - $49.99 USD
   🔗 https://mpago.li/32cJgK3

2️⃣ PayPal - $15.00 USD
   🔗 https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG

¿Con cuál método te gustaría pagar? 🎹`

      await db.product.update({
        where: { id: piano.id },
        data: {
          autoResponse: updatedResponse
        }
      })
      console.log('✅ Curso de Piano actualizado')
      console.log('   💰 MercadoPago: https://mpago.li/32cJgK3 ($49.99)')
      console.log('   💰 PayPal: https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG ($15.00)')
    } else {
      console.log('⚠️ No se encontró el curso de piano')
    }

    console.log('\n🎯 Configuración completada!')
    console.log('\n💡 El bot ahora ofrecerá ambas opciones de pago automáticamente')
    console.log('   cuando los clientes pregunten por estos productos.')

    console.log('\n📝 Prueba enviando desde WhatsApp:')
    console.log('   "Quiero comprar el megapack"')
    console.log('   "Cómo pago el curso de piano?"')
    console.log('   "Cuál es el precio?"')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

configurarLinks()
