/**
 * 🐛 DEBUG: Ver qué prompt se le está enviando a la IA
 */

import { db } from '../src/lib/db'

async function testPrompt() {
    console.log('🔍 Generando prompt para la IA...\n')

    const allProducts = await db.product.findMany({
        where: { status: 'AVAILABLE' },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            subcategory: true,
            store: true
        },
        take: 160
    })

    // Crear lista de productos como lo hace el código
    const productList = allProducts.map((p, idx) => {
        const subcatInfo = p.subcategory ? ` [${p.subcategory}]` : '';
        const storeInfo = p.store ? ` (${p.store})` : '';
        return `${idx + 1}. ${p.name}${subcatInfo}${storeInfo} - ${p.category} - ${p.price}`;
    }).join('\n');

    // Buscar el portátil Acer y el mouse en la lista
    const lines = productList.split('\n')
    
    console.log('📋 Buscando Portátil Acer y Mouse en la lista...\n')
    
    lines.forEach((line, idx) => {
        if (line.includes('Acer A15-51p-591e')) {
            console.log(`✅ Portátil Acer encontrado en línea ${idx + 1}:`)
            console.log(`   ${line}`)
        }
        if (line.includes('Mouse Trust Fyda')) {
            console.log(`\n🖱️ Mouse encontrado en línea ${idx + 1}:`)
            console.log(`   ${line}`)
        }
    })

    // Mostrar líneas alrededor de la 45
    console.log(`\n📋 Líneas 44-47 de la lista:`)
    lines.slice(43, 47).forEach((line, idx) => {
        console.log(`${44 + idx}. ${line}`)
    })
}

testPrompt()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })
