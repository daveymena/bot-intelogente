/**
 * 🔄 SINCRONIZAR TIENDA CON BOT
 * - Elimina productos duplicados
 * - Actualiza imágenes de megapacks individuales
 * - Sincroniza catálogo entre tienda y bot
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// URLs de imágenes de megapacks individuales
const MEGAPACK_IMAGES: Record<string, string> = {
  '1': 'https://i.postimg.cc/Kz8Lh5Qy/megapack-1.jpg',
  '2': 'https://i.postimg.cc/9FZvXqYL/megapack-2.jpg',
  '3': 'https://i.postimg.cc/9FZvXqYL/megapack-3.jpg',
  '4': 'https://i.postimg.cc/9FZvXqYL/megapack-4.jpg',
  '5': 'https://i.postimg.cc/9FZvXqYL/megapack-5.jpg',
  '6': 'https://i.postimg.cc/9FZvXqYL/megapack-6.jpg',
  '7': 'https://i.postimg.cc/9FZvXqYL/megapack-7.jpg',
  '8': 'https://i.postimg.cc/9FZvXqYL/megapack-8.jpg',
  '9': 'https://i.postimg.cc/9FZvXqYL/megapack-9.jpg',
  '10': 'https://i.postimg.cc/9FZvXqYL/megapack-10.jpg',
  // Agregar más según tengas las imágenes
}

async function sincronizarTiendaBot() {
  console.log('🔄 SINCRONIZACIÓN TIENDA <-> BOT\n')
  console.log('='.repeat(60))

  try {
    // 1. BUSCAR PRODUCTOS DUPLICADOS
    console.log('\n📦 1. Buscando productos duplicados...')
    
    const todosLosProductos = await db.product.findMany({
      orderBy: { createdAt: 'asc' }
    })

    const productosPorNombre = new Map<string, any[]>()
    
    todosLosProductos.forEach(producto => {
      const nombre = producto.name.toLowerCase().trim()
      if (!productosPorNombre.has(nombre)) {
        productosPorNombre.set(nombre, [])
      }
      productosPorNombre.get(nombre)!.push(producto)
    })

    // Encontrar duplicados
    const duplicados: any[] = []
    productosPorNombre.forEach((productos, nombre) => {
      if (productos.length > 1) {
        duplicados.push({
          nombre,
          productos
        })
      }
    })

    if (duplicados.length === 0) {
      console.log('   ✅ No se encontraron duplicados')
    } else {
      console.log(`   ⚠️  Encontrados ${duplicados.length} productos duplicados`)
      
      // Mostrar duplicados
      for (const dup of duplicados) {
        console.log(`\n   📌 "${dup.nombre}" (${dup.productos.length} copias)`)
        dup.productos.forEach((p: any, i: number) => {
          console.log(`      ${i + 1}. ID: ${p.id} | Precio: ${p.price} | Creado: ${p.createdAt.toLocaleDateString()}`)
        })
      }

      // Preguntar si eliminar duplicados
      console.log('\n   🗑️  Eliminando duplicados (manteniendo el más reciente)...')
      
      let eliminados = 0
      for (const dup of duplicados) {
        // Ordenar por fecha de creación (más reciente primero)
        const ordenados = dup.productos.sort((a: any, b: any) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        )
        
        // Mantener el primero (más reciente), eliminar el resto
        const aMantener = ordenados[0]
        const aEliminar = ordenados.slice(1)
        
        for (const producto of aEliminar) {
          await db.product.delete({
            where: { id: producto.id }
          })
          eliminados++
          console.log(`      ❌ Eliminado: ${producto.id}`)
        }
        
        console.log(`      ✅ Mantenido: ${aMantener.id} (más reciente)`)
      }
      
      console.log(`\n   ✅ ${eliminados} productos duplicados eliminados`)
    }

    // 2. ACTUALIZAR IMÁGENES DE MEGAPACKS
    console.log('\n\n📸 2. Actualizando imágenes de megapacks individuales...')
    
    const megapacks = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: 'megapack', mode: 'insensitive' } },
          { name: { contains: 'mega pack', mode: 'insensitive' } }
        ]
      }
    })

    console.log(`   Encontrados ${megapacks.length} megapacks`)

    let actualizados = 0
    for (const megapack of megapacks) {
      // Extraer número del megapack
      const match = megapack.name.match(/megapack\s*(\d+)/i) || 
                    megapack.name.match(/mega\s*pack\s*(\d+)/i)
      
      if (match) {
        const numero = match[1]
        const imagenUrl = MEGAPACK_IMAGES[numero]
        
        if (imagenUrl) {
          // Actualizar imagen
          await db.product.update({
            where: { id: megapack.id },
            data: {
              images: JSON.stringify([imagenUrl])
            }
          })
          
          console.log(`   ✅ Megapack ${numero}: Imagen actualizada`)
          actualizados++
        } else {
          console.log(`   ⚠️  Megapack ${numero}: No hay imagen disponible`)
        }
      } else {
        console.log(`   ⚠️  "${megapack.name}": No se pudo extraer número`)
      }
    }

    console.log(`\n   ✅ ${actualizados} imágenes de megapacks actualizadas`)

    // 3. VERIFICAR SINCRONIZACIÓN
    console.log('\n\n🔍 3. Verificando sincronización...')
    
    const productosFinales = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        status: true,
        images: true
      },
      orderBy: { name: 'asc' }
    })

    console.log(`\n   📊 Total de productos: ${productosFinales.length}`)
    
    // Agrupar por categoría
    const porCategoria = productosFinales.reduce((acc: any, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {})

    console.log('\n   📋 Por categoría:')
    Object.entries(porCategoria).forEach(([cat, count]) => {
      console.log(`      • ${cat}: ${count}`)
    })

    // Verificar productos sin imágenes
    const sinImagenes = productosFinales.filter(p => {
      if (!p.images) return true
      try {
        const imgs = JSON.parse(p.images as string)
        return !Array.isArray(imgs) || imgs.length === 0
      } catch {
        return true
      }
    })

    if (sinImagenes.length > 0) {
      console.log(`\n   ⚠️  ${sinImagenes.length} productos sin imágenes:`)
      sinImagenes.forEach(p => {
        console.log(`      • ${p.name}`)
      })
    } else {
      console.log('\n   ✅ Todos los productos tienen imágenes')
    }

    // 4. RESUMEN FINAL
    console.log('\n\n' + '='.repeat(60))
    console.log('✅ SINCRONIZACIÓN COMPLETADA')
    console.log('='.repeat(60))
    console.log(`\n📊 Resumen:`)
    console.log(`   • Duplicados eliminados: ${eliminados || 0}`)
    console.log(`   • Imágenes actualizadas: ${actualizados}`)
    console.log(`   • Total productos: ${productosFinales.length}`)
    console.log(`   • Productos sin imágenes: ${sinImagenes.length}`)

    console.log('\n💡 Próximos pasos:')
    console.log('   1. Verifica la tienda: http://localhost:3000/tienda')
    console.log('   2. Verifica el catálogo: http://localhost:3000/catalogo')
    console.log('   3. Prueba el bot de WhatsApp')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
sincronizarTiendaBot()
