const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function agregarFotosFaltantes() {
  console.log('📸 Buscando y agregando fotos faltantes...\n')
  
  try {
    const usuario = await prisma.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })
    
    if (!usuario) {
      console.error('❌ Usuario no encontrado')
      return
    }
    
    // Cargar todos los JSON con productos
    const megaPath = path.join(__dirname, 'catalogo-completo-importar.json')
    const disyvarPath = path.join(__dirname, 'scripts/disyvar-productos.json')
    
    let todosLosProductosJSON = []
    
    if (fs.existsSync(megaPath)) {
      const mega = JSON.parse(fs.readFileSync(megaPath, 'utf8'))
      todosLosProductosJSON = todosLosProductosJSON.concat(mega)
      console.log(`✅ Cargados ${mega.length} productos de MegaComputer`)
    }
    
    if (fs.existsSync(disyvarPath)) {
      const disyvar = JSON.parse(fs.readFileSync(disyvarPath, 'utf8'))
      todosLosProductosJSON = todosLosProductosJSON.concat(disyvar)
      console.log(`✅ Cargados ${disyvar.length} productos de Disyvar`)
    }
    
    console.log(`\n📦 Total productos en JSON: ${todosLosProductosJSON.length}\n`)
    
    // Obtener productos sin fotos de la BD
    const productosBD = await prisma.product.findMany({
      where: { userId: usuario.id }
    })
    
    let fotosAgregadas = 0
    let noEncontradas = 0
    
    console.log('🔍 Buscando fotos para productos sin imágenes...\n')
    
    for (const productoBD of productosBD) {
      let imagenes = []
      try {
        imagenes = JSON.parse(productoBD.images || '[]')
      } catch (e) {
        imagenes = []
      }
      
      // Si no tiene fotos, buscar en los JSON
      if (imagenes.length === 0) {
        // Buscar coincidencia exacta por nombre
        const productoJSON = todosLosProductosJSON.find(p => 
          p.name.trim().toLowerCase() === productoBD.name.trim().toLowerCase()
        )
        
        if (productoJSON && productoJSON.images && productoJSON.images.length > 0) {
          // Actualizar con las fotos encontradas
          await prisma.product.update({
            where: { id: productoBD.id },
            data: { images: JSON.stringify(productoJSON.images) }
          })
          
          console.log(`✅ Fotos agregadas: ${productoBD.name}`)
          console.log(`   📸 ${productoJSON.images.length} imagen(es)`)
          fotosAgregadas++
        } else {
          console.log(`⚠️  Sin fotos en JSON: ${productoBD.name}`)
          noEncontradas++
        }
      }
    }
    
    console.log('\n━'.repeat(50))
    console.log('📊 RESUMEN:')
    console.log('━'.repeat(50))
    console.log(`✅ Fotos agregadas: ${fotosAgregadas}`)
    console.log(`⚠️  Sin fotos en JSON: ${noEncontradas}`)
    
    // Verificar estado final
    const productosSinFotos = await prisma.product.findMany({
      where: { userId: usuario.id }
    })
    
    let finalSinFotos = 0
    productosSinFotos.forEach(p => {
      try {
        const imgs = JSON.parse(p.images || '[]')
        if (imgs.length === 0) finalSinFotos++
      } catch (e) {
        finalSinFotos++
      }
    })
    
    console.log(`\n📦 Productos finales sin fotos: ${finalSinFotos}`)
    
    if (finalSinFotos > 0) {
      console.log('\n💡 Estos productos no tienen fotos en los JSON originales.')
      console.log('   Puedes agregarlas manualmente desde el dashboard.')
    }
    
    console.log('\n🎉 ¡Proceso completado!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

agregarFotosFaltantes()
