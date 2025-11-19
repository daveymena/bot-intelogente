'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Share2, Plus, Minus, Truck, Shield, CreditCard, Info } from 'lucide-react'
import { CurrencyService } from '@/lib/currency-service'
import CurrencySelector from '@/components/CurrencySelector'
import ContraentregaForm from '@/components/ContraentregaForm'

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
  const [showContraentregaForm, setShowContraentregaForm] = useState(false)

  // Función para formatear la descripción
  const formatDescription = (description: string) => {
    // Dividir por emojis comunes que indican secciones
    const sections = description.split(/(?=[🎵🎹🎼🎸🎺🎻🎤🎧🎬📚📖📝✅☑️✔️💡🎯🎓📊📈🔥⭐🌟💪🎁🎉🏆📦📱💻🖥️⚡🚀])/g)
    
    return sections.map((section, index) => {
      const trimmed = section.trim()
      if (!trimmed) return null
      
      // Detectar si es un título (empieza con emoji y es corto)
      const isTitle = /^[^\w\s]{1,3}\s*[A-ZÁ-Ú]/.test(trimmed) && trimmed.length < 100
      
      if (isTitle) {
        return (
          <h3 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0">
            {trimmed}
          </h3>
        )
      }
      
      // Dividir en puntos para crear lista
      const points = trimmed.split(/[•✓✔☑]/g).filter(p => p.trim())
      
      if (points.length > 1) {
        return (
          <ul key={index} className="space-y-2 mb-4">
            {points.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-pink-600 mt-1 flex-shrink-0">✓</span>
                <span className="text-gray-700">{point.trim()}</span>
              </li>
            ))}
          </ul>
        )
      }
      
      return (
        <p key={index} className="text-gray-700 mb-3 leading-relaxed">
          {trimmed}
        </p>
      )
    }).filter(Boolean)
  }

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
            <div className="p-6 md:p-8 lg:p-10 flex flex-col">
              {/* Categoría */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {product.category === 'PHYSICAL' ? '📦 Producto Físico' : 
                   product.category === 'DIGITAL' ? '💾 Producto Digital' : 
                   '🛠️ Servicio'}
                </span>
              </div>
              
              {/* Título */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight text-gray-900">
                {product.name}
              </h1>
              
              {/* Price and Stock */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <span className="text-4xl md:text-5xl font-bold text-pink-600">
                    {formatPrice(product.price * quantity)}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `✓ ${product.stock} disponibles` : '✗ Agotado'}
                  </span>
                </div>
                
                {/* Conversion Info */}
                {userCurrency !== 'USD' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="text-sm space-y-2">
                        <p className="font-semibold text-blue-900">
                          💱 Conversión de pago
                        </p>
                        <p className="text-blue-700">
                          Precio en tu moneda: <span className="font-bold">{formatPrice(product.price * quantity)}</span>
                        </p>
                        <p className="text-blue-700">
                          Al pagar se convertirá a: <span className="font-bold">{getPriceInUSD(product.price * quantity)}</span>
                        </p>
                        <p className="text-xs text-blue-600">
                          Tasa: 1 USD = {CurrencyService.getCurrencyInfo(userCurrency)?.rate.toLocaleString()} {userCurrency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <span>Descripción del Producto</span>
                </h2>
                <div className="prose prose-sm max-w-none">
                  {formatDescription(product.description)}
                </div>
              </div>

              {/* Product Details */}
              <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  <span>Información del Producto</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">🏷️</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Categoría</div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.category === 'PHYSICAL' ? 'Producto Físico' : 
                         product.category === 'DIGITAL' ? 'Producto Digital' : 
                         'Servicio'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Disponibilidad</div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Precio Unitario</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Envío</div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.category === 'PHYSICAL' ? 'A todo el país' : 'Entrega inmediata'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-900">✨ Beneficios de Comprar Aquí</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-100">
                    <Truck className="w-7 h-7 text-pink-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Envío Rápido</div>
                      <div className="text-xs text-gray-600">Entrega segura</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                    <Shield className="w-7 h-7 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Compra Segura</div>
                      <div className="text-xs text-gray-600">100% protegida</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <CreditCard className="w-7 h-7 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Pago Fácil</div>
                      <div className="text-xs text-gray-600">Múltiples métodos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-lg font-bold mb-4 text-gray-900">📦 Cantidad</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center shadow-sm"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-20 text-center bg-gray-50 py-2 rounded-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center shadow-sm"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-5 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] mb-8 flex items-center justify-center gap-3"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="w-6 h-6" />
                <span>AGREGAR AL CARRITO</span>
              </button>

              {/* Payment Methods */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-xl mb-4 text-gray-900">💳 Métodos de Pago</h3>
                
                {/* MercadoPago */}
                <button
                  onClick={() => handleGeneratePaymentLink('mercadopago')}
                  disabled={generatingPayment || product.stock <= 0}
                  className="w-full bg-[#00B1EA] hover:bg-[#009DD1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  <span className="text-xl">💳</span>
                  <span>{generatingPayment ? 'Generando...' : 'Pagar con MercadoPago'}</span>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => handleGeneratePaymentLink('paypal')}
                  disabled={generatingPayment || product.stock <= 0}
                  className="w-full bg-[#0070BA] hover:bg-[#005A92] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  <span className="text-xl">💰</span>
                  <span>{generatingPayment ? 'Generando...' : 'Pagar con PayPal'}</span>
                </button>

                {/* Contraentrega (solo productos físicos) */}
                {isPhysicalProduct() && (
                  <button
                    onClick={() => setShowContraentregaForm(true)}
                    disabled={product.stock <= 0}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02]"
                  >
                    <span className="text-xl">🚚</span>
                    <span>Pago Contraentrega</span>
                  </button>
                )}

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  <span className="text-xl">💬</span>
                  <span>Consultar por WhatsApp</span>
                </button>
              </div>

              {/* Share Button */}
              <button className="w-full border-2 border-gray-300 hover:border-pink-600 hover:bg-pink-50 text-gray-700 hover:text-pink-600 py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
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

      {/* Contraentrega Form Modal */}
      {showContraentregaForm && product && (
        <ContraentregaForm
          product={{
            id: product.id,
            name: product.name,
            price: product.price
          }}
          quantity={quantity}
          onClose={() => setShowContraentregaForm(false)}
          formatPrice={formatPrice}
        />
      )}
    </div>
  )
}
