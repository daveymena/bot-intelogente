import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/whatsapp'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await AuthService.validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const connection = await WhatsAppService.getConnectionStatus(user.id)
    const health = await WhatsAppService.checkConnectionHealth(user.id)
    const stats = await WhatsAppService.getConnectionStats(user.id)

    return NextResponse.json({
      connection,
      health,
      stats
    })
  } catch (error) {
    console.error('Error getting WhatsApp status:', error)
    return NextResponse.json(
      { error: 'Failed to get WhatsApp status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await AuthService.validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phoneNumber, action } = body

    if (action === 'connect') {
      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number is required' },
          { status: 400 }
        )
      }

      const connection = await WhatsAppService.initializeConnection(user.id, phoneNumber)
      return NextResponse.json({
        success: true,
        connection,
        message: 'Connection initiated. Please scan the QR code.'
      })
    }

    if (action === 'disconnect') {
      await WhatsAppService.disconnect(user.id)
      return NextResponse.json({
        success: true,
        message: 'Disconnected successfully'
      })
    }

    if (action === 'reconnect') {
      const success = await WhatsAppService.autoReconnect(user.id)
      return NextResponse.json({
        success,
        message: success ? 'Reconnection initiated' : 'Reconnection failed'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing WhatsApp connection:', error)
    return NextResponse.json(
      { error: 'Failed to manage connection' },
      { status: 500 }
    )
  }
}