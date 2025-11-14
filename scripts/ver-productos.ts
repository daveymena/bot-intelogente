import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verProductos() {
  const productos = await prisma.product.findMany()
  
  console.log(`\nTotal productos: ${productos.length}\n`)
  
  const conPiano = productos.filter(p => 
    p.name.toLowerCase().includes('piano') || 
    p.name.toLowerCase().includes('curso')
  )
  
  console.log(`Productos con "piano" o "curso": ${conPiano.length}`)
  conPiano.forEach(p => console.log(`  - ${p.name}`))
  
  await prisma.$disconnect()
}

verProductos()
