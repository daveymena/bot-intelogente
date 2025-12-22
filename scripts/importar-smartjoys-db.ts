/**
 * 📦 Importar productos de SmartJoys a la base de datos
 * Ejecutar: npx tsx scripts/importar-smartjoys-db.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ProductoSmartJoys {
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  url: string
  category: string
  inStock: boolean
}

// Margen de ganancia para dropshipping
const MARGEN_GANANCIA = 20000 // $20,000 COP

function generarDescripcionMejorada(producto: ProductoSmartJoys): string {
  const precioFinal = producto.price + MARGEN_GANANCIA
  
  let desc = `${producto.description}\n\n`
  
  if (producto.discount) {
    desc += `🔥 ¡OFERTA! ${producto.discount}% de descuento\n`
  }
  
  desc += `💰 Precio: $${precioFinal.toLocaleString()} COP\n`
  desc += `📦 Producto de dropshipping SmartJoys\n`
  desc += `🚚 Envío a toda Colombia\n`
  desc += `⏱️ Tiempo de entrega: 3-5 días hábiles\n`
  desc += `✅ Producto ${producto.inStock ? 'disponible' : 'bajo pedido'}\n`
  desc += `\n🔗 Más información: ${producto.url}`
  
  return desc
}

function generarTags(producto: ProductoSmartJoys): string[] {
  const tags: string[] = ['dropshipping', 'smartjoys']
  
  const nombre = producto.name.toLowerCase()
  
  // Tags por tipo de producto
  if (nombre.includes('audifonos') || nombre.includes('earbuds') || nombre.includes('airpods')) {
    tags.push('audifonos', 'audio', 'bluetooth', 'inalambrico')
  }
  if (nombre.includes('smartwatch') || nombre.includes('reloj')) {
    tags.push('smartwatch', 'reloj', 'wearable', 'fitness')
  }
  if (nombre.includes('cargador') || nombre.includes('cable')) {
    tags.push('cargador', 'cable', 'accesorio', 'usb')
  }
  if (nombre.includes('funda') || nombre.includes('case')) {
    tags.push('funda', 'proteccion', 'accesorio')
  }
  if (nombre.includes('parlante') || nombre.includes('speaker')) {
    tags.push('parlante', 'audio', 'bluetooth', 'speaker')
  }
  if (nombre.includes('mouse') || nombre.includes('teclado')) {
    tags.push('accesorio', 'computador', 'gaming')
  }
  if (nombre.includes('camara') || nombre.includes('webcam')) {
    tags.push('camara', 'video', 'streaming')
  }
  if (nombre.includes('lampara') || nombre.includes('luz')) {
    tags.push('iluminacion', 'led', 'smart')
  }
  
  // Marcas comunes
  const marcas = ['samsung', 'apple', 'xiaomi', 'huawei', 'jbl', 'sony', 'anker', 'baseus']
  marcas.forEach(marca => {
    if (nombre.includes(marca)) {
      tags.push(marca)
    }
  })
  
  // Tags de descuento
  if (producto.discount && producto.discount > 20) {
    tags.push('oferta', 'descuento')
  }
  
  return [...new Set(tags)]
}

async function importarSmartJoys() {
  console.log('🔄 ========================================')
  console.log('🔄 IMPORTANDO PRODUCTOS SMARTJOYS')
  console.log('🔄 ========================================\n')
  
  try {
    // Leer archivo JSON generado por el scraper
    const jsonPath = path.join(process.cwd(), 'scripts', 'productos-dropshipping.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró el archivo productos-dropshipping.json')
      console.log('💡 Primero ejecuta: npx tsx scripts/scrape-smartjoys-final.ts')
      return
    }
    
    const productosSmartJoys: ProductoSmartJoys[] = JSON.parse(
      fs.readFileSync(jsonPath, 'utf-8')
    )

    // Buscar usuario admin
    const usuario = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'daveymena16@gmail.com' },
          { email: 'deinermena25@gmail.com' }
        ]
      }
    })

    if (!usuario) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    console.log(`✅ Usuario: ${usuario.email}`)
    console.log(`📦 Productos SmartJoys a importar: ${productosSmartJoys.length}`)
    console.log(`💰 Margen de ganancia: $${MARGEN_GANANCIA.toLocaleString()} COP\n`)

    let creados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productosSmartJoys) {
      try {
        const precioFinal = producto.price + MARGEN_GANANCIA
        const descripcion = generarDescripcionMejorada(producto)
        const tags = generarTags(producto)

        // Verificar si ya existe
        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        })

        const datosProducto = {
          name: producto.name,
          description: descripcion,
          price: precioFinal,
          currency: "COP",
          category: "PHYSICAL",
          status: producto.inStock ? "AVAILABLE" : "OUT_OF_STOCK",
          images: JSON.stringify(producto.images),
          tags: JSON.stringify(tags),
          stock: producto.inStock ? 50 : 0,
          paymentLinkCustom: producto.url
        }

        if (existente) {
          await prisma.product.update({
            where: { id: existente.id },
            data: datosProducto
          })
          console.log(`🔄 Actualizado: ${producto.name}`)
          actualizados++
        } else {
          await prisma.product.create({
            data: {
              ...datosProducto,
              userId: usuario.id
            }
          })
          console.log(`✅ Creado: ${producto.name} - $${precioFinal.toLocaleString()}`)
          if (producto.discount) {
            console.log(`   🔥 Descuento: ${producto.discount}%`)
          }
          creados++
        }
      } catch (error: any) {
        console.error(`❌ Error con ${producto.name}:`, error.message)
        errores++
      }
    }

    console.log('\n📊 ========================================')
    console.log('📊 RESUMEN FINAL')
    console.log('📊 ========================================')
    console.log(`✅ Productos creados: ${creados}`)
    console.log(`🔄 Productos actualizados: ${actualizados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total procesados: ${productosSmartJoys.length}`)
    console.log(`💰 Margen aplicado: $${MARGEN_GANANCIA.toLocaleString()} COP`)
    console.log('\n✅ ¡Productos SmartJoys importados!')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importarSmartJoys()
