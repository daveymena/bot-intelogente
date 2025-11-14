/**
 * 📬 API: Estadísticas de cola de mensajes
 */

import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppWebService } from '@/lib/whatsapp-web-service'
import { AuthService } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Obtener token del header
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = AuthService.verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Obtener estadísticas de la cola
    const stats = await WhatsAppWebService.getQueueStats()

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
