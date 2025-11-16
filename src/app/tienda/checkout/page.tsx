'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CreditCard, Truck, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  images?: string | string[]
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'CONTRAENTREGA'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setCart(JSON.parse(saved))
    }
  }, [])

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const getImageUrl = (images: string | string[] | undefined): string => {
    if (!images) return '/placeholder-product.svg'
    if (Array.isArray(images)) return images[0] || '/placeholder-product.svg'
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed[0] : images
    } catch {
      return images
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer: formData,
          total: cartTotal,
          paymentMethod: formData.paymentMethod
        })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.removeItem('cart')
        router.push(`/tienda/orden/${data.orderId}`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/tienda" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/tienda" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Nombre completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Teléfono"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Ciudad"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    placeholder="Dirección de entrega"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-bold mb-4">Método de Pago</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'CONTRAENTREGA', label: '💵 Contraentrega (Pago al recibir)', icon: DollarSign },
                        { value: 'NEQUI', label: '📱 Nequi', icon: CreditCard },
                        { value: 'DAVIPLATA', label: '📱 Daviplata', icon: CreditCard },
                        { value: 'TRANSFERENCIA', label: '🏦 Transferencia Bancaria', icon: CreditCard },
                        { value: 'MERCADOPAGO', label: '💳 MercadoPago', icon: CreditCard },
                      ].map(method => (
                        <label key={method.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-4 h-4"
                          />
                          <span>{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-lg rounded-lg"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resumen */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-200">
                      <Image
                        src={getImageUrl(item.images)}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                        unoptimized
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-600">x{item.quantity}</p>
                        <p className="text-sm font-bold text-green-600">
                          ${(item.price * item.quantity).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Envío:</span>
                    <span>Gratis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-green-600">${cartTotal.toLocaleString('es-CO')}</span>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                  <p className="font-bold mb-1">✅ Envío Gratis</p>
                  <p>En todos los productos a toda Colombia</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
