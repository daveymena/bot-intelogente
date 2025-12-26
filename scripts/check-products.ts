
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Mega' } },
        { name: { contains: 'Pack' } },
        { name: { contains: 'Curso' } },
        { name: { contains: 'Programación' } }
      ]
    },
    select: {
      id: true,
      name: true,
      category: true
    }
  })

  console.log('--- PRODUCTOS ENCONTRADOS ---')
  products.forEach(p => console.log(`- ${p.name} (${p.category})`))
  console.log('---------------------------')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
