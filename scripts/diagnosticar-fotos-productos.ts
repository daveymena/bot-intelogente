/**
 * 🔍 Diagnosticar Fotos de Productos
 * Verifica qué productos tienen fotos en JSON vs BD
 */

import { db } from '../src/lib/db'
import * as fs from 'fs'

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE FOTOS DE PRODUCTOS\n')
  console.log('=' .repeat(70))

  // 1. PRODUCTOS EN LA BASE DE DATOS
  console.log('\n📊 PRODUCTOS EN LA BASE DE DATOS:\n')

  const user = await db.user.findFirst()
  if (!user) {
    console.error('❌ No hay usuarios')
    return
  }

  const productosDB = await db.product.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      price: true,
      images: true
    }
  })

  console.log(`Total en BD: ${productosDB.length}`)

  const conFotosDB = productosDB.filter(p => {
    try {
      const imgs = p.images ? JSON.parse(p.images) : []
      return imgs.length > 0
    } catch {
      return false
    }
  })

  const sinFotosDB = productosDB.length - conFotosDB.length

  console.log(`Con fotos: ${conFotosDB.length}`)
  console.log(`Sin fotos: ${sinFotosDB.length}`)

  // Mostrar productos sin fotos
  if (sinFotosDB > 0) {
    console.log('\n⚠️  PRODUCTOS SIN FOTOS EN BD:\n')
    productosDB.forEach((p, index) => {
      try {
        const imgs = p.images ? JSON.parse(p.images) : []
        if (imgs.length === 0) {
          console.log(`${index + 1}. ${p.name.substring(0, 60)}...`)
          console.log(`   ID: ${p.id}`)
          console.log(`   images field: ${p.images || 'null'}`)
          console.log()
        }
      } catch (error) {
        console.log(`${index + 1}. ${p.name.substring(0, 60)}...`)
        console.log(`   ID: ${p.id}`)
        console.log(`   ❌ Error parseando images: ${p.images}`)
        console.log()
      }
    })
  }

  // 2. PRODUCTOS EN EL JSON
  console.log('\n📄 PRODUCTOS EN EL JSON:\n')

  const jsonPath = 'catalogo-completo-importar.json'
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ No se encontró ${jsonPath}`)
    return
  }

  const productosJSON = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  
  console.log(`Total en JSON: ${productosJSON.length}`)

  const conFotosJSON = productosJSON.filter((p: any) => p.images && p.images.length > 0)
  const sinFotosJSON = productosJSON.length - conFotosJSON.length

  console.log(`Con fotos: ${conFotosJSON.length}`)
  console.log(`Sin fotos: ${sinFotosJSON.length}`)

  // 3. COMPARACIÓN
  console.log('\n🔍 COMPARACIÓN JSON vs BD:\n')

  // Buscar productos del JSON que están en BD
  let coincidencias = 0
  let fotosCoinciden = 0
  let fotosFaltanEnBD = 0

  for (const prodJSON of productosJSON) {
    const prodDB = productosDB.find(p => 
      p.name.toLowerCase().includes(prodJSON.name.toLowerCase().substring(0, 30)) ||
      prodJSON.name.toLowerCase().includes(p.name.toLowerCase().substring(0, 30))
    )

    if (prodDB) {
      coincidencias++
      
      const imgsJSON = prodJSON.images || []
      const imgsDB = prodDB.images ? JSON.parse(prodDB.images) : []

      if (imgsJSON.length > 0 && imgsDB.length === 0) {
        fotosFaltanEnBD++
      } else if (imgsJSON.length > 0 && imgsDB.length > 0) {
        fotosCoinciden++
      }
    }
  }

  console.log(`Productos que coinciden: ${coincidencias}`)
  console.log(`Con fotos en ambos: ${fotosCoinciden}`)
  console.log(`Con fotos en JSON pero NO en BD: ${fotosFaltanEnBD}`)

  // 4. PRODUCTOS QUE FALTAN FOTOS
  if (fotosFaltanEnBD > 0) {
    console.log('\n⚠️  PRODUCTOS QUE NECESITAN ACTUALIZAR FOTOS:\n')
    
    let count = 0
    for (const prodJSON of productosJSON) {
      const prodDB = productosDB.find(p => 
        p.name.toLowerCase().includes(prodJSON.name.toLowerCase().substring(0, 30)) ||
        prodJSON.name.toLowerCase().includes(p.name.toLowerCase().substring(0, 30))
      )

      if (prodDB) {
        const imgsJSON = prodJSON.images || []
        const imgsDB = prodDB.images ? JSON.parse(prodDB.images) : []

        if (imgsJSON.length > 0 && imgsDB.length === 0) {
          count++
          console.log(`${count}. ${prodDB.name.substring(0, 60)}...`)
          console.log(`   ID en BD: ${prodDB.id}`)
          console.log(`   Fotos en JSON: ${imgsJSON.length}`)
          console.log(`   Foto URL: ${imgsJSON[0]}`)
          console.log()

          if (count >= 10) {
            console.log(`   ... y ${fotosFaltanEnBD - 10} más`)
            break
          }
        }
      }
    }
  }

  // 5. PRODUCTOS QUE NO ESTÁN EN EL JSON
  console.log('\n📦 PRODUCTOS EN BD QUE NO ESTÁN EN EL JSON:\n')

  let noEnJSON = 0
  for (const prodDB of productosDB) {
    const enJSON = productosJSON.find((p: any) => 
      p.name.toLowerCase().includes(prodDB.name.toLowerCase().substring(0, 30)) ||
      prodDB.name.toLowerCase().includes(p.name.toLowerCase().substring(0, 30))
    )

    if (!enJSON) {
      noEnJSON++
      console.log(`${noEnJSON}. ${prodDB.name.substring(0, 60)}...`)
      console.log(`   Precio: $${prodDB.price.toLocaleString('es-CO')}`)
      
      const imgs = prodDB.images ? JSON.parse(prodDB.images) : []
      console.log(`   Fotos: ${imgs.length}`)
      console.log()

      if (noEnJSON >= 10) {
        console.log(`   ... y más`)
        break
      }
    }
  }

  console.log(`\nTotal de productos en BD que NO están en JSON: ${noEnJSON}`)

  // 6. RESUMEN FINAL
  console.log('\n' + '=' .repeat(70))
  console.log('\n📊 RESUMEN:\n')
  console.log(`BD: ${productosDB.length} productos (${conFotosDB.length} con fotos)`)
  console.log(`JSON: ${productosJSON.length} productos (${conFotosJSON.length} con fotos)`)
  console.log(`Coincidencias: ${coincidencias}`)
  console.log(`Necesitan actualizar fotos: ${fotosFaltanEnBD}`)
  console.log(`Productos únicos en BD: ${noEnJSON}`)
}

// Ejecutar
diagnosticar()
  .then(() => {
    console.log('\n✅ Diagnóstico completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
