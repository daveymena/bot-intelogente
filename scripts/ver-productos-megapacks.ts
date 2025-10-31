import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verMegapacks() {
    try {
        console.log('📚 Buscando todos los productos...\n')

        const allProducts = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                stock: true,
                status: true
            }
        })

        // Filtrar manualmente los que contienen "megapack" o "curso"
        const megapacks = allProducts.filter(p => 
            p.name.toLowerCase().includes('megapack') ||
            p.name.toLowerCase().includes('curso')
        )

        console.log(`✅ Encontrados ${megapacks.length} productos relacionados con megapacks:\n`)

        megapacks.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`)
            console.log(`   ID: ${p.id}`)
            console.log(`   Precio: $${p.price}`)
            console.log(`   Categoría: ${p.category}`)
            console.log(`   Stock: ${p.stock}`)
            console.log(`   Estado: ${p.status}`)
            console.log('')
        })

        if (megapacks.length === 0) {
            console.log('⚠️  No se encontraron productos de megapacks')
            console.log('💡 Necesitas agregar los megapacks a la base de datos')
        }

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

verMegapacks()
