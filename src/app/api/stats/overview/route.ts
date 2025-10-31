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

    // Get statistics
    const [
      totalConversations,
      totalProducts,
      totalMessages,
      whatsappConnection
    ] = await Promise.all([
      db.conversation.count({ where: { userId: user.id } }),
      db.product.count({ where: { userId: user.id } }),
      db.message.count({
        where: {
          conversation: {
            userId: user.id
          }
        }
      }),
      db.whatsAppConnection.findUnique({ where: { userId: user.id } })
    ])

    // Get unique customers
    const conversations = await db.conversation.findMany({
      where: { userId: user.id },
      select: { customerPhone: true },
      distinct: ['customerPhone']
    })

    const totalCustomers = conversations.length

    // Get recent conversations
    const recentConversations = await db.conversation.findMany({
      where: { userId: user.id },
      orderBy: { lastMessageAt: 'desc' },
      take: 5,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    // Get message stats by day (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const messagesByDay = await db.message.groupBy({
      by: ['createdAt'],
      where: {
        conversation: {
          userId: user.id
        },
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: true
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalConversations,
        totalProducts,
        totalMessages,
        totalCustomers,
        botStatus: whatsappConnection?.isConnected ? 'CONNECTED' : 'DISCONNECTED',
        whatsappStatus: whatsappConnection?.status || 'DISCONNECTED'
      },
      recentConversations,
      messagesByDay
    })
  } catch (error) {
    console.error('Stats overview error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get statistics' },
      { status: 500 }
    )
  }
}
