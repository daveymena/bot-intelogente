/**
 * 🧪 PRUEBA - DETECCIÓN DE SALUDOS
 * Verifica que los saludos se detecten correctamente
 */

import { IntelligentProductQuerySystem } from '../src/lib/intelligent-product-query-system'

console.log('🧪 PRUEBA DE DETECCIÓN DE SALUDOS\n')
console.log('='.repeat(60))

const testMessages = [
  'Hola',
  'hola',
  'Hola muy buenas',
  'hola muy buenas',
  'Buenos días',
  'buenos dias',
  'Buenas tardes',
  'buenas',
  'Hey',
  'Saludos',
  'Hola, necesito una laptop', // NO debería ser saludo
  'Buenos días, tienen portátiles?', // NO debería ser saludo
]

async function testGreetings() {
  console.log('\n✅ PROBANDO DETECCIÓN DE SALUDOS:\n')
  
  for (const message of testMessages) {
    try {
      const intent = await IntelligentProductQuerySystem.analyzeIntent(message, [])
      const isGreeting = intent.type === 'greeting'
      const icon = isGreeting ? '👋' : '❌'
      const expected = message.length < 20 && !message.includes('laptop') && !message.includes('portátil')
      const status = (isGreeting === expected) ? '✅' : '⚠️'
      
      console.log(`${status} ${icon} "${message}"`)
      console.log(`   Tipo detectado: ${intent.type}`)
      console.log(`   Esperado: ${expected ? 'greeting' : 'otro'}`)
      console.log()
    } catch (error) {
      console.log(`❌ Error con "${message}":`, error)
    }
  }
}

testGreetings().then(() => {
  console.log('='.repeat(60))
  console.log('✅ Prueba completada\n')
  process.exit(0)
}).catch(error => {
  console.error('❌ Error en prueba:', error)
  process.exit(1)
})
