/**
 * 📬 API: Estadísticas de cola de mensajes
 */

import { NextRequest, NextResponse } from 'next/server'
import { BaileysService } from '@/lib/baileys-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener estadísticas de la cola
    const stats = await BaileysService.getQueueStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('[API Queue] Error:', error)
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas de cola' },
      { status: 500 }
    )
  }
}
