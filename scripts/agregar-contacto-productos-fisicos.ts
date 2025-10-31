import { db } from '../src/lib/db'

async function agregarContactoProductosFisicos() {
  try {
    console.log('📞 Agregando información de contacto a productos físicos...\n')

    // Obtener todos los productos que NO son Megapacks ni Curso de Piano
    const productos = await db.product.findMany({
      where: {
        AND: [
          { name: { not: { contains: 'Mega Pack' } } },
          { name: { not: { contains: 'Piano' } } }
        ]
      }
    })

    console.log(`📦 Procesando ${productos.length} productos físicos...\n`)

    for (const producto of productos) {
      const tags = producto.tags ? JSON.parse(producto.tags) : []
      
      // Verificar si ya tiene contacto
      const tieneContacto = tags.some((tag: string) => tag.startsWith('contacto:'))
      
      if (!tieneContacto) {
        // Agregar tag de contacto
        tags.push('contacto:+57 304 274 8687')
        
        await db.product.update({
          where: { id: producto.id },
          data: {
            tags: JSON.stringify(tags)
          }
        })
        
        console.log(`✅ ${producto.name}`)
      } else {
        console.log(`⏭️  ${producto.name} (ya tiene contacto)`)
      }
    }

    console.log('\n✅ Contacto agregado a todos los productos físicos')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

agregarContactoProductosFisicos()
