'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, CreditCard, Loader2, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface CartItem {
  id: string
  name: string
  price: number
  currency: string
  quantity: number
  images?: string | string[]
}

interface PaymentLinks {
  mercadopago?: string
  paypal?: string
}

export default function CheckoutProfesional() {
  const router = useRouter()
  const { toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>('mercadopago')
  const [isClient, setIsClient] = useState(false)
  const [paymentLinks, setPaymentLinks] = useState<PaymentLinks>({})
  const [generatingLinks, setGeneratingLinks] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  })

  useEffect(() => {
    setIsClient(true)
    loadCart()
  }, [])

  useEffect(() => {
    if (cart.length > 0) {
      generatePaymentLinks()
    }
  }, [cart])

  const loadCart = () => {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        const parsedCart = JSON.parse(saved)
        setCart(parsedCart)
        if (parsedCart.length === 0) {
          router.push('/tienda')
        }
      } else {
        router.push('/tienda')
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      router.push('/tienda')
    }
  }

  const generatePaymentLinks = async () => {
    if (cart.length === 0) return
    
    setGeneratingLinks(true)
    
    try {
      // Generar links para el primer producto (o puedes hacer un bundle)
      const mainProduct = cart[0]
      const response = await fetch(`/api/payment/generate-link?productId=${mainProduct.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setPaymentLinks(data.paymentLinks || {})
      }
    } catch (error) {
      console.error('Error generating payment links:', error)
    } finally {
      setGeneratingLinks(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getImageUrl = (item: CartItem): string => {
    try {
      if (!item.images) return '/placeholder-product.svg'
      
      if (Array.isArray(item.images)) {
        return item.images[0] || '/placeholder-product.svg'
      }
      
      if (typeof item.images === 'string') {
        try {
          const parsed = JSON.parse(item.images)
          return Array.isArray(parsed) ? parsed[0] : item.images.split(',')[0]
        } catch {
          return item.images.split(',')[0] || '/placeholder-product.svg'
        }
      }
      
      return '/placeholder-product.svg'
    } catch {
      return '/placeholder-product.svg'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulario
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // Crear orden en la base de datos
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        notes: formData.notes,
        items: cart,
        total: cartTotal,
        paymentMethod: paymentMethod,
        status: 'pending'
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la orden')
      }

      const { orderId } = await response.json()

      // Redirigir seg├║n el m├®todo de pago
      let paymentUrl = ''
      
      if (paymentMethod === 'mercadopago' && paymentLinks.mercadopago) {
        paymentUrl = paymentLinks.mercadopago
      } else if (paymentMethod === 'paypal' && paymentLinks.paypal) {
        paymentUrl = paymentLinks.paypal
      } else if (paymentMethod === 'whatsapp') {
        const message = `Hola! Quiero completar mi pedido #${orderId}:\n\n${cart.map(item => 
          `${item.quantity}x ${item.name} - ${formatPrice(item.price)}`
        ).join('\n')}\n\nTotal: ${formatPrice(cartTotal)}\n\nDatos:\nNombre: ${formData.name}\nEmail: ${formData.email}\nTel├®fono: ${formData.phone}`
        
        paymentUrl = `https://wa.me/573102345678?text=${encodeURIComponent(message)}`
      }

      if (paymentUrl) {
        // Limpiar carrito
        localStorage.removeItem('cart')
        
        // Abrir link de pago
        window.open(paymentUrl, '_blank')
        
        // Redirigir a p├ígina de confirmaci├│n
        router.push(`/tienda/orden/${orderId}`)
      } else {
        throw new Error('No se pudo generar el link de pago')
      }

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Hubo un problema al procesar tu pedido. Intenta nuevamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/tienda" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver a la tienda</span>
            </Link>
            <div className="flex items-center gap-2 text-green-600">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium">Pago Seguro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Informaci├│n de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Nombre Completo *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Juan P├®rez"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Tel├®fono *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+57 300 123 4567"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Correo Electr├│nico *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                        Ciudad
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Bogot├í"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                        Direcci├│n
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Calle 123 #45-67"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                      Notas adicionales (opcional)
                    </Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Instrucciones especiales para tu pedido..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* M├®todo de Pago */}
                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-lg font-bold text-gray-900">M├®todo de Pago</Label>
                    
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-white">
                        <RadioGroupItem value="mercadopago" id="mercadopago" />
                        <Label htmlFor="mercadopago" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">MP</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">MercadoPago</div>
                            <div className="text-sm text-gray-500">Tarjetas, PSE, Efectivo</div>
                          </div>
                          {generatingLinks && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all cursor-pointer bg-white">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">PP</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">PayPal</div>
                            <div className="text-sm text-gray-500">Pago internacional seguro</div>
                          </div>
                          {generatingLinks && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-all cursor-pointer bg-white">
                        <RadioGroupItem value="whatsapp" id="whatsapp" />
                        <Label htmlFor="whatsapp" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">WA</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">WhatsApp</div>
                            <div className="text-sm text-gray-500">Coordina tu pago directamente</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || generatingLinks}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Finalizar Compra - {formatPrice(cartTotal)}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Pago 100% seguro y encriptado</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={getImageUrl(item)}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Env├¡o</span>
                    <span className="font-semibold text-green-600">GRATIS</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t-2">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Env├¡o gratis en compras digitales</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Entrega inmediata por email</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Soporte 24/7 por WhatsApp</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
