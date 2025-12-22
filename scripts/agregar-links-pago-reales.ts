import { db } from '../src/lib/db'

/**
 * Script para agregar links de pago REALES a todos los productos
 * IMPORTANTE: Estos son los links reales configurados
 */

async function agregarLinksPagoReales() {
  try {
    console.log('💳 Agregando links de pago REALES a productos...\n')

    // 1. CURSO DE PIANO - Ya tiene links reales
    console.log('✅ Curso de Piano ya tiene links configurados\n')

    // 2. MEGAPACKS - Configurar links reales
    const megapacks = await db.product.findMany({
      where: {
        name: {
          contains: 'Mega Pack'
        }
      }
    })

    console.log(`📦 Configurando ${megapacks.length} Megapacks...`)

    for (const megapack of megapacks) {
      const tags = megapack.tags ? JSON.parse(megapack.tags) : []
      
      // Limpiar links antiguos
      const cleanTags = tags.filter((tag: string) => 
        !tag.startsWith('http') && 
        !tag.startsWith('nequi:') && 
        !tag.startsWith('payco:') &&
        !tag.startsWith('mercadopago:') &&
        !tag.startsWith('paypal:')
      )

      // Agregar links REALES para megapacks individuales
      const newTags = [
        ...cleanTags,
        'nequi:3136174267', // Número real de Nequi
        'payco:https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf', // Link real de Payco
      ]

      await db.product.update({
        where: { id: megapack.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${megapack.description || megapack.name}

💳 **MÉTODOS DE PAGO:**
1️⃣ Nequi/Daviplata: 313 617 4267
2️⃣ Tarjeta de crédito: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf
3️⃣ Transferencia bancaria disponible

📞 WhatsApp: +57 304 274 8687`
        }
      })

      console.log(`   ✅ ${megapack.name}`)
    }

    // 3. LAPTOPS Y PRODUCTOS FÍSICOS - Contacto directo
    const laptops = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'ASUS' } },
          { name: { contains: 'HP' } },
          { name: { contains: 'MacBook' } },
          { name: { contains: 'Memoria' } },
          { name: { contains: 'SSD' } },
          { name: { contains: 'Morral' } }
        ]
      }
    })

    console.log(`\n💻 Configurando ${laptops.length} productos físicos...`)

    for (const laptop of laptops) {
      const tags = laptop.tags ? JSON.parse(laptop.tags) : []
      
      // Limpiar links antiguos
      const cleanTags = tags.filter((tag: string) => 
        !tag.startsWith('http') && 
        !tag.startsWith('contacto:')
      )

      // Agregar contacto directo
      const newTags = [
        ...cleanTags,
        'contacto:+57 304 274 8687'
      ]

      await db.product.update({
        where: { id: laptop.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${laptop.description || laptop.name}

📍 **UBICACIÓN:** Centro Comercial El Diamante 2, San Nicolás, Cali

💳 **MÉTODOS DE PAGO:**
✅ Efectivo
✅ Transferencia bancaria
✅ Nequi/Daviplata
✅ Tarjeta de crédito

📞 **CONTACTO DIRECTO:**
WhatsApp: +57 304 274 8687
Correo: deinermen25@gmail.com

🚚 Envíos a toda Colombia disponibles`
        }
      })

      console.log(`   ✅ ${laptop.name}`)
    }

    // 4. MOTOS - Contacto directo
    const motos = await db.product.findMany({
      where: {
        name: {
          contains: 'Moto'
        }
      }
    })

    console.log(`\n🏍️  Configurando ${motos.length} motos...`)

    for (const moto of motos) {
      const tags = moto.tags ? JSON.parse(moto.tags) : []
      
      // Limpiar links antiguos
      const cleanTags = tags.filter((tag: string) => 
        !tag.startsWith('http') && 
        !tag.startsWith('contacto:')
      )

      // Agregar contacto directo
      const newTags = [
        ...cleanTags,
        'contacto:+57 304 274 8687',
        'ubicacion:Centro Comercial El Diamante 2, San Nicolás, Cali'
      ]

      await db.product.update({
        where: { id: moto.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${moto.description || moto.name}

📍 **UBICACIÓN:** Centro Comercial El Diamante 2, San Nicolás, Cali

💰 **PRECIO NEGOCIABLE**
Precio base: $${moto.price.toLocaleString()} COP
Precio negociable: $6.300.000 COP

💳 **MÉTODOS DE PAGO:**
✅ Efectivo
✅ Transferencia bancaria
✅ Financiación disponible

📞 **CONTACTO DIRECTO:**
WhatsApp: +57 304 274 8687
Correo: deinermen25@gmail.com

🔧 Revisión mecánica incluida
📄 Papeles al día`
        }
      })

      console.log(`   ✅ ${moto.name}`)
    }

    console.log('\n✅ Links de pago REALES agregados a todos los productos')
    console.log('\n📋 RESUMEN:')
    console.log(`   - Curso de Piano: Hotmart (link real)`)
    console.log(`   - Megapacks: Nequi + Payco (links reales)`)
    console.log(`   - Laptops/Accesorios: Contacto directo`)
    console.log(`   - Motos: Contacto directo`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

agregarLinksPagoReales()
