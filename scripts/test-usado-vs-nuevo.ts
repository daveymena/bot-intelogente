// 🧪 SCRIPT DE PRUEBA: USADO VS NUEVO

import { db } from '../src/lib/db'
import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'

async function testUsadoVsNuevo() {
  console.log('\n' + '═'.repeat(80))
  console.log('🧪 PRUEBA: FILTRO USADO VS NUEVO')
  console.log('═'.repeat(80) + '\n')

  try {
    // Obtener el primer usuario
    const user = await db.user.findFirst()
    if (!user) {
      console.error('❌ No hay usuarios en la base de datos')
      return
    }

    console.log(`✅ Usuario encontrado: ${user.businessName || user.email}\n`)

    // Obtener todos los productos
    const allProducts = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE'
      }
    })

    console.log(`📦 Total de productos: ${allProducts.length}\n`)

    // Separar usados y nuevos
    const usados = allProducts.filter(p => 
      p.name.toLowerCase().includes('usado') || 
      p.name.toLowerCase().includes('usada')
    )
    const nuevos = allProducts.filter(p => 
      !p.name.toLowerCase().includes('usado') && 
      !p.name.toLowerCase().includes('usada')
    )

    console.log(`📊 Productos USADOS: ${usados.length}`)
    usados.forEach(p => console.log(`   - ${p.name}`))
    
    console.log(`\n📊 Productos NUEVOS: ${nuevos.length}`)
    nuevos.forEach(p => console.log(`   - ${p.name}`))

    console.log('\n' + '─'.repeat(80))
    console.log('🧪 PRUEBA 1: Buscar "portátil usado"')
    console.log('─'.repeat(80))
    
    const result1 = await ProductIntelligenceService.findProduct('portátil usado', user.id)
    
    if (result1) {
      const esUsado = result1.name.toLowerCase().includes('usado')
      console.log(`\n${esUsado ? '✅' : '❌'} Resultado: ${result1.name}`)
      console.log(`   Precio: $${result1.price.toLocaleString('es-CO')}`)
      console.log(`   Condición: ${esUsado ? 'USADO ✅' : 'NUEVO ❌ ERROR'}`)
      
      if (!esUsado) {
        console.log('\n🚨 ERROR: Devolvió producto NUEVO cuando se pidió USADO')
      }
    } else {
      console.log('\n❌ No se encontró ningún producto')
    }

    console.log('\n' + '─'.repeat(80))
    console.log('🧪 PRUEBA 2: Buscar "laptop usada"')
    console.log('─'.repeat(80))
    
    const result2 = await ProductIntelligenceService.findProduct('laptop usada', user.id)
    
    if (result2) {
      const esUsado = result2.name.toLowerCase().includes('usado')
      console.log(`\n${esUsado ? '✅' : '❌'} Resultado: ${result2.name}`)
      console.log(`   Precio: $${result2.price.toLocaleString('es-CO')}`)
      console.log(`   Condición: ${esUsado ? 'USADO ✅' : 'NUEVO ❌ ERROR'}`)
      
      if (!esUsado) {
        console.log('\n🚨 ERROR: Devolvió producto NUEVO cuando se pidió USADO')
      }
    } else {
      console.log('\n❌ No se encontró ningún producto')
    }

    console.log('\n' + '─'.repeat(80))
    console.log('🧪 PRUEBA 3: Buscar "laptop nueva"')
    console.log('─'.repeat(80))
    
    const result3 = await ProductIntelligenceService.findProduct('laptop nueva', user.id)
    
    if (result3) {
      const esUsado = result3.name.toLowerCase().includes('usado')
      console.log(`\n${!esUsado ? '✅' : '❌'} Resultado: ${result3.name}`)
      console.log(`   Precio: $${result3.price.toLocaleString('es-CO')}`)
      console.log(`   Condición: ${esUsado ? 'USADO ❌ ERROR' : 'NUEVO ✅'}`)
      
      if (esUsado) {
        console.log('\n🚨 ERROR: Devolvió producto USADO cuando se pidió NUEVO')
      }
    } else {
      console.log('\n❌ No se encontró ningún producto')
    }

    console.log('\n' + '─'.repeat(80))
    console.log('🧪 PRUEBA 4: Buscar "portátil nuevo"')
    console.log('─'.repeat(80))
    
    const result4 = await ProductIntelligenceService.findProduct('portátil nuevo', user.id)
    
    if (result4) {
      const esUsado = result4.name.toLowerCase().includes('usado')
      console.log(`\n${!esUsado ? '✅' : '❌'} Resultado: ${result4.name}`)
      console.log(`   Precio: $${result4.price.toLocaleString('es-CO')}`)
      console.log(`   Condición: ${esUsado ? 'USADO ❌ ERROR' : 'NUEVO ✅'}`)
      
      if (esUsado) {
        console.log('\n🚨 ERROR: Devolvió producto USADO cuando se pidió NUEVO')
      }
    } else {
      console.log('\n❌ No se encontró ningún producto')
    }

    console.log('\n' + '─'.repeat(80))
    console.log('🧪 PRUEBA 5: Buscar "laptop" (sin especificar condición)')
    console.log('─'.repeat(80))
    
    const result5 = await ProductIntelligenceService.findProduct('laptop', user.id)
    
    if (result5) {
      const esUsado = result5.name.toLowerCase().includes('usado')
      console.log(`\n✅ Resultado: ${result5.name}`)
      console.log(`   Precio: $${result5.price.toLocaleString('es-CO')}`)
      console.log(`   Condición: ${esUsado ? 'USADO' : 'NUEVO'}`)
      console.log(`   ℹ️ Sin filtro específico, puede devolver cualquiera`)
    } else {
      console.log('\n❌ No se encontró ningún producto')
    }

    console.log('\n' + '═'.repeat(80))
    console.log('✅ PRUEBAS COMPLETADAS')
    console.log('═'.repeat(80) + '\n')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar pruebas
testUsadoVsNuevo()
