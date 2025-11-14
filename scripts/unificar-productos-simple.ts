/**
 * 📦 Unificar Productos - Versión Simple
 * Combina laptops e impresoras de MegaComputer en un solo JSON
 */

import * as fs from 'fs'

console.log('📦 UNIFICANDO PRODUCTOS\n')

// Leer laptops
const laptops = JSON.parse(fs.readFileSync('laptops-megacomputer.json', 'utf-8'))
console.log(`✅ Laptops: ${laptops.length}`)

// Leer impresoras
const impresoras = JSON.parse(fs.readFileSync('impresoras-megacomputer.json', 'utf-8'))
console.log(`✅ Impresoras: ${impresoras.length}`)

// Convertir al formato correcto
const productosFinales = []

// Procesar laptops
for (const prod of laptops) {
  productosFinales.push({
    name: prod.nombre,
    description: `${prod.nombre}. Producto original con garantía. Envío a toda Colombia.`,
    price: prod.precioActual,
    currency: 'COP',
    category: 'PHYSICAL',
    status: 'AVAILABLE',
    images: prod.imagen ? [prod.imagen] : [],
    tags: ['laptop', 'portatil', 'computador', prod.marca?.toLowerCase() || '', 'nuevo', 'garantia'].filter(Boolean),
    stock: 5,
    paymentLinkCustom: prod.link
  })
}

// Procesar impresoras
for (const prod of impresoras) {
  productosFinales.push({
    name: prod.nombre,
    description: `${prod.nombre}. Producto original con garantía. Envío a toda Colombia.`,
    price: prod.precioActual,
    currency: 'COP',
    category: 'PHYSICAL',
    status: 'AVAILABLE',
    images: prod.imagen ? [prod.imagen] : [],
    tags: ['impresora', 'printer', 'oficina', prod.marca?.toLowerCase() || '', 'nuevo', 'garantia'].filter(Boolean),
    stock: 5,
    paymentLinkCustom: prod.link
  })
}

// Guardar
fs.writeFileSync(
  'productos-megacomputer-completo.json',
  JSON.stringify(productosFinales, null, 2)
)

console.log(`\n✅ JSON creado: productos-megacomputer-completo.json`)
console.log(`📊 Total: ${productosFinales.length} productos`)
console.log(`   - Laptops: ${laptops.length}`)
console.log(`   - Impresoras: ${impresoras.length}`)
