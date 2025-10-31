'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { toast } from 'sonner'

function VerificationPendingContent() {
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const handleResend = async () => {
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResent(true)
        toast.success('Correo de verificación reenviado')
      } else {
        toast.error(data.error || 'Error al reenviar correo')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Error de conexión')
    } finally {
      setIsResending(false)
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
            <CardTitle>Verifica tu correo electrónico</CardTitle>
            <CardDescription>
              Te hemos enviado un correo de verificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Email Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-green-600" />
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <p className="text-gray-700">
                  Hemos enviado un correo de verificación a:
                </p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pasos siguientes:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Revisa tu bandeja de entrada</li>
                    <li>Haz clic en el enlace de verificación</li>
                    <li>Inicia sesión en tu cuenta</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Resend Button */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  ¿No recibiste el correo?
                </p>
                <Button
                  onClick={handleResend}
                  disabled={isResending || resent}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reenviando...
                    </div>
                  ) : resent ? (
                    '✓ Correo reenviado'
                  ) : (
                    'Reenviar correo de verificación'
                  )}
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-900">💡 Consejos:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Revisa tu carpeta de spam o correo no deseado</li>
                  <li>• El correo puede tardar unos minutos en llegar</li>
                  <li>• Asegúrate de que el correo sea correcto</li>
                </ul>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link href="/login">
                  <Button variant="ghost" className="text-green-600 hover:text-green-700">
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Problemas con la verificación?</p>
          <a href="mailto:soporte@smartsalesbot.com" className="text-green-600 hover:text-green-700">
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  )
}

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <VerificationPendingContent />
    </Suspense>
  )
}
