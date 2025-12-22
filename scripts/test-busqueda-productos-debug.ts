/**
 * Debug: Ver si la búsqueda de productos funciona
 */

import { db } from '../src/lib/db'

async function testBusqueda() {
  console.log('🔍 TEST DE BÚSQUEDA DE PRODUCTOS\n')

  // Buscar usuario
  const user = await db.user.findFirst({
    where: { email: 'daveymena16@gmail.com' }
  })

  if (!user) {
    console.log('❌ Usuario no encontrado')
    return
  }

  console.log(`✅ Usuario: ${user.email}`)
  console.log(`📦 ID: ${user.id}\n`)

  // Test 1: Buscar "laptop"
  console.log('1️⃣ Buscando "laptop"...')
  const query1 = 'laptop'
  const keywords1 = query1.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  console.log(`   Keywords: ${keywords1.join(', ')}`)

  const products1 = await db.product.findMany({
    where: {
      userId: user.id,
      OR: keywords1.map(keyword => ({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      }))
    },
    take: 5
  })

  console.log(`   Encontrados: ${products1.length}`)
  products1.slice(0, 3).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP`)
  })
  console.log()

  // Test 2: Buscar "diseño"
  console.log('2️⃣ Buscando "diseño"...')
  const query2 = 'diseño'
  const keywords2 = query2.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  console.log(`   Keywords: ${keywords2.join(', ')}`)

  const products2 = await db.product.findMany({
    where: {
      userId: user.id,
      OR: keywords2.map(keyword => ({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      }))
    },
    take: 5
  })

  console.log(`   Encontrados: ${products2.length}`)
  products2.slice(0, 3).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP`)
  })
  console.log()

  // Test 3: Buscar "laptop diseño" (múltiples keywords)
  console.log('3️⃣ Buscando "laptop diseño"...')
  const query3 = 'laptop diseño'
  const keywords3 = query3.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  console.log(`   Keywords: ${keywords3.join(', ')}`)

  const products3 = await db.product.findMany({
    where: {
      userId: user.id,
      OR: keywords3.map(keyword => ({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      }))
    },
    take: 5
  })

  console.log(`   Encontrados: ${products3.length}`)
  products3.slice(0, 3).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} COP`)
  })
  console.log()

  // Test 4: Ver todos los productos del usuario
  const totalProducts = await db.product.count({
    where: { userId: user.id }
  })
  console.log(`📊 Total de productos del usuario: ${totalProducts}`)

  await db.$disconnect()
}

testBusqueda().catch(console.error)
