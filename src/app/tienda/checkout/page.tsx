'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'paypal' | 'contraentrega'>('mercadopago')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  })

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const getTotal = () => {
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
      if (paymentMethod === 'contraentrega') {
        // Enviar pedido por API (email + WhatsApp)
        const res = await fetch('/api/orders/contraentrega', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerData: formData,
            cart,
            total: getTotal()
          })
        })

        const data = await res.json()

        if (data.success) {
          // Abrir WhatsApp
          if (data.whatsappLink) {
            window.open(data.whatsappLink, '_blank')
          }
          
          // Limpiar carrito
          localStorage.removeItem('cart')
          
          // Mostrar mensaje de éxito
          alert('✅ Pedido enviado correctamente!\n\nRecibirás un email de confirmación y nos contactaremos contigo pronto.')
          
          router.push('/tienda?success=contraentrega')
        } else {
          alert('Error enviando pedido. Por favor intenta de nuevo.')
        }
      } else {
        // Generar link de pago
        const res = await fetch('/api/payments/generate-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: cart[0].id,
            productName: cart.map(i => i.name).join(', '),
            amount: getTotal(),
            quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
            method: paymentMethod,
            customerData: formData
          })
        })

        const data = await res.json()

        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          alert('Error generando link de pago')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error procesando el pedido')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No hay productos en el carrito</h2>
          <Link href="/tienda" className="text-pink-600 hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/tienda/carrito" className="flex items-center space-x-2 hover:opacity-80 transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Volver al Carrito</span>
            </Link>
            <h1 className="text-lg font-bold">Checkout</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Información de Contacto
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="juan@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="3001234567"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Información de Envío
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Calle 123 #45-67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Bogotá"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notas (Opcional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={3}
                    placeholder="Instrucciones especiales de entrega..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Método de Pago</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-pink-500 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="mercadopago"
                    checked={paymentMethod === 'mercadopago'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-5 h-5"
                  />
                  <span className="text-2xl">💳</span>
                  <div className="flex-1">
                    <div className="font-bold">MercadoPago</div>
                    <div className="text-sm text-gray-600">Tarjetas, PSE, Efectivo</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-pink-500 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-5 h-5"
                  />
                  <span className="text-2xl">💰</span>
                  <div className="flex-1">
                    <div className="font-bold">PayPal</div>
                    <div className="text-sm text-gray-600">Tarjetas internacionales</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-pink-500 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="contraentrega"
                    checked={paymentMethod === 'contraentrega'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-5 h-5"
                  />
                  <span className="text-2xl">🚚</span>
                  <div className="flex-1">
                    <div className="font-bold">Contraentrega</div>
                    <div className="text-sm text-gray-600">Paga al recibir</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">{formatPrice(getTotal())}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
