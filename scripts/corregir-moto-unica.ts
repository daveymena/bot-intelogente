import { db } from '../src/lib/db'

async function corregirMotoUnica() {
  try {
    console.log('🏍️  Corrigiendo la moto...\n')

    // Buscar la moto
    const moto = await db.product.findFirst({
      where: {
        name: {
          contains: 'Moto'
        }
      }
    })

    if (!moto) {
      console.log('❌ No se encontró la moto')
      return
    }

    console.log(`📦 Moto encontrada: ${moto.name}`)
    console.log(`   Tags actuales: ${moto.tags}\n`)

    // Corregir los tags a formato JSON válido
    const tagsCorrectos = [
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
      'negociable',
      'contacto:+57 304 274 8687',
      'ubicacion:Centro Comercial El Diamante 2, San Nicolás, Cali'
    ]

    // Actualizar la moto
    await db.product.update({
      where: { id: moto.id },
      data: {
        tags: JSON.stringify(tagsCorrectos),
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
📄 Papeles al día`
      }
    })

    console.log('✅ Moto corregida\n')

    // Verificar
    const motoActualizada = await db.product.findUnique({
      where: { id: moto.id }
    })

    console.log('📋 Verificación:')
    console.log(`   Nombre: ${motoActualizada?.name}`)
    console.log(`   Precio: $${motoActualizada?.price.toLocaleString()}`)
    console.log(`   Tags: ${motoActualizada?.tags}`)

    // Probar que los tags sean JSON válido
    try {
      const tags = JSON.parse(motoActualizada?.tags || '[]')
      console.log(`\n✅ Tags son JSON válido (${tags.length} tags)`)
      console.log(`   Tags: ${tags.join(', ')}`)
    } catch (e) {
      console.log('\n❌ Tags NO son JSON válido')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

corregirMotoUnica()
