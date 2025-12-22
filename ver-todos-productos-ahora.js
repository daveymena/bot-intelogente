/**
 * Ver TODOS los productos en la base de datos
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function verTodosProductos() {
    try {
        console.log('📦 TODOS LOS PRODUCTOS EN LA BASE DE DATOS\n')
        console.log('='.repeat(80))

        const user = await db.user.findFirst()
        if (!user) {
            console.log('❌ No hay usuarios')
            return
        }

        const productos = await db.product.findMany({
            where: {
                userId: user.id,
                status: 'AVAILABLE'
            },
            orderBy: {
                name: 'asc'
            }
        })

        console.log(`\n✅ Total de productos: ${productos.length}\n`)

        // Agrupar por categoría
        const porCategoria = {}
        productos.forEach(p => {
            const cat = p.category || 'SIN_CATEGORIA'
            if (!porCategoria[cat]) {
                porCategoria[cat] = []
            }
            porCategoria[cat].push(p)
        })

        // Mostrar por categoría
        Object.keys(porCategoria).sort().forEach(categoria => {
            console.log(`\n📁 ${categoria} (${porCategoria[categoria].length} productos)`)
            console.log('-'.repeat(80))
            
            porCategoria[categoria].forEach((p, i) => {
                console.log(`\n${i + 1}. ${p.name}`)
                console.log(`   ID: ${p.id}`)
                console.log(`   Precio: ${p.price.toLocaleString('es-CO')} COP`)
                if (p.description) {
                    const desc = p.description.length > 100 
                        ? p.description.substring(0, 100) + '...'
                        : p.description
                    console.log(`   Descripción: ${desc}`)
                }
            })
        })

        // Buscar específicamente productos con "piano", "curso", "megapack"
        console.log('\n' + '='.repeat(80))
        console.log('\n🔍 BÚSQUEDAS ESPECÍFICAS:\n')

        const busquedas = ['piano', 'curso', 'megapack', 'laptop', 'moto']
        
        for (const termino of busquedas) {
            const encontrados = productos.filter(p => 
                p.name.toLowerCase().includes(termino) ||
                (p.description && p.description.toLowerCase().includes(termino))
            )
            
            console.log(`\n"${termino}": ${encontrados.length} productos`)
            if (encontrados.length > 0) {
                encontrados.slice(0, 3).forEach(p => {
                    console.log(`   - ${p.name}`)
                })
                if (encontrados.length > 3) {
                    console.log(`   ... y ${encontrados.length - 3} más`)
                }
            }
        }

        console.log('\n' + '='.repeat(80))

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await db.$disconnect()
    }
}

verTodosProductos()
