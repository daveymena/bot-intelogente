/**
 * 📦 Crear JSON de Importación Completo
 * Unifica productos de MegaComputer y Dropshipping en un solo JSON
 */

import fs from 'fs'
import path from 'path'

interface ProductoMegaComputer {
  nombre: string
  precioOriginal: number
  precioActual: number
  imagen: string
  link: string
  categoria: string
  marca?: string
  procesador?: string
  ram?: string
  almacenamiento?: string
  pantalla?: string
}

interface ProductoImportacion {
  name: string
  description: string
  price: number
  currency: string
  category: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED'
  images: string[]
  tags: string[]
  stock: number | null
  paymentLinkMercadoPago?: string
  paymentLinkPayPal?: string
  paymentLinkCustom?: string
}

async function crearJSONCompleto() {
  console.log('📦 CREANDO JSON DE IMPORTACIÓN COMPLETO\n')
  console.log('=' .repeat(70))

  const productosFinales: ProductoImportacion[] = []

  // 1. LEER PRODUCTOS DE MEGACOMPUTER
  console.log('\n📂 Leyendo productos de MegaComputer...\n')

  const archivosMegaComputer = [
    'laptops-megacomputer.json',
    'impresoras-megacomputer.json',
    // Agregar más archivos si existen
  ]

  for (const archivo of archivosMegaComputer) {
    const rutaArchivo = path.join(process.cwd(), archivo)
    
    if (fs.existsSync(rutaArchivo)) {
      const contenido = fs.readFileSync(rutaArchivo, 'utf-8')
      const productos: ProductoMegaComputer[] = JSON.parse(contenido)
      
      console.log(`✅ ${archivo}: ${productos.length} productos`)

      // Convertir al formato de importación
      for (const prod of productos) {
        const productoImportacion = convertirMegaComputerAImportacion(prod)
        productosFinales.push(productoImportacion)
      }
    } else {
      console.log(`⚠️  ${archivo}: No encontrado`)
    }
  }

  // 2. LEER PRODUCTOS DE DROPSHIPPING (si existen)
  console.log('\n📂 Buscando productos de Dropshipping...\n')

  const archivosDropshipping = [
    'productos-dropi.json',
    'productos-dropshipping.json',
    // Agregar más si existen
  ]

  for (const archivo of archivosDropshipping) {
    const rutaArchivo = path.join(process.cwd(), archivo)
    
    if (fs.existsSync(rutaArchivo)) {
      const contenido = fs.readFileSync(rutaArchivo, 'utf-8')
      const productos = JSON.parse(contenido)
      
      console.log(`✅ ${archivo}: ${productos.length} productos`)

      // Si ya están en formato correcto, agregarlos directamente
      // Si no, convertirlos
      for (const prod of productos) {
        if (esFormatoCorrecto(prod)) {
          productosFinales.push(prod)
        } else {
          // Convertir si es necesario
          const productoImportacion = convertirDropshippingAImportacion(prod)
          productosFinales.push(productoImportacion)
        }
      }
    } else {
      console.log(`ℹ️  ${archivo}: No encontrado`)
    }
  }

  // 3. ELIMINAR DUPLICADOS
  console.log('\n🔍 Eliminando duplicados...\n')
  const productosUnicos = eliminarDuplicados(productosFinales)
  console.log(`   Productos antes: ${productosFinales.length}`)
  console.log(`   Productos después: ${productosUnicos.length}`)
  console.log(`   Duplicados eliminados: ${productosFinales.length - productosUnicos.length}`)

  // 4. GUARDAR JSON FINAL
  const nombreArchivo = 'productos-importacion-completo.json'
  const rutaFinal = path.join(process.cwd(), nombreArchivo)
  
  fs.writeFileSync(
    rutaFinal,
    JSON.stringify(productosUnicos, null, 2),
    'utf-8'
  )

  console.log(`\n✅ JSON creado: ${nombreArchivo}`)
  console.log(`📊 Total de productos: ${productosUnicos.length}`)

  // 5. ESTADÍSTICAS
  console.log('\n📊 ESTADÍSTICAS:\n')
  
  const porCategoria = productosUnicos.reduce((acc, prod) => {
    acc[prod.category] = (acc[prod.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('Por categoría:')
  Object.entries(porCategoria).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`)
  })

  const conImagenes = productosUnicos.filter(p => p.images.length > 0).length
  const sinImagenes = productosUnicos.length - conImagenes

  console.log(`\nCon imágenes: ${conImagenes}`)
  console.log(`Sin imágenes: ${sinImagenes}`)

  const precioPromedio = productosUnicos.reduce((sum, p) => sum + p.price, 0) / productosUnicos.length
  console.log(`\nPrecio promedio: $${Math.round(precioPromedio).toLocaleString('es-CO')} COP`)

  console.log('\n' + '=' .repeat(70))
  console.log('\n✅ JSON listo para importar')
  console.log(`\n💡 Para importar ejecuta:`)
  console.log(`   npx tsx scripts/import-productos-completos.ts`)
}

/**
 * Convertir producto de MegaComputer al formato de importación
 */
function convertirMegaComputerAImportacion(prod: ProductoMegaComputer): ProductoImportacion {
  // Generar descripción
  const specs: string[] = []
  if (prod.procesador) specs.push(prod.procesador)
  if (prod.ram) specs.push(`RAM ${prod.ram}`)
  if (prod.almacenamiento) specs.push(prod.almacenamiento)
  if (prod.pantalla) specs.push(prod.pantalla)

  const description = `${prod.nombre}. ${specs.join(' • ')}. Producto original con garantía. Envío a toda Colombia.`

  // Generar tags
  const tags = generarTags(prod)

  return {
    name: prod.nombre,
    description,
    price: prod.precioActual,
    currency: 'COP',
    category: 'PHYSICAL',
    status: 'AVAILABLE',
    images: prod.imagen ? [prod.imagen] : [],
    tags,
    stock: 5, // Stock por defecto
    paymentLinkCustom: prod.link
  }
}

/**
 * Convertir producto de Dropshipping al formato de importación
 */
function convertirDropshippingAImportacion(prod: any): ProductoImportacion {
  return {
    name: prod.name || prod.nombre || prod.title,
    description: prod.description || prod.descripcion || `${prod.name}. Producto de calidad. Envío a toda Colombia.`,
    price: prod.price || prod.precio || 0,
    currency: 'COP',
    category: 'PHYSICAL',
    status: 'AVAILABLE',
    images: Array.isArray(prod.images) ? prod.images : (prod.imagen ? [prod.imagen] : []),
    tags: Array.isArray(prod.tags) ? prod.tags : generarTagsBasicos(prod.name || prod.nombre),
    stock: prod.stock || null,
    paymentLinkCustom: prod.link || prod.url || ''
  }
}

/**
 * Generar tags inteligentes para un producto
 */
function generarTags(prod: ProductoMegaComputer): string[] {
  const tags: string[] = []
  const nombre = prod.nombre.toLowerCase()

  // Categoría general
  if (nombre.includes('laptop') || nombre.includes('portatil') || nombre.includes('notebook')) {
    tags.push('laptop', 'portatil', 'computador', 'notebook')
  }
  if (nombre.includes('impresora')) {
    tags.push('impresora', 'printer', 'oficina')
  }
  if (nombre.includes('monitor')) {
    tags.push('monitor', 'pantalla', 'display')
  }
  if (nombre.includes('tablet')) {
    tags.push('tablet', 'tableta')
  }

  // Marca
  if (prod.marca) {
    tags.push(prod.marca.toLowerCase())
  }

  // Procesador
  if (prod.procesador) {
    const proc = prod.procesador.toLowerCase()
    if (proc.includes('intel')) tags.push('intel')
    if (proc.includes('amd')) tags.push('amd')
    if (proc.includes('ryzen')) tags.push('ryzen')
    if (proc.includes('core i5')) tags.push('core i5', 'i5')
    if (proc.includes('core i7')) tags.push('core i7', 'i7')
    if (proc.includes('core i9')) tags.push('core i9', 'i9')
  }

  // RAM
  if (prod.ram) {
    const ram = prod.ram.toLowerCase()
    if (ram.includes('8gb')) tags.push('8gb ram')
    if (ram.includes('16gb')) tags.push('16gb ram')
    if (ram.includes('32gb')) tags.push('32gb ram')
  }

  // Almacenamiento
  if (prod.almacenamiento) {
    const storage = prod.almacenamiento.toLowerCase()
    if (storage.includes('ssd')) tags.push('ssd')
    if (storage.includes('512gb')) tags.push('512gb ssd')
    if (storage.includes('1tb')) tags.push('1tb ssd')
  }

  // Estado
  tags.push('nuevo', 'original', 'garantia')

  // Uso
  tags.push('trabajo', 'estudio', 'profesional')

  return [...new Set(tags)] // Eliminar duplicados
}

/**
 * Generar tags básicos desde el nombre
 */
function generarTagsBasicos(nombre: string): string[] {
  const tags: string[] = []
  const nombreLower = nombre.toLowerCase()

  // Palabras clave comunes
  const palabrasClave = ['laptop', 'tablet', 'mouse', 'teclado', 'monitor', 'impresora', 'auriculares', 'camara']
  
  palabrasClave.forEach(palabra => {
    if (nombreLower.includes(palabra)) {
      tags.push(palabra)
    }
  })

  tags.push('nuevo', 'garantia')

  return tags
}

/**
 * Verificar si un producto ya está en formato correcto
 */
function esFormatoCorrecto(prod: any): boolean {
  return (
    typeof prod.name === 'string' &&
    typeof prod.price === 'number' &&
    typeof prod.currency === 'string' &&
    typeof prod.category === 'string' &&
    Array.isArray(prod.images) &&
    Array.isArray(prod.tags)
  )
}

/**
 * Eliminar productos duplicados por nombre
 */
function eliminarDuplicados(productos: ProductoImportacion[]): ProductoImportacion[] {
  const vistos = new Map<string, ProductoImportacion>()

  for (const prod of productos) {
    const nombreNormalizado = prod.name.toLowerCase().trim()
    
    if (!vistos.has(nombreNormalizado)) {
      vistos.set(nombreNormalizado, prod)
    } else {
      // Si ya existe, mantener el que tenga más información
      const existente = vistos.get(nombreNormalizado)!
      if (prod.images.length > existente.images.length || prod.description.length > existente.description.length) {
        vistos.set(nombreNormalizado, prod)
      }
    }
  }

  return Array.from(vistos.values())
}

// Ejecutar
crearJSONCompleto()
  .then(() => {
    console.log('\n✅ Script completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    console.error(error.stack)
    process.exit(1)
  })
