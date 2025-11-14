import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { db } from '@/lib/db'
import { BaileysStableService } from '@/lib/baileys-stable-service'

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

    // Obtener estado de la sesión activa de Baileys
    const session = BaileysStableService.getConnectionStatus(user.id)

    // Obtener estado de la DB
    const connection = await db.whatsAppConnection.findUnique({
      where: { userId: user.id }
    })

    // Si hay sesión activa, usar su QR
    const qrCode = session?.qr || connection?.qrCode

    return NextResponse.json({
      success: true,
      connection: connection || null,
      isConnected: connection?.isConnected || false,
      status: session?.status || connection?.status || 'DISCONNECTED',
      qrCode: qrCode
    })
  } catch (error) {
    console.error('WhatsApp status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get status' },
      { status: 500 }
    )
  }
}
