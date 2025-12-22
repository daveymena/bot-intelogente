/**
 * 🧪 TEST DROPI INTEGRATION
 * Prueba la conexión y funcionalidades de Dropi
 */

import dotenv from 'dotenv'
dotenv.config()

import { DropiService } from '../src/lib/dropi-service'

async function testDropi() {
  console.log('🧪 PROBANDO INTEGRACIÓN CON DROPI\n')
  console.log('='.repeat(70))

  // Verificar configuración
  console.log('\n📋 Verificando configuración...\n')
  console.log('DROPI_AGENT_TOKEN:', process.env.DROPI_AGENT_TOKEN ? '✅ Configurado' : '❌ No encontrado')
  console.log('DROPI_API_URL:', process.env.DROPI_API_URL || 'https://app.dropi.co/api/v1')
  console.log('DROPI_ENABLED:', process.env.DROPI_ENABLED || 'false')

  if (!process.env.DROPI_AGENT_TOKEN) {
    console.log('\n❌ ERROR: DROPI_AGENT_TOKEN no configurado en .env')
    console.log('\n💡 Agrega tu token en .env:')
    console.log('   DROPI_AGENT_TOKEN=tu_token_jwt_aqui')
    process.exit(1)
  }

  console.log('\n' + '─'.repeat(70))

  // Test 1: Verificar conexión
  console.log('\n🔌 TEST 1: Verificando conexión con Dropi...\n')
  try {
    const connected = await DropiService.testConnection()
    if (connected) {
      console.log('✅ Conexión exitosa con Dropi API')
    } else {
      console.log('❌ Error de conexión')
      process.exit(1)
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('\n' + '─'.repeat(70))

  // Test 2: Obtener productos
  console.log('\n📦 TEST 2: Obteniendo productos de Dropi...\n')
  try {
    const products = await DropiService.getProducts()
    console.log(`✅ ${products.length} productos obtenidos`)
    
    if (products.length > 0) {
      console.log('\n📋 Primeros 3 productos:')
      products.slice(0, 3).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`)
        console.log(`   ID: ${product.id}`)
        console.log(`   Precio: $${product.price}`)
        console.log(`   Stock: ${product.stock}`)
        if (product.images && product.images.length > 0) {
          console.log(`   Imágenes: ${product.images.length}`)
        }
      })
    }
  } catch (error: any) {
    console.error('❌ Error obteniendo productos:', error.message)
  }

  console.log('\n' + '─'.repeat(70))

  // Test 3: Buscar productos
  console.log('\n🔍 TEST 3: Buscando productos...\n')
  try {
    const searchTerm = 'celular'
    console.log(`Buscando: "${searchTerm}"`)
    const results = await DropiService.searchProducts(searchTerm)
    console.log(`✅ ${results.length} productos encontrados`)
    
    if (results.length > 0) {
      console.log('\n📋 Resultados:')
      results.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price}`)
      })
    }
  } catch (error: any) {
    console.error('❌ Error buscando productos:', error.message)
  }

  console.log('\n' + '─'.repeat(70))

  // Test 4: Obtener órdenes
  console.log('\n📋 TEST 4: Obteniendo órdenes...\n')
  try {
    const orders = await DropiService.getOrders({ limit: 5 })
    console.log(`✅ ${orders.length} órdenes obtenidas`)
    
    if (orders.length > 0) {
      console.log('\n📋 Últimas órdenes:')
      orders.forEach((order, index) => {
        console.log(`${index + 1}. Orden #${order.order_number}`)
        console.log(`   Estado: ${order.status}`)
        console.log(`   Total: $${order.total}`)
      })
    } else {
      console.log('ℹ️  No hay órdenes registradas aún')
    }
  } catch (error: any) {
    console.error('❌ Error obteniendo órdenes:', error.message)
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n✅ PRUEBAS COMPLETADAS\n')
  console.log('💡 Endpoints disponibles:')
  console.log('   GET  /api/dropi/products')
  console.log('   GET  /api/dropi/products/:id')
  console.log('   GET  /api/dropi/products?q=busqueda')
  console.log('   POST /api/dropi/orders')
  console.log('   GET  /api/dropi/orders')
  console.log('   GET  /api/dropi/orders/:id')
  console.log('   POST /api/dropi/sync')
  console.log('   GET  /api/dropi/sync (test conexión)')
  console.log('\n🤖 Tu bot puede usar estos endpoints para:')
  console.log('   - Mostrar catálogo de productos Dropi')
  console.log('   - Buscar productos por nombre')
  console.log('   - Crear órdenes automáticamente')
  console.log('   - Consultar estado de pedidos')
  console.log('\n' + '='.repeat(70))
}

testDropi()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
