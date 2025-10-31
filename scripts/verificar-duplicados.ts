import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarDuplicados() {
    console.log('🔍 VERIFICACIÓN DE PRODUCTOS\n')
    console.log('='.repeat(60))

    try {
        const productos = await prisma.product.findMany({
            orderBy: { name: 'asc' }
        })

        console.log(`\n📦 Total de productos en la base de datos: ${productos.length}\n`)

        // Agrupar por nombre
        const productosPorNombre = new Map<string, typeof productos>()

        productos.forEach(producto => {
            const nombreNormalizado = producto.name.toLowerCase().trim()
            if (!productosPorNombre.has(nombreNormalizado)) {
                productosPorNombre.set(nombreNormalizado, [])
            }
            productosPorNombre.get(nombreNormalizado)!.push(producto)
        })

        // Mostrar duplicados
        let totalDuplicados = 0
        console.log('🔍 PRODUCTOS DUPLICADOS:\n')

        productosPorNombre.forEach((productos, nombre) => {
            if (productos.length > 1) {
                totalDuplicados++
                console.log(`❌ "${productos[0].name}" (${productos.length} copias)`)
                productos.forEach((p, i) => {
                    const images = JSON.parse(p.images || '[]')
                    const tieneImagen = images.length > 0
                    console.log(`   ${i + 1}. ID: ${p.id} | Precio: $${p.price} | Imagen: ${tieneImagen ? '✅' : '❌'}`)
                })
                console.log('')
            }
        })

        if (totalDuplicados === 0) {
            console.log('✅ No se encontraron productos duplicados\n')
        } else {
            console.log(`\n⚠️  Total de productos con duplicados: ${totalDuplicados}\n`)
        }

        // Verificar imágenes
        console.log('='.repeat(60))
        console.log('\n🖼️  VERIFICACIÓN DE IMÁGENES:\n')

        let conImagen = 0
        let sinImagen = 0
        let conUnsplash = 0

        productos.forEach(p => {
            try {
                const images = p.images ? JSON.parse(p.images) : []
                if (images.length > 0) {
                    conImagen++
                    if (images.some((img: string) => img.includes('unsplash.com'))) {
                        conUnsplash++
                    }
                } else {
                    sinImagen++
                }
            } catch (e) {
                // Si no es JSON válido, asumir que es una URL directa
                if (p.images && p.images.length > 0) {
                    conImagen++
                    if (p.images.includes('unsplash.com')) {
                        conUnsplash++
                    }
                } else {
                    sinImagen++
                }
            }
        })

        console.log(`✅ Con imagen: ${conImagen}`)
        console.log(`❌ Sin imagen: ${sinImagen}`)
        console.log(`🌅 Con Unsplash: ${conUnsplash}`)

        // Listar productos sin imagen
        if (sinImagen > 0) {
            console.log('\n📸 PRODUCTOS SIN IMAGEN:\n')

            const productosSinImagen = productos.filter(p => {
                try {
                    const images = p.images ? JSON.parse(p.images) : []
                    return images.length === 0
                } catch (e) {
                    return !p.images || p.images.length === 0
                }
            })

            productosSinImagen.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`)
                console.log(`   ID: ${p.id} | Precio: $${p.price} ${p.currency}`)
            })
        }

        console.log('\n' + '='.repeat(60))
        console.log('\n💡 RECOMENDACIONES:\n')

        if (totalDuplicados > 0) {
            console.log(`⚠️  Tienes ${totalDuplicados} productos duplicados`)
            console.log('   Ejecuta: npm run limpiar-duplicados')
        }

        if (conUnsplash > 0) {
            console.log(`⚠️  Tienes ${conUnsplash} productos con imágenes de Unsplash`)
            console.log('   Ejecuta: npm run limpiar-duplicados (las eliminará)')
        }

        if (sinImagen > 0) {
            console.log(`📸 Tienes ${sinImagen} productos sin imagen`)
            console.log('   Agrégalas manualmente desde el dashboard')
        }

        console.log('')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

verificarDuplicados()
