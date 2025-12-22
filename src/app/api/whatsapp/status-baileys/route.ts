import { NextRequest, NextResponse } from 'next/server'
import { BaileysStableService } from '@/lib/baileys-stable-service'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Obtener usuario de la sesión
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { id: sessionCookie.value },
      include: { user: true }
    })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener estado de la sesión en memoria
    const sessionStatus = BaileysStableService.getConnectionStatus(userId)

    // Obtener estado de la DB
    const dbConnection = await db.whatsAppConnection.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      connected: sessionStatus?.status === 'CONNECTED',
      status: sessionStatus?.status || dbConnection?.status || 'DISCONNECTED',
      phoneNumber: dbConnection?.phoneNumber,
      qr: dbConnection?.qrCode,
      qrExpires: dbConnection?.qrExpiresAt,
      lastConnected: dbConnection?.lastConnectedAt,
      isReady: sessionStatus?.isReady || false
    })
  } catch (error) {
    console.error('[API Baileys Status] Error:', error)
    return NextResponse.json({
      connected: false,
      status: 'DISCONNECTED',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
  }
}
