import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎹 Actualizando precio del curso de piano a 60.000 COP...')
  
  const updated = await prisma.product.updateMany({
    where: { name: { contains: 'piano', mode: 'insensitive' } },
    data: { price: 60000 }
  })
  
  console.log(`✅ Productos actualizados: ${updated.count}`)
  
  const piano = await prisma.product.findFirst({
    where: { name: { contains: 'piano', mode: 'insensitive' } },
    select: { id: true, name: true, price: true }
  })
  
  if (piano) {
    console.log(`🎹 ${piano.name}`)
    console.log(`💰 Precio: ${piano.price.toLocaleString('es-CO')} COP`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
