import { db } from '../src/lib/db'

async function debugProductos() {
  console.log('🔍 Verificando categorización de productos...\n')
  
  // Ver todos los productos disponibles
  const products = await db.product.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      name: true,
      category: true,
      subcategory: true,
      tags: true,
      price: true
    },
    take: 20,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`Total productos: ${products.length}\n`)
  
  // Agrupar por categoría
  const byCategory: any = {}
  products.forEach(p => {
    const cat = p.category || 'SIN_CATEGORIA'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(p)
  })
  
  // Mostrar por categoría
  for (const [cat, prods] of Object.entries(byCategory)) {
    console.log(`\n📦 ${cat} (${(prods as any[]).length} productos):`)
    ;(prods as any[]).forEach(p => {
      console.log(`  - ${p.name}`)
      console.log(`    Subcategoría: ${p.subcategory || 'N/A'}`)
      console.log(`    Tags: ${p.tags || 'N/A'}`)
      console.log(`    Precio: $${p.price}`)
    })
  }
  
  await db.$disconnect()
}

debugProductos().catch(console.error)
