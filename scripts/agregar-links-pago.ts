import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function agregarLinksPago() {
  try {
    console.log('💳 AGREGANDO LINKS DE PAGO A PRODUCTOS\n')
    console.log('=' .repeat(60))

    const userId = 'cmhc22zw20000kmhgvx5ubazy'

    // 1. CURSO DE PIANO - 3 métodos de pago
    console.log('\n🎹 Actualizando Curso de Piano...')
    const cursoPiano = await prisma.product.findFirst({
      where: {
        userId,
        name: { contains: 'Piano', mode: 'insensitive' }
      }
    })

    if (cursoPiano) {
      const tags = JSON.parse(cursoPiano.tags || '[]')
      const newTags = [
        ...tags.filter((t: string) => !t.startsWith('http')),
        // Hotmart (principal)
        'hotmart:https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205',
        // Mercado Pago
        'mercadopago:https://mpago.li/piano-profesional',
        // PayPal
        'paypal:https://www.paypal.com/invoice/p/#INV2-PIANO-CURSO'
      ]

      await prisma.product.update({
        where: { id: cursoPiano.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${cursoPiano.description}

💳 **MÉTODOS DE PAGO:**
1️⃣ Hotmart (Recomendado): https://pay.hotmart.com/I95497720H
2️⃣ Mercado Pago: https://mpago.li/piano-profesional
3️⃣ PayPal: Solicita el link por WhatsApp

📞 WhatsApp: +57 304 274 8687`
        }
      })
      console.log('   ✅ Curso de Piano actualizado con 3 métodos de pago')
    }

    // 2. MEGAPACKS - PayPal y Mercado Pago
    console.log('\n📚 Actualizando Megapacks...')
    const megapacks = await prisma.product.findMany({
      where: {
        userId,
        name: { contains: 'Mega Pack', mode: 'insensitive' }
      }
    })

    for (const pack of megapacks) {
      const tags = JSON.parse(pack.tags || '[]')
      const isCompleto = pack.name.toLowerCase().includes('completo')
      
      const newTags = [
        ...tags.filter((t: string) => !t.startsWith('http') && !t.includes('pago')),
        isCompleto 
          ? 'paypal:https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG'
          : 'nequi:3136174267',
        isCompleto
          ? 'mercadopago:https://mpago.li/32cJgK3'
          : 'payco:https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf'
      ]

      await prisma.product.update({
        where: { id: pack.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${pack.description}

💳 **MÉTODOS DE PAGO:**
${isCompleto 
  ? `1️⃣ PayPal: https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG
2️⃣ Mercado Pago: https://mpago.li/32cJgK3`
  : `1️⃣ Nequi/Daviplata: 313 617 4267
2️⃣ Tarjeta: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf`
}

📞 WhatsApp: +57 304 274 8687`
        }
      })
      console.log(`   ✅ ${pack.name} actualizado`)
    }

    // 3. LAPTOPS - Mercado Pago
    console.log('\n💻 Actualizando Laptops...')
    const laptops = await prisma.product.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: 'Laptop', mode: 'insensitive' } },
          { name: { contains: 'MacBook', mode: 'insensitive' } },
          { name: { contains: 'VivoBook', mode: 'insensitive' } }
        ]
      }
    })

    for (const laptop of laptops) {
      const tags = JSON.parse(laptop.tags || '[]')
      
      // Generar link de Mercado Pago dinámico
      const productSlug = laptop.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      const newTags = [
        ...tags.filter((t: string) => !t.startsWith('http') && !t.includes('pago')),
        `mercadopago:https://mpago.li/${productSlug}`,
        `paypal:solicitar-por-whatsapp`
      ]

      await prisma.product.update({
        where: { id: laptop.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${laptop.description}

💳 **MÉTODOS DE PAGO:**
1️⃣ Mercado Pago: https://mpago.li/${productSlug}
2️⃣ PayPal: Solicita el link por WhatsApp
3️⃣ Transferencia bancaria disponible

📞 WhatsApp: +57 304 274 8687
📍 Ubicación: Cali, Valle del Cauca`
        }
      })
      console.log(`   ✅ ${laptop.name} actualizado`)
    }

    // 4. MOTO - Contacto directo
    console.log('\n🏍️ Actualizando Moto...')
    const moto = await prisma.product.findFirst({
      where: {
        userId,
        name: { contains: 'Pulsar', mode: 'insensitive' }
      }
    })

    if (moto) {
      const tags = JSON.parse(moto.tags || '[]')
      const newTags = [
        ...tags.filter((t: string) => !t.startsWith('http') && !t.includes('pago')),
        'pago:efectivo-o-transferencia',
        'whatsapp:+573042748687'
      ]

      await prisma.product.update({
        where: { id: moto.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${moto.description}

💳 **MÉTODOS DE PAGO:**
💵 Efectivo
🏦 Transferencia bancaria
💳 Consignación

📞 **CONTACTO DIRECTO:**
WhatsApp: +57 304 274 8687
📍 Ver en persona: Centro Comercial El Diamante 2, San Nicolás, Cali

⚠️ Se requiere ver la moto en persona antes de comprar`
        }
      })
      console.log('   ✅ Moto actualizada')
    }

    // Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('🎉 ¡LINKS DE PAGO AGREGADOS EXITOSAMENTE!\n')

    const totalProductos = await prisma.product.count({ where: { userId } })
    console.log('📊 RESUMEN:')
    console.log(`   📦 Total de productos: ${totalProductos}`)
    console.log(`   🎹 Curso Piano: 3 métodos (Hotmart, Mercado Pago, PayPal)`)
    console.log(`   📚 Megapacks: 2 métodos cada uno`)
    console.log(`   💻 Laptops: Mercado Pago + PayPal`)
    console.log(`   🏍️ Moto: Efectivo/Transferencia`)

    console.log('\n✅ El bot ahora puede proporcionar links de pago automáticamente')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

agregarLinksPago()
