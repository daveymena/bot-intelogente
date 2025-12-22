import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Extrae el precio final de un string con múltiples precios
 * Ejemplo: "$2.299.900 El precio original era: $2.299.900.$1.899.900El precio actual es: $1.899.900."
 * Resultado: 1899900
 */
function extractFinalPrice(priceString: string | number): number {
  // Si ya es un número, devolverlo
  if (typeof priceString === 'number') {
    return priceString
  }

  // Buscar "El precio actual es: $X" o el último precio en el string
  const currentPriceMatch = priceString.match(/El precio actual es:\s*\$?([\d.,]+)/i)
  if (currentPriceMatch) {
    const price = currentPriceMatch[1].replace(/[.,]/g, '')
    return parseInt(price, 10)
  }

  // Si no encuentra "precio actual", buscar el último precio en el string
  const allPrices = priceString.match(/\$?([\d.,]+)/g)
  if (allPrices && allPrices.length > 0) {
    // Tomar el último precio (generalmente es el precio final)
    const lastPrice = allPrices[allPrices.length - 1].replace(/[$.,]/g, '')
    return parseInt(lastPrice, 10)
  }

  // Si no encuentra nada, intentar parsear el string completo
  const cleanPrice = priceString.replace(/[^0-9]/g, '')
  return parseInt(cleanPrice, 10) || 0
}

async function limpiarPrecios() {
  console.log('🧹 Limpiando precios de productos...\n')

  try {
    // Obtener todos los productos
    const productos = await prisma.product.findMany()

    console.log(`📦 Total de productos: ${productos.length}\n`)

    let actualizados = 0
    let sinCambios = 0
    let errores = 0

    for (const producto of productos) {
      try {
        const precioOriginal = producto.price
        
        // Si el precio ya es un número limpio, no hacer nada
        if (typeof precioOriginal === 'number' && precioOriginal > 0 && precioOriginal < 100000000) {
          sinCambios++
          continue
        }

        // Extraer precio final
        const precioFinal = extractFinalPrice(precioOriginal)

        // Validar que el precio sea razonable
        if (precioFinal <= 0 || precioFinal > 100000000) {
          console.log(`⚠️  Precio inválido para: ${producto.name}`)
          console.log(`   Original: ${precioOriginal}`)
          console.log(`   Extraído: ${precioFinal}`)
          errores++
          continue
        }

        // Actualizar solo si el precio cambió
        if (precioFinal !== precioOriginal) {
          await prisma.product.update({
            where: { id: producto.id },
            data: { price: precioFinal }
          })

          console.log(`✅ ${producto.name}`)
          console.log(`   Antes: ${precioOriginal}`)
          console.log(`   Ahora: $${precioFinal.toLocaleString('es-CO')}`)
          console.log('')
          
          actualizados++
        } else {
          sinCambios++
        }
      } catch (error) {
        console.error(`❌ Error con ${producto.name}:`, error)
        errores++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN')
    console.log('='.repeat(60))
    console.log(`✅ Actualizados: ${actualizados}`)
    console.log(`➖ Sin cambios: ${sinCambios}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total: ${productos.length}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limpiarPrecios()
