const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function diagnosticarFotosIncorrectas() {
  console.log('🔍 Diagnosticando fotos incorrectas...\n')
  
  try {
    const usuario = await prisma.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    })
    
    if (!usuario) {
      console.error('❌ Usuario no encontrado')
      return
    }
    
    // Cargar TODOS los JSON
    const archivosJSON = [
      'catalogo-completo-importar.json',
      'scripts/productos-megacomputer.json',
      'scripts/disyvar-productos.json'
    ]
    
    let todosLosProductosJSON = []
    
    console.log('📂 Cargando archivos JSON...\n')
    
    for (const archivo of archivosJSON) {
      const rutaCompleta = path.join(__dirname, archivo)
      if (fs.existsSync(rutaCompleta)) {
        try {
          const contenido = JSON.parse(fs.readFileSync(rutaCompleta, 'utf8'))
          const productos = Array.isArray(contenido) ? contenido : []
          
          if (productos.length > 0) {
            todosLosProductosJSON = todosLosProductosJSON.concat(productos)
            console.log(`✅ ${archivo}: ${productos.length} productos`)
          }
        } catch (e) {
          console.log(`⚠️  Error leyendo ${archivo}`)
        }
      }
    }
    
    console.log(`\n📦 Total productos en JSON: ${todosLosProductosJSON.length}\n`)
    
    // Crear índice por nombre Y precio
    const indiceProductos = {}
    todosLosProductosJSON.forEach(p => {
      if (p && p.name && p.price) {
        const clave = `${p.name.trim().toLowerCase()}|${p.price}`
        if (!indiceProductos[clave]) {
          indiceProductos[clave] = p
        }
      }
    })
    
    // Obtener productos de la BD
    const productosBD = await prisma.product.findMany({
      where: { userId: usuario.id },
      orderBy: { name: 'asc' }
    })
    
    console.log('━'.repeat(70))
    console.log('🔍 PRODUCTOS CON POSIBLES FOTOS INCORRECTAS:\n')
    
    let problemasEncontrados = 0
    let sinFotos = 0
    let fotosCorrectas = 0
    
    for (const productoBD of productosBD) {
      // Buscar por nombre + precio
      const clave = `${productoBD.name.trim().toLowerCase()}|${productoBD.price}`
      const productoJSON = indiceProductos[clave]
      
      let fotosActuales = []
      try {
        fotosActuales = JSON.parse(productoBD.images || '[]')
      } catch (e) {
        fotosActuales = []
      }
      
      if (fotosActuales.length === 0) {
        console.log(`❌ SIN FOTOS: ${productoBD.name} - $${productoBD.price}`)
        sinFotos++
      } else if (!productoJSON) {
        console.log(`⚠️  NO ENCONTRADO EN JSON: ${productoBD.name} - $${productoBD.price}`)
        console.log(`   Fotos actuales: ${fotosActuales.length}`)
        console.log(`   Primera foto: ${fotosActuales[0]?.substring(0, 80)}...`)
        problemasEncontrados++
      } else {
        const fotosJSON = productoJSON.images || []
        const fotosIguales = JSON.stringify(fotosActuales) === JSON.stringify(fotosJSON)
        
        if (!fotosIguales) {
          console.log(`🔄 FOTOS DIFERENTES: ${productoBD.name} - $${productoBD.price}`)
          console.log(`   BD: ${fotosActuales.length} fotos`)
          console.log(`   JSON: ${fotosJSON.length} fotos`)
          problemasEncontrados++
        } else {
          fotosCorrectas++
        }
      }
    }
    
    console.log('\n━'.repeat(70))
    console.log('📊 RESUMEN:')
    console.log('━'.repeat(70))
    console.log(`✅ Fotos correctas: ${fotosCorrectas}`)
    console.log(`⚠️  Problemas encontrados: ${problemasEncontrados}`)
    console.log(`❌ Sin fotos: ${sinFotos}`)
    console.log(`📦 Total productos: ${productosBD.length}`)
    
    if (problemasEncontrados > 0 || sinFotos > 0) {
      console.log('\n💡 Ejecuta: node CORREGIR_FOTOS_POR_PRECIO.js')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnosticarFotosIncorrectas()
