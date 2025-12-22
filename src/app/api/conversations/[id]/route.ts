import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Await params in Next.js 15
    const { id } = await params

    const conversation = await db.conversation.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        product: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation
    })
  } catch (error) {
    console.error('Conversation detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Await params in Next.js 15
    const { id } = await params

    const body = await request.json()
    const { status } = body

    const conversation = await db.conversation.updateMany({
      where: {
        id: id,
        userId: user.id
      },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      conversation
    })
  } catch (error) {
    console.error('Update conversation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}
