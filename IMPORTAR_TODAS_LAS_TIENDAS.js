const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importarTodasLasTiendas() {
    console.log('🚀 Importando productos de TODAS las tiendas...\n')

    try {
        // Buscar el usuario correcto: daveymena16@gmail.com
        let usuario = await prisma.user.findFirst({
            where: {
                email: 'daveymena16@gmail.com'
            }
        })

        // Si no existe, listar usuarios disponibles
        if (!usuario) {
            console.log('❌ Usuario daveymena16@gmail.com no encontrado\n')

            const usuarios = await prisma.user.findMany({
                select: { id: true, email: true, name: true }
            })

            console.log('👥 Usuarios disponibles:')
            usuarios.forEach(u => console.log(`   - ${u.email} (${u.name || 'Sin nombre'})`))

            console.error('\n❌ Por favor verifica que el usuario daveymena16@gmail.com existe')
            console.log('💡 O actualiza el email en el script')
            return
        }

        console.log(`👤 Importando para: ${usuario.email}\n`)

        let totalImportados = 0
        let totalActualizados = 0
        let totalErrores = 0

        // ========== TIENDA 1: MEGACOMPUTER ==========
        console.log('🏪 TIENDA 1: MEGACOMPUTER')
        console.log('━'.repeat(50))

        const megaPath = path.join(__dirname, 'catalogo-completo-importar.json')
        if (fs.existsSync(megaPath)) {
            const megaProductos = JSON.parse(fs.readFileSync(megaPath, 'utf8'))
            console.log(`📦 ${megaProductos.length} productos encontrados\n`)

            for (const producto of megaProductos) {
                try {
                    const productData = {
                        name: producto.name,
                        description: producto.description || '',
                        price: producto.price,
                        currency: producto.currency || 'COP',
                        category: producto.category || 'PHYSICAL',
                        status: producto.status || 'AVAILABLE',
                        images: JSON.stringify(producto.images || []),
                        tags: Array.isArray(producto.tags) ? producto.tags.join(',') : (producto.tags || 'megacomputer'),
                        userId: usuario.id
                    }

                    const existing = await prisma.product.findFirst({
                        where: { name: producto.name, userId: usuario.id }
                    })

                    if (existing) {
                        await prisma.product.update({
                            where: { id: existing.id },
                            data: productData
                        })
                        totalActualizados++
                    } else {
                        await prisma.product.create({ data: productData })
                        totalImportados++
                    }
                } catch (error) {
                    totalErrores++
                    console.error(`❌ Error: ${producto.name}`)
                }
            }

            console.log(`✅ MegaComputer: ${totalImportados} nuevos, ${totalActualizados} actualizados\n`)
        }

        // ========== TIENDA 2: DISYVAR ==========
        console.log('🏪 TIENDA 2: DISYVAR')
        console.log('━'.repeat(50))

        const disyvarPath = path.join(__dirname, 'scripts/disyvar-productos.json')
        if (fs.existsSync(disyvarPath)) {
            const disyvarProductos = JSON.parse(fs.readFileSync(disyvarPath, 'utf8'))
            console.log(`📦 ${disyvarProductos.length} productos encontrados\n`)

            let disyvarNuevos = 0
            let disyvarActualizados = 0

            for (const producto of disyvarProductos) {
                try {
                    const productData = {
                        name: producto.name,
                        description: producto.description || '',
                        price: producto.price,
                        currency: 'COP',
                        category: 'PHYSICAL',
                        status: 'AVAILABLE',
                        images: JSON.stringify(producto.images || []),
                        tags: `disyvar,${producto.category || ''}`,
                        userId: usuario.id
                    }

                    const existing = await prisma.product.findFirst({
                        where: { name: producto.name, userId: usuario.id }
                    })

                    if (existing) {
                        await prisma.product.update({
                            where: { id: existing.id },
                            data: productData
                        })
                        disyvarActualizados++
                        totalActualizados++
                    } else {
                        await prisma.product.create({ data: productData })
                        disyvarNuevos++
                        totalImportados++
                    }
                } catch (error) {
                    totalErrores++
                    console.error(`❌ Error: ${producto.name}`)
                }
            }

            console.log(`✅ Disyvar: ${disyvarNuevos} nuevos, ${disyvarActualizados} actualizados\n`)
        }

        // ========== RESUMEN FINAL ==========
        console.log('━'.repeat(50))
        console.log('📊 RESUMEN FINAL:')
        console.log('━'.repeat(50))
        console.log(`✅ Total Nuevos: ${totalImportados}`)
        console.log(`🔄 Total Actualizados: ${totalActualizados}`)
        console.log(`❌ Total Errores: ${totalErrores}`)
        console.log(`📦 TOTAL: ${totalImportados + totalActualizados}`)

        console.log(`\n🎉 ¡Importación completada!`)
        console.log(`\n🌐 Ver productos en:`)
        console.log(`   Tienda: http://localhost:3000/tienda`)
        console.log(`   Catálogo: http://localhost:3000/catalogo`)

    } catch (error) {
        console.error('❌ Error fatal:', error)
    } finally {
        await prisma.$disconnect()
    }
}

importarTodasLasTiendas()
