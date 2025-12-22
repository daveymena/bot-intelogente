import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Descripción requerida' },
        { status: 400 }
      )
    }

    // Lazy loading de Groq
    const Groq = (await import('groq-sdk')).default
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })

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
          content: `Genera un prompt de personalidad para este bot:\n\n${description}`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    const generatedPrompt = completion.choices[0]?.message?.content || ''

    if (!generatedPrompt) {
      throw new Error('No se pudo generar el prompt')
    }

    return NextResponse.json({
      prompt: generatedPrompt,
      model: 'llama-3.3-70b-versatile'
    })

  } catch (error: any) {
    console.error('Error generando personalidad:', error)
    return NextResponse.json(
      { error: 'Error al generar personalidad', details: error.message },
      { status: 500 }
    )
  }
}
