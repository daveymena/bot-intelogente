/**
 * 📦 Importar productos de MegaComputer a la base de datos
 * Ejecutar: npx tsx scripts/importar-megacomputer-db.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ProductoMegaComputer {
  nombre: string
  precio: string
  imagen: string
  link: string
  categoria: string
}

function parsePrecio(precioTexto: string): number {
  // Extraer números del texto: "$1.329.900" -> 1329900
  const cleaned = precioTexto.replace(/[^\d]/g, '')
  const precio = parseInt(cleaned)
  return isNaN(precio) ? 0 : precio
}

function generarDescripcion(producto: ProductoMegaComputer): string {
  return `${producto.nombre}

📦 Producto original con garantía
🚚 Envío a toda Colombia
💳 Múltiples métodos de pago disponibles
✅ Stock disponible

Categoría: ${producto.categoria}

Más información: ${producto.link}`
}

function generarTags(producto: ProductoMegaComputer): string[] {
  const tags: string[] = []
  
  // Tags por categoría
  const categoria = producto.categoria.toLowerCase()
  tags.push(categoria)
  
  // Tags por nombre
  const nombre = producto.nombre.toLowerCase()
  
  if (nombre.includes('portatil') || nombre.includes('laptop')) {
    tags.push('laptop', 'portatil', 'computador')
  }
  if (nombre.includes('impresora')) {
    tags.push('impresora', 'printer', 'oficina')
  }
  if (nombre.includes('monitor')) {
    tags.push('monitor', 'pantalla', 'display')
  }
  if (nombre.includes('mouse')) {
    tags.push('mouse', 'raton', 'accesorio')
  }
  if (nombre.includes('teclado')) {
    tags.push('teclado', 'keyboard', 'accesorio')
  }
  if (nombre.includes('diadema') || nombre.includes('audifonos')) {
    tags.push('audio', 'audifonos', 'diadema')
  }
  if (nombre.includes('parlante')) {
    tags.push('audio', 'parlante', 'speaker')
  }
  
  // Marcas comunes
  const marcas = ['asus', 'hp', 'dell', 'lenovo', 'acer', 'epson', 'canon', 'brother', 'logitech', 'razer']
  marcas.forEach(marca => {
    if (nombre.includes(marca)) {
      tags.push(marca)
    }
  })
  
  // Tags generales
  tags.push('nuevo', 'garantia', 'megacomputer')
  
  return [...new Set(tags)] // Remover duplicados
}

async function importarMegaComputer() {
  console.log('🔄 ========================================')
  console.log('🔄 IMPORTANDO PRODUCTOS MEGACOMPUTER')
  console.log('🔄 ========================================\n')
  
  try {
    // Leer archivo JSON generado por el scraper
    const jsonPath = path.join(process.cwd(), 'scripts', 'productos-megacomputer-completo.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró el archivo productos-megacomputer-completo.json')
      console.log('💡 Primero ejecuta: node scripts/scraper-megacomputer-completo.js')
      return
    }
    
    const productosMegaComputer: ProductoMegaComputer[] = JSON.parse(
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
    console.log(`📦 Productos MegaComputer a importar: ${productosMegaComputer.length}\n`)

    let creados = 0
    let actualizados = 0
    let errores = 0
    let sinPrecio = 0

    for (const producto of productosMegaComputer) {
      try {
        const precio = parsePrecio(producto.precio)
        
        if (precio === 0) {
          console.log(`⚠️  Sin precio: ${producto.nombre}`)
          sinPrecio++
          continue
        }

        const descripcion = generarDescripcion(producto)
        const tags = generarTags(producto)
        const images = producto.imagen ? [producto.imagen] : []

        // Verificar si ya existe
        const existente = await prisma.product.findFirst({
          where: {
            name: producto.nombre,
            userId: usuario.id
          }
        })

        const datosProducto = {
          name: producto.nombre,
          description: descripcion,
          price: precio,
          currency: "COP",
          category: "PHYSICAL",
          status: "AVAILABLE",
          images: JSON.stringify(images),
          tags: JSON.stringify(tags),
          stock: 5, // Stock por defecto
          paymentLinkCustom: producto.link
        }

        if (existente) {
          await prisma.product.update({
            where: { id: existente.id },
            data: datosProducto
          })
          console.log(`🔄 Actualizado: ${producto.nombre} - $${precio.toLocaleString()}`)
          actualizados++
        } else {
          await prisma.product.create({
            data: {
              ...datosProducto,
              userId: usuario.id
            }
          })
          console.log(`✅ Creado: ${producto.nombre} - $${precio.toLocaleString()}`)
          creados++
        }
      } catch (error: any) {
        console.error(`❌ Error con ${producto.nombre}:`, error.message)
        errores++
      }
    }

    console.log('\n📊 ========================================')
    console.log('📊 RESUMEN FINAL')
    console.log('📊 ========================================')
    console.log(`✅ Productos creados: ${creados}`)
    console.log(`🔄 Productos actualizados: ${actualizados}`)
    console.log(`⚠️  Sin precio: ${sinPrecio}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total procesados: ${productosMegaComputer.length}`)
    console.log('\n✅ ¡Productos MegaComputer importados!')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importarMegaComputer()
