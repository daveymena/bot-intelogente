/**
 * 🐛 DEBUG: Verificar orden de productos
 */

import { db } from '../src/lib/db'

async function testOrden() {
    console.log('🔍 Verificando orden de productos...\n')

    const allProducts = await db.product.findMany({
        where: { status: 'AVAILABLE' },
        select: {
            id: true,
            name: true,
            price: true,
            category: true
        },
        take: 160
    })

    console.log(`📦 Total productos: ${allProducts.length}\n`)

    // Buscar el portátil Acer que la IA mencionó
    const acerIndex = allProducts.findIndex(p => 
        p.name.includes('Acer A15-51p-591e')
    )

    if (acerIndex >= 0) {
        console.log(`✅ Portátil Acer encontrado en índice: ${acerIndex} (1-based: ${acerIndex + 1})`)
        console.log(`   Nombre: ${allProducts[acerIndex].name}`)
        console.log(`   Precio: ${allProducts[acerIndex].price}`)
    } else {
        console.log('❌ Portátil Acer NO encontrado')
    }

    // Buscar el mouse
    const mouseIndex = allProducts.findIndex(p => 
        p.name.includes('Mouse Trust Fyda')
    )

    if (mouseIndex >= 0) {
        console.log(`\n🖱️ Mouse encontrado en índice: ${mouseIndex} (1-based: ${mouseIndex + 1})`)
        console.log(`   Nombre: ${allProducts[mouseIndex].name}`)
        console.log(`   Precio: ${allProducts[mouseIndex].price}`)
    } else {
        console.log('\n❌ Mouse NO encontrado')
    }

    // Verificar qué hay en el índice 45 (productIndex 46 - 1)
    if (allProducts[45]) {
        console.log(`\n📍 Producto en índice 45 (productIndex 46):`)
        console.log(`   Nombre: ${allProducts[45].name}`)
        console.log(`   Precio: ${allProducts[45].price}`)
        console.log(`   Categoría: ${allProducts[45].category}`)
    }

    // Mostrar primeros 10 productos
    console.log(`\n📋 Primeros 10 productos:`)
    allProducts.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name.substring(0, 60)}...`)
    })

    // Mostrar productos alrededor del índice 45
    console.log(`\n📋 Productos alrededor del índice 45:`)
    allProducts.slice(43, 48).forEach((p, i) => {
        const idx = 43 + i
        console.log(`${idx + 1}. ${p.name.substring(0, 60)}...`)
    })
}

testOrden()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })
