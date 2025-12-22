/**
 * 🧪 TEST ESPECÍFICO: "Portátil para diseño"
 * 
 * Verifica que cuando el usuario busca "portátil para diseño",
 * el sistema muestre PORTÁTILES y NO Mega Packs de diseño.
 */

import { SearchAgent } from './src/agents/search-agent'
import { SharedMemoryService } from './src/agents/shared-memory'

console.log('🧪 ========================================')
console.log('🧪 TEST: PORTÁTIL PARA DISEÑO')
console.log('🧪 ========================================\n')

async function testPortatilDiseno() {
  const chatId = 'test_diseno_' + Date.now()
  const userId = 'test_user_' + Date.now()
  const memoryService = SharedMemoryService.getInstance()
  const searchAgent = new SearchAgent()

  console.log('📝 TEST: "busco un portátil para diseño gráfico"\n')

  const memory = memoryService.get(chatId, userId)
  const result = await searchAgent.execute('busco un portátil para diseño gráfico', memory)

  console.log('\n🤖 RESPUESTA DEL BOT:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(result.text)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📊 PRODUCTOS ENCONTRADOS:', memory.interestedProducts.length)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (memory.interestedProducts.length > 0) {
    memory.interestedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Categoría: ${product.category}`)
      console.log(`   Precio: $${product.price.toLocaleString()} COP`)
      console.log('')
    })
  }

  // VERIFICACIÓN
  console.log('\n✅ VERIFICACIÓN:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const hasPortatiles = memory.interestedProducts.some(p => 
    p.name.toLowerCase().includes('portátil') || 
    p.name.toLowerCase().includes('portatil') ||
    p.name.toLowerCase().includes('laptop')
  )

  const hasMegaPacks = memory.interestedProducts.some(p => 
    p.name.toLowerCase().includes('mega pack') ||
    p.name.toLowerCase().includes('curso')
  )

  if (hasPortatiles && !hasMegaPacks) {
    console.log('✅ CORRECTO: Muestra portátiles')
    console.log('✅ CORRECTO: NO muestra Mega Packs')
    console.log('\n🎉 TEST PASADO! 🎉\n')
    return true
  } else if (hasMegaPacks) {
    console.log('❌ ERROR: Muestra Mega Packs cuando debería mostrar portátiles')
    console.log('\n❌ TEST FALLIDO ❌\n')
    return false
  } else if (!hasPortatiles) {
    console.log('⚠️  ADVERTENCIA: No encontró portátiles')
    console.log('   (Puede que no haya portátiles en la BD)')
    console.log('\n⚠️  TEST INCONCLUSO ⚠️\n')
    return false
  }

  return false
}

// Ejecutar test
testPortatilDiseno()
  .then(success => {
    if (success) {
      console.log('✅ Sistema funcionando correctamente')
      process.exit(0)
    } else {
      console.log('❌ Sistema necesita ajustes')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Error en el test:', error)
    process.exit(1)
  })
