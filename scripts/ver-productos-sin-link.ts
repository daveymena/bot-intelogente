import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const sinLink = await db.product.findMany({
    where: {
      category: 'DIGITAL',
      deliveryLink: null
    },
    select: {
      id: true,
      name: true
    }
  })
  
  console.log('📦 Productos digitales SIN link de entrega:\n')
  sinLink.forEach(p => console.log('- ' + p.name))
  console.log('\n📊 Total:', sinLink.length)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
