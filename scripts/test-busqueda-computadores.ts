import { IntelligentProductQuerySystem } from '../src/lib/intelligent-product-query-system'

async function testBusquedaComputadores() {
  console.log('🧪 Probando búsqueda de computadores...\n')
  
  const testCases = [
    'Hola, tienes computadores?',
    'Quiero ver portátiles',
    'Necesito un laptop',
    'Que opciones de computadores tienes?',
    'Muéstrame los portátiles disponibles',
    'Tienes laptops para trabajo?'
  ]
  
  // Usar el userId del admin
  const userId = 'cmhpw941q0000kmp85qvjm0o5'
  
  for (const message of testCases) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📝 Mensaje: "${message}"`)
    console.log('='.repeat(60))
    
    try {
      const response = await IntelligentProductQuerySystem.processQuery(
        message,
        userId,
        []
      )
      
      console.log('\n✅ Respuesta del bot:')
      console.log(response)
    } catch (error: any) {
      console.error('❌ Error:', error.message)
    }
    
    // Esperar un poco entre consultas
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n\n✅ Pruebas completadas')
}

testBusquedaComputadores().catch(console.error)
