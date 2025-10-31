import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function agregarEnlaces() {
  console.log('🔗 Agregando enlaces a productos...\n')

  try {
    // Leer el JSON de productos completos
    const productosPath = path.join(process.cwd(), 'scripts', 'productos-completos.json')
    const productosData = JSON.parse(fs.readFileSync(productosPath, 'utf-8'))

    let actualizados = 0

    // Actualizar Curso de Piano con enlaces
    const cursoPiano = productosData.categorias?.cursos_digitales?.productos?.curso_piano_premium
    if (cursoPiano) {
      const productos = await prisma.product.findMany()
      const producto = productos.find(p => p.name.toLowerCase().includes('piano'))

      if (producto) {
        const tags = [
          'piano',
          'curso',
          'música',
          'hotmart',
          cursoPiano.enlaces?.informacion || '',
          cursoPiano.enlaces?.compra || ''
        ].filter(t => t)

        await prisma.product.update({
          where: { id: producto.id },
          data: {
            tags: JSON.stringify(tags),
            description: cursoPiano.descripcion || producto.description
          }
        })

        actualizados++
        console.log(`✅ Curso de Piano actualizado con enlaces`)
        console.log(`   Info: ${cursoPiano.enlaces?.informacion}`)
        console.log(`   Compra: ${cursoPiano.enlaces?.compra}`)
      }
    }

    // Actualizar productos físicos con información de contacto
    const productosActualizar = await prisma.product.findMany({
      where: {
        category: 'PHYSICAL',
        OR: [
          { tags: null },
          { tags: { not: { contains: 'whatsapp' } } }
        ]
      }
    })

    for (const producto of productosActualizar) {
      const tags = []
      
      // Intentar parsear tags existentes
      try {
        const existingTags = producto.tags ? JSON.parse(producto.tags) : []
        tags.push(...existingTags.filter((t: string) => !t.startsWith('http')))
      } catch (e) {
        // Ignorar errores de parsing
      }

      // Agregar información de contacto
      tags.push('whatsapp:+573042748687')
      tags.push('email:deinermen25@gmail.com')
      tags.push('ubicacion:Cali, Valle del Cauca')

      await prisma.product.update({
        where: { id: producto.id },
        data: {
          tags: JSON.stringify(tags)
        }
      })

      actualizados++
    }

    console.log(`\n📊 RESUMEN:`)
    console.log(`✅ Productos actualizados: ${actualizados}`)
    console.log(`\n✨ Enlaces agregados exitosamente!`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

agregarEnlaces()
