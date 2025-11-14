/**
 * 🔍 VERIFICAR MODELOS DISPONIBLES EN GROQ
 * Muestra modelos, límites de tokens y velocidad
 */

import 'dotenv/config'
import Groq from 'groq-sdk'

async function verificarModelosGroq() {
  console.log('🔍 VERIFICANDO MODELOS DE GROQ\n')
  console.log('=' .repeat(70))

  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.log('❌ Error: GROQ_API_KEY no está configurada en .env')
    return
  }

  console.log(`\n🔑 API Key: ${apiKey.substring(0, 20)}...`)

  const groq = new Groq({ apiKey })

  try {
    console.log('\n📋 Obteniendo lista de modelos...\n')

    const models = await groq.models.list()

    console.log(`✅ Total de modelos disponibles: ${models.data.length}\n`)

    // Modelos recomendados para chat
    const chatModels = models.data.filter(m => 
      m.id.includes('llama') || 
      m.id.includes('mixtral') || 
      m.id.includes('gemma')
    )

    console.log('🤖 MODELOS RECOMENDADOS PARA CHAT:\n')
    console.log('-'.repeat(70))

    chatModels.forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.id}`)
      console.log(`   Creado: ${new Date(model.created * 1000).toLocaleDateString()}`)
      console.log(`   Propiedad: ${model.owned_by}`)
      
      // Información adicional según el modelo
      if (model.id.includes('llama-3.1-8b-instant')) {
        console.log(`   ⚡ Velocidad: MUY RÁPIDO`)
        console.log(`   📊 Límite: 6,000 tokens/min (tier gratuito)`)
        console.log(`   💡 Contexto: 8K tokens`)
        console.log(`   ✅ Recomendado: Sí (actual)`)
      } else if (model.id.includes('llama-3.1-70b')) {
        console.log(`   ⚡ Velocidad: RÁPIDO`)
        console.log(`   📊 Límite: 6,000 tokens/min`)
        console.log(`   💡 Contexto: 8K tokens`)
        console.log(`   ⚠️  Más lento que 8b`)
      } else if (model.id.includes('llama-3.2')) {
        console.log(`   ⚡ Velocidad: MUY RÁPIDO`)
        console.log(`   📊 Límite: 6,000 tokens/min`)
        console.log(`   💡 Contexto: 8K-128K tokens`)
        console.log(`   ✅ Alternativa: Sí`)
      } else if (model.id.includes('mixtral')) {
        console.log(`   ⚡ Velocidad: RÁPIDO`)
        console.log(`   📊 Límite: 5,000 tokens/min`)
        console.log(`   💡 Contexto: 32K tokens`)
      } else if (model.id.includes('gemma')) {
        console.log(`   ⚡ Velocidad: MUY RÁPIDO`)
        console.log(`   📊 Límite: 15,000 tokens/min`)
        console.log(`   💡 Contexto: 8K tokens`)
        console.log(`   ✅ Mejor límite!`)
      }
    })

    console.log('\n' + '='.repeat(70))
    console.log('💡 RECOMENDACIONES:\n')
    
    console.log('1. MODELO ACTUAL (llama-3.1-8b-instant):')
    console.log('   ✅ Muy rápido')
    console.log('   ❌ Límite bajo (6,000 tokens/min)')
    console.log('   💡 Bueno para mensajes cortos\n')

    console.log('2. ALTERNATIVA RECOMENDADA (gemma-7b-it):')
    console.log('   ✅ Muy rápido')
    console.log('   ✅ Límite alto (15,000 tokens/min)')
    console.log('   ✅ Mejor para conversaciones largas\n')

    console.log('3. ALTERNATIVA (llama-3.2-3b-preview):')
    console.log('   ✅ Muy rápido')
    console.log('   ✅ Contexto grande (128K)')
    console.log('   ⚠️  Modelo en preview\n')

    console.log('='.repeat(70))
    console.log('\n📝 PARA CAMBIAR DE MODELO:\n')
    console.log('En tu .env, cambia:')
    console.log('GROQ_MODEL=llama-3.1-8b-instant')
    console.log('\nPor uno de estos:')
    console.log('GROQ_MODEL=gemma-7b-it              # Recomendado (15K tokens/min)')
    console.log('GROQ_MODEL=llama-3.2-3b-preview     # Alternativa (contexto grande)')
    console.log('GROQ_MODEL=mixtral-8x7b-32768       # Alternativa (contexto 32K)')

    // Test rápido con el modelo actual
    console.log('\n' + '='.repeat(70))
    console.log('🧪 TEST RÁPIDO CON MODELO ACTUAL\n')

    const currentModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
    console.log(`Modelo: ${currentModel}`)

    const startTime = Date.now()
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'user', content: 'Hola, responde en una palabra' }
        ],
        model: currentModel,
        max_tokens: 10
      })

      const responseTime = Date.now() - startTime
      const response = completion.choices[0]?.message?.content || 'Sin respuesta'

      console.log(`✅ Respuesta en ${responseTime}ms`)
      console.log(`💬 Respuesta: "${response}"`)
      console.log(`📊 Tokens usados: ${completion.usage?.total_tokens || 0}`)

    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`)
    }

  } catch (error: any) {
    console.log(`\n❌ Error obteniendo modelos: ${error.message}`)
    
    if (error.message.includes('401')) {
      console.log('\n💡 La API key parece inválida. Verifica:')
      console.log('   1. Que esté correcta en .env')
      console.log('   2. Que no haya expirado')
      console.log('   3. Que tenga permisos')
    }
  }

  console.log('\n' + '='.repeat(70))
}

verificarModelosGroq()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
