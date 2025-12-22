const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importarProductos() {
  console.log('📦 Importando productos con imágenes desde JSON...\n')
  
  try {
    // Leer el archivo JSON
    const jsonPath = path.join(__dirname, '../smart-sales/productos-completos.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró el archivo productos-completos.json')
      console.log('📍 Buscando en:', jsonPath)
      return
    }
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    console.log('✅ Archivo JSON cargado correctamente\n')
    
    let importados = 0
    let actualizados = 0
    
    // Obtener el primer usuario para asignar los productos
    const usuario = await prisma.user.findFirst()
    
    if (!usuario) {
      console.error('❌ No hay usuarios en la base de datos')
      console.log('💡 Crea un usuario primero desde el dashboard')
      return
    }
    
    console.log(`👤 Asignando productos al usuario: ${usuario.email}\n`)
    
    // Importar Curso de Piano
    if (data.categorias?.cursos_digitales?.productos?.curso_piano_premium) {
      const piano = data.categorias.cursos_digitales.productos.curso_piano_premium
      
      const productData = {
        name: piano.nombre,
        description: `${piano.descripcion}\n\n${piano.caracteristicas.join('\n')}`,
        price: piano.precio,
        currency: 'COP',
        category: 'DIGITAL',
        status: 'AVAILABLE',
        images: JSON.stringify([
          'https://landein-page-pian2.vercel.app/og-image.jpg',
          'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800'
        ]),
        tags: `piano,curso,digital,hotmart,${piano.enlaces.compra}`,
        userId: usuario.id
      }
      
      const existing = await prisma.product.findFirst({
        where: { name: piano.nombre, userId: usuario.id }
      })
      
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: productData
        })
        actualizados++
        console.log(`🔄 Actualizado: ${piano.nombre}`)
      } else {
        await prisma.product.create({ data: productData })
        importados++
        console.log(`✅ Importado: ${piano.nombre}`)
      }
    }
    
    // Importar Mega Packs
    if (data.categorias?.cursos_digitales?.productos?.mega_packs?.packs_disponibles) {
      const megaPacks = data.categorias.cursos_digitales.productos.mega_packs.packs_disponibles
      
      for (const categoria in megaPacks) {
        const catData = megaPacks[categoria]
        
        if (catData.packs && Array.isArray(catData.packs)) {
          for (const pack of catData.packs) {
            const productData = {
              name: pack.nombre,
              description: `${pack.descripcion || ''}\n\nCursos incluidos:\n${pack.cursos_incluidos?.join('\n') || ''}`,
              price: pack.precio,
              currency: 'COP',
              category: 'DIGITAL',
              status: 'AVAILABLE',
              images: JSON.stringify(pack.imagenes || []),
              tags: `megapack,${categoria},digital`,
              userId: usuario.id
            }
            
            const existing = await prisma.product.findFirst({
              where: { name: pack.nombre, userId: usuario.id }
            })
            
            if (existing) {
              await prisma.product.update({
                where: { id: existing.id },
                data: productData
              })
              actualizados++
              console.log(`🔄 Actualizado: ${pack.nombre}`)
            } else {
              await prisma.product.create({ data: productData })
              importados++
              console.log(`✅ Importado: ${pack.nombre}`)
            }
          }
        }
      }
    }
    
    // Importar Productos Físicos (Motos)
    if (data.categorias?.productos_fisicos?.motos) {
      const motos = data.categorias.productos_fisicos.motos
      
      for (const motoKey in motos) {
        const moto = motos[motoKey]
        
        if (moto.nombre) {
          const productData = {
            name: moto.nombre,
            description: `${moto.descripcion || ''}\n\nCaracterísticas:\n${moto.caracteristicas?.join('\n') || ''}`,
            price: moto.precio,
            currency: 'COP',
            category: 'PHYSICAL',
            status: moto.disponibilidad === 'En stock' ? 'AVAILABLE' : 'OUT_OF_STOCK',
            images: JSON.stringify(moto.imagenes || []),
            tags: `moto,${moto.marca},${moto.modelo},fisica`,
            userId: usuario.id
          }
          
          const existing = await prisma.product.findFirst({
            where: { name: moto.nombre, userId: usuario.id }
          })
          
          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: productData
            })
            actualizados++
            console.log(`🔄 Actualizado: ${moto.nombre}`)
          } else {
            await prisma.product.create({ data: productData })
            importados++
            console.log(`✅ Importado: ${moto.nombre}`)
          }
        }
      }
    }
    
    console.log(`\n📊 Resumen:`)
    console.log(`✅ Productos nuevos importados: ${importados}`)
    console.log(`🔄 Productos actualizados: ${actualizados}`)
    console.log(`📦 Total procesados: ${importados + actualizados}`)
    
    console.log(`\n🎉 ¡Importación completada!`)
    console.log(`\n💡 Ahora puedes ver los productos en:`)
    console.log(`   - Tienda: http://localhost:3000/tienda`)
    console.log(`   - Catálogo: http://localhost:3000/catalogo`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importarProductos()
