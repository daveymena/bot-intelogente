/**
 * 📦 Ver todos los productos
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('📦 Consultando productos...\n')

    const productos = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    if (productos.length === 0) {
      console.log('❌ No hay productos en la base de datos')
      return
    }

    console.log(`✅ Encontrados ${productos.length} producto(s):\n`)
    console.log('═'.repeat(80))

    productos.forEach((prod, index) => {
      console.log(`\n${index + 1}. ${prod.name}`)
      console.log('   ID:', prod.id)
      console.log('   Precio:', `$${prod.price} ${prod.currency}`)
      console.log('   Categoría:', prod.category)
      console.log('   Estado:', prod.status)
      
      const images = prod.images ? JSON.parse(prod.images) : []
      console.log('   Imágenes:', images.length)
      
      const tags = prod.tags ? JSON.parse(prod.tags) : []
      console.log('   Tags:', tags.length, '-', tags.slice(0, 5).join(', '))
      
      const desc = prod.description || ''
      console.log('   Descripción:', desc.substring(0, 100) + '...')
    })

    console.log('\n' + '═'.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
