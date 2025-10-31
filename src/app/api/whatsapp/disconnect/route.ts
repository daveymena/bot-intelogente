import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { BaileysService } from '@/lib/baileys-service'

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

    console.log(`[API] Desconectando WhatsApp para usuario: ${user.id}`)

    // Desconectar usando Baileys
    const success = await BaileysService.disconnect(user.id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Disconnected successfully'
    })
  } catch (error) {
    console.error('[API] WhatsApp disconnect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
