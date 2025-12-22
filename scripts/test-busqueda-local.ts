import { db } from '../src/lib/db'

async function testBusquedaLocal() {
  console.log('🧪 Probando búsqueda local de computadores...\n')
  
  const userId = 'cmhpw941q0000kmp85qvjm0o5'
  
  // Simular búsqueda con keywords expandidas
  const keywords = ['computador', 'portátil', 'portatil', 'laptop', 'notebook']
  
  console.log('🔑 Keywords de búsqueda:', keywords)
  console.log('')
  
  // Buscar productos
  const whereClause: any = {
    userId,
    status: 'AVAILABLE',
    category: 'PHYSICAL',
    OR: keywords.flatMap(keyword => [
      { name: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } }
    ])
  }
  
  const products = await db.product.findMany({
    where: whereClause,
    take: 20,
    select: {
      name: true,
      price: true,
      description: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`📦 Productos encontrados: ${products.length}\n`)
  
  // Rankear productos
  const ranked = products
    .map(product => {
      let score = 0
      const nameLower = product.name.toLowerCase()
      const descLower = (product.description || '').toLowerCase()
      
      // Puntos por coincidencia en nombre
      keywords.forEach(keyword => {
        if (nameLower.includes(keyword)) score += 100
        if (descLower.includes(keyword)) score += 10
      })
      
      // Penalizar accesorios
      const accessories = ['base', 'soporte', 'protector', 'ventilador', 'enfriador', 'cable']
      accessories.forEach(acc => {
        if (nameLower.includes(acc)) score -= 50
      })
      
      // Bonus por precio
      if (product.price > 1000000) score += 20
      else if (product.price > 500000) score += 10
      
      return { ...product, score }
    })
    .sort((a, b) => b.score - a.score)
  
  console.log('🏆 Top 10 productos rankeados:\n')
  ranked.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`)
    console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`)
    console.log(`   Score: ${p.score}`)
    console.log('')
  })
  
  await db.$disconnect()
}

testBusquedaLocal().catch(console.error)
