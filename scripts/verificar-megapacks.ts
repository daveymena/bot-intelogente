// 🔍 VERIFICAR MEGAPACKS EN LA BASE DE DATOS

import { db } from '../src/lib/db'

async function verificarMegapacks() {
  console.log('\n' + '═'.repeat(80))
  console.log('🔍 VERIFICANDO MEGAPACKS EN LA BASE DE DATOS')
  console.log('═'.repeat(80) + '\n')

  try {
    // Obtener usuario
    const user = await db.user.findFirst()
    if (!user) {
      console.error('❌ No hay usuarios en la base de datos')
      return
    }

    console.log(`✅ Usuario: ${user.businessName || user.email}\n`)

    // Buscar megapacks
    const megapacks = await db.product.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: { contains: 'mega', mode: 'insensitive' } },
          { name: { contains: 'pack', mode: 'insensitive' } },
          { description: { contains: 'mega', mode: 'insensitive' } },
          { description: { contains: 'pack', mode: 'insensitive' } }
        ]
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`📦 Megapacks encontrados: ${megapacks.length}\n`)

    if (megapacks.length === 0) {
      console.log('❌ NO HAY MEGAPACKS EN LA BASE DE DATOS\n')
      console.log('Para agregar megapacks, puedes:')
      console.log('1. Agregarlos manualmente desde el dashboard')
      console.log('2. Usar un script de importación')
      console.log('3. Ejecutar: npx tsx scripts/agregar-links-megapacks-simple.ts\n')
    } else {
      console.log('─'.repeat(80))
      megapacks.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`)
        console.log(`   💰 Precio: $${p.price.toLocaleString('es-CO')} COP`)
        console.log(`   📦 Stock: ${p.stock || 'Ilimitado'}`)
        console.log(`   🆔 ID: ${p.id}`)
        
        if (p.description) {
          const desc = p.description.substring(0, 100)
          console.log(`   📝 ${desc}${p.description.length > 100 ? '...' : ''}`)
        }

        // Verificar tags
        try {
          const tags = p.tags ? JSON.parse(p.tags) : []
          if (tags.length > 0) {
            console.log(`   🏷️ Tags: ${tags.slice(0, 3).join(', ')}${tags.length > 3 ? '...' : ''}`)
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      })
      console.log('\n' + '─'.repeat(80))
    }

    // Buscar todos los productos para contexto
    const allProducts = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE'
      }
    })

    console.log(`\n📊 RESUMEN:`)
    console.log(`   Total de productos: ${allProducts.length}`)
    console.log(`   Megapacks: ${megapacks.length}`)
    console.log(`   Otros productos: ${allProducts.length - megapacks.length}`)

    console.log('\n' + '═'.repeat(80))
    console.log('✅ VERIFICACIÓN COMPLETADA')
    console.log('═'.repeat(80) + '\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verificarMegapacks()
