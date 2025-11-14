import { db } from '../src/lib/db'

async function verificarPiano() {
  const products = await db.product.findMany({
    where: {
      name: {
        contains: 'Piano'
      }
    }
  })
  
  console.log(`Productos con "Piano": ${products.length}`)
  products.forEach(p => {
    console.log(`- ${p.name} (${p.category})`)
  })
  
  await db.$disconnect()
}

verificarPiano()
