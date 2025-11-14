'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bot, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'

function ResendVerificationContent() {
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  
  const [email, setEmail] = useState(emailParam || '')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [emailParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico')
      return
    }

    setIsLoading(true)
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
        setSuccess(true)
        toast.success('¡Correo de verificación enviado!')
      } else {
        toast.error(data.error || 'Error al enviar el correo')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
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

          <Card>
            <CardHeader>
              <CardTitle>¡Correo enviado!</CardTitle>
              <CardDescription>
                Revisa tu bandeja de entrada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>

                {/* Message */}
                <div className="text-center space-y-2">
                  <p className="text-gray-700">
                    Hemos enviado un nuevo correo de verificación a:
                  </p>
                  <p className="font-semibold text-gray-900">{email}</p>
                </div>

                {/* Trial Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 mb-2">🎁 ¡10 Días Gratis te esperan!</h3>
                      <p className="text-sm text-green-700 mb-3">
                        Al verificar tu email, se activarán automáticamente tus 10 días de prueba gratuita.
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
                        <li>Revisa tu bandeja de entrada (y spam)</li>
                        <li>Haz clic en el enlace de verificación</li>
                        <li>¡Tu plan gratuito se activa automáticamente!</li>
                        <li>Inicia sesión y empieza a usar el sistema</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-900">💡 Consejos:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Revisa tu carpeta de spam o correo no deseado</li>
                    <li>• El correo puede tardar unos minutos en llegar</li>
                    <li>• Si no llega, puedes solicitar otro correo</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link href="/login" className="block">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Ir a iniciar sesión
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Enviar a otro correo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Reenviar verificación</CardTitle>
            <CardDescription>
              Ingresa tu correo para recibir un nuevo enlace de verificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-green-600" />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>¿Ya te registraste pero no verificaste tu email?</strong>
                  <br />
                  Ingresa tu correo electrónico y te enviaremos un nuevo enlace de verificación.
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar correo de verificación'
                )}
              </Button>

              {/* Links */}
              <div className="space-y-2 text-center text-sm">
                <div>
                  <Link href="/verify-code" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                    Ya tengo el código - Verificar ahora
                  </Link>
                </div>
                <div>
                  <Link href="/login" className="text-green-600 hover:text-green-700 hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </div>
                <div>
                  <span className="text-gray-600">¿No tienes cuenta? </span>
                  <Link href="/register" className="text-green-600 hover:text-green-700 hover:underline">
                    Regístrate aquí
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Problemas con la verificación?</p>
          <a href="mailto:soporte@smartsalesbot.com" className="text-green-600 hover:text-green-700 hover:underline">
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <ResendVerificationContent />
    </Suspense>
  )
}
