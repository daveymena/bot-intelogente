#!/usr/bin/env tsx
/**
 * 🚀 IMPORTAR PRODUCTOS COMPLETOS CON TAGS Y LINKS
 * Importa productos con imágenes, tags y links de pago configurados
 */

import { db } from '../src/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

interface ProductoImport {
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

async function importarProductos() {
  console.log('🚀 IMPORTANDO PRODUCTOS COMPLETOS\n')

  try {
    // Leer archivo JSON (usa el catálogo completo)
    const jsonPath = join(process.cwd(), 'catalogo-completo-importar.json')
    const productos: ProductoImport[] = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    console.log(`📦 Productos a importar: ${productos.length}\n`)

    // Obtener el primer usuario (admin)
    const user = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!user) {
      console.error('❌ No se encontró un usuario admin')
      console.log('💡 Ejecuta primero: npx tsx scripts/create-admin.ts')
      return
    }

    console.log(`👤 Usuario: ${user.email}\n`)

    let importados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productos) {
      try {
        // Buscar si ya existe por nombre
        const existente = await db.product.findFirst({
          where: {
            name: producto.name,
            userId: user.id
          }
        })

        const data = {
          name: producto.name,
          description: producto.description,
          price: producto.price,
          currency: producto.currency,
          category: producto.category,
          status: producto.status,
          images: JSON.stringify(producto.images),
          tags: JSON.stringify(producto.tags),
          stock: producto.stock,
          paymentLinkMercadoPago: producto.paymentLinkMercadoPago || null,
          paymentLinkPayPal: producto.paymentLinkPayPal || null,
          paymentLinkCustom: producto.paymentLinkCustom || null,
          userId: user.id
        }

        if (existente) {
          // Actualizar
          await db.product.update({
            where: { id: existente.id },
            data
          })
          console.log(`🔄 Actualizado: ${producto.name}`)
          actualizados++
        } else {
          // Crear nuevo
          await db.product.create({ data })
          console.log(`✅ Importado: ${producto.name}`)
          importados++
        }

      } catch (error) {
        console.error(`❌ Error con ${producto.name}:`, error)
        errores++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE IMPORTACIÓN')
    console.log('='.repeat(60))
    console.log(`✅ Productos nuevos: ${importados}`)
    console.log(`🔄 Productos actualizados: ${actualizados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total procesados: ${productos.length}`)
    console.log('='.repeat(60))

    console.log('\n✨ PRÓXIMOS PASOS:')
    console.log('1. Ve al dashboard y verifica los productos')
    console.log('2. Agrega tus links de pago reales en cada producto')
    console.log('3. Ajusta los precios si es necesario')
    console.log('4. ¡Prueba el bot enviando mensajes con los tags!')
    console.log('\n💡 Ejemplo: "Quiero un laptop" o "Necesito el curso de piano"')

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await db.$disconnect()
  }
}

importarProductos()
