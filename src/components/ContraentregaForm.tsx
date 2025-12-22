'use client'

import { useState } from 'react'
import { X, Truck, User, Phone, MapPin, Home, Package } from 'lucide-react'

interface ContraentregaFormProps {
  product: {
    id: number
    name: string
    price: number
  }
  quantity: number
  onClose: () => void
  formatPrice: (price: number) => string
}

export default function ContraentregaForm({ product, quantity, onClose, formatPrice }: ContraentregaFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    cantidad: quantity,
    notas: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/orders/contraentrega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: formData.cantidad,
          customerName: formData.nombre,
          customerPhone: formData.telefono,
          city: formData.ciudad,
          address: formData.direccion,
          notes: formData.notas
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        alert('Error al enviar el pedido. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar el pedido. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const totalPrice = product.price * formData.cantidad

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">¡Pedido Recibido!</h3>
          <p className="text-gray-600 mb-4">
            Hemos recibido tu pedido de contraentrega. Nos pondremos en contacto contigo pronto.
          </p>
          <p className="text-sm text-gray-500">
            Recibirás una confirmación por WhatsApp
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Pago Contraentrega</h2>
                <p className="text-green-100 text-sm">Paga cuando recibas tu producto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">Cantidad: {formData.cantidad}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{formatPrice(totalPrice)}</p>
              <p className="text-xs text-gray-500">Total a pagar</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              placeholder="Ej: 3001234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Ciudad *
            </label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
              placeholder="Ej: Bogotá"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="w-4 h-4 inline mr-1" />
              Dirección Completa *
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              placeholder="Ej: Calle 123 #45-67, Apto 301"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Cantidad
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, cantidad: Math.max(1, formData.cantidad - 1) })}
                className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-bold"
              >
                -
              </button>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                min="1"
                required
                className="w-20 text-center px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition font-bold text-lg"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, cantidad: formData.cantidad + 1 })}
                className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              placeholder="Ej: Entregar en la tarde, llamar antes de llegar..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              📦 ¿Cómo funciona el pago contraentrega?
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Recibirás tu pedido en la dirección indicada</li>
              <li>• Pagas en efectivo al momento de la entrega</li>
              <li>• Verificas el producto antes de pagar</li>
              <li>• Nos contactaremos contigo para confirmar</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enviando pedido...</span>
              </>
            ) : (
              <>
                <Truck className="w-5 h-5" />
                <span>Confirmar Pedido Contraentrega</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al confirmar, aceptas nuestros términos y condiciones
          </p>
        </form>
      </div>
    </div>
  )
}
