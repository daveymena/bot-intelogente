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
  const [paymentLinks, setPaymentLinks] = useState({
    mercadopago: '#',
    paypal: '#',
    whatsapp: '#'
  })

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (product) {
      generatePaymentLinks()
    }
  }, [product, quantity])

  const generatePaymentLinks = async () => {
    if (!product) return

    try {
      // MercadoPago
      const mpResponse = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          description: product.description,
          quantity,
          method: 'mercadopago'
        })
      })
      const mpData = await mpResponse.json()

      // PayPal
      const ppResponse = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          description: product.description,
          quantity,
          method: 'paypal'
        })
      })
      const ppData = await ppResponse.json()

      // WhatsApp
      const waResponse = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          description: product.description,
          quantity,
          method: 'whatsapp'
        })
      })
      const waData = await waResponse.json()

      setPaymentLinks({
        mercadopago: mpData.paymentLink || '#',
        paypal: ppData.paymentLink || '#',
        whatsapp: waData.paymentLink || '#'
      })
    } catch (error) {
      console.error('Error generating payment links:', error)
    }
  }

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
    if (!product?.images) return ['/placeholder.svg']
    
    try {
      // Si images es un array, devolverlo
      if (Array.isArray(product.images)) {
        return product.images.length > 0 ? product.images : ['/placeholder.svg']
      }
      
      // Si es string, intentar parsear
      if (typeof product.images === 'string') {
        const parsed = JSON.parse(product.images)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['/placeholder.svg']
      }
      
      return ['/placeholder.svg']
    } catch {
      // Si falla el parse, usar la imagen como string directo
      return [product.images || '/placeholder.svg']
    }
  }

  // Scroll to top cuando carga la página
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [product])

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
              <div className="text-xl font-black">
                <span className="text-blue-600">Tecnovariedades</span>
                <span className="text-pink-500"> D&S</span>
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
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://via.placeholder.com/800x800/e5e7eb/6b7280?text=' + encodeURIComponent(product.name)
                }}
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
                    <Image 
                      src={img} 
                      alt={`${product.name} ${idx + 1}`} 
                      fill 
                      className="object-contain p-2"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://via.placeholder.com/200x200/e5e7eb/6b7280?text=Imagen+' + (idx + 1)
                      }}
                    />
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

            {/* Stock Status */}
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
              <p className="text-green-700 font-bold">✅ Hay existencias</p>
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

            {/* Payment Methods - REAL BUTTONS CON ESTILO TIENDA */}
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-blue-200 shadow-lg">
              <h3 className="font-black text-xl mb-4 text-center">💳 Métodos de Pago</h3>
              
              <div className="space-y-3">
                {/* MercadoPago */}
                <a
                  href={paymentLinks.mercadopago}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#009EE3] p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-lg">MercadoPago</p>
                          <p className="text-sm text-gray-600">Tarjetas, PSE, Efectivo</p>
                        </div>
                      </div>
                      <div className="text-blue-600 font-bold group-hover:translate-x-2 transition-transform">→</div>
                    </div>
                  </div>
                </a>

                {/* PayPal */}
                <a
                  href={paymentLinks.paypal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bg-white p-4 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#0070BA] p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 01-.793.68H7.76c-.66 0-1.152-.57-1.028-1.19l2.037-12.908c.093-.593.615-1.028 1.218-1.028h6.46c1.425 0 2.542.328 3.32.984z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-lg">PayPal</p>
                          <p className="text-sm text-gray-600">Pagos internacionales</p>
                        </div>
                      </div>
                      <div className="text-purple-600 font-bold group-hover:translate-x-2 transition-transform">→</div>
                    </div>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={paymentLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bg-white p-4 rounded-2xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#25D366] p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-lg">WhatsApp</p>
                          <p className="text-sm text-gray-600">Consulta y compra</p>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold group-hover:translate-x-2 transition-transform">→</div>
                    </div>
                  </div>
                </a>
              </div>

              {/* Payment Icons */}
              <div className="mt-6 pt-6 border-t-2 border-white">
                <p className="text-sm text-gray-600 mb-3 text-center font-semibold">Aceptamos:</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" width={45} height={28} unoptimized />
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={45} height={28} unoptimized />
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" width={45} height={28} unoptimized />
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={45} height={28} unoptimized />
                  </div>
                </div>
              </div>
            </div>

            {/* Description - MOVED TO BOTTOM */}
            <div className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-2xl">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>📝</span> Descripción
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'La mejor calidad del mercado. Producto de alta calidad con garantía.'}
              </p>
            </div>

            {/* Features - MOVED TO BOTTOM */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">Envío Gratis</p>
                  <p className="text-xs text-gray-600">En compras +$100.000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">Compra Segura</p>
                  <p className="text-xs text-gray-600">Protección garantizada</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-sm">Devoluciones</p>
                  <p className="text-xs text-gray-600">30 días sin preguntas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
