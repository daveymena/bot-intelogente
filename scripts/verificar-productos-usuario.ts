/**
 * 🔍 VERIFICAR PRODUCTOS POR USUARIO
 * Muestra qué usuarios tienen productos y cuáles son
 */

import { db } from '../src/lib/db'

async function verificarProductos() {
  console.log('🔍 VERIFICANDO PRODUCTOS POR USUARIO\n')

  try {
    // Obtener todos los usuarios
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`👥 Usuarios encontrados: ${users.length}\n`)

    for (const user of users) {
      console.log(`═══════════════════════════════════════════════════`)
      console.log(`👤 Usuario: ${user.email}`)
      console.log(`📧 Email: ${user.email}`)
      console.log(`🆔 ID: ${user.id}`)
      
      // Contar productos
      const totalProducts = await db.product.count({
        where: { userId: user.id }
      })

      const availableProducts = await db.product.count({
        where: { 
          userId: user.id,
          status: 'AVAILABLE'
        }
      })

      console.log(`📦 Total productos: ${totalProducts}`)
      console.log(`✅ Productos disponibles: ${availableProducts}`)

      if (availableProducts > 0) {
        // Buscar productos de idiomas
        const idiomasProducts = await db.product.findMany({
          where: {
            userId: user.id,
            status: 'AVAILABLE',
            OR: [
              { name: { contains: 'idioma', mode: 'insensitive' } },
              { description: { contains: 'idioma', mode: 'insensitive' } },
              { tags: { contains: 'idioma', mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true
          }
        })

        // Buscar productos de música
        const musicaProducts = await db.product.findMany({
          where: {
            userId: user.id,
            status: 'AVAILABLE',
            OR: [
              { name: { contains: 'música', mode: 'insensitive' } },
              { name: { contains: 'musica', mode: 'insensitive' } },
              { description: { contains: 'música', mode: 'insensitive' } },
              { description: { contains: 'musica', mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true
          }
        })

        console.log(`\n🎯 Productos de IDIOMAS: ${idiomasProducts.length}`)
        if (idiomasProducts.length > 0) {
          idiomasProducts.forEach(p => {
            console.log(`   - ${p.name}`)
          })
        }

        console.log(`\n🎵 Productos de MÚSICA: ${musicaProducts.length}`)
        if (musicaProducts.length > 0) {
          musicaProducts.forEach(p => {
            console.log(`   - ${p.name}`)
          })
        }

        // Mostrar algunos productos de ejemplo
        const sampleProducts = await db.product.findMany({
          where: {
            userId: user.id,
            status: 'AVAILABLE'
          },
          select: {
            name: true,
            category: true
          },
          take: 5
        })

        console.log(`\n📋 Ejemplos de productos:`)
        sampleProducts.forEach(p => {
          console.log(`   - ${p.name} (${p.category || 'Sin categoría'})`)
        })
      }

      console.log('')
    }

    // Resumen
    console.log('═══════════════════════════════════════════════════')
    console.log('RESUMEN')
    console.log('═══════════════════════════════════════════════════\n')

    const userWithProducts = users.find(async (user) => {
      const count = await db.product.count({
        where: { 
          userId: user.id,
          status: 'AVAILABLE'
        }
      })
      return count > 0
    })

    if (userWithProducts) {
      console.log(`✅ Usuario recomendado para tests: ${userWithProducts.email}`)
      console.log(`🆔 ID: ${userWithProducts.id}`)
    } else {
      console.log('⚠️ No se encontraron usuarios con productos disponibles')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
verificarProductos()
