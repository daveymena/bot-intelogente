import { db } from '../src/lib/db'
import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'

async function verificarLinksPiano() {
  const piano = await db.product.findFirst({
    where: { name: { contains: 'Piano' } }
  })
  
  if (!piano) {
    console.log('No se encontró el producto')
    return
  }
  
  console.log('Producto:', piano.name)
  console.log('Tags:', piano.tags)
  console.log('\nExtrayendo links...')
  
  const productInfo = ProductIntelligenceService.extractProductInfo(piano)
  console.log('\nLinks extraídos:')
  console.log('- buy:', productInfo.links.buy)
  console.log('- info:', productInfo.links.info)
  console.log('- mercadopago:', productInfo.links.mercadopago)
  console.log('- paypal:', productInfo.links.paypal)
  console.log('- contacto:', productInfo.links.contacto)
  
  await db.$disconnect()
}

verificarLinksPiano()
