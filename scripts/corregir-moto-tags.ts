import { db } from '../src/lib/db'

async function corregirMotoTags() {
  try {
    console.log('🔧 Corrigiendo tags de motos...\n')

    const motos = await db.product.findMany({
      where: {
        name: {
          contains: 'Moto'
        }
      }
    })

    for (const moto of motos) {
      console.log(`\n📦 ${moto.name}`)
      console.log(`   Tags actuales: ${moto.tags}`)
      
      // Crear tags correctos
      const newTags = [
        'moto',
        'bajaj',
        'pulsar',
        'ns160',
        'transporte',
        'vehiculo',
        'contacto:+57 304 274 8687',
        'ubicacion:Centro Comercial El Diamante 2, San Nicolás, Cali'
      ]

      await db.product.update({
        where: { id: moto.id },
        data: {
          tags: JSON.stringify(newTags),
          description: `${moto.name}

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

      console.log(`   ✅ Tags corregidos`)
    }

    console.log('\n✅ Todas las motos corregidas')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

corregirMotoTags()
