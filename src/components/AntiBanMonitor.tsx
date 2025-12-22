'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Activity, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

interface AntiBanStats {
  sending: {
    messageCount: number
    lastMessageTime: string
    uniqueRecipients: number
    uniquePhrases: number
    canSendMessage: boolean
  }
  reconnection: {
    disconnectCount: number
    reconnectAttempts: number
    isReconnecting: boolean
    lastDisconnectTime: string
    canReconnect: boolean
  }
}

export default function AntiBanMonitor({ userId }: { userId: string }) {
  const [stats, setStats] = useState<AntiBanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/anti-ban/stats/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching anti-ban stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const resetStats = async () => {
    try {
      const response = await fetch(`/api/anti-ban/stats/${userId}/reset`, {
        method: 'POST'
      })
      if (response.ok) {
        await fetchStats()
        alert('✅ Estadísticas reseteadas')
      }
    } catch (error) {
      console.error('Error resetting stats:', error)
      alert('❌ Error reseteando estadísticas')
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Actualizar cada 30s
    return () => clearInterval(interval)
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold">Protección Anti-Ban</h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={resetStats}
            variant="outline"
            size="sm"
          >
            Resetear
          </Button>
        </div>
      </div>

      {/* Sending Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Estadísticas de Envío
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Mensajes Enviados</p>
              <p className="text-2xl font-bold">{stats.sending.messageCount}</p>
              <p className="text-xs text-gray-500">Último minuto</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Destinatarios Únicos</p>
              <p className="text-2xl font-bold">{stats.sending.uniqueRecipients}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Frases Únicas</p>
              <p className="text-2xl font-bold">{stats.sending.uniquePhrases}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <div className="flex items-center gap-2 mt-1">
                {stats.sending.canSendMessage ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Activo</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">Límite</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {stats.sending.lastMessageTime && (
            <p className="text-xs text-gray-500 mt-4">
              Último mensaje: {new Date(stats.sending.lastMessageTime).toLocaleString('es-CO')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reconnection Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Estadísticas de Reconexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Desconexiones</p>
              <p className="text-2xl font-bold">{stats.reconnection.disconnectCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Intentos de Reconexión</p>
              <p className="text-2xl font-bold">{stats.reconnection.reconnectAttempts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <div className="flex items-center gap-2 mt-1">
                {stats.reconnection.isReconnecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-semibold text-blue-600">Reconectando</span>
                  </>
                ) : stats.reconnection.canReconnect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">OK</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">Bloqueado</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Puede Reconectar</p>
              <p className="text-2xl font-bold">
                {stats.reconnection.canReconnect ? '✅' : '❌'}
              </p>
            </div>
          </div>
          {stats.reconnection.lastDisconnectTime && (
            <p className="text-xs text-gray-500 mt-4">
              Última desconexión: {new Date(stats.reconnection.lastDisconnectTime).toLocaleString('es-CO')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">🛡️ Protección Anti-Ban Activa</p>
              <ul className="space-y-1 text-xs">
                <li>• Máximo 15 mensajes por minuto</li>
                <li>• Delays humanos automáticos (800-2500ms)</li>
                <li>• Detección de spam por frase repetida</li>
                <li>• Reconexión con exponential backoff</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
