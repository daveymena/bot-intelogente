// 📋 VER PRODUCTOS USADOS EN LA BASE DE DATOS

import { db } from '../src/lib/db'

async function verProductosUsados() {
  console.log('\n' + '═'.repeat(80))
  console.log('📋 PRODUCTOS USADOS EN LA BASE DE DATOS')
  console.log('═'.repeat(80) + '\n')

  try {
    const user = await db.user.findFirst()
    if (!user) {
      console.error('❌ No hay usuarios')
      return
    }

    const allProducts = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE'
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Separar usados y nuevos
    const usados = allProducts.filter(p => 
      p.name.toLowerCase().includes('usado') || 
      p.name.toLowerCase().includes('usada') ||
      (p.description && (
        p.description.toLowerCase().includes('usado') ||
        p.description.toLowerCase().includes('usada')
      ))
    )

    const nuevos = allProducts.filter(p => 
      !p.name.toLowerCase().includes('usado') && 
      !p.name.toLowerCase().includes('usada') &&
      (!p.description || (
        !p.description.toLowerCase().includes('usado') &&
        !p.description.toLowerCase().includes('usada')
      ))
    )

    console.log(`📊 RESUMEN:`)
    console.log(`   Total de productos: ${allProducts.length}`)
    console.log(`   Productos USADOS: ${usados.length}`)
    console.log(`   Productos NUEVOS: ${nuevos.length}\n`)

    if (usados.length > 0) {
      console.log('🔧 PRODUCTOS USADOS:')
      console.log('─'.repeat(80))
      usados.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`)
        console.log(`   💰 Precio: $${p.price.toLocaleString('es-CO')} COP`)
        if (p.description) {
          const desc = p.description.substring(0, 100)
          console.log(`   📝 ${desc}${p.description.length > 100 ? '...' : ''}`)
        }
        console.log(`   🆔 ID: ${p.id}`)
      })
    } else {
      console.log('⚠️ NO HAY PRODUCTOS USADOS EN LA BASE DE DATOS')
      console.log('\nPara agregar productos usados, asegúrate de incluir "USADO" o "USADA" en el nombre.')
      console.log('Ejemplo: "Laptop HP USADO - Core i5 8GB RAM"')
    }

    console.log('\n' + '─'.repeat(80))
    console.log('💻 PRODUCTOS NUEVOS (primeros 5):')
    console.log('─'.repeat(80))
    nuevos.slice(0, 5).forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`)
      console.log(`   💰 Precio: $${p.price.toLocaleString('es-CO')} COP`)
    })

    if (nuevos.length > 5) {
      console.log(`\n   ... y ${nuevos.length - 5} productos más`)
    }

    console.log('\n' + '═'.repeat(80))
    console.log('✅ LISTADO COMPLETADO')
    console.log('═'.repeat(80) + '\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verProductosUsados()
