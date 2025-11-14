/**
 * 🐛 DEBUG: Por qué aparece un mouse cuando busco portátil
 */

import { db } from '../src/lib/db'
import { intelligentProductSearch } from '../src/lib/intelligent-product-search'

async function testDebug() {
    console.log('🐛 DEBUG: Búsqueda de portátil\n')

    // Simular búsqueda
    const result = await intelligentProductSearch({
        userMessage: 'busco un portátil',
        conversationHistory: [],
        previousProducts: []
    })

    if (!result) {
        console.log('❌ No se encontró resultado')
        return
    }

    console.log('\n📊 RESULTADO:')
    console.log('- isGeneralQuery:', result.isGeneralQuery)
    console.log('- confidence:', result.confidence)
    console.log('- reason:', result.reason)

    if (result.product) {
        console.log('\n🎯 PRODUCTO ÚNICO:')
        console.log('- Nombre:', result.product.name)
        console.log('- Categoría:', result.product.category)
        console.log('- Precio:', result.product.price)
    }

    if (result.products) {
        console.log(`\n📦 PRODUCTOS MÚLTIPLES (${result.products.length}):`)
        result.products.forEach((p: any, i: number) => {
            console.log(`${i + 1}. ${p.name}`)
            console.log(`   💰 ${p.price.toLocaleString('es-CO')} COP`)
            console.log(`   📂 ${p.category}`)
        })
    }

    // Verificar si hay un mouse en los resultados
    const allResults = result.products || (result.product ? [result.product] : [])
    const mouseFound = allResults.find((p: any) => 
        p.name.toLowerCase().includes('mouse') ||
        p.name.toLowerCase().includes('ratón')
    )

    if (mouseFound) {
        console.log('\n🚨 PROBLEMA DETECTADO:')
        console.log('Se encontró un mouse en los resultados:')
        console.log('- Nombre:', mouseFound.name)
        console.log('- ID:', mouseFound.id)
        console.log('\n❌ Esto NO debería pasar cuando se busca "portátil"')
    } else {
        console.log('\n✅ OK: No se encontró ningún mouse en los resultados')
    }
}

testDebug()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })
