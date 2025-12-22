/**
 * Verificar productos en la base de datos
 */

import { db } from './src/lib/db'

async function verificarProductos() {
  console.log('🔍 Verificando productos en la base de datos...\n')

  try {
    // Contar productos totales
    const totalProducts = await db.product.count()
    console.log(`📊 Total de productos: ${totalProducts}`)

    // Contar por estado
    const available = await db.product.count({ where: { status: 'AVAILABLE' } })
    const outOfStock = await db.product.count({ where: { status: 'OUT_OF_STOCK' } })
    const discontinued = await db.product.count({ where: { status: 'DISCONTINUED' } })
    
    console.log(`   ✅ Disponibles: ${available}`)
    console.log(`   ⚠️  Sin stock: ${outOfStock}`)
    console.log(`   ❌ Descontinuados: ${discontinued}`)

    // Mostrar primeros 10 productos
    console.log(`\n📦 Primeros 10 productos disponibles:\n`)
    
    const products = await db.product.findMany({
      where: { status: 'AVAILABLE' },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   ID: ${p.id}`)
      console.log(`   Precio: ${p.price.toLocaleString('es-CO')} COP`)
      console.log(`   Categoría: ${p.category}`)
      console.log(`   Usuario: ${p.userId}`)
      console.log(``)
    })

    // Buscar productos específicos
    console.log(`\n🔍 Buscando productos específicos:\n`)
    
    const searches = [
      { term: 'laptop', field: 'name' },
      { term: 'computador', field: 'name' },
      { term: 'piano', field: 'name' },
      { term: 'curso', field: 'name' },
      { term: 'HP', field: 'name' },
      { term: 'Asus', field: 'name' }
    ]

    for (const search of searches) {
      const count = await db.product.count({
        where: {
          status: 'AVAILABLE',
          name: {
            contains: search.term,
            mode: 'insensitive'
          }
        }
      })
      console.log(`   "${search.term}": ${count} productos`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verificarProductos()
