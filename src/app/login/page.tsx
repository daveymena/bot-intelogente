'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Bot,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  // Always redirect to dashboard after login
  const redirect = '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include', // Important: include cookies
      })

      const data = await response.json()

      if (response.ok) {
        // Login successful
        console.log('✅ Login exitoso')
        console.log('🍪 Cookie guardada')
        console.log('🔄 Redirigiendo a:', redirect)
        
        // Keep loading state active during redirect
        // Wait a moment for cookie to be fully set
        setTimeout(() => {
          console.log('⏰ Ejecutando redirección...')
          window.location.replace(redirect)
        }, 300)
      } else {
        setError(data.error || 'Error al iniciar sesión')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Error de conexión. Intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Sales Bot Pro</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para gestionar tu bot</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                  Regístrate gratis
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">7 días gratis</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">IA avanzada</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Soporte 24/7</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
