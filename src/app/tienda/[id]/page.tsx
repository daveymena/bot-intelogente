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
        setProduct(data.product)
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden mb-4 border-2 border-gray-200">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-contain p-8"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                  🎁 ¡Obsequio Incluido!
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold">
                  📦 Envío Gratis
                </Badge>
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-blue-600 scale-105' : 'border-gray-200 hover:border-gray-300'
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
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-pink-500 text-white">
              {product.category === 'PHYSICAL' && '📦 Producto Físico'}
              {product.category === 'DIGITAL' && '💾 Producto Digital'}
              {product.category === 'SERVICE' && '🛠️ Servicio'}
            </Badge>

            <h1 className="text-4xl font-black mb-4 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600 font-semibold">(4.8) 127 reseñas</span>
            </div>

            <div className="mb-6">
              <div className="text-2xl text-gray-400 line-through mb-2">
                {formatPrice(product.price * 1.3)}
              </div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
                {formatPrice(product.price)}
              </div>
              <Badge className="mt-2 bg-red-500 text-white">¡30% de descuento!</Badge>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              {product.description || 'Producto de alta calidad con las mejores especificaciones del mercado. Garantía incluida y soporte técnico disponible.'}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl">
              <span className="font-bold text-lg">Cantidad:</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full w-12 h-12"
                >
                  -
                </Button>
                <span className="w-16 text-center font-bold text-2xl">{quantity}</span>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full w-12 h-12"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={addToCart}
                className="flex-1 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 h-14 text-lg font-bold rounded-full"
              >
                <ShoppingCart className="mr-2 h-6 w-6" />
                Agregar al Carrito
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-2">
                <Heart className="h-6 w-6" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">Envío Gratis</p>
                  <p className="text-sm text-gray-600">En compras superiores a $100.000</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                <div className="bg-green-600 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">Compra 100% Segura</p>
                  <p className="text-sm text-gray-600">Protección al comprador garantizada</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                <div className="bg-purple-600 p-3 rounded-full">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">Devoluciones Fáciles</p>
                  <p className="text-sm text-gray-600">30 días para devoluciones sin preguntas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
