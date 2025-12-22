/**
 * Landing Page AI Service
 * Usa OpenAI y Groq para generar contenido optimizado para landing pages
 */

import Groq from 'groq-sdk'

// Inicializar cliente Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

type OpenAIConstructor = typeof import('openai').default
type OpenAIInstance = InstanceType<OpenAIConstructor>

let OpenAIClient: OpenAIConstructor | null = null
let openai: OpenAIInstance | null = null

async function ensureOpenAIInitialized() {
  if (openai || process.env.OPENAI_ENABLED !== 'true' || !process.env.OPENAI_API_KEY) {
    return
  }

  try {
    const module = await import('openai')
    OpenAIClient = module.default
    openai = new OpenAIClient({
      apiKey: process.env.OPENAI_API_KEY || ''
    })
  } catch (error) {
    console.warn('OpenAI no está instalado, usando solo Groq')
  }
}

interface Product {
  name: string
  description: string
  price: number
  category: string
}

interface LandingContent {
  headline: string
  subheadline: string
  benefits: string[]
  features: string[]
  cta: string
  urgencyMessage: string
  guarantee: string
}

export class LandingAIService {
  /**
   * Genera contenido completo para una landing page usando IA
   */
  static async generateLandingContent(product: Product): Promise<LandingContent> {
    try {
      await ensureOpenAIInitialized()

      // Intentar con OpenAI primero (mejor para copywriting)
      if (openai && process.env.OPENAI_ENABLED === 'true') {
        return await this.generateWithOpenAI(product)
      }
      
      // Fallback a Groq
      return await this.generateWithGroq(product)
    } catch (error) {
      console.error('Error generando contenido con IA:', error)
      // Fallback a contenido por defecto
      return this.generateDefaultContent(product)
    }
  }

  /**
   * Genera contenido usando OpenAI (GPT-4)
   */
  private static async generateWithOpenAI(product: Product): Promise<LandingContent> {
    await ensureOpenAIInitialized()
    if (!openai) {
      throw new Error('OpenAI no está disponible')
    }

    const prompt = this.buildPrompt(product)
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto copywriter especializado en landing pages de alta conversión. Generas contenido persuasivo, claro y orientado a resultados en español.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No se recibió respuesta de OpenAI')

    return JSON.parse(content)
  }

  /**
   * Genera contenido usando Groq (Llama)
   */
  private static async generateWithGroq(product: Product): Promise<LandingContent> {
    const prompt = this.buildPrompt(product)
    
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto copywriter especializado en landing pages de alta conversión. Generas contenido persuasivo, claro y orientado a resultados en español. IMPORTANTE: Responde SOLO con JSON válido, sin texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No se recibió respuesta de Groq')

    return JSON.parse(content)
  }

  /**
   * Construye el prompt para la IA
   */
  private static buildPrompt(product: Product): string {
    const isDigital = product.category === 'DIGITAL'
    const productType = isDigital ? 'producto digital' : 'producto físico'

    return `
Genera contenido optimizado para una landing page de ${productType} con los siguientes datos:

Producto: ${product.name}
Descripción: ${product.description}
Precio: $${product.price.toLocaleString('es-CO')} COP
Categoría: ${product.category}

Genera un JSON con la siguiente estructura:
{
  "headline": "Título principal impactante (máximo 60 caracteres)",
  "subheadline": "Subtítulo que explica el beneficio principal (máximo 120 caracteres)",
  "benefits": ["Beneficio 1", "Beneficio 2", "Beneficio 3", "Beneficio 4", "Beneficio 5"],
  "features": ["Característica 1", "Característica 2", "Característica 3"],
  "cta": "Texto del botón de acción (máximo 30 caracteres)",
  "urgencyMessage": "Mensaje de urgencia (máximo 80 caracteres)",
  "guarantee": "Mensaje de garantía (máximo 100 caracteres)"
}

REGLAS:
1. El headline debe ser IMPACTANTE y enfocado en BENEFICIOS, no en características
2. Usa lenguaje persuasivo y emocional
3. Los beneficios deben responder "¿Qué gano yo?"
4. Las características deben ser específicas y verificables
5. El CTA debe ser accionable y crear urgencia
6. Usa emojis estratégicamente (máximo 1 por texto)
7. Enfócate en RESULTADOS, no en el producto
8. Usa palabras poderosas: "Descubre", "Transforma", "Domina", "Ahorra"
9. Para productos digitales: enfatiza acceso inmediato y resultados
10. Para productos físicos: enfatiza calidad y envío

Responde SOLO con el JSON, sin texto adicional.
`
  }

