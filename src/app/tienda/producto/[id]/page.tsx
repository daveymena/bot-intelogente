'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Share2, Plus, Minus, Truck, Shield, CreditCard, Info } from 'lucide-react'
import { CurrencyService } from '@/lib/currency-service'
import CurrencySelector from '@/components/CurrencySelector'
import ContraentregaForm from '@/components/ContraentregaForm'
import ModernProductDetail from '@/components/store/ModernProductDetail'
import SmartJoysProductDetail from '@/components/store/SmartJoysProductDetail'

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

interface StoreSettings {
  storeName: string
  storeSlogan: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: string
  logoSquare: string
  email: string
  phone: string
  whatsapp: string
  layoutTemplate?: string
}

export default function ProductoPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [generatingPayment, setGeneratingPayment] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [userCurrency, setUserCurrency] = useState('COP')
  const [showContraentregaForm, setShowContraentregaForm] = useState(false)
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)

  // Función para formatear la descripción
  const formatDescription = (description: string) => {
    if (!description) return null
    
    // Limpiar caracteres especiales problemáticos
    let cleaned = description
      .replace(/◆/g, '') // Eliminar diamantes
      .replace(/♦/g, '') // Eliminar otros diamantes
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim()
    
    // Dividir por saltos de línea o emojis que indican secciones
    const lines = cleaned.split(/\n+/)
    
    return lines.map((line, index) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.length < 3) return null
      
      // Detectar si es un título (texto en negrita o con emoji al inicio)
      const isTitleWithEmoji = /^[🎵🎹🎼🎸🎺🎻🎤🎧🎬📚📖📝✅☑️✔️💡🎯🎓📊📈🔥⭐🌟💪🎁🎉🏆📦📱💻🖥️⚡🚀]/.test(trimmed)
      const isShortTitle = trimmed.length < 80 && /^[A-ZÁ-Ú]/.test(trimmed.replace(/^[^\w\s]+\s*/, ''))
      
      if (isTitleWithEmoji || isShortTitle) {
        return (
          <h3 key={index} className="text-lg font-bold text-gray-900 mt-6 mb-3 first:mt-0 flex items-center gap-2">
            {trimmed}
          </h3>
        )
      }
      
      // Detectar listas (líneas que empiezan con +, -, *, •, ✓, ✔, ☑)
      if (/^[+\-*•✓✔☑]\s/.test(trimmed)) {
        return (
          <div key={index} className="flex items-start gap-3 mb-2 pl-2">
            <span className="text-blue-600 mt-1 flex-shrink-0 font-bold">✓</span>
            <span className="text-gray-700 leading-relaxed">{trimmed.replace(/^[+\-*•✓✔☑]\s*/, '')}</span>
          </div>
        )
      }
      
      // Texto normal
      return (
        <p key={index} className="text-gray-700 mb-3 leading-relaxed">
          {trimmed}
        </p>
      )
    }).filter(Boolean)
  }

  useEffect(() => {
    fetchProduct()
    fetchStoreSettings()
    
    // Detectar moneda del usuario
    CurrencyService.detectUserCountry().then(info => {
      setUserCurrency(info.currency.code)
    })
  }, [params.id])
  
  const fetchStoreSettings = async () => {
    if (typeof window !== 'undefined' && !window.navigator.onLine) return

    try {
      // Primero obtener el producto para saber el userId
      const productRes = await fetch(`/api/products/${params.id}`, {
        signal: AbortSignal.timeout(5000)
      })
      const productData = await productRes.json()
      const userId = productData.product?.userId || 'default'
      
      // Luego cargar la configuración de ese usuario
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/store-settings/public?userId=${userId}&t=${timestamp}`, {
        signal: AbortSignal.timeout(5000)
      })
      const data = await res.json()
      
      if (data.settings) {
        setStoreSettings(data.settings)
        console.log('✅ Configuración de tienda cargada en producto')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ Carga de configuración cancelada por timeout')
      } else {
        console.log('ℹ️ Carga de configuración de tienda pospuesta (red/fetch ocupado)')
      }
    }
  }

  useEffect(() => {
    // Cargar carrito solo en el cliente
    updateCartCount()
    
    // Escuchar cambios en el carrito
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [])

  const updateCartCount = () => {
    if (typeof window === 'undefined') return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
    setCartCount(total)
  }

  const fetchProduct = async () => {
    if (typeof window !== 'undefined' && !window.navigator.onLine) return

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        signal: AbortSignal.timeout(5000)
      })
      const data = await res.json()
      setProduct(data.product)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ Carga de producto cancelada por timeout')
      } else {
        console.log('ℹ️ Carga de producto pospuesta (red/fetch ocupado)')
      }
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

  const handleGeneratePaymentLink = async (method: 'mercadopago' | 'paypal') => {
    if (!product) return
    
    setGeneratingPayment(true)
    try {
      console.log('🔄 Generando link de pago:', { method, productId: product.id, userId: product.userId })
      
      const res = await fetch('/api/payments/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          amount: product.price * quantity,
          quantity,
          method,
          userId: product.userId || 'default'
        })
      })
      
      const data = await res.json()
      console.log('📦 Respuesta del servidor:', data)
      
      if (data.success && data.paymentUrl) {
        console.log('✅ Link generado, abriendo:', data.paymentUrl)
        window.open(data.paymentUrl, '_blank')
      } else {
        console.error('❌ Error en respuesta:', data)
        const errorMsg = data.error || 'Error generando link de pago'
        alert(`❌ ${errorMsg}\n\nPor favor verifica que MercadoPago esté configurado correctamente.`)
      }
    } catch (error) {
      console.error('❌ Error generando link:', error)
      alert('❌ Error de conexión. Por favor intenta de nuevo.')
    } finally {
      setGeneratingPayment(false)
    }
  }

  const handleWhatsApp = () => {
    const message = `Hola! Estoy interesado en:\n\n📦 ${product?.name}\n💰 Precio: ${formatPrice((product?.price || 0) * quantity)}\n📊 Cantidad: ${quantity}\n\n¿Está disponible?`
    const whatsappLink = `https://wa.me/573042748687?text=${encodeURIComponent(message)}`
    window.open(whatsappLink, '_blank')
  }

  const handleShare = async () => {
    if (!product) return
    
    const shareData = {
      title: product.name,
      text: `¡Mira este producto! ${product.name} - ${formatPrice(product.price)}`,
      url: window.location.href
    }

    try {
      // Intentar usar la Web Share API (móviles)
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(window.location.href)
        alert('✅ Link copiado al portapapeles')
      }
    } catch (error) {
      // Si falla, copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('✅ Link copiado al portapapeles')
      } catch (clipboardError) {
        // Último fallback: mostrar el link
        prompt('Copia este link:', window.location.href)
      }
    }
  }

  const handleAddToCart = () => {
    if (!product || typeof window === 'undefined') return
    
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

  if (loading || !storeSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Link href="/tienda" className="text-red-600 hover:underline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  // Renderizar el diseño seleccionado
  if (storeSettings.layoutTemplate === 'smartjoys') {
    return (
      <SmartJoysProductDetail 
        product={product}
        settings={storeSettings}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        quantity={quantity}
        setQuantity={setQuantity}
        generatingPayment={generatingPayment}
        userCurrency={userCurrency}
        formatPrice={formatPrice}
        getPriceInUSD={getPriceInUSD}
        handleGeneratePaymentLink={handleGeneratePaymentLink}
        handleWhatsApp={handleWhatsApp}
        handleShare={handleShare}
        handleAddToCart={handleAddToCart}
        showContraentregaForm={showContraentregaForm}
        setShowContraentregaForm={setShowContraentregaForm}
        formatDescription={formatDescription}
        setUserCurrency={setUserCurrency}
      />
    )
  }

  // Diseño Moderno por defecto
  return (
    <ModernProductDetail 
      product={product}
      settings={storeSettings}
      selectedImage={selectedImage}
      setSelectedImage={setSelectedImage}
      quantity={quantity}
      setQuantity={setQuantity}
      generatingPayment={generatingPayment}
      userCurrency={userCurrency}
      formatPrice={formatPrice}
      getPriceInUSD={getPriceInUSD}
      handleGeneratePaymentLink={handleGeneratePaymentLink}
      handleWhatsApp={handleWhatsApp}
      handleShare={handleShare}
      handleAddToCart={handleAddToCart}
      showContraentregaForm={showContraentregaForm}
      setShowContraentregaForm={setShowContraentregaForm}
      formatDescription={formatDescription}
      setUserCurrency={setUserCurrency}
    />
  )
}
