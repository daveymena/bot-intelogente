import { NextRequest, NextResponse } from 'next/server'
import { SessionCleanupService } from '@/lib/session-cleanup-service'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

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
        const health = await SessionCleanupService.checkSessionHealth(userId)
        
        if (health.shouldCleanup || body.force) {
          const success = await SessionCleanupService.cleanupCorruptedSession(userId)
          return NextResponse.json({
            success,
            message: success ? 'Sesión limpiada exitosamente' : 'Error al limpiar sesión',
            health
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'La sesión está saludable, no requiere limpieza',
            health
          })
        }

      case 'check':
        // Solo verificar salud sin limpiar
        const healthCheck = await SessionCleanupService.checkSessionHealth(userId)
        return NextResponse.json({
          success: true,
          health: healthCheck
        })

      case 'diagnostic':
        // Reporte completo (solo admin)
        const diagnostic = await SessionCleanupService.diagnosticReport()
        return NextResponse.json({
          success: true,
          diagnostic
        })

      case 'auto-cleanup':
        // Ejecutar auto-limpieza de todas las sesiones corruptas
        await SessionCleanupService.autoCleanup()
        await SessionCleanupService.cleanupExpiredLocks()
        return NextResponse.json({
          success: true,
          message: 'Auto-limpieza ejecutada'
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
export async function GET(request: NextRequest) {
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

    const health = await SessionCleanupService.checkSessionHealth(userId)

    return NextResponse.json({
      success: true,
      health
    })

  } catch (error) {
    console.error('[API Cleanup] Error:', error)
    return NextResponse.json(
      { error: 'Error verificando sesión' },
      { status: 500 }
    )
  }
}
