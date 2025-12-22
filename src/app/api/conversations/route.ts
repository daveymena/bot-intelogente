import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { userId: user.id }
    if (status) {
      where.status = status
    }

    const [conversations, total] = await Promise.all([
      db.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          product: true,
          _count: {
            select: { messages: true }
          }
        }
      }),
      db.conversation.count({ where })
    ])

    return NextResponse.json({
      success: true,
      conversations,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Conversations error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get conversations' },
      { status: 500 }
    )
  }
}
