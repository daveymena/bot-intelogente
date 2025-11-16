/**
 * GET /api/local-ai/status
 * Obtener estado de la IA Local
 */

import { NextRequest, NextResponse } from 'next/server'
import { BaileysLocalAIIntegration } from '@/lib/baileys-local-ai-integration'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Verificando estado de IA Local...')

    // Verificar que IA Local está lista
    const isReady = await BaileysLocalAIIntegration.verifyLocalAIReady()

    // Obtener estadísticas
    const stats = await BaileysLocalAIIntegration.getStats()

    return NextResponse.json({
      status: isReady ? 'READY' : 'NOT_READY',
      isReady,
      stats,
      timestamp: new Date(),
      message: isReady
        ? '✅ IA Local lista y funcionando'
        : '⚠️ IA Local no está completamente inicializada'
    })
  } catch (error) {
    console.error('[API] Error verificando IA Local:', error)
    return NextResponse.json(
      {
        status: 'ERROR',
        isReady: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date()
      },
      { status: 500 }
    )
  }
}
