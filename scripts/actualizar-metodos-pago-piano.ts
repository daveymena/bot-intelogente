import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function actualizarMetodosPagoPiano() {
  console.log('🎹 Actualizando métodos de pago del Curso de Piano...\n')

  try {
    // Buscar el producto
    const producto = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'Piano', mode: 'insensitive' } },
          { name: { contains: 'piano', mode: 'insensitive' } }
        ]
      }
    })

    if (!producto) {
      console.log('❌ No se encontró el producto de Piano')
      return
    }

    console.log(`✅ Producto encontrado: ${producto.name}`)
    console.log(`   Precio actual: $${producto.price.toLocaleString('es-CO')} COP\n`)

    // Configurar los tags con los métodos de pago REALES
    const tags = [
      // Métodos de pago locales
      'nequi:3042748687',
      'daviplata:3042748687',
      
      // Links de pago online (estos debes reemplazarlos con los reales)
      'hotmart:https://pay.hotmart.com/tu-link-piano',  // ← REEMPLAZA CON TU LINK REAL
      'mercadopago:https://mpago.la/tu-link-piano',      // ← REEMPLAZA CON TU LINK REAL
      'paypal:https://paypal.me/tu-link-piano',          // ← REEMPLAZA CON TU LINK REAL
      
      // Información adicional
      'whatsapp:+573042748687',
      'efectivo:Bogotá,Medellín,Cali',
      'curso',
      'digital',
      'acceso_inmediato'
    ]

    // Actualizar el producto
    const actualizado = await prisma.product.update({
      where: { id: producto.id },
      data: {
        tags: JSON.stringify(tags),
        updatedAt: new Date()
      }
    })

    console.log('✅ Producto actualizado con métodos de pago:\n')
    console.log('💚 Nequi: 3042748687')
    console.log('💙 Daviplata: 3042748687')
    console.log('🌐 Hotmart: (configura tu link)')
    console.log('💰 Mercado Pago: (configura tu link)')
    console.log('🌍 PayPal: (configura tu link)')
    console.log('📱 WhatsApp: +57 304 274 8687')
    console.log('💵 Efectivo: Bogotá, Medellín, Cali\n')

    console.log('⚠️  IMPORTANTE:')
    console.log('   Edita este script y reemplaza los links de Hotmart,')
    console.log('   Mercado Pago y PayPal con tus links reales de pago.\n')

    console.log('📝 Tags actualizados:')
    console.log(JSON.stringify(tags, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

actualizarMetodosPagoPiano()
