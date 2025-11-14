/**
 * 🔍 DIAGNOSTICAR PRODUCTOS EN BASE DE DATOS
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE PRODUCTOS EN BASE DE DATOS\n')
  console.log('━'.repeat(50))

  try {
    // 1. Contar productos totales
    const totalProductos = await db.product.count()
    console.log(`📦 Total de productos: ${totalProductos}`)

    // 2. Contar por categoría
    const porCategoria = await db.product.groupBy({
      by: ['category'],
      _count: true
    })
    
    console.log('\n📊 Productos por categoría:')
    porCategoria.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count} productos`)
    })

    // 3. Contar por status
    const porStatus = await db.product.groupBy({
      by: ['status'],
      _count: true
    })
    
    console.log('\n📊 Productos por status:')
    porStatus.forEach(st => {
      console.log(`   ${st.status}: ${st._count} productos`)
    })

    // 4. Mostrar algunos productos PHYSICAL
    console.log('\n💻 Productos PHYSICAL (primeros 5):')
    const productosPhysical = await db.product.findMany({
      where: {
        category: 'PHYSICAL',
        status: 'AVAILABLE'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        status: true
      }
    })

    if (productosPhysical.length === 0) {
      console.log('   ⚠️ NO HAY PRODUCTOS PHYSICAL DISPONIBLES')
    } else {
      productosPhysical.forEach(p => {
        console.log(`   - ${p.name} ($${p.price.toLocaleString()})`)
      })
    }

    // 5. Buscar productos con "portátil" o "laptop"
    console.log('\n🔍 Búsqueda: "portátil" o "laptop":')
    const busqueda = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'portátil', mode: 'insensitive' } },
          { name: { contains: 'portatil', mode: 'insensitive' } },
          { name: { contains: 'laptop', mode: 'insensitive' } },
          { name: { contains: 'computador', mode: 'insensitive' } }
        ],
        status: 'AVAILABLE'
      },
      take: 5
    })

    if (busqueda.length === 0) {
      console.log('   ⚠️ NO SE ENCONTRARON PRODUCTOS')
    } else {
      console.log(`   ✅ Encontrados: ${busqueda.length} productos`)
      busqueda.forEach(p => {
        console.log(`   - ${p.name} ($${p.price.toLocaleString()})`)
      })
    }

    // 6. Verificar usuarios
    console.log('\n👥 Usuarios en BD:')
    const usuarios = await db.user.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: { products: true }
        }
      }
    })

    usuarios.forEach(u => {
      console.log(`   - ${u.email}: ${u._count.products} productos`)
    })

    console.log('\n━'.repeat(50))
    console.log('✅ Diagnóstico completado')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await db.$disconnect()
  }
}

diagnosticar()
