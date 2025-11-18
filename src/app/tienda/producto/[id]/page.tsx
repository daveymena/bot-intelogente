'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Share2, Plus, Minus, Truck, Shield, CreditCard, Info } from 'lucide-react'
import { CurrencyService } from '@/lib/currency-service'
import CurrencySelector from '@/components/CurrencySelector'

interface Product {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  userId?: string
  paymentLinkMercadoPago?: string
  paymentLinkPayPal?: string
  paymentLinkCustom?: string
}

export default function ProductoPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [generatingPayment, setGeneratingPayment] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [userCurrency, setUserCurrency] = useState('COP')
  const [showConversionInfo, setShowConversionInfo] = useState(false)

  useEffect(() => {
    fetchProduct()
    updateCartCount()
    
    // Detectar moneda del usuario
    CurrencyService.detectUserCountry().then(info => {
      setUserCurrency(info.currency.code)
    })
    
    // Escuchar cambios en el carrito
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [params.id])

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
    setCartCount(total)
  }

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

  const formatPrice = (priceInCOP: number) => {
    const convertedPrice = CurrencyService.convertFromCOP(priceInCOP, userCurrency)
    return CurrencyService.formatPrice(convertedPrice, userCurrency)
  }

  const getPriceInUSD = (priceInCOP: number) => {
    const convertedPrice = CurrencyService.convertFromCOP(priceInCOP, userCurrency)
    const usd = CurrencyService.convertToUSD(convertedPrice, userCurrency)
    return CurrencyService.formatPrice(usd, 'USD')
  }

  const getConversionInfo = () => {
    if (!product) return null
    const totalInLocal = product.price * quantity
    const convertedPrice = CurrencyService.convertFromCOP(totalInLocal, userCurrency)
    const payment = CurrencyService.calculatePaymentAmount(convertedPrice, userCurrency)
    return payment
  }

  const isPhysicalProduct = () => {
    return product?.category === 'PHYSICAL'
  }

  const handleGeneratePaymentLink = async (method: 'mercadopago' | 'paypal') => {
    if (!product) return
    
    setGeneratingPayment(true)
    try {
      const res = await fetch('/api/payments/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          amount: product.price * quantity,
          quantity,
          method,
          userId: product.userId
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.paymentUrl) {
        window.open(data.paymentUrl, '_blank')
      } else {
        alert('Error generando link de pago')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error generando link de pago')
    } finally {
      setGeneratingPayment(false)
    }
  }

  const handleWhatsApp = () => {
    const message = `Hola! Estoy interesado en:\n\n📦 ${product?.name}\n💰 Precio: ${formatPrice((product?.price || 0) * quantity)}\n📊 Cantidad: ${quantity}\n\n¿Está disponible?`
    const whatsappLink = `https://wa.me/573136174267?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // Agregar al carrito (localStorage)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity,
        category: product.category
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Actualizar contador del carrito
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Mostrar confirmación
    alert('✅ Producto agregado al carrito')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/tienda" className="flex items-center space-x-2 hover:opacity-80 transition">
              <ArrowLeft className="w-5 h-5" />
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                SSB
              </div>
              <span className="font-bold text-lg hidden sm:block">Smart Sales Bot</span>
            </Link>
            <div className="flex items-center gap-2">
              <CurrencySelector onCurrencyChange={(currency) => setUserCurrency(currency.code)} />
              <Link href="/tienda/carrito" className="relative p-2 hover:bg-gray-800 rounded-lg transition">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* Images Section */}
            <div className="p-4 md:p-6">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-gray-400 text-6xl">📦</span>
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg">
                      Agotado
                    </span>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === idx ? 'border-pink-600 ring-2 ring-pink-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="p-4 md:p-6 lg:p-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>
              
              {/* Price and Stock */}
              <div className="mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-pink-600">
                    {formatPrice(product.price * quantity)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                  </span>
                </div>
                
                {/* Conversion Info */}
                {userCurrency !== 'USD' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">
                          Conversión de pago
                        </p>
                        <p className="text-blue-700">
                          Precio en tu moneda: <span className="font-bold">{formatPrice(product.price * quantity)}</span>
                        </p>
                        <p className="text-blue-700">
                          Al pagar se convertirá a: <span className="font-bold">{getPriceInUSD(product.price * quantity)}</span>
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Tasa: 1 USD = {CurrencyService.getCurrencyInfo(userCurrency)?.rate.toLocaleString()} {userCurrency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-pink-600" />
                  <span>Envío rápido</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-pink-600" />
                  <span>Compra segura</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                  <span>Pago fácil</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-bold flex items-center justify-center"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-bold flex items-center justify-center"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl mb-4 flex items-center justify-center gap-2"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="w-5 h-5" />
                AGREGAR AL CARRITO
              </button>

              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
                <h3 className="font-bold text-lg mb-3">Métodos de Pago</h3>
                
                {/* MercadoPago */}
                <button
                  onClick={() => handleGeneratePaymentLink('mercadopago')}
                  disabled={generatingPayment || product.stock <= 0}
                  className="w-full bg-[#00B1EA] hover:bg-[#009DD1] disabled:bg-gray-300 text-white py-3 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>💳</span>
                  <span>{generatingPayment ? 'Generando...' : 'Pagar con MercadoPago'}</span>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => handleGeneratePaymentLink('paypal')}
                  disabled={generatingPayment || product.stock <= 0}
                  className="w-full bg-[#0070BA] hover:bg-[#005A92] disabled:bg-gray-300 text-white py-3 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>💰</span>
                  <span>{generatingPayment ? 'Generando...' : 'Pagar con PayPal'}</span>
                </button>

                {/* Contraentrega (solo productos físicos) */}
                {isPhysicalProduct() && (
                  <button
                    onClick={handleWhatsApp}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <span>🚚</span>
                    <span>Pago Contraentrega</span>
                  </button>
                )}

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white py-3 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>💬</span>
                  <span>Consultar por WhatsApp</span>
                </button>
              </div>

              {/* Share Button */}
              <button className="w-full border-2 border-gray-300 hover:border-pink-600 text-gray-700 hover:text-pink-600 py-3 px-6 rounded-xl font-bold transition flex items-center justify-center gap-2">
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
