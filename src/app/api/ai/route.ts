import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'
import { db } from '@/lib/db'
import { z } from 'zod'

const generateResponseSchema = z.object({
  message: z.string().min(1),
  customerPhone: z.string(),
  customerName: z.string().optional(),
  conversationId: z.string().optional(),
  userId: z.string(),
  preferredModel: z.string().default('llama-3.1-8b')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = generateResponseSchema.parse(body)

    // Get user's prompts and products
    const [userPrompts, userProducts, userSettings] = await Promise.all([
      db.aIPrompt.findMany({
        where: { 
          userId: validatedData.userId,
          isActive: true 
        }
      }),
      db.product.findMany({
        where: { 
          userId: validatedData.userId,
          status: 'AVAILABLE'
        }
      }),
      db.botSettings.findUnique({
        where: { userId: validatedData.userId }
      })
    ])

    // Get conversation history if conversationId provided
    let conversationHistory = []
    if (validatedData.conversationId) {
      const messages = await db.message.findMany({
        where: { conversationId: validatedData.conversationId },
        orderBy: { createdAt: 'asc' },
        take: 10 // Last 10 messages for context
      })

      conversationHistory = messages.map(msg => ({
        role: msg.direction === 'INCOMING' ? 'user' : 'assistant',
        content: msg.content
      }))
    }

    // Organize prompts by type
    const prompts = userPrompts.reduce((acc, prompt) => {
      const key = prompt.type.toLowerCase()
      acc[key] = prompt.prompt
      return acc
    }, {} as Record<string, string>)

    // Build context for AI
    const context = {
      customerName: validatedData.customerName,
      conversationHistory,
      products: userProducts,
      businessInfo: {
        name: userSettings?.businessName || 'Tecnovariedades D&S',
        phone: userSettings?.businessPhone || 'No especificado',
        email: userSettings?.businessPhone ? `whatsapp@${userSettings.businessPhone.replace(/[^\d]/g, '')}.com` : undefined
      },
      prompts
    }

    // Generate AI response
    const aiResponse = await AIService.generateResponse(
      validatedData.message,
      context,
      validatedData.preferredModel
    )

    // Save message to database if conversationId provided
    if (validatedData.conversationId) {
      await Promise.all([
        // Save incoming message
        db.message.create({
          data: {
            content: validatedData.message,
            direction: 'INCOMING',
            conversationId: validatedData.conversationId,
            aiGenerated: false
          }
        }),
        // Save AI response
        db.message.create({
          data: {
            content: aiResponse.content,
            direction: 'OUTGOING',
            conversationId: validatedData.conversationId,
            aiGenerated: true,
            confidence: aiResponse.confidence
          }
        }),
        // Update conversation last message time
        db.conversation.update({
          where: { id: validatedData.conversationId },
          data: { lastMessageAt: new Date() }
        })
      ])
    }

    return NextResponse.json({
      response: aiResponse.content,
      model: aiResponse.model,
      confidence: aiResponse.confidence,
      tokens: aiResponse.tokens
    })

  } catch (error) {
    console.error('Error generating AI response:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'models') {
      const models = AIService.getAvailableModels()
      return NextResponse.json(models)
    }

    if (action === 'test') {
      const model = searchParams.get('model')
      if (!model) {
        return NextResponse.json(
          { error: 'Model parameter is required' },
          { status: 400 }
        )
      }

      const isWorking = await AIService.testModel(model)
      return NextResponse.json({ model, working: isWorking })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in AI API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}