import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createPromptSchema = z.object({
  name: z.string().min(1),
  prompt: z.string().min(1),
  type: z.enum(['WELCOME', 'PRODUCT_INFO', 'PRICING', 'SUPPORT', 'CLOSING', 'CUSTOM']),
  isActive: z.boolean().default(true),
  userId: z.string()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const prompts = await db.aIPrompt.findMany({
      where: {
        ...(userId && { userId }),
        ...(type && { type: type as any }),
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(prompts)
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPromptSchema.parse(body)

    const prompt = await db.aIPrompt.create({
      data: validatedData
    })

    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}