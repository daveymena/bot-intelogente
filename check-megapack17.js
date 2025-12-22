
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Buscar el producto "Mega Pack 17: Cursos Idiomas"
  const producto = await prisma.product.findFirst({
    where: {
      name: { contains: 'Mega Pack 17', mode: 'insensitive' }
    }
  })

  if (!producto) {
    console.log('❌ No se encontró el producto "Mega Pack 17"')
    return
  }

  console.log('✅ Producto encontrado:')
  console.log('  ID:', producto.id)
  console.log('  Nombre:', producto.name)
  console.log('  Descripción:', producto.description?.substring(0, 100))
  console.log('  Precio:', producto.price)
  console.log('  Imágenes RAW:', producto.images)
  
  try {
    const imagenesParseadas = producto.images ? JSON.parse(producto.images) : []
    console.log('  Imágenes PARSEADAS:', imagenesParseadas)
  } catch (error) {
    console.log('  ❌ Error parseando imágenes:', error.message)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
