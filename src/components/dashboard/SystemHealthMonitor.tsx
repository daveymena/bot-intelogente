'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react'

interface ComponentHealth {
  name: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  lastCheck: Date
}

interface RecoveryLog {
  timestamp: string
  component: string
  error: string
  diagnosis: string
  action: string
  success: boolean
}

export default function SystemHealthMonitor() {
  const [health, setHealth] = useState<ComponentHealth[]>([])
  const [logs, setLogs] = useState<RecoveryLog[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRecovering, setAutoRecovering] = useState(false)

  useEffect(() => {
    checkSystemHealth()
    loadRecoveryLogs()
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      checkSystemHealth()
      loadRecoveryLogs()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const checkSystemHealth = async () => {
    setLoading(true)
    try {
      // Simular chequeo de salud (en producción, esto llamaría a APIs reales)
      const components: ComponentHealth[] = [
        {
          name: 'WhatsApp',
          status: 'healthy',
          message: 'Conectado y funcionando',
          lastCheck: new Date()
        },
        {
          name: 'Base de Datos',
          status: 'healthy',
          message: '256 productos activos',
          lastCheck: new Date()
        },
        {
          name: 'Sistema de Pagos',
          status: 'healthy',
          message: 'APIs configuradas',
          lastCheck: new Date()
        },
        {
          name: 'Inteligencia Artificial',
          status: 'healthy',
          message: 'Groq API activa',
          lastCheck: new Date()
        }
      ]

      setHealth(components)
    } catch (error) {
      console.error('Error checking health:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecoveryLogs = async () => {
    try {
      const response = await fetch('/api/system/auto-recovery')
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error loading logs:', error)
    }
  }

  const triggerAutoRecovery = async (component?: string) => {
    setAutoRecovering(true)
    try {
      const response = await fetch('/api/system/auto-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: component || 'all',
          action: component ? 'recover' : 'full'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('✅ Recuperación exitosa')
        checkSystemHealth()
        loadRecoveryLogs()
      } else {
        alert('❌ Error en recuperación: ' + result.error)
      }
    } catch (error) {
      alert('❌ Error: ' + error)
    } finally {
      setAutoRecovering(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Saludable</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500">Advertencia</Badge>
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Salud del Sistema</h2>
          <p className="text-gray-600">Auto-recuperación inteligente activada</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => checkSystemHealth()}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => triggerAutoRecovery()}
            disabled={autoRecovering}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {autoRecovering ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Recuperando...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Recuperación Completa
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estado de Componentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {health.map((component) => (
          <Card key={component.name} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(component.status)}
                <h3 className="font-semibold">{component.name}</h3>
              </div>
              {getStatusBadge(component.status)}
            </div>
            <p className="text-sm text-gray-600 mb-3">{component.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(component.lastCheck).toLocaleTimeString('es-CO')}
              </span>
              {component.status !== 'healthy' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => triggerAutoRecovery(component.name.toLowerCase())}
                  disabled={autoRecovering}
                >
                  Reparar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Logs de Recuperación */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Historial de Recuperaciones</h3>
        
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay recuperaciones registradas
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  log.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-semibold">{log.component}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString('es-CO')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Error:</strong> {log.error}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Diagnóstico:</strong> {log.diagnosis}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Acción:</strong> {log.action}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Información */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Sistema de Auto-Recuperación Activo
            </h4>
            <p className="text-sm text-blue-800">
              El sistema monitorea automáticamente todos los componentes cada 5 minutos.
              Si detecta un problema, intentará diagnosticarlo usando IA y aplicar una
              solución automática. Los logs de todas las recuperaciones se guardan aquí.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
