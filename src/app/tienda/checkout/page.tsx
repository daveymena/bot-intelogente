'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ShoppingCart, CreditCard, Truck, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  images?: string
}

export default function Checkout() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('mercadopago')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  })

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setCart(JSON.parse(saved))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Crear orden de pago
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getCartTotal(),
          currency: 'COP',
          description: `Compra de ${cart.length} productos`,
          paymentMethod,
          customerInfo: formData,
          items: cart
        })
      })

      const data = await response.json()

      if (data.paymentUrl) {
        // Redirigir a la página de pago
        window.location.href = data.paymentUrl
      } else {
        alert('Error al procesar el pago')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const getProductImages = (item: CartItem): string[] => {
    try {
      return item.images ? JSON.parse(item.images) : []
    } catch {
      return []
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <Link href="/tienda">
            <Button>Ir a la tienda</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-black text-white text-center py-2 text-sm">
        🎉 Envío GRATIS en compras superiores a $100.000 | 🎁 Regalos en productos seleccionados
      </div>

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/tienda" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ChevronLeft className="h-5 w-5" />
              <span className="font-semibold">Volver a la tienda</span>
            </Link>
            <Link href="/tienda" className="flex items-center gap-2">
              <div className="text-2xl font-black">
                <span className="text-blue-600">SMART</span>
                <span className="text-pink-500">JOYS</span>
              </div>
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-2 text-center">Finalizar Compra</h1>
        <p className="text-center text-gray-600 mb-8">Completa tu información para recibir tu pedido</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <Card className="p-6 rounded-3xl border-2">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-3 rounded-full">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  Información de Envío
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Notas (Opcional)</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Instrucciones especiales de entrega..."
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6 rounded-3xl border-2">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  Método de Pago
                </h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="mercadopago" id="mercadopago" />
                    <Label htmlFor="mercadopago" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Image src="/mercadopago-logo.svg" alt="MercadoPago" width={100} height={30} />
                        <span>Tarjetas, PSE, Efectivo</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Image src="/paypal-logo.svg" alt="PayPal" width={80} height={30} />
                        <span>Pago internacional</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-lg font-bold rounded-full"
              >
                {loading ? '⏳ Procesando...' : `💳 Pagar ${formatPrice(getCartTotal())}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24 rounded-3xl border-2 bg-gradient-to-br from-gray-50 to-white">
              <h2 className="text-2xl font-black mb-6">📦 Resumen del Pedido</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  const images = getProductImages(item)
                  const mainImage = images[0] || '/placeholder.svg'

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-gray-100 rounded">
                        <Image src={mainImage} alt={item.name} fill className="object-cover rounded" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        <p className="text-blue-600 font-bold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t-2 pt-4 space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Envío:</span>
                  <span className="text-green-600 font-bold">¡GRATIS! 🎉</span>
                </div>
                <div className="flex justify-between text-2xl font-black border-t-2 pt-4">
                  <span>Total:</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
                    {formatPrice(getCartTotal())}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
