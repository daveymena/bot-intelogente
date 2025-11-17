'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, MessageCircle, Plus, Minus, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  subcategory?: string | null
  status: string
  images?: string | string[]
  tags?: string
  stock?: number
}

export default function ProductoDetalle() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

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
        setProduct(data)
      } else {
        router.push('/tienda')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/tienda')
    } finally {
      setLoading(false)
    }
  }

  const getProductImages = (product: Product): string[] => {
    try {
      if (!product.images) return []
      if (Array.isArray(product.images)) return product.images
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images)
          if (Array.isArray(parsed)) return parsed
          return product.images.split(',').map(img => img.trim()).filter(img => img.length > 0)
        } catch {
          return product.images.split(',').map(img => img.trim()).filter(img => img.length > 0)
        }
      }
      return []
    } catch {
      return []
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!product) return

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    alert('✅ Producto agregado al carrito')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/tienda')
  }

  const handleWhatsApp = () => {
    if (!product) return
    const phone = '573102345678'
    const message = `Hola! Me interesa el producto:\n\n${product.name}\nPrecio: ${formatPrice(product.price)}\n\n¿Está disponible?`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  const images = getProductImages(product)
  const mainImage = images[selectedImage] || '/placeholder-product.svg'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/tienda" className="flex items-center gap-2 hover:text-red-200 transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Volver a la tienda</span>
            </Link>
            <h1 className="text-xl font-bold">TECNOVARIEDADES D&S</h1>
            <button
              onClick={handleWhatsApp}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Inicio</Link>
            {' / '}
            <Link href="/tienda" className="hover:text-red-600">Tienda</Link>
            {' / '}
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div>
            <div className="flex gap-4">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 bg-white rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === idx ? 'border-red-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 relative h-[500px] bg-white rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-product.svg'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded">
                {product.category === 'PHYSICAL' && '📦 Producto Físico'}
                {product.category === 'DIGITAL' && '💾 Producto Digital'}
                {product.category === 'SERVICE' && '🛠️ Servicio'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(20 personas viendo este producto ahora)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 line-through mb-1">
                {formatPrice(product.price * 1.3)}
              </div>
              <div className="text-4xl font-bold text-red-600">
                {formatPrice(product.price)}
              </div>
              <div className="text-sm text-green-600 font-semibold mt-1">
                ✓ Hay existencias
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'Sin descripción disponible'}
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-xs font-semibold text-gray-700">Entrega de 1 a 5 días hábiles*</p>
                <p className="text-xs text-gray-500">*El tiempo de entrega puede variar</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-xs font-semibold text-gray-700">Envío gratis</p>
                <p className="text-xs text-gray-500">Para compras superiores a $400.000*</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-xs font-semibold text-gray-700">Con garantía y opción de devolución</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition"
                >
                  <Minus className="w-5 h-5 mx-auto" />
                </button>
                <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition"
                >
                  <Plus className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-lg font-bold text-lg transition"
              >
                Compra Rápida Contra Entrega
              </button>

              <div className="flex gap-3">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition">
                  <Heart className="w-5 h-5" />
                  Añadir a la lista de deseos
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition">
                  <Share2 className="w-5 h-5" />
                  Comparar
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t pt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Métodos de pago disponibles:</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs font-semibold text-blue-700">
                  Crédito Fácil
                </div>
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded text-xs font-semibold text-green-700">
                  PSE
                </div>
                <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded text-xs font-semibold text-purple-700">
                  Tarjeta de Crédito
                </div>
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs font-semibold text-red-700">
                  Addi
                </div>
                <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs font-semibold text-yellow-700">
                  Sistecredito
                </div>
                <div className="px-3 py-2 bg-pink-50 border border-pink-200 rounded text-xs font-semibold text-pink-700">
                  SuRed Pay
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-red-600 to-red-700 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="mb-2 text-lg font-bold">
              💬 ¿Tienes preguntas? Contáctanos por WhatsApp
            </p>
            <p className="text-sm text-red-100">
              Todos los precios incluyen IVA • Envío gratis en compras digitales • Soporte 24/7
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
