'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, AlertTriangle, Wifi, WifiOff, RotateCw } from 'lucide-react'

interface HealthMetrics {
  userId: string
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'UNHEALTHY'
  isHealthy: boolean
  statusMessage: string
  metrics: {
    uptime: number
    reconnectAttempts: number
    lastConnectedAt: string | null
    lastDisconnectAt: string | null
    averageResponseTime: number
    messagesSent: number
    messagesReceived: number
    errorRate: string
  }
  lastError: string | null
  lastHealthCheckAt: string
}

interface WhatsAppHealthMonitorProps {
  userId: string
  onReconnect?: () => void
}

export function WhatsAppHealthMonitor({ userId, onReconnect }: WhatsAppHealthMonitorProps) {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Obtener métricas
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/whatsapp/health?userId=${userId}`)
      if (!response.ok) throw new Error('Error obteniendo métricas')
      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Actualizar cada 10 segundos si está habilitado
  useEffect(() => {
    fetchMetrics()

    if (!autoRefresh) return

    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [userId, autoRefresh])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin">
              <RotateCw className="h-6 w-6" />
            </div>
            <span className="ml-2">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado de WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (metrics.status) {
      case 'CONNECTED':
        return metrics.isHealthy ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        )
      case 'CONNECTING':
        return <RotateCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <WifiOff className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (metrics.status) {
      case 'CONNECTED':
        return metrics.isHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      case 'CONNECTING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Estado de WhatsApp
          </CardTitle>
          <CardDescription>Monitoreo en tiempo real de la conexión</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ Pausar' : '▶️ Reanudar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
          >
            🔄 Actualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado Principal */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className="text-lg font-semibold">{metrics.statusMessage}</p>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {metrics.status}
          </Badge>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Tiempo de Respuesta</p>
            <p className="text-lg font-semibold text-blue-600">
              {metrics.metrics.averageResponseTime}ms
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Tasa de Error</p>
            <p className="text-lg font-semibold text-green-600">
              {metrics.metrics.errorRate}
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Mensajes Enviados</p>
            <p className="text-lg font-semibold text-purple-600">
              {metrics.metrics.messagesSent}
            </p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Mensajes Recibidos</p>
            <p className="text-lg font-semibold text-orange-600">
              {metrics.metrics.messagesReceived}
            </p>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Tiempo de Actividad</span>
            <span className="font-medium">
              {formatUptime(metrics.metrics.uptime)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Intentos de Reconexión</span>
            <span className="font-medium">
              {metrics.metrics.reconnectAttempts}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Última Conexión</span>
            <span className="font-medium">
              {formatDate(metrics.metrics.lastConnectedAt)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Última Desconexión</span>
            <span className="font-medium">
              {formatDate(metrics.metrics.lastDisconnectAt)}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-600">Último Chequeo</span>
            <span className="font-medium">
              {formatDate(metrics.lastHealthCheckAt)}
            </span>
          </div>
        </div>

        {/* Error si existe */}
        {metrics.lastError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 font-medium mb-1">Último Error</p>
            <p className="text-sm text-red-700">{metrics.lastError}</p>
          </div>
        )}

        {/* Botón de Reconexión */}
        {metrics.status !== 'CONNECTED' && (
          <Button
            onClick={onReconnect}
            className="w-full"
            variant="default"
          >
            🔄 Reconectar WhatsApp
          </Button>
        )}

        {/* Información de Ayuda */}
        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <p className="font-medium mb-1">💡 Información</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>El monitoreo se actualiza cada 10 segundos</li>
            <li>Si el estado es "Degradado", la conexión es lenta</li>
            <li>Si el estado es "Desconectado", haz clic en Reconectar</li>
            <li>Contacta al soporte si persisten los problemas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
