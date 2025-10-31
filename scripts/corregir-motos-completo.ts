import { db } from '../src/lib/db'

async function corregirMotosCompleto() {
  try {
    console.log('🏍️  Corrigiendo y agregando motos...\n')

    // 1. Eliminar motos existentes con problemas
    await db.product.deleteMany({
      where: {
        name: {
          contains: 'Moto'
        }
      }
    })

    console.log('✅ Motos antiguas eliminadas\n')

    // 2. Agregar las 3 motos correctamente
    const motos = [
      {
        name: 'Moto Bajaj Pulsar NS 160 FI (2020)',
        description: `🏍️ **Moto Bajaj Pulsar NS 160 FI (2020)**

✅ Motor 160cc inyección electrónica
✅ Frenos ABS
✅ Tablero digital
✅ Excelente estado
✅ Papeles al día

📍 **UBICACIÓN:** Centro Comercial El Diamante 2, San Nicolás, Cali

💰 **PRECIO NEGOCIABLE**
Precio base: $6.500.000 COP
Precio negociable: $6.300.000 COP

💳 **MÉTODOS DE PAGO:**
✅ Efectivo
✅ Transferencia bancaria
✅ Financiación disponible

📞 **CONTACTO DIRECTO:**
WhatsApp: +57 304 274 8687
Correo: deinermen25@gmail.com

🔧 Revisión mecánica incluida
📄 Papeles al día`,
        price: 6500000,
        stock: 1,
        status: 'AVAILABLE',
        category: 'Motos',
        tags: JSON.stringify([
          'moto',
          'bajaj',
          'pulsar',
          'ns160',
          'fi',
          'inyeccion',
          '2020',
          'deportiva',
          'transporte',
          'vehiculo',
          'contacto:+57 304 274 8687',
          'ubicacion:Centro Comercial El Diamante 2, San Nicolás, Cali'
        ])
      },
      {
        name: 'Bajaj Pulsar NS 160 FI 2020',
        description: `🏍️ **Bajaj Pulsar NS 160 FI 2020**

✅ Motor 160cc inyección electrónica
✅ Frenos ABS
✅ Tablero digital
✅ Excelente estado

📍 Centro Comercial El Diamante 2, San Nicolás, Cali

💰 $6.000.000 COP (Negociable)

📞 WhatsApp: +57 304 274 8687`,
        price: 6000000,
        stock: 1,
        status: 'AVAILABLE',
        category: 'Motos',
        tags: JSON.stringify([
          'moto',
          'bajaj',
          'pulsar',
          'ns160',
          'fi',
          '2020',
          'deportiva',
          'transporte',
          'contacto:+57 304 274 8687',
          'ubicacion:Centro Comercial El Diamante 2, San Nicolás, Cali'
        ])
      },
      {
        name: 'Moto Bajaj Pulsar NS 160',
        description: `🏍️ **Moto Bajaj Pulsar NS 160**

✅ Motor 160cc
✅ Excelente estado
✅ Papeles al día

📍 Centro Comercial El Diamante 2, San Nicolás, Cali

💰 $6.500.000 COP (Negociable hasta $6.300.000)

📞 WhatsApp: +57 304 274 8687`,
        price: 6500000,
        stock: 1,
        status: 'AVAILABLE',
        category: 'Motos',
        tags: JSON.stringify([
          'moto',
          'bajaj',
          'pulsar',
          'ns160',
          'deportiva',
          'transporte',
          'vehiculo',
          'contacto:+57 304 274 8687',
          'ubicacion:Centro Comercial El Diamante 2, San Nicolás, Cali'
        ])
      }
    ]

    // Obtener el usuario admin
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    // Crear las motos
    for (const moto of motos) {
      const created = await db.product.create({
        data: {
          ...moto,
          userId: admin.id
        }
      })
      console.log(`✅ ${created.name} - $${created.price.toLocaleString()}`)
    }

    console.log('\n✅ 3 motos agregadas correctamente')
    console.log('\n📋 Verificando...')

    const motosCreadas = await db.product.findMany({
      where: {
        name: {
          contains: 'Moto'
        }
      }
    })

    console.log(`\n🏍️  Total de motos en BD: ${motosCreadas.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

corregirMotosCompleto()
