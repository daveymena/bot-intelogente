/**
 * Verificar que existen productos de idiomas en la base de datos
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verificarProductosIdiomas() {
  console.log('🔍 VERIFICANDO PRODUCTOS DE IDIOMAS EN BASE DE DATOS\n')
  console.log('='.repeat(70))

  try {
    // Buscar productos que contengan "idioma" en nombre o descripción
    const productos = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'idioma', mode: 'insensitive' } },
          { name: { contains: 'ingles', mode: 'insensitive' } },
          { name: { contains: 'frances', mode: 'insensitive' } },
          { name: { contains: 'aleman', mode: 'insensitive' } },
          { name: { contains: 'language', mode: 'insensitive' } },
          { description: { contains: 'idioma', mode: 'insensitive' } },
          { description: { contains: 'ingles', mode: 'insensitive' } },
          { description: { contains: 'frances', mode: 'insensitive' } }
        ],
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        description: true
      }
    })

    if (productos.length === 0) {
      console.log('❌ NO SE ENCONTRARON PRODUCTOS DE IDIOMAS')
      console.log('\nPosibles causas:')
      console.log('1. No hay productos de idiomas en la base de datos')
      console.log('2. Los productos no tienen las palabras clave correctas')
      console.log('3. Los productos están marcados como no disponibles')
      console.log('\n💡 Solución: Importar productos de idiomas o verificar nombres')
      return
    }

    console.log(`✅ ENCONTRADOS ${productos.length} PRODUCTOS DE IDIOMAS:\n`)

    productos.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`)
      console.log(`   ID: ${p.id}`)
      console.log(`   Precio: ${p.price.toLocaleString('es-CO')} COP`)
      console.log(`   Categoría: ${p.category}`)
      if (p.description) {
        const desc = p.description.substring(0, 100)
        console.log(`   Descripción: ${desc}${p.description.length > 100 ? '...' : ''}`)
      }
      console.log('')
    })

    console.log('='.repeat(70))
    console.log('\n✅ VERIFICACIÓN COMPLETADA')
    console.log(`\n📊 Total productos de idiomas: ${productos.length}`)

    // Verificar si hay megapacks
    const megapacks = productos.filter(p => 
      p.name.toLowerCase().includes('megapack') || 
      p.name.toLowerCase().includes('mega pack') ||
      p.name.toLowerCase().includes('pack')
    )

    if (megapacks.length > 0) {
      console.log(`📦 Megapacks encontrados: ${megapacks.length}`)
      megapacks.forEach(m => {
        console.log(`   - ${m.name}`)
      })
    } else {
      console.log('⚠️  No se encontraron megapacks de idiomas')
      console.log('   El bot buscará cursos individuales de idiomas')
    }

  } catch (error) {
    console.error('❌ ERROR:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarProductosIdiomas()
