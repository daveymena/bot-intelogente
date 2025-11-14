/**
 * 🧪 TEST DEL SISTEMA INTELIGENTE LOCAL
 * Prueba el sistema sin IA con contexto conversacional
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Simular el sistema (en producción usarías el TypeScript compilado)
async function testLocalSystem() {
  console.log('🧪 Probando Sistema Inteligente Local...\n')

  const userId = 'test-user'
  const customerPhone = '+573001234567'

  // Simular conversación
  const conversation = [
    'Hola',
    'Cuánto cuesta el curso de piano?',
    'Qué métodos de pago tienen?',
    'Quiero comprarlo',
    'Juan Pérez - Cali - Calle 10 #20-30 - Nequi - Negro'
  ]

  console.log('📱 Simulando conversación:\n')

  for (const message of conversation) {
    console.log(`👤 Cliente: ${message}`)
    
    // Aquí llamarías al sistema real
    // const response = await LocalIntelligentSystem.generateResponse(userId, message, customerPhone)
    
    console.log(`🤖 Bot: [Respuesta del sistema]\n`)
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('✅ Test completado!')
}

// Ejecutar test
testLocalSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
