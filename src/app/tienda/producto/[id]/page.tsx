'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Share2 } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  paymentMethods?: {
    mercadopago?: { enabled: boolean; link?: string }
    paypal?: { enabled: boolean; email?: string }
    nequi?: { enabled: boolean; phone?: string }
  }
}

export default function ProductoPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`)
      const data = await res.json()
      setProduct(data.product)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handlePayPal = () => {
    if (product?.paymentMethods?.paypal?.email) {
      const paypalLink = `https://www.paypal.com/paypalme/${product.paymentMethods.paypal.email}/${product.price * quantity}`
      window.open(paypalLink, '_blank')
    }
  }

  const handleMercadoPago = () => {
    if (product?.paymentMethods?.mercadopago?.link) {
      window.open(product.paymentMethods.mercadopago.link, '_blank')
    }
  }

  const handleWhatsApp = () => {
    const message = `Hola! Estoy interesado en: ${product?.name}\nPrecio: ${formatPrice(product?.price || 0)}\nCantidad: ${quantity}`
    const whatsappLink = `https://wa.me/573136174267?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Link href="/tienda" className="text-pink-600 hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Negro */}
      <header className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/tienda" className="flex items-center space-x-2">
              <ArrowLeft className="w-6 h-6" />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                SSB
              </div>
              <span className="font-bold text-lg hidden sm:block">Smart Sales Bot</span>
            </Link>
            <button className="relative p-2 hover:bg-gray-800 rounded-lg transition">
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Images */}
            <div>
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-gray-400 text-6xl">📦</span>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-20 rounded-lg overflow-hidden ${
                        selectedImage === idx ? 'ring-2 ring-pink-600' : ''
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-pink-600">
                  {formatPrice(product.price)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Cantidad</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-bold"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-3 mb-6">
                <h3 className="font-bold text-lg mb-3">Métodos de Pago</h3>
                
                {product.paymentMethods?.mercadopago?.enabled && (
                  <button
                    onClick={handleMercadoPago}
                    className="w-full bg-[#00B1EA] hover:bg-[#009DD1] text-white py-3 px-6 rounded-lg font-bold transition flex items-center justify-center space-x-2"
                  >
                    <span>💳</span>
                    <span>Pagar con MercadoPago</span>
                  </button>
                )}

                {product.paymentMethods?.paypal?.enabled && (
                  <button
                    onClick={handlePayPal}
                    className="w-full bg-[#0070BA] hover:bg-[#005A92] text-white py-3 px-6 rounded-lg font-bold transition flex items-center justify-center space-x-2"
                  >
                    <span>💰</span>
                    <span>Pagar con PayPal</span>
                  </button>
                )}

                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white py-3 px-6 rounded-lg font-bold transition flex items-center justify-center space-x-2"
                >
                  <span>💬</span>
                  <span>Comprar por WhatsApp</span>
                </button>
              </div>

              {/* Share */}
              <button className="w-full border-2 border-gray-300 hover:border-pink-600 text-gray-700 hover:text-pink-600 py-3 px-6 rounded-lg font-bold transition flex items-center justify-center space-x-2">
                <Share2 className="w-5 h-5" />
                <span>Compartir producto</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Smart Sales Bot Pro - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}
