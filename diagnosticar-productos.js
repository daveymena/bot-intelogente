/**
 * Script de diagnóstico para verificar productos en la base de datos
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE PRODUCTOS\n')
  
  try {
    // Obtener primer usuario
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos')
      return
    }
    
    console.log(`✅ Usuario encontrado: ${user.name || user.email}`)
    console.log(`   ID: ${user.id}\n`)
    
    // Contar productos totales
    const totalProducts = await prisma.product.count({
      where: { userId: user.id }
    })
    
    console.log(`📦 Total de productos: ${totalProducts}\n`)
    
    if (totalProducts === 0) {
      console.log('❌ No hay productos para este usuario')
      console.log('\n💡 Solución: Agrega productos desde el dashboard o ejecuta el seed')
      return
    }
    
    // Obtener primeros 5 productos
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { name: 'asc' }
    })
    
    console.log('📋 Primeros 5 productos:\n')
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   💰 Precio: ${p.price.toLocaleString('es-CO')} COP`)
      console.log(`   📁 Categoría: ${p.category}`)
      console.log(`   📊 Status: ${p.status || 'N/A'}`)
      console.log()
    })
    
    // Contar por categoría
    const digital = await prisma.product.count({
      where: { userId: user.id, category: 'DIGITAL' }
    })
    
    const physical = await prisma.product.count({
      where: { userId: user.id, category: 'PHYSICAL' }
    })
    
    const service = await prisma.product.count({
      where: { userId: user.id, category: 'SERVICE' }
    })
    
    console.log('📊 DISTRIBUCIÓN POR CATEGORÍA:')
    console.log(`   📱 Digital: ${digital}`)
    console.log(`   📦 Físico: ${physical}`)
    console.log(`   🛠️  Servicio: ${service}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticar()
