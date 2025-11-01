'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Heart, Star, ChevronLeft, Truck, Shield, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  status: string
  images?: string
  tags?: string
  stock?: number
}

export default function ProductoDetalle() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        // El API devuelve el producto directamente, no en { product }
        setProduct(data)
      } else {
        console.error('Product not found:', response.status)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = () => {
    if (!product) return
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((item: any) => item.id === product.id)
    
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    router.push('/tienda')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getProductImages = (): string[] => {
    if (!product?.images) return []
    try {
      return JSON.parse(product.images)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Link href="/tienda">
            <Button>Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = getProductImages()
  const mainImage = images[selectedImage] || '/placeholder.svg'

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
            <Link href="/tienda">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sticky Add to Cart Bar */}
      <div className="sticky top-[73px] z-30 bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black">{formatPrice(product.price)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-10 h-10 rounded-lg"
              >
                -
              </Button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-10 h-10 rounded-lg"
              >
                +
              </Button>
              <Button
                onClick={addToCart}
                className="bg-white text-black hover:bg-gray-100 font-bold px-8 h-10 rounded-lg"
              >
                AÑADIR AL CARRITO
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="sticky top-24 self-start">
            <Badge className="mb-4 bg-yellow-500 text-black font-bold">
              ⭐ Producto Recomendado
            </Badge>
            <div className="relative aspect-square bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl overflow-hidden mb-4 border-2 border-gray-200 group">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-contain p-8 group-hover:scale-110 transition-transform duration-300"
              />
              {/* Zoom Icon */}
              <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
                🔍
              </button>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-blue-600 scale-105 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-black mb-4 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600 font-semibold">(4.8)</span>
            </div>

            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-pink-50 rounded-3xl border-2 border-blue-200">
              <div className="text-2xl text-gray-500 line-through mb-2">
                {formatPrice(product.price * 1.5)}
              </div>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500 mb-3">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-500 text-white font-bold">
                  Envío a <span className="font-black">todo</span> el país 🇨🇴
                </Badge>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-lg mb-3">📝 Descripción</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'La mejor calidad del mercado. AirPods inalámbricos con un diseño de cargador portátil, excelente sonido y bajos de alta calidad.'}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
              <p className="text-green-700 font-bold">✅ Hay existencias</p>
            </div>

            {/* Payment Options */}
            <div className="mb-8 p-6 bg-white border-2 border-gray-200 rounded-3xl">
              <h3 className="font-bold text-lg mb-4">💳 Opciones de Pago</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-semibold">Compra a 3 cuotas de {formatPrice(product.price / 3)}</p>
                    <p className="text-sm text-gray-600">con SurPay</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <p className="font-semibold">Paga con Addi en hasta 6 cuotas</p>
                    <a href="#" className="text-sm text-blue-600 hover:underline">Pide un cupo</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-full w-12 h-12 text-xl font-bold"
              >
                -
              </Button>
              <span className="w-16 text-center font-bold text-2xl">{quantity}</span>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setQuantity(quantity + 1)}
                className="rounded-full w-12 h-12 text-xl font-bold"
              >
                +
              </Button>
            </div>

            {/* Action Button */}
            <Button
              onClick={addToCart}
              className="w-full bg-black hover:bg-gray-800 h-16 text-xl font-bold rounded-full mb-4"
            >
              AÑADIR AL CARRITO
            </Button>

            {/* Payment Methods */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">✅</span>
                <p className="font-bold text-lg">Paga fácil y seguro con Mercado Pago</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white px-4 py-2 rounded-lg border">💳 VISA</div>
                <div className="bg-white px-4 py-2 rounded-lg border">💳 Mastercard</div>
                <div className="bg-white px-4 py-2 rounded-lg border">💳 Amex</div>
                <div className="bg-white px-4 py-2 rounded-lg border">🏦 PSE</div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">Envío Gratis</p>
                  <p className="text-sm text-gray-600">En compras superiores a $100.000</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border-2 border-green-200">
                <div className="bg-green-600 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">Compra 100% Segura</p>
                  <p className="text-sm text-gray-600">Protección al comprador garantizada</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
                <div className="bg-purple-600 p-3 rounded-full">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">Devoluciones Fáciles</p>
                  <p className="text-sm text-gray-600">30 días para devoluciones sin preguntas</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl text-white">
              <div className="flex items-center gap-4">
                <span className="text-4xl">💬</span>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">¿Tienes dudas?</p>
                  <p className="text-sm opacity-90">Contáctanos por WhatsApp</p>
                </div>
                <Button className="bg-white text-green-600 hover:bg-gray-100 font-bold rounded-full">
                  Chatear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
