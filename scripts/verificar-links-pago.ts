import { db } from '../src/lib/db'

async function verificarLinksPago() {
  try {
    console.log('🔍 Verificando links de pago en productos...\n')

    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        tags: true
      }
    })

    console.log(`📦 Total de productos: ${products.length}\n`)

    for (const product of products) {
      console.log(`\n📦 ${product.name}`)
      console.log(`💰 Precio: $${product.price.toLocaleString()} COP`)
      
      if (product.tags) {
        try {
          const tags = JSON.parse(product.tags)
          const paymentLinks = tags.filter((tag: string) => 
            tag.includes('http') || 
            tag.startsWith('hotmart:') || 
            tag.startsWith('mercadopago:') || 
            tag.startsWith('paypal:') ||
            tag.startsWith('nequi:') ||
            tag.startsWith('payco:')
          )

          if (paymentLinks.length > 0) {
            console.log('💳 Links de pago encontrados:')
            paymentLinks.forEach((link: string) => {
              // Verificar si es un link genérico
              if (link.includes('example') || link.includes('mpago.la/example') || link.includes('paypal.com/invoice/example')) {
                console.log(`   ❌ GENÉRICO: ${link}`)
              } else {
                console.log(`   ✅ ${link}`)
              }
            })
          } else {
            console.log('⚠️  Sin links de pago configurados')
          }
        } catch (error) {
          console.log('❌ Error parseando tags:', error)
        }
      } else {
        console.log('⚠️  Sin tags configurados')
      }
    }

    console.log('\n✅ Verificación completada')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

verificarLinksPago()
