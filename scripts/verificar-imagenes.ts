import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarImagenes() {
  const productos = await prisma.product.findMany({
    take: 5,
    select: {
      name: true,
      images: true
    }
  })

  console.log('📸 Verificando imágenes de productos:\n')
  
  productos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`)
    console.log(`   Imágenes: ${p.images || 'Sin imágenes'}`)
    console.log('')
  })

  await prisma.$disconnect()
}

verificarImagenes()
