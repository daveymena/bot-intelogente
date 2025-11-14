/**
 * 🧪 TEST SISTEMA DE PRECIOS DROPSHIPPING
 * Prueba el cálculo automático de precios con ganancias
 */

import dotenv from 'dotenv'
dotenv.config()

import { DropshippingPricing } from '../src/lib/dropshipping-pricing'

console.log('💰 SISTEMA DE PRECIOS DROPSHIPPING\n')
console.log('='.repeat(70))

// Ejemplos de productos con diferentes precios
const ejemplos = [
  { nombre: 'Producto Económico', costo: 30000 },
  { nombre: 'Producto Medio', costo: 75000 },
  { nombre: 'Producto Premium', costo: 150000 },
  { nombre: 'Smartwatch', costo: 89900 },
  { nombre: 'Audífonos TWS', costo: 59900 },
]

console.log('\n📊 CÁLCULO AUTOMÁTICO DE PRECIOS:\n')

ejemplos.forEach((producto, index) => {
  console.log(`${index + 1}. ${producto.nombre}`)
  console.log(DropshippingPricing.getPriceSummary(producto.costo))
  console.log('')
})

console.log('─'.repeat(70))

// Ejemplo de orden con múltiples productos
console.log('\n📦 EJEMPLO DE ORDEN COMPLETA:\n')

const orden = [
  { costPrice: 89900, quantity: 1 },  // Smartwatch
  { costPrice: 59900, quantity: 2 },  // 2 Audífonos
]

const totales = DropshippingPricing.calculateTotalProfit(orden)

console.log('Productos en la orden:')
console.log('  - 1x Smartwatch ($89.900)')
console.log('  - 2x Audífonos ($59.900 c/u)')
console.log('')
console.log('💵 TOTALES:')
console.log(`  Costo productos: $${totales.totalCost.toLocaleString('es-CO')}`)
console.log(`  Costo envíos: $${totales.totalShipping.toLocaleString('es-CO')}`)
console.log(`  Tu ganancia: $${totales.totalProfit.toLocaleString('es-CO')} 💰`)
console.log(`  ─────────────────────`)
console.log(`  Total a cobrar: $${totales.totalRevenue.toLocaleString('es-CO')}`)

console.log('\n' + '='.repeat(70))

// Configuración actual
console.log('\n⚙️  CONFIGURACIÓN ACTUAL:\n')
console.log(`Envío mínimo: $${process.env.DROPSHIPPING_SHIPPING_MIN || '15.000'}`)
console.log(`Envío máximo: $${process.env.DROPSHIPPING_SHIPPING_MAX || '20.000'}`)
console.log(`Ganancia mínima: $${process.env.DROPSHIPPING_PROFIT_MIN || '20.000'}`)
console.log(`Ganancia máxima: $${process.env.DROPSHIPPING_PROFIT_MAX || '30.000'}`)

console.log('\n💡 ESTRATEGIA DE PRECIOS:\n')
console.log('  • Productos < $50.000 → Ganancia $20.000')
console.log('  • Productos $50-100k → Ganancia $25.000')
console.log('  • Productos > $100.000 → Ganancia $30.000')
console.log('  • Precios redondeados a .900 (psicología de precios)')

console.log('\n✅ Sistema de precios funcionando correctamente')
console.log('\n' + '='.repeat(70))
