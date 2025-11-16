/**
 * GET /api/whatsapp/health
 * Obtener estado de salud de la conexión de WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server'
import WhatsAppHealthMonitor from '@/lib/whatsapp-health-monitor'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requerido' },
        { status: 400 }
      )
    }

    // Obtener métricas del monitor
    const monitor = WhatsAppHealthMonitor.getMonitor(userId)
    
    if (!monitor) {
      // Si no hay monitor, obtener estado de la BD
      const connection = await db.whatsAppConnection.findUnique({
        where: { userId }
      })

      if (!connection) {
        return NextResponse.json(
          {
            status: 'DISCONNECTED',
            message: 'No hay conexión registrada',
            userId
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        status: connection.status,
        isConnected: connection.isConnected,
        phoneNumber: connection.phoneNumber,
        lastConnectedAt: connection.lastConnectedAt,
        lastError: connection.lastError,
        userId
      })
    }

    const metrics = monitor.getMetrics()

    return NextResponse.json({
      userId,
      status: metrics.connectionStatus,
      isHealthy: metrics.isHealthy,
      statusMessage: monitor.getStatus(),
      metrics: {
        uptime: metrics.uptime,
        reconnectAttempts: metrics.reconnectAttempts,
        lastConnectedAt: metrics.lastConnectedAt,
        lastDisconnectAt: metrics.lastDisconnectAt,
        averageResponseTime: metrics.averageResponseTime,
        messagesSent: metrics.messagesSent,
        messagesReceived: metrics.messagesReceived,
        errorRate: (metrics.errorRate * 100).toFixed(2) + '%'
      },
      lastError: metrics.lastError,
      lastHealthCheckAt: metrics.lastHealthCheckAt
    })
  } catch (error) {
    console.error('[API] Error en /api/whatsapp/health:', error)
    return NextResponse.json(
      { error: 'Error obteniendo estado de salud' },
      { status: 500 }
    )
  }
}
