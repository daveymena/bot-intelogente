'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600">
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 p-3 rounded text-left text-xs font-mono text-red-800 overflow-auto max-h-32">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
