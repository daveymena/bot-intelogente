import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { BaileysStableService } from '@/lib/baileys-stable-service'
import { db } from '@/lib/db'

/**
 * 🔄 API de Reconexión Automática
 * Intenta reconectar WhatsApp sin generar nuevo QR
 * Usa las credenciales guardadas en auth_sessions
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

    console.log(`[API Reconnect] 🔄 Iniciando reconexión para usuario: ${user.id}`)

    // Verificar si ya hay una conexión activa
    const existingSession = BaileysStableService.getConnectionStatus(user.id)
    
    if (existingSession && existingSession.status === 'CONNECTED') {
      console.log('[API Reconnect] ✅ Ya hay una conexión activa')
      return NextResponse.json({
        success: true,
        message: 'Ya conectado',
        alreadyConnected: true
      })
    }

    // Verificar si hay credenciales guardadas
    const fs = await import('fs')
    const path = await import('path')
    const authDir = path.join(process.cwd(), 'auth_sessions', user.id)
    
    if (!fs.existsSync(authDir) || fs.readdirSync(authDir).length === 0) {
      console.log('[API Reconnect] ⚠️ No hay credenciales guardadas, se necesita nuevo QR')
      return NextResponse.json({
        success: false,
        error: 'No hay credenciales guardadas. Genera un nuevo QR.',
        needsNewQR: true
      }, { status: 400 })
    }

    console.log('[API Reconnect] 📁 Credenciales encontradas, intentando reconectar...')

    // Intentar reconectar con las credenciales existentes
    const result = await BaileysStableService.initializeConnection(user.id)

    if (result.success) {
      console.log('[API Reconnect] ✅ Reconexión exitosa')
      
      // Actualizar base de datos
      await db.whatsAppConnection.updateMany({
        where: { userId: user.id },
        data: {
          status: 'CONNECTED',
          isConnected: true,
          lastConnectedAt: new Date(),
          lastError: null,
          lastErrorAt: null
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Reconectado exitosamente'
      })
    } else {
      console.log('[API Reconnect] ❌ Error en reconexión:', result.error)
      
      // Si falla, puede ser que las credenciales expiraron
      if (result.error?.includes('logged out') || result.error?.includes('401')) {
        console.log('[API Reconnect] 🔑 Credenciales expiradas, se necesita nuevo QR')
        return NextResponse.json({
          success: false,
          error: 'Credenciales expiradas. Genera un nuevo QR.',
          needsNewQR: true
        }, { status: 401 })
      }

      return NextResponse.json({
        success: false,
        error: result.error || 'Error al reconectar'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[API Reconnect] ❌ Error general:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}
