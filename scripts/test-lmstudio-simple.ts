// 🧪 Test simple y rápido de LM Studio

import { config } from 'dotenv'
config()

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions'

console.log('🎮 TEST RÁPIDO DE LM STUDIO\n')
console.log('URL:', LM_STUDIO_URL)
console.log('\n⏳ Probando...\n')

async function testSimple() {
  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi-2',
        messages: [{ role: 'user', content: 'Hola' }],
        max_tokens: 10
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    console.log('✅ LM STUDIO FUNCIONA!')
    console.log('📦 Modelo:', data.model)
    console.log('💬 Respuesta:', content)
    console.log('\n🎉 ¡Perfecto! LM Studio está listo para usar como respaldo.')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Verifica que LM Studio esté ejecutándose')
  }
}

testSimple()
