const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function verificarYCorregirFotos() {
    console.log('🔍 Verificando y corrigiendo fotos de productos...\n')

    try {
        const usuario = await prisma.user.findFirst({
            where: { email: 'daveymena16@gmail.com' }
        })

        if (!usuario) {
            console.error('❌ Usuario no encontrado')
            return
        }

        console.log(`👤 Usuario: ${usuario.email}\n`)

        // Cargar TODOS los JSON con productos
        const archivosJSON = [
            'catalogo-completo-importar.json',
            'catalogo-completo-68-productos.json',
            'productos-2025-11-04.json',
            'productos-listos-importar.json',
            'productos-megacomputer-completo.json',
            'scripts/disyvar-productos.json',
            'scripts/productos-completos.json',
            'scripts/productos-megacomputer-completo.json',
            'scripts/productos-megacomputer.json'
        ]

        let todosLosProductosJSON = []
        let archivosCargados = []

        console.log('📂 Cargando archivos JSON...\n')

        for (const archivo of archivosJSON) {
            const rutaCompleta = path.join(__dirname, archivo)
            if (fs.existsSync(rutaCompleta)) {
                try {
                    const contenido = JSON.parse(fs.readFileSync(rutaCompleta, 'utf8'))
                    const productos = Array.isArray(contenido) ? contenido : []

                    if (productos.length > 0) {
                        todosLosProductosJSON = todosLosProductosJSON.concat(productos)
                        archivosCargados.push({ archivo, cantidad: productos.length })
                        console.log(`✅ ${archivo}: ${productos.length} productos`)
                    }
                } catch (e) {
                    console.log(`⚠️  Error leyendo ${archivo}`)
                }
            }
        }

        console.log(`\n📦 Total productos en JSON: ${todosLosProductosJSON.length}`)
        console.log(`📁 Archivos cargados: ${archivosCargados.length}\n`)

        // Crear índice por nombre para búsqueda rápida
        const indiceProductos = {}
        todosLosProductosJSON.forEach(p => {
            if (p && p.name) {
                const nombreNormalizado = p.name.trim().toLowerCase()
                if (!indiceProductos[nombreNormalizado]) {
                    indiceProductos[nombreNormalizado] = []
                }
                indiceProductos[nombreNormalizado].push(p)
            }
        })

        // Obtener productos de la BD
        const productosBD = await prisma.product.findMany({
            where: { userId: usuario.id }
        })

        console.log(`🗄️  Productos en BD: ${productosBD.length}\n`)
        console.log('━'.repeat(60))
        console.log('🔍 VERIFICANDO FOTOS...\n')

        let contadorFotosCorrectas = 0
        let fotosCorregidas = 0
        let sinFotosEnJSON = 0
        let fotosIncorrectas = 0

        for (const productoBD of productosBD) {
            const nombreNormalizado = productoBD.name.trim().toLowerCase()
            const productosJSON = indiceProductos[nombreNormalizado] || []

            // Obtener fotos actuales
            let fotosActuales = []
            try {
                fotosActuales = JSON.parse(productoBD.images || '[]')
            } catch (e) {
                fotosActuales = []
            }

            if (productosJSON.length > 0) {
                // Encontrar el producto con más fotos
                let mejorProducto = productosJSON[0]
                let maxFotos = 0

                productosJSON.forEach(p => {
                    const fotos = p.images || []
                    if (fotos.length > maxFotos) {
                        maxFotos = fotos.length
                        mejorProducto = p
                    }
                })

                const fotosJSON = mejorProducto.images || []

                // Comparar fotos
                const fotosIguales = JSON.stringify(fotosActuales) === JSON.stringify(fotosJSON)

                if (!fotosIguales && fotosJSON.length > 0) {
                    // Actualizar fotos
                    await prisma.product.update({
                        where: { id: productoBD.id },
                        data: { images: JSON.stringify(fotosJSON) }
                    })

                    console.log(`🔄 CORREGIDO: ${productoBD.name}`)
                    console.log(`   Antes: ${fotosActuales.length} fotos`)
                    console.log(`   Ahora: ${fotosJSON.length} fotos`)

                    if (fotosActuales.length > 0) {
                        fotosIncorrectas++
                    }
                    fotosCorregidas++
                } else if (fotosJSON.length > 0) {
                    contadorFotosCorrectas++
                }
            } else {
                if (fotosActuales.length === 0) {
                    console.log(`⚠️  SIN FOTOS EN JSON: ${productoBD.name}`)
                    sinFotosEnJSON++
                }
            }
        }

        console.log('\n━'.repeat(60))
        console.log('📊 RESUMEN:')
        console.log('━'.repeat(60))
        console.log(`✅ Fotos correctas: ${contadorFotosCorrectas}`)
        console.log(`🔄 Fotos corregidas: ${fotosCorregidas}`)
        console.log(`⚠️  Fotos incorrectas corregidas: ${fotosIncorrectas}`)
        console.log(`❌ Sin fotos en JSON: ${sinFotosEnJSON}`)

        console.log('\n🎉 ¡Verificación completada!')
        console.log('\n🌐 Ver productos en:')
        console.log('   Tienda: http://localhost:3000/tienda')
        console.log('   Catálogo: http://localhost:3000/catalogo')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

verificarYCorregirFotos()