  /**
   * Genera un headline optimizado
   */
  static async generateHeadline(productName: string, description: string): Promise<string> {
    try {
      const useOpenAI = openai && process.env.OPENAI_ENABLED === 'true'

      if (useOpenAI) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en copywriting. Genera headlines impactantes de máximo 60 caracteres.'
            },
            {
              role: 'user',
              content: `Genera un headline impactante para: ${productName}. Descripción: ${description.substring(0, 200)}`
            }
          ],
          temperature: 0.9,
          max_tokens: 100
        })

        return completion.choices[0]?.message?.content?.trim() || productName
      } else {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en copywriting. Genera headlines impactantes de máximo 60 caracteres.'
            },
            {
              role: 'user',
              content: `Genera un headline impactante para: ${productName}. Descripción: ${description.substring(0, 200)}`
            }
          ],
          temperature: 0.9,
          max_tokens: 100
        })

        return completion.choices[0]?.message?.content?.trim() || productName
      }
    } catch (error) {
      console.error('Error generando headline:', error)
      return productName
    }
  }

  /**
   * Mejora un texto existente
   */
  static async improveText(text: string, context: string): Promise<string> {
    try {
      const useOpenAI = openai && process.env.OPENAI_ENABLED === 'true'

      const prompt = `Mejora este texto para una landing page (contexto: ${context}):

"${text}"

Hazlo más persuasivo, claro y orientado a conversión. Máximo 150 caracteres.`

      if (useOpenAI) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres un experto copywriter.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 150
        })

        return completion.choices[0]?.message?.content?.trim() || text
      } else {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Eres un experto copywriter.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 150
        })

        return completion.choices[0]?.message?.content?.trim() || text
      }
    } catch (error) {
      console.error('Error mejorando texto:', error)
      return text
    }
  }

  /**
   * Genera contenido por defecto si falla la IA
   */
  private static generateDefaultContent(product: Product): LandingContent {
    const isDigital = product.category === 'DIGITAL'

    return {
      headline: `¡Descubre ${product.name}!`,
      subheadline: 'La solución que estabas buscando',
      benefits: [
        'Calidad garantizada',
        'Resultados comprobados',
        'Fácil de usar',
        'Soporte incluido',
        'Satisfacción garantizada'
      ],
      features: [
        'Alta calidad',
        'Entrega rápida',
        'Garantía incluida'
      ],
      cta: 'COMPRAR AHORA',
      urgencyMessage: '¡Oferta por tiempo limitado! No te lo pierdas',
      guarantee: 'Garantía de satisfacción 100% o te devolvemos tu dinero'
    }
  }

  /**
   * Genera variaciones A/B de un headline
   */
  static async generateHeadlineVariations(headline: string, count: number = 3): Promise<string[]> {
    try {
      const useOpenAI = openai && process.env.OPENAI_ENABLED === 'true'

      const prompt = `Genera ${count} variaciones del siguiente headline para A/B testing:

"${headline}"

Cada variación debe:
- Ser diferente en enfoque (beneficio, urgencia, curiosidad)
- Mantener máximo 60 caracteres
- Ser igual de persuasiva

Responde con un JSON: {"variations": ["variación 1", "variación 2", "variación 3"]}`

      if (useOpenAI) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres un experto en copywriting y A/B testing.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,
          max_tokens: 300,
          response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content)
          return parsed.variations || [headline]
        }
      } else {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Eres un experto en copywriting y A/B testing. Responde SOLO con JSON válido.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,
          max_tokens: 300,
          response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content)
          return parsed.variations || [headline]
        }
      }

      return [headline]
    } catch (error) {
      console.error('Error generando variaciones:', error)
      return [headline]
    }
  }
}
