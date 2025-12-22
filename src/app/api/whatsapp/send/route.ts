import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { WhatsAppWebService } from '@/lib/whatsapp-web-service'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { to, content } = body

    if (!to || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, content' },
        { status: 400 }
      )
    }

    console.log(`[API] Enviando mensaje a ${to}`)

    // Enviar mensaje usando WhatsApp Web.js
    const success = await WhatsAppWebService.sendMessage(user.id, to, content)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send message. Check WhatsApp connection.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('[API] WhatsApp send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
