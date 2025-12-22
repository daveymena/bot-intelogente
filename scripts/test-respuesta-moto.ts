import { AIService } from '../src/lib/ai-service'
import { db } from '../src/lib/db'

async function testRespuestaMoto() {
  try {
    console.log('🧪 Probando respuesta del bot sobre motos...\n')

    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.log('❌ No se encontró usuario admin')
      return
    }

    console.log(`✅ Usuario: ${admin.email}\n`)

    // Probar pregunta sobre motos
    console.log('📝 Pregunta: "tienes motos?"\n')
    
    const response = await AIService.generateResponse(
      admin.id,
      'tienes motos?',
      '+573001234567',
      []
    )

    console.log('🤖 Respuesta del bot:')
    console.log(response.message)
    console.log(`\n📊 Confianza: ${response.confidence}`)
    console.log(`📊 Intención: ${response.intent}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

testRespuestaMoto()
