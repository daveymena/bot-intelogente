
import { db } from './src/lib/db'

async function checkBot() {
  try {
    const products = await db.product.findMany({ take: 5 })
    console.log('--- Product Slugs/IDs ---')
    products.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}`))
    console.log('-------------------------')
  } catch (error) {
    console.error('Error checking products:', error)
  } finally {
    process.exit(0)
  }
}

checkBot()
