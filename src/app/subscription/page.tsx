'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { 
  Crown, 
  Zap, 
  Check, 
  X,
  Star,
  TrendingUp,
  Shield,
  Headphones,
  Rocket,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: string
  intervalCount: number
  features: string[]
  isActive: boolean
}

export default function SubscriptionPage() {
  const { user, subscription, refreshUser } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.map((plan: any) => ({
          ...plan,
          features: JSON.parse(plan.features)
        })))
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Error al cargar los planes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    setSubscribing(planId)
    
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('¡Suscripción creada exitosamente!')
        await refreshUser()
        router.push('/dashboard')
      } else {
        toast.error(data.error || 'Error al crear suscripción')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubscribing(null)
    }
  }

  const getPopularPlan = () => {
    return plans.find(plan => plan.name === 'Semestral')
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Semanal':
        return <Zap className="w-6 h-6" />
      case 'Mensual':
        return <TrendingUp className="w-6 h-6" />
      case 'Semestral':
        return <Crown className="w-6 h-6" />
      case 'Anual':
        return <Rocket className="w-6 h-6" />
      default:
        return <Star className="w-6 h-6" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'Semanal':
        return 'from-green-500 to-green-600'
      case 'Mensual':
        return 'from-blue-500 to-blue-600'
      case 'Semestral':
        return 'from-purple-500 to-purple-600'
      case 'Anual':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando planes...</p>
        </div>
      </div>
    )
  }

  const popularPlan = getPopularPlan()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planes de Suscripción</h1>
              <p className="text-gray-600 mt-2">
                Elige el plan perfecto para tu negocio
              </p>
            </div>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Volver al Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Current Subscription Alert */}
      {subscription && subscription.hasAccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Alert className="border-green-200 bg-green-50">
            <Crown className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Plan Actual: {subscription.type}</strong>
                  <p className="text-sm mt-1">
                    {subscription.endsAt && (
                      <>Válido hasta: {new Date(subscription.endsAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Administrar Suscripción
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const isPopular = plan.id === popularPlan?.id
            const isCurrentPlan = subscription && (
              (subscription.type === plan.name) || 
              (subscription.type === 'TRIAL' && plan.name === 'Semanal')
            )
            const isSubscribing = subscribing === plan.id

            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'border-2 border-purple-500 shadow-xl' : 'border border-gray-200'}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(plan.name)} rounded-lg flex items-center justify-center mx-auto mb-4 text-white`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">
                      /{plan.interval === 'WEEK' ? 'semana' : 
                         plan.interval === 'MONTH' && plan.intervalCount === 6 ? 'semestre' : 
                         plan.interval === 'YEAR' ? 'año' : 'mes'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${isPopular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
                    disabled={isCurrentPlan || isSubscribing}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isSubscribing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </div>
                    ) : isCurrentPlan ? (
                      'Plan Actual'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Suscribirse
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Comparación de Características</h2>
            <p className="text-gray-600 mt-2">
              Todas las características incluidas en cada plan
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 font-semibold text-sm">
              <div>Característica</div>
              <div className="text-center">Semanal</div>
              <div className="text-center">Mensual</div>
              <div className="text-center">Semestral</div>
              <div className="text-center">Anual</div>
            </div>
            
            {[
              { feature: 'Mensajes diarios', weekly: '100', monthly: '500', semestral: '∞', annual: '∞' },
              { feature: 'Productos', weekly: '50', monthly: '200', semestral: '1000', annual: '∞' },
              { feature: 'Conexiones WhatsApp', weekly: '1', monthly: '2', semestral: '5', annual: '∞' },
              { feature: 'Soporte', weekly: 'Email', monthly: 'Prioritario', semestral: '24/7', annual: 'Dedicado' },
              { feature: 'API Access', weekly: <X className="w-4 h-4 text-red-500 mx-auto" />, monthly: <X className="w-4 h-4 text-red-500 mx-auto" />, semestral: <Check className="w-4 h-4 text-green-500 mx-auto" />, annual: <Check className="w-4 h-4 text-green-500 mx-auto" /> },
              { feature: 'White Label', weekly: <X className="w-4 h-4 text-red-500 mx-auto" />, monthly: <X className="w-4 h-4 text-red-500 mx-auto" />, semestral: <X className="w-4 h-4 text-red-500 mx-auto" />, annual: <Check className="w-4 h-4 text-green-500 mx-auto" /> }
            ].map((row, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-6 border-t border-gray-200 text-sm">
                <div className="font-medium">{row.feature}</div>
                <div className="text-center">{row.weekly}</div>
                <div className="text-center">{row.monthly}</div>
                <div className="text-center">{row.semestral}</div>
                <div className="text-center">{row.annual}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Preguntas Frecuentes</h2>
            <p className="text-gray-600 mt-2">
              Todo lo que necesitas saber sobre nuestros planes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Puedo cambiar de plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sí, puedes actualizar o cambiar tu plan en cualquier momento. 
                  Los cambios se reflejarán en tu próximo ciclo de facturación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Hay período de prueba?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sí, todos los nuevos usuarios disfrutan de 7 días GRATIS 
                  con acceso completo a todas las funciones.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué métodos de pago aceptan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Aceptamos tarjetas de crédito/débito, PayPal y transferencias 
                  bancarias. Todos los pagos son procesados de forma segura.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Puedo cancelar cuando quiera?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sí, puedes cancelar tu suscripción en cualquier momento. 
                  Seguirás teniendo acceso hasta el final del período pagado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}