const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function reimportarTodoLimpio() {
  console.log('🔄 REIMPORTACIÓN COMPLETA CON FOTOS CORRECTAS\n')
  
  try {
    const usuario = await prisma.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })
    
    if (!usuario) {
      console.error('❌ Usuario no encontrado')
      return
    }
    
    console.log(`👤 Usuario: ${usuario.email}\n`)
    
    // PASO 1: Eliminar TODOS los productos actuales
    console.log('🗑️  PASO 1: Eliminando productos actuales...')
    const eliminados = await prisma.product.deleteMany({
      where: { userId: usuario.id }
    })
    console.log(`✅ Eliminados: ${eliminados.count} productos\n`)
    
    // PASO 2: Cargar productos de los JSON principales
    console.log('📂 PASO 2: Cargando productos desde JSON...\n')
    
    const megaPath = path.join(__dirname, 'catalogo-completo-importar.json')
    const disyvarPath = path.join(__dirname, 'scripts/disyvar-productos.json')
    
    let productosParaImportar = []
    
    // MegaComputer
    if (fs.existsSync(megaPath)) {
      const mega = JSON.parse(fs.readFileSync(megaPath, 'utf8'))
      console.log(`✅ MegaComputer: ${mega.length} productos`)
      productosParaImportar = productosParaImportar.concat(mega)
    }
    
    // Disyvar
    if (fs.existsSync(disyvarPath)) {
      const disyvar = JSON.parse(fs.readFileSync(disyvarPath, 'utf8'))
      console.log(`✅ Disyvar: ${disyvar.length} productos`)
      productosParaImportar = productosParaImportar.concat(disyvar)
    }
    
    console.log(`\n📦 Total a importar: ${productosParaImportar.length}\n`)
    
    // PASO 3: Filtrar productos válidos (con nombre, precio y fotos)
    console.log('🔍 PASO 3: Filtrando productos válidos...\n')
    
    const productosValidos = productosParaImportar.filter(p => {
      if (!p || !p.name || !p.price) return false
      
      const fotos = p.images || []
      if (fotos.length === 0) {
        console.log(`⚠️  Sin fotos: ${p.name}`)
        return false
      }
      
      return true
    })
    
    console.log(`\n✅ Productos válidos con fotos: ${productosValidos.length}\n`)
    
    // PASO 4: Eliminar duplicados (mismo nombre + precio)
    console.log('🧹 PASO 4: Eliminando duplicados...\n')
    
    const productosUnicos = {}
    productosValidos.forEach(p => {
      const clave = `${p.name.trim().toLowerCase()}|${p.price}`
      if (!productosUnicos[clave]) {
        productosUnicos[clave] = p
      }
    })
    
    const listaFinal = Object.values(productosUnicos)
    console.log(`✅ Productos únicos: ${listaFinal.length}\n`)
    
    // PASO 5: Importar productos
    console.log('📥 PASO 5: Importando productos...\n')
    
    let importados = 0
    let errores = 0
    
    for (const producto of listaFinal) {
      try {
        await prisma.product.create({
          data: {
            name: producto.name,
            description: producto.description || '',
            price: producto.price,
            currency: producto.currency || 'COP',
            category: producto.category || 'PHYSICAL',
            status: producto.status || 'AVAILABLE',
            images: JSON.stringify(producto.images || []),
            tags: Array.isArray(producto.tags) 
              ? producto.tags.join(',') 
              : (producto.tags || ''),
            userId: usuario.id
          }
        })
        importados++
        
        if (importados % 20 === 0) {
          console.log(`   Importados: ${importados}/${listaFinal.length}`)
        }
      } catch (error) {
        errores++
        console.error(`❌ Error: ${producto.name}`)
      }
    }
    
    console.log('\n━'.repeat(60))
    console.log('📊 RESUMEN FINAL:')
    console.log('━'.repeat(60))
    console.log(`✅ Productos importados: ${importados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📸 Todos con fotos reales: 100%`)
    console.log(`🎯 Sin duplicados: ✓`)
    
    console.log('\n🎉 ¡Reimportación completada!')
    console.log('\n🌐 Ver productos en:')
    console.log('   Tienda: http://localhost:3000/tienda')
    console.log('   Catálogo: http://localhost:3000/catalogo')
    
  } catch (error) {
    console.error('❌ Error fatal:', error)
  } finally {
    await prisma.$disconnect()
  }
}

reimportarTodoLimpio()
