/**
 * 📦 Importar productos de MegaComputer a la base de datos
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function importarMegaComputer() {
  try {
    console.log('📦 Importando productos de MegaComputer a la base de datos...\n')

    const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
    if (!admin) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    // Leer el archivo JSON
    const jsonPath = path.join(process.cwd(), 'scripts', 'productos-megacomputer-completo.json')
    const productos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

    console.log(`📊 Encontrados ${productos.length} productos en el JSON\n`)

    let importados = 0
    let errores = 0

    for (const prod of productos) {
      try {
        // Limpiar precio (quitar texto extra)
        const precioMatch = prod.precio.match(/\$([0-9.,]+)/)
        const precioLimpio = precioMatch ? 
          parseInt(precioMatch[1].replace(/\./g, '').replace(',', '')) : 
          0

        // Generar tags automáticamente
        const tags = [
          prod.categoria.toLowerCase(),
          ...prod.nombre.toLowerCase().split(' ').slice(0, 5)
        ].filter(t => t.length > 2)

        await db.product.create({
          data: {
            name: prod.nombre,
            description: `${prod.nombre}

📦 Categoría: ${prod.categoria}
💰 Precio: ${prod.precio}
🔗 Más info: ${prod.link}

Producto disponible en MegaComputer.
Contacto: +57 304 274 8687`,
            price: precioLimpio,
            currency: 'COP',
            category: 'PHYSICAL',
            images: JSON.stringify(prod.imagen ? [prod.imagen] : []),
            tags: JSON.stringify(tags),
            autoResponse: `📦 ${prod.nombre}

💰 Precio: ${prod.precio}
📂 Categoría: ${prod.categoria}

📞 Contacto: +57 304 274 8687
📍 Ubicación: Cali, Valle del Cauca

¿Te gustaría más información sobre este producto?`,
            userId: admin.id
          }
        })

        importados++
        
        if (importados % 10 === 0) {
          console.log(`   ✅ Importados ${importados}/${productos.length}...`)
        }

      } catch (error) {
        errores++
        console.error(`   ❌ Error importando "${prod.nombre}":`, error.message)
      }
    }

    console.log(`\n🎉 Importación completada!`)
    console.log(`   ✅ Importados: ${importados}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log(`   📊 Total en DB: ${importados + errores}`)

    // Mostrar resumen por categoría
    const resumen = await db.product.groupBy({
      by: ['category'],
      _count: true
    })

    console.log('\n📊 Resumen de productos en la base de datos:')
    for (const item of resumen) {
      console.log(`   ${item.category}: ${item._count} productos`)
    }

    const totalProductos = await db.product.count()
    console.log(`\n📦 TOTAL DE PRODUCTOS: ${totalProductos}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

importarMegaComputer()
