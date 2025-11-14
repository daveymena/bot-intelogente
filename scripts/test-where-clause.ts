/**
 * 🐛 DEBUG: Ver qué whereClause se está generando
 */

import { db } from '../src/lib/db'

async function testWhereClause() {
    console.log('🐛 DEBUG: Generando whereClause\n')

    const intent = {
        type: 'product_search',
        category: 'DIGITAL',
        keywords: ['curso', 'piano'],
        confidence: 90
    }

    const userId = 'cm3rvvvvv0000kqw0aaaa0000'

    // Simular la lógica de searchProducts
    const whereClause: any = {
        userId,
        status: 'AVAILABLE'
    }

    if (intent.category) {
        whereClause.category = intent.category
    }

    const searchTerms = intent.keywords || []
    if (searchTerms.length > 0) {
        whereClause.OR = searchTerms.map(term => ({
            OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { tags: { contains: term, mode: 'insensitive' } }
            ]
        }))
    }

    console.log('📋 whereClause generado:')
    console.log(JSON.stringify(whereClause, null, 2))

    console.log('\n🔍 Buscando con este whereClause...')

    try {
        const products = await db.product.findMany({
            where: whereClause,
            take: 4
        })

        console.log(`\n📦 Productos encontrados: ${products.length}`)
        products.forEach((p: any) => {
            console.log(`   - ${p.name}`)
        })
    } catch (error: any) {
        console.log(`\n❌ Error: ${error.message}`)
    }

    // Probar con una búsqueda más simple
    console.log('\n\n🔍 Probando búsqueda simple...')
    
    const simpleWhere = {
        userId,
        status: 'AVAILABLE',
        category: 'DIGITAL',
        name: { contains: 'piano', mode: 'insensitive' as const }
    }

    const simpleProducts = await db.product.findMany({
        where: simpleWhere,
        take: 4
    })

    console.log(`📦 Productos encontrados (búsqueda simple): ${simpleProducts.length}`)
    simpleProducts.forEach((p: any) => {
        console.log(`   - ${p.name}`)
    })
}

testWhereClause()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })
