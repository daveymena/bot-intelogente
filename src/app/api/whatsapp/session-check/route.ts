import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { WhatsAppSessionManager } from '@/lib/whatsapp-session-manager'

/**
 * GET /api/whatsapp/session-check
 * Verificar si el usuario puede conectar WhatsApp
 */
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

    // Verificar si puede conectar
    const validation = await WhatsAppSessionManager.canUserConnect(user.id)

    // Obtener estadísticas
    const stats = await WhatsAppSessionManager.getSessionStats()

    return NextResponse.json({
      success: true,
      canConnect: validation.canConnect,
      reason: validation.reason,
      existingConnection: validation.existingConnection ? {
        status: validation.existingConnection.status,
        phoneNumber: validation.existingConnection.phoneNumber,
        isConnected: validation.existingConnection.isConnected,
        lastConnectedAt: validation.existingConnection.lastConnectedAt
      } : null,
      stats
    })
  } catch (error) {
    console.error('[API] Session check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check session' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/whatsapp/session-check
 * Detectar y resolver conflictos de números duplicados
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

    // Solo admin puede ejecutar esto
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number required' },
        { status: 400 }
      )
    }

    // Detectar y resolver conflictos
    const result = await WhatsAppSessionManager.detectAndResolveConflicts(phoneNumber)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('[API] Conflict resolution error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to resolve conflicts' },
      { status: 500 }
    )
  }
}
