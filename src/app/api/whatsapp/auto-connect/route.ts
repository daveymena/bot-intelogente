import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppAutoConnect } from '@/lib/whatsapp-auto-connect'
import { db } from '@/lib/db'

/**
 * GET - Obtener estado del sistema de auto-conexión
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación mediante cookie o header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const status = WhatsAppAutoConnect.getStatus()

    return NextResponse.json({
      success: true,
      status
    })

  } catch (error) {
    console.error('[API] Error obteniendo estado de auto-conexión:', error)
    return NextResponse.json(
      { error: 'Error obteniendo estado' },
      { status: 500 }
    )
  }
}

/**
 * POST - Forzar reconexión
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    console.log(`[API] Forzando reconexión para usuario: ${userId}`)

    const success = await WhatsAppAutoConnect.forceReconnect(userId)

    return NextResponse.json({
      success,
      message: success 
        ? 'Reconexión iniciada' 
        : 'Reconexión requiere escanear QR'
    })

  } catch (error) {
    console.error('[API] Error forzando reconexión:', error)
    return NextResponse.json(
      { error: 'Error forzando reconexión' },
      { status: 500 }
    )
  }
}
