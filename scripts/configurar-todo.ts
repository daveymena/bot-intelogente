import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function configurarTodo() {
  try {
    console.log('🚀 CONFIGURACIÓN COMPLETA DEL SISTEMA\n')
    console.log('=' .repeat(50))

    const userId = 'cmhc22zw20000kmhgvx5ubazy'

    // 1. Agregar Moto
    console.log('\n🏍️ PASO 1: Agregando Moto Bajaj Pulsar NS 160...')
    const moto = await prisma.product.create({
      data: {
        userId,
        name: 'Moto Bajaj Pulsar NS 160 FI1 (2020)',
        description: `🏍️ **BAJAJ PULSAR NS 160 FI1 - MODELO 2020**

¡Moto en excelentes condiciones, lista para rodar! 🔥

📋 **ESPECIFICACIONES:**
🚦 Modelo: 2020
⚙️ Motor: 160cc Inyección Electrónica (FI1)
🧾 Papeles: Al día + Traspaso disponible
🛠️ Mantenimiento: Reciente, todo al día
💥 Estado: Impecable y muy cuidada
✅ SOAT y Tecnomecánica vigentes

💰 **PRECIOS:**
💵 Precio inicial: $6.500.000 COP
🎯 Con rebaja: $6.300.000 COP
🔥 Precio final negociable: $6.000.000 COP

📍 **UBICACIÓN:**
Centro Comercial El Diamante 2, San Nicolás, Cali

📞 **CONTACTO DIRECTO:**
WhatsApp: +57 304 274 8687`,
        price: 6500000,
        category: 'PHYSICAL',
        stock: 1,
        status: 'AVAILABLE',
        tags: JSON.stringify([
          'moto', 'bajaj', 'pulsar', 'ns160', 'fi1', '160cc',
          'inyeccion', '2020', 'deportiva', 'negociable',
          'papeles al dia', 'traspaso', 'cali', 'san nicolas',
          '+57 304 274 8687'
        ]),
        images: JSON.stringify([])
      }
    })
    console.log(`   ✅ Moto agregada: ${moto.name}`)

    // 2. Agregar Prompt de Moto
    console.log('\n📝 PASO 2: Agregando prompt de negociación de moto...')
    const promptMoto = await prisma.aIPrompt.create({
      data: {
        userId,
        name: 'Negociación Moto Pulsar NS 160',
        prompt: `ESTRATEGIA DE PRECIOS PARA MOTO:
1. Precio inicial: $6.500.000 COP
2. Primera rebaja (si pide): $6.300.000 COP
3. Precio final (si insiste): $6.000.000 COP

NO menciones todos los precios de una vez. Baja solo si el cliente pide rebaja.`,
        type: 'SALES',
        isActive: true
      }
    })
    console.log(`   ✅ Prompt creado: ${promptMoto.name}`)

    // 3. Agregar Prompt de Megapacks
    console.log('\n📚 PASO 3: Agregando prompt de megapacks...')
    const promptMegapacks = await prisma.aIPrompt.create({
      data: {
        userId,
        name: 'Venta de Megapacks',
        prompt: `MEGAPACKS:
- Individual: $20.000 COP
- Completo (40 packs): $60.000 COP
- Ahorro: $740.000 COP

SIEMPRE ofrece el pack completo como mejor opción. Enfatiza el ahorro masivo.`,
        type: 'SALES',
        isActive: true
      }
    })
    console.log(`   ✅ Prompt creado: ${promptMegapacks.name}`)

    // 4. Verificar productos totales
    console.log('\n📦 PASO 4: Verificando catálogo...')
    const totalProductos = await prisma.product.count({ where: { userId } })
    console.log(`   ✅ Total de productos: ${totalProductos}`)

    // 5. Verificar prompts totales
    console.log('\n🤖 PASO 5: Verificando prompts de IA...')
    const totalPrompts = await prisma.aIPrompt.count({ where: { userId, isActive: true } })
    console.log(`   ✅ Total de prompts activos: ${totalPrompts}`)

    console.log('\n' + '='.repeat(50))
    console.log('🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!\n')

    console.log('📋 RESUMEN:')
    console.log(`   🏍️ Moto agregada: Bajaj Pulsar NS 160 FI1`)
    console.log(`   📝 Prompts configurados: ${totalPrompts}`)
    console.log(`   📦 Productos totales: ${totalProductos}`)

    console.log('\n🚀 PRÓXIMOS PASOS:')
    console.log('   1. Reconectar WhatsApp: npx tsx scripts/reconectar-whatsapp.ts')
    console.log('   2. Ir al dashboard: http://localhost:3000')
    console.log('   3. Escanear QR en sección WhatsApp')
    console.log('   4. ¡Enviar mensaje de prueba!')

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('\n⚠️ Algunos elementos ya existen en la base de datos')
      console.log('   Esto es normal si ya ejecutaste este script antes')
    } else {
      console.error('\n❌ Error:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

configurarTodo()
