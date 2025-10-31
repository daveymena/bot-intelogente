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

    console.log(`[API] Iniciando conexión WhatsApp para usuario: ${user.id}`)

    // Inicializar conexión real con Baileys
    const result = await BaileysService.initializeConnection(user.id)

    console.log(`[API] Resultado de inicialización:`, { 
      success: result.success, 
      hasQr: !!result.qr,
      error: result.error 
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to initialize connection' },
        { status: 500 }
      )
    }

    // Si el QR está disponible inmediatamente, devolverlo
    if (result.qr) {
      console.log(`[API] QR disponible inmediatamente, enviando al cliente`)
      return NextResponse.json({
        success: true,
        qr: result.qr,
        message: 'QR generado. Escanea con WhatsApp.'
      })
    }

    // Si no está disponible inmediatamente, indicar que debe hacer polling
    console.log(`[API] QR no disponible inmediatamente, cliente debe hacer polling`)
    return NextResponse.json({
      success: true,
      qr: null,
      message: 'Generando QR. Consulta el estado en unos segundos.',
      polling: true
    })
  } catch (error) {
    console.error('[API] WhatsApp connect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize connection' },
      { status: 500 }
    )
  }
}
