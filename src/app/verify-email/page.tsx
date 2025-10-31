'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bot, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no encontrado')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('¡Tu correo ha sido verificado exitosamente!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Error al verificar el correo')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Error de conexión. Intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Sales Bot Pro</h1>
        </div>

        {/* Verification Card */}
        <Card>
          <CardHeader>
            <CardTitle>Verificación de Email</CardTitle>
            <CardDescription>
              {status === 'loading' && 'Verificando tu correo electrónico...'}
              {status === 'success' && 'Verificación completada'}
              {status === 'error' && 'Error en la verificación'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              {status === 'loading' && (
                <div className="space-y-4">
                  <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto" />
                  <p className="text-gray-600">Verificando tu correo...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{message}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Serás redirigido al inicio de sesión en unos segundos...
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/login')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Ir al inicio de sesión
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Error</p>
                    <p className="text-sm text-gray-600 mt-2">{message}</p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Volver al inicio de sesión
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="outline" className="w-full">
                        Crear nueva cuenta
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Necesitas ayuda? Contáctanos en</p>
          <a href="mailto:soporte@smartsalesbot.com" className="text-green-600 hover:text-green-700">
            soporte@smartsalesbot.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
