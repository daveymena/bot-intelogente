/**
 * Script de prueba para el generador de personalidad del bot
 * Ejecutar con: npx tsx scripts/test-personality-generator.ts
 */

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

async function testPersonalityGenerator() {
  console.log('🎭 Probando Generador de Personalidad del Bot\n')

  const testDescriptions = [
    {
      name: 'Vendedor de Tecnología',
      description: 'Necesito un bot para una tienda de tecnología que vende laptops y componentes. Debe ser técnico pero accesible, ayudar a clientes a elegir según sus necesidades (gaming, trabajo, estudio), y ser honesto sobre especificaciones.'
    },
    {
      name: 'Coach de Cursos Online',
      description: 'Bot para vender cursos online de desarrollo personal. Debe ser motivador e inspirador, enfocado en transformación del cliente. Usa storytelling y testimonios. Tono energético y positivo.'
    },
    {
      name: 'Asesor Premium',
      description: 'Bot para servicios de consultoría premium. Clientes son empresarios de alto nivel. Debe ser sofisticado, discreto, enfocado en ROI. Lenguaje elegante, respuestas detalladas.'
    }
  ]

  for (const test of testDescriptions) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📝 Generando: ${test.name}`)
    console.log(`${'='.repeat(60)}\n`)

    try {
      const systemPrompt = `Eres un experto en diseño de personalidades para chatbots de ventas. Tu trabajo es crear prompts detallados y efectivos que definan cómo debe comportarse un bot.

ESTRUCTURA DEL PROMPT QUE DEBES GENERAR:
1. PERSONALIDAD: Rasgos de carácter y actitud
2. ENFOQUE: Metodología y prioridades
3. TÉCNICAS: Estrategias específicas para lograr objetivos
4. ESTILO: Tono, lenguaje y formato de respuestas
5. MANEJO DE SITUACIONES: Cómo responder a objeciones, preguntas difíciles, etc.

REGLAS:
- El prompt debe ser en español
- Debe ser específico y accionable
- Incluye ejemplos de frases o enfoques
- Considera el contexto de WhatsApp
- Debe ser profesional pero natural
- Incluye guías sobre uso de emojis
- Define límites claros (qué hacer y qué NO hacer)

Genera un prompt completo y profesional basado en la descripción del usuario.`

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Genera un prompt de personalidad para este bot:\n\n${test.description}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })

      const generatedPrompt = completion.choices[0]?.message?.content || ''

      console.log('✅ Prompt Generado:\n')
      console.log(generatedPrompt)
      console.log('\n' + '='.repeat(60))

      // Esperar un poco entre requests
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error: any) {
      console.error(`❌ Error generando ${test.name}:`, error.message)
    }
  }

  console.log('\n✅ Prueba completada!')
  console.log('\n💡 Próximos pasos:')
  console.log('   1. Ejecuta: npm run db:push')
  console.log('   2. Accede al dashboard')
  console.log('   3. Ve a "Personalidad Bot"')
  console.log('   4. Prueba el generador con IA')
}

testPersonalityGenerator()
