import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarLinksDescripcion() {
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'megacomputer' } },
        { description: { contains: 'http://' } },
        { description: { contains: 'https://' } }
      ]
    },
    select: {
      name: true,
      description: true
    }
  })

  console.log(`🔍 Productos con links en la descripción: ${productos.length}\n`)
  
  if (productos.length === 0) {
    console.log('✅ No hay productos con links visibles en la descripción')
  } else {
    productos.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   Descripción: ${p.description?.substring(0, 200)}...`)
      console.log('')
    })
  }

  await prisma.$disconnect()
}

verificarLinksDescripcion()
