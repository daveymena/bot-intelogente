import { NextRequest, NextResponse } from 'next/server'
import { LandingAIService } from '@/lib/landing-ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, description, price, category, action } = body

    // Diferentes acciones
    switch (action) {
      case 'generate-full':
        // Generar contenido completo
        const fullContent = await LandingAIService.generateLandingContent({
          name: productName,
          description,
          price,
          category
        })
        return NextResponse.json({ success: true, content: fullContent })

      case 'generate-headline':
        // Generar solo headline
        const headline = await LandingAIService.generateHeadline(productName, description)
        return NextResponse.json({ success: true, headline })

      case 'improve-text':
        // Mejorar un texto existente
        const { text, context } = body
        const improved = await LandingAIService.improveText(text, context)
        return NextResponse.json({ success: true, text: improved })

      case 'generate-variations':
        // Generar variaciones A/B
        const { headline: originalHeadline, count } = body
        const variations = await LandingAIService.generateHeadlineVariations(originalHeadline, count || 3)
        return NextResponse.json({ success: true, variations })

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Error en generate-content:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error generando contenido' },
      { status: 500 }
    )
  }
}
