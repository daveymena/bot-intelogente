import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function actualizarLinksPago() {
  try {
    console.log('💳 ACTUALIZANDO LINKS DE PAGO DINÁMICOS\n')
    console.log('=' .repeat(60))

    const userId = 'cmhc22zw20000kmhgvx5ubazy'

    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      where: { userId }
    })

    console.log(`\n📦 Procesando ${productos.length} productos...\n`)

    for (const producto of productos) {
      const isPiano = producto.name.toLowerCase().includes('piano')
      const isMoto = producto.name.toLowerCase().includes('moto') || 
                     producto.name.toLowerCase().includes('pulsar')
      const isMegapack = producto.name.toLowerCase().includes('mega pack')

      // Generar slug para links
      const slug = producto.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const productId = producto.id.slice(-8)

      // Generar links dinámicos
      const mercadopagoLink = `https://mpago.li/${slug}-${productId}`
      const paypalLink = `https://www.paypal.com/invoice/p/#INV-${productId.toUpperCase()}`

      let tags: string[] = []
      let descripcionPago = ''

      // CASO 1: CURSO DE PIANO - Hotmart + Mercado Pago + PayPal
      if (isPiano) {
        tags = [
          'curso', 'piano', 'musica', 'profesional',
          'hotmart:https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205',
          `mercadopago:${mercadopagoLink}`,
          `paypal:${paypalLink}`
        ]

        descripcionPago = `

💳 **MÉTODOS DE PAGO:**

1️⃣ **Hotmart** (Recomendado)
   👉 https://pay.hotmart.com/I95497720H
   ✅ Pago seguro y acceso inmediato

2️⃣ **Mercado Pago**
   👉 ${mercadopagoLink}
   ✅ Tarjetas, PSE, efectivo

3️⃣ **PayPal**
   👉 ${paypalLink}
   ✅ Pago internacional seguro

📞 WhatsApp: +57 304 274 8687`
      }
      // CASO 2: MOTO - Solo contacto directo
      else if (isMoto) {
        tags = [
          'moto', 'bajaj', 'pulsar', 'ns160', 'fi1', '160cc',
          'inyeccion', '2020', 'deportiva', 'negociable',
          'pago:efectivo-transferencia',
          'whatsapp:+573042748687'
        ]

        descripcionPago = `

💳 **MÉTODOS DE PAGO:**
💵 Efectivo
🏦 Transferencia bancaria
💳 Consignación

📞 **CONTACTO DIRECTO:**
WhatsApp: +57 304 274 8687
📍 Ver en persona: Centro Comercial El Diamante 2, San Nicolás

⚠️ Se requiere ver la moto en persona antes de comprar`
      }
      // CASO 3: MEGAPACKS
      else if (isMegapack) {
        const isCompleto = producto.name.toLowerCase().includes('completo')
        
        if (isCompleto) {
          tags = [
            'megapack', 'completo', 'cursos', 'digital',
            `mercadopago:${mercadopagoLink}`,
            `paypal:${paypalLink}`
          ]

          descripcionPago = `

💳 **MÉTODOS DE PAGO:**

1️⃣ **Mercado Pago**
   👉 ${mercadopagoLink}
   ✅ Tarjetas, PSE, efectivo

2️⃣ **PayPal**
   👉 ${paypalLink}
   ✅ Pago internacional

📞 WhatsApp: +57 304 274 8687`
        } else {
          tags = [
            'megapack', 'individual', 'cursos', 'digital',
            'nequi:3136174267',
            'payco:https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf'
          ]

          descripcionPago = `

💳 **MÉTODOS DE PAGO:**

1️⃣ **Nequi/Daviplata**
   📱 313 617 4267
   ✅ Transferencia móvil instantánea

2️⃣ **Tarjeta de Crédito/Débito**
   👉 https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf
   ✅ Pago con tarjeta

📞 WhatsApp: +57 304 274 8687`
        }
      }
      // CASO 4: OTROS PRODUCTOS (Laptops, etc.) - Mercado Pago + PayPal
      else {
        tags = [
          slug,
          `mercadopago:${mercadopagoLink}`,
          `paypal:${paypalLink}`
        ]

        descripcionPago = `

💳 **MÉTODOS DE PAGO:**

1️⃣ **Mercado Pago**
   👉 ${mercadopagoLink}
   ✅ Tarjetas, PSE, efectivo

2️⃣ **PayPal**
   👉 ${paypalLink}
   ✅ Pago internacional

📞 WhatsApp: +57 304 274 8687
📍 Ubicación: Cali, Valle del Cauca`
      }

      // Actualizar producto
      const descripcionBase = producto.description?.split('💳')[0]?.trim() || producto.description
      
      await prisma.product.update({
        where: { id: producto.id },
        data: {
          tags: JSON.stringify(tags),
          description: descripcionBase + descripcionPago
        }
      })

      console.log(`✅ ${producto.name}`)
      if (isPiano) console.log('   → Hotmart + Mercado Pago + PayPal')
      else if (isMoto) console.log('   → Efectivo/Transferencia')
      else if (isMegapack) console.log('   → Mercado Pago + PayPal')
      else console.log('   → Mercado Pago + PayPal')
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 ¡LINKS DE PAGO ACTUALIZADOS!\n')

    console.log('📊 RESUMEN:')
    console.log('   🎹 Curso Piano: Hotmart + Mercado Pago + PayPal')
    console.log('   📚 Megapacks: Mercado Pago + PayPal (o Nequi/Payco)')
    console.log('   💻 Laptops: Mercado Pago + PayPal')
    console.log('   🏍️ Moto: Efectivo/Transferencia')
    console.log('\n✅ Todos los links son dinámicos y únicos por producto')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

actualizarLinksPago()
