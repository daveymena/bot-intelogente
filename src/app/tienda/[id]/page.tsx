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
      console.log('🔄 Generando links de pago para:', product.name, 'Cantidad:', quantity)
      generatePaymentLinks()
    }
  }, [product?.id, quantity])

  const generatePaymentLinks = async () => {
    if (!product) return

    console.log('📦 Producto:', {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity
    })

    try {
      // MercadoPago
      console.log('💳 Generando link MercadoPago...')
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
      console.log('✅ MercadoPago response:', mpData)

      // PayPal
      console.log('💰 Generando link PayPal...')
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
      console.log('✅ PayPal response:', ppData)

      // WhatsApp
      console.log('💬 Generando link WhatsApp...')
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
      console.log('✅ WhatsApp response:', waData)

      const newLinks = {
        mercadopago: mpData.paymentLink || '#',
        paypal: ppData.paymentLink || '#',
        whatsapp: waData.paymentLink || '#'
      }

      console.log('🔗 Links generados:', newLinks)
      setPaymentLinks(newLinks)
    } catch (error) {
      console.error('❌ Error generating payment links:', error)
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
            <h1 className="text-2xl font-bold mb-3 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600 text-sm">(4.8)</span>
            </div>

            {/* Precio */}
            <div className="mb-6">
              <div className="text-4xl font-black text-gray-900 mb-2">
                {formatPrice(product.price)}
              </div>
              <p className="text-sm text-gray-600">Envío a <span className="font-semibold">todo el país</span> 🇨🇴</p>
            </div>

            {/* Stock */}
            <div className="mb-4">
              <p className="text-green-600 text-sm font-semibold">Hay existencias</p>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 h-10"
                >
                  -
                </Button>
                <span className="px-4 font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 h-10"
                >
                  +
                </Button>
              </div>
              <Button
                onClick={addToCart}
                className="flex-1 bg-black hover:bg-gray-800 h-10 font-bold rounded-lg"
              >
                AÑADIR AL CARRITO
              </Button>
            </div>

            {/* Payment Methods - COMPACTOS */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">Paga con</span>
                <Image src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-xs.svg" alt="MercadoPago" width={60} height={20} unoptimized />
              </div>
              
              <div className="flex gap-2 mb-4">
                <a
                  href={paymentLinks.mercadopago}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-[#009EE3] hover:bg-[#0082c3] h-9 text-sm font-semibold rounded-lg">
                    MercadoPago
                  </Button>
                </a>
                <a
                  href={paymentLinks.paypal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-[#0070BA] hover:bg-[#005a94] h-9 text-sm font-semibold rounded-lg">
                    PayPal
                  </Button>
                </a>
                <a
                  href={paymentLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-[#25D366] hover:bg-[#1fb855] h-9 text-sm font-semibold rounded-lg">
                    WhatsApp
                  </Button>
                </a>
              </div>

              {/* Payment Icons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">Aceptamos:</span>
                <Image src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" width={35} height={22} unoptimized />
                <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={35} height={22} unoptimized />
                <Image src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" width={35} height={22} unoptimized />
                <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={35} height={22} unoptimized />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 border-t pt-6">
              <h3 className="font-bold text-base mb-3">Descripción</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.description || 'La mejor calidad del mercado. Producto de alta calidad con garantía.'}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-semibold">Envío Gratis</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-semibold">Compra Segura</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <RefreshCw className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-semibold">Devoluciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
