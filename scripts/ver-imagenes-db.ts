import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: { status: 'AVAILABLE' },
    select: { name: true, images: true },
    take: 15
  })
  
  console.log('📦 Imágenes actuales en la base de datos:\n')
  
  products.forEach(p => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦', p.name)
    console.log('🖼️ ', p.images)
  })
}

main().finally(() => prisma.$disconnect())
