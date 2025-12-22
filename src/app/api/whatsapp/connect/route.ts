import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { BaileysStableService } from '@/lib/baileys-stable-service'
import { WhatsAppSessionManager } from '@/lib/whatsapp-session-manager'

export async function POST(request: NextRequest) {
  let userId: string | undefined
  
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)
    userId = user?.id

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    console.log(`[API] 🔍 Verificando permisos de conexión para usuario: ${user.id}`)

    // 🔒 VALIDACIÓN: Verificar si el usuario puede conectar
    const validation = await WhatsAppSessionManager.canUserConnect(user.id)

    if (!validation.canConnect) {
      console.log(`[API] ❌ Conexión rechazada: ${validation.reason}`)
      return NextResponse.json(
        { 
          success: false, 
          error: validation.reason,
          existingConnection: validation.existingConnection ? {
            status: validation.existingConnection.status,
            phoneNumber: validation.existingConnection.phoneNumber,
            isConnected: validation.existingConnection.isConnected
          } : null
        },
        { status: 409 } // 409 Conflict
      )
    }

    console.log(`[API] ✅ Usuario autorizado para conectar`)

    // 🔒 Bloquear sesión para prevenir conexiones simultáneas
    WhatsAppSessionManager.lockSession(user.id)

    // 🧹 Limpiar sesión anterior si existe
    await WhatsAppSessionManager.cleanupBeforeConnect(user.id)

    console.log(`[API] 🚀 Iniciando conexión WhatsApp con Baileys para usuario: ${user.id}`)

    // Inicializar conexión con Baileys (más estable que whatsapp-web.js)
    const result = await BaileysStableService.initializeConnection(user.id)

    console.log(`[API] Resultado de inicialización:`, { 
      success: result.success, 
      hasQr: !!result.qr,
      error: result.error 
    })

    if (!result.success) {
      // 🔓 Desbloquear sesión si falla
      WhatsAppSessionManager.unlockSession(user.id)
      
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to initialize connection' },
        { status: 500 }
      )
    }

    // Si el QR está disponible inmediatamente, devolverlo
    if (result.qr) {
      console.log(`[API] ✅ QR disponible inmediatamente, enviando al cliente`)
      
      // 🔓 Desbloquear sesión (QR generado exitosamente)
      WhatsAppSessionManager.unlockSession(user.id)
      
      return NextResponse.json({
        success: true,
        qr: result.qr,
        message: 'QR generado. Escanea con WhatsApp.'
      })
    }

    // Si no está disponible inmediatamente, indicar que debe hacer polling
    console.log(`[API] ⏳ QR no disponible inmediatamente, cliente debe hacer polling`)
    
    // 🔓 Desbloquear sesión después de un tiempo
    setTimeout(() => {
      WhatsAppSessionManager.unlockSession(user.id)
    }, 10000) // 10 segundos
    
    return NextResponse.json({
      success: true,
      qr: null,
      message: 'Generando QR. Consulta el estado en unos segundos.',
      polling: true
    })
  } catch (error) {
    console.error('[API] ❌ WhatsApp connect error:', error)
    
    // 🔓 Desbloquear sesión en caso de error
    if (userId) {
      WhatsAppSessionManager.unlockSession(userId)
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to initialize connection' },
      { status: 500 }
    )
  }
}
