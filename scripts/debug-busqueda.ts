import { PrismaClient } from '@prisma/client'
import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'

const prisma = new PrismaClient()

async function debugBusqueda() {
  // Verificar todos los usuarios
  const usuarios = await prisma.user.findMany()
  console.log(`Usuarios en BD: ${usuarios.length}`)
  usuarios.forEach(u => console.log(`  - ${u.email}`))

  // Verificar productos con piano
  const productoPiano = await prisma.product.findFirst({
    where: { name: { contains: 'Piano' } },
    include: { user: true }
  })

  if (productoPiano) {
    console.log(`\n✅ Producto Piano encontrado:`)
    console.log(`   Nombre: ${productoPiano.name}`)
    console.log(`   Usuario: ${productoPiano.user.email}`)
    console.log(`   UserId: ${productoPiano.userId}`)
  } else {
    console.log(`\n❌ No hay producto con Piano`)
  }

  // Usar el usuario correcto
  const user = productoPiano ? productoPiano.user : usuarios[0]
  console.log(`\nUsando usuario: ${user.email}`)

  const query = "Info del curso de piano"
  console.log(`Buscando: "${query}"\n`)

  const producto = await ProductIntelligenceService.findProduct(query, user.id)

  if (producto) {
    console.log(`\n✅ Producto encontrado: ${producto.name}`)
    console.log(`   Descripción: ${producto.description?.substring(0, 100)}...`)
    console.log(`   Tags: ${producto.tags}`)
  } else {
    console.log(`\n❌ No se encontró producto`)
  }

  await prisma.$disconnect()
}

debugBusqueda()
