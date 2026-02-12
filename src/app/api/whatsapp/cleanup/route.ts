import { NextRequest, NextResponse } from 'next/server'
import { BaileysStableService } from '@/lib/baileys-stable-service'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

/**
 * 🧹 API para limpieza manual de sesiones WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener userId desde cookies o body
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    let userId: string | null = null
    
    // Intentar obtener userId de la sesión
    if (sessionCookie?.value) {
      try {
        const sessionData = JSON.parse(sessionCookie.value)
        userId = sessionData.userId
      } catch (e) {
        console.log('[Cleanup API] No se pudo parsear cookie de sesión')
      }
    }
    
    // Si no hay userId en cookie, intentar obtener del body
    const body = await request.json().catch(() => ({}))
    if (!userId && body.userId) {
      userId = body.userId
    }
    
    // Si aún no hay userId, obtener el primer usuario de la DB (para desarrollo)
    if (!userId) {
      const firstUser = await db.user.findFirst()
      if (firstUser) {
        userId = firstUser.id
        console.log('[Cleanup API] Usando primer usuario de DB:', userId)
      }
    }
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No autorizado',
        message: 'No se pudo determinar el usuario. Intenta iniciar sesión nuevamente.'
      }, { status: 401 })
    }
    const action = body.action || 'cleanup'

    switch (action) {
      case 'cleanup':
        // Limpiar sesión del usuario actual
        console.log(`[Cleanup API] 🧹 Limpiando sesión para usuario: ${userId}`)
        
        try {
          // 1. Desconectar sesión activa
          await BaileysStableService.disconnect(userId)
          console.log('[Cleanup API] ✅ Sesión desconectada')
          
          // 2. Limpiar archivos de sesión
          const sessionDir = path.join(process.cwd(), 'auth_sessions', userId)
          if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true })
            console.log('[Cleanup API] ✅ Archivos de sesión eliminados')
          }
          
          // 3. Limpiar base de datos
          await db.whatsAppConnection.deleteMany({
            where: { userId }
          })
          console.log('[Cleanup API] ✅ Conexión eliminada de BD')
          
          return NextResponse.json({
            success: true,
            message: 'Sesión limpiada exitosamente. Puedes conectar de nuevo.'
          })
        } catch (error) {
          console.error('[Cleanup API] Error en limpieza:', error)
          return NextResponse.json({
            success: false,
            message: 'Error al limpiar sesión: ' + (error as Error).message
          }, { status: 500 })
        }

      case 'check':
        // Verificar estado de conexión
        const status = BaileysStableService.getConnectionStatus(userId)
        const connection = await db.whatsAppConnection.findUnique({
          where: { userId }
        })

        return NextResponse.json({
          success: true,
          health: {
            isConnected: status?.status === 'CONNECTED',
            status: status?.status || 'DISCONNECTED',
            hasConnection: !!connection,
            phoneNumber: connection?.phoneNumber,
            lastConnected: connection?.lastConnectedAt
          }
        })

      case 'diagnostic':
        // Reporte completo
        const allConnections = await db.whatsAppConnection.findMany()

        return NextResponse.json({
          success: true,
          diagnostic: {
            totalConnections: allConnections.length,
            connections: allConnections
          }
        })

      case 'auto-cleanup':
        // Ejecutar auto-limpieza de conexiones expiradas
        console.log('[Cleanup API] 🧹 Ejecutando auto-limpieza...')

        // Limpiar conexiones expiradas en DB
        const expiredTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
        const result = await db.whatsAppConnection.updateMany({
          where: {
            status: 'QR_PENDING',
            qrExpiresAt: { lt: expiredTime }
          },
          data: {
            status: 'DISCONNECTED',
            qrCode: null,
            qrExpiresAt: null
          }
        })

        console.log(`[Cleanup API] ✅ ${result.count} conexiones expiradas limpiadas`)

        return NextResponse.json({
          success: true,
          message: `Auto-limpieza ejecutada: ${result.count} conexiones limpiadas`
        })

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

  } catch (error) {
    console.error('[API Cleanup] Error:', error)
    return NextResponse.json(
      { error: 'Error en limpieza de sesión' },
      { status: 500 }
    )
  }
}

/**
 * GET - Verificar estado de salud de la sesión
 */
export async function GET() {
  try {
    // Obtener userId desde cookies
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    let userId: string | null = null
    
    if (sessionCookie?.value) {
      try {
        const sessionData = JSON.parse(sessionCookie.value)
        userId = sessionData.userId
      } catch (e) {
        console.log('[Cleanup API GET] No se pudo parsear cookie de sesión')
      }
    }
    
    // Si no hay userId, obtener el primer usuario de la DB
    if (!userId) {
      const firstUser = await db.user.findFirst()
      if (firstUser) {
        userId = firstUser.id
        console.log('[Cleanup API GET] Usando primer usuario de DB:', userId)
      }
    }
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No autorizado',
        message: 'No se pudo determinar el usuario'
      }, { status: 401 })
    }

    // Verificar estado de conexión
    const status = BaileysStableService.getConnectionStatus(userId)
    const connection = await db.whatsAppConnection.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      health: {
        isConnected: status?.status === 'CONNECTED',
        status: status?.status || 'DISCONNECTED',
        hasConnection: !!connection,
        phoneNumber: connection?.phoneNumber,
        lastConnected: connection?.lastConnectedAt
      }
    })

  } catch (error) {
    console.error('[API Cleanup] Error:', error)
    return NextResponse.json(
      { error: 'Error verificando sesión' },
      { status: 500 }
    )
  }
}

