import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarPrecios() {
  const productos = await prisma.product.findMany({
    take: 10,
    select: {
      name: true,
      price: true
    }
  })

  console.log('💰 Verificando precios de productos:\n')
  
  productos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`)
    console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`)
    console.log('')
  })

  await prisma.$disconnect()
}

verificarPrecios()
