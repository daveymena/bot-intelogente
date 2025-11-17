import { NextRequest, NextResponse } from 'next/server'
import { SafeBaileysSender } from '@/lib/safe-baileys-sender'
import { SafeReconnectManager } from '@/lib/safe-reconnect-manager'

/**
 * GET /api/anti-ban/stats/:userId
 * Obtener estadísticas de protección anti-ban para un usuario
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID requerido' },
        { status: 400 }
      )
    }

    // Obtener estadísticas de envío
    const sendingStats = SafeBaileysSender.getStats(userId)

    // Obtener estadísticas de reconexión
    const reconnectStats = SafeReconnectManager.getReconnectState(userId)

    return NextResponse.json({
      success: true,
      userId,
      stats: {
        sending: sendingStats,
        reconnection: reconnectStats
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[API] Error obteniendo stats anti-ban:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/anti-ban/stats/:userId/reset
 * Resetear estadísticas de un usuario
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID requerido' },
        { status: 400 }
      )
    }

    // Resetear límites
    SafeBaileysSender.resetLimits(userId)
    SafeReconnectManager.resetState(userId)

    return NextResponse.json({
      success: true,
      message: 'Estadísticas reseteadas',
      userId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[API] Error reseteando stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
