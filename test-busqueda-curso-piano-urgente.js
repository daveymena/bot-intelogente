/**
 * 🚨 TEST URGENTE: Búsqueda de "curso de piano"
 * Verificar por qué devuelve productos incorrectos
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testBusquedaCursoPiano() {
    try {
        console.log('🔍 TEST: Búsqueda de "curso de piano"\n')
        console.log('='.repeat(80))

        // 1. Obtener usuario
        const user = await db.user.findFirst()
        if (!user) {
            console.log('❌ No hay usuarios en la base de datos')
            return
        }

        console.log(`✅ Usuario: ${user.email}\n`)

        // 2. Buscar TODOS los productos que contengan "piano"
        console.log('📦 Productos que contienen "piano":\n')
        const productosConPiano = await db.product.findMany({
            where: {
                userId: user.id,
                status: 'AVAILABLE',
                OR: [
                    { name: { contains: 'piano', mode: 'insensitive' } },
                    { description: { contains: 'piano', mode: 'insensitive' } }
                ]
            }
        })

        if (productosConPiano.length === 0) {
            console.log('❌ NO HAY PRODUCTOS CON "PIANO" EN LA BASE DE DATOS')
            console.log('\n🔍 Buscando productos con "curso"...\n')
            
            const productosConCurso = await db.product.findMany({
                where: {
                    userId: user.id,
                    status: 'AVAILABLE',
                    OR: [
                        { name: { contains: 'curso', mode: 'insensitive' } },
                        { description: { contains: 'curso', mode: 'insensitive' } }
                    ]
                },
                take: 10
            })
            
            console.log(`Encontrados ${productosConCurso.length} productos con "curso":\n`)
            productosConCurso.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`)
                console.log(`   Categoría: ${p.category}`)
                console.log(`   Precio: ${p.price} COP`)
                if (p.description) {
                    console.log(`   Descripción: ${p.description.substring(0, 100)}...`)
                }
                console.log()
            })
        } else {
            console.log(`✅ Encontrados ${productosConPiano.length} productos:\n`)
            productosConPiano.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`)
                console.log(`   ID: ${p.id}`)
                console.log(`   Categoría: ${p.category}`)
                console.log(`   Precio: ${p.price} COP`)
                if (p.description) {
                    console.log(`   Descripción: ${p.description.substring(0, 100)}...`)
                }
                console.log()
            })
        }

        // 3. Probar la función findProduct
        console.log('='.repeat(80))
        console.log('\n🧪 Probando ProductIntelligenceService.findProduct()\n')

        const { ProductIntelligenceService } = require('./src/lib/product-intelligence-service')
        
        const queries = [
            'curso de piano',
            'Estoy interesado en el curso de piano',
            'piano',
            'curso piano'
        ]

        for (const query of queries) {
            console.log(`\n🔍 Query: "${query}"`)
            console.log('-'.repeat(80))
            
            const resultado = await ProductIntelligenceService.findProduct(query, user.id)
            
            if (resultado) {
                console.log(`✅ ENCONTRADO: ${resultado.name}`)
                console.log(`   Precio: ${resultado.price} COP`)
                console.log(`   Categoría: ${resultado.category}`)
            } else {
                console.log(`❌ NO ENCONTRADO`)
            }
        }

        console.log('\n' + '='.repeat(80))

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await db.$disconnect()
    }
}

testBusquedaCursoPiano()
