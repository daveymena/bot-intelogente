'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bot, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'

function VerifyCodeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email')
  
  const [email, setEmail] = useState(emailParam || '')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [emailParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !code) {
      toast.error('Por favor ingresa tu email y el código')
      return
    }

    if (code.length !== 6) {
      toast.error('El código debe tener 6 dígitos')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success('¡Email verificado exitosamente!')
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast.error(data.error || 'Código inválido')
      }
    } catch (error) {
      console.error('Verify error:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Por favor ingresa tu email')
      return
    }

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
        toast.success('Nuevo código enviado a tu email')
      } else {
        toast.error(data.error || 'Error al reenviar código')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Error de conexión')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Sales Bot Pro</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>¡Email Verificado!</CardTitle>
              <CardDescription>
                Tu cuenta ha sido activada exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                  <div className="text-center">
                    <h3 className="font-bold text-green-900 mb-2">🎉 ¡Bienvenido!</h3>
                    <p className="text-sm text-green-700 mb-3">
                      Tu cuenta está activa con 10 días de prueba gratuita
                    </p>
                    <p className="text-xs text-green-600">
                      Redirigiendo al login...
                    </p>
                  </div>
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Sales Bot Pro</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verificar Email</CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos que enviamos a tu email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Revisa tu email</strong>
                  <br />
                  Te enviamos un código de 6 dígitos. Si no lo ves, revisa tu carpeta de spam.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || !!emailParam}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={isLoading}
                  className="h-12 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 text-center">
                  Ingresa los 6 dígitos que recibiste por email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full h-12 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </div>
                ) : (
                  'Verificar Email'
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  ¿No recibiste el código?
                </p>
                <Button
                  type="button"
                  onClick={handleResend}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Reenviar código
                </Button>
              </div>

              <div className="space-y-2 text-center text-sm">
                <div>
                  <Link href="/resend-verification" className="text-orange-600 hover:text-orange-700 hover:underline">
                    ¿No tienes el código? Reenviar código
                  </Link>
                </div>
                <div>
                  <Link href="/login" className="text-green-600 hover:text-green-700 hover:underline">
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

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

export default function VerifyCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <VerifyCodeContent />
    </Suspense>
  )
}
