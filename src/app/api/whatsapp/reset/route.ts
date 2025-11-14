import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { WhatsAppWebService } from '@/lib/whatsapp-web-service'

/**
 * 🔄 API para RESETEO COMPLETO de WhatsApp
 * Limpia TODAS las sesiones y archivos para empezar desde cero
 */
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

    console.log(`[API Reset] 🔄 Iniciando reseteo completo para usuario: ${user.id}`)

    // Ejecutar desconexión (limpia sesión y archivos)
    const disconnected = await WhatsAppWebService.disconnect(user.id)

    if (disconnected) {
      console.log(`[API Reset] ✅ Reseteo exitoso`)
      return NextResponse.json({
        success: true,
        message: 'Sesión limpiada exitosamente. Ahora puedes conectar desde cero.'
      })
    } else {
      console.log(`[API Reset] ❌ Reseteo fallido`)
      return NextResponse.json(
        { success: false, error: 'Error al limpiar sesión' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API Reset] ❌ Error en reseteo:', error)
    return NextResponse.json(
      { success: false, error: 'Error ejecutando reseteo completo' },
        { status: 500 }
    )
  }
}
