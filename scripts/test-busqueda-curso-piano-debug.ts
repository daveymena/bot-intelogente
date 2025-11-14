/**
 * 🐛 DEBUG: Por qué no encuentra el curso de piano
 */

import { IntelligentProductQuerySystem } from '../src/lib/intelligent-product-query-system'

async function testDebug() {
    console.log('🐛 DEBUG: Búsqueda de curso de piano\n')

    const intent = {
        type: 'product_search',
        category: 'DIGITAL',
        keywords: ['curso', 'piano'],
        confidence: 90
    }

    const userId = 'cm3rvvvvv0000kqw0aaaa0000' // Usuario de prueba

    console.log('🔍 Buscando con intent:', JSON.stringify(intent, null, 2))

    const products = await IntelligentProductQuerySystem.searchProducts(intent, userId)

    console.log(`\n📦 Productos encontrados: ${products.length}`)

    if (products.length > 0) {
        console.log('\n✅ PRODUCTOS:')
        products.forEach((p: any, i: number) => {
            console.log(`\n${i + 1}. ${p.name}`)
            console.log(`   💰 ${p.price.toLocaleString('es-CO')} COP`)
            console.log(`   📂 ${p.category}`)
            console.log(`   📝 ${p.description?.substring(0, 100)}...`)
        })
    } else {
        console.log('\n❌ No se encontraron productos')
        console.log('\n🔍 Verificando en la BD directamente...')
        
        const { db } = await import('../src/lib/db')
        
        const allProducts = await db.product.findMany({
            where: {
                status: 'AVAILABLE',
                OR: [
                    { name: { contains: 'piano', mode: 'insensitive' } },
                    { description: { contains: 'piano', mode: 'insensitive' } }
                ]
            }
        })
        
        console.log(`\n📊 Productos con "piano" en BD: ${allProducts.length}`)
        allProducts.forEach((p: any) => {
            console.log(`   - ${p.name} (${p.category})`)
        })
    }
}

testDebug()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })
