'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, X, Star } from 'lucide-react'
import CurrencySelector from '@/components/CurrencySelector'
import { CurrencyService } from '@/lib/currency-service'
import ModernDesign from '@/components/store/ModernDesign'
import SmartJoysDesign from '@/components/store/SmartJoysDesign'

interface Product {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
}

interface StoreSettings {
  storeName: string
  storeSlogan: string
  description: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: string
  logoSquare: string
  email: string
  phone: string
  whatsapp: string
  facebook: string
  instagram: string
  twitter: string
  tiktok: string
  layoutTemplate?: string
}

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [userCurrency, setUserCurrency] = useState('COP')
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)

  const categories = ['Todos', 'Físicos', 'Digitales', 'Servicios']

  useEffect(() => {
    // Detectar moneda del usuario
    CurrencyService.detectUserCountry().then(info => {
      setUserCurrency(info.currency.code)
    })
    
    // Cargar configuración de la tienda (con timestamp para evitar caché)
    fetchStoreSettings()
  }, [])
  
  // Recargar configuración cada vez que se enfoca la ventana
  useEffect(() => {
    const handleFocus = () => {
      fetchStoreSettings()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])
  
  const fetchStoreSettings = async () => {
    // Evitar fetch si no hay internet
    if (typeof window !== 'undefined' && !window.navigator.onLine) return

    try {
      // Agregar timestamp para evitar caché
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/store-settings/public?userId=default&t=${timestamp}`, {
        signal: AbortSignal.timeout(5000)
      })
      const data = await res.json()
      
      if (data.settings) {
        setStoreSettings(data.settings)
        console.log('✅ Configuración de tienda cargada')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ Carga de configuración cancelada por timeout')
      } else {
        // Silenciar error en consola para reducir ruido del usuario (asociado a extensiones)
        console.log('ℹ️ Carga de configuración de tienda pospuesta (red/fetch ocupado)')
      }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

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

  const fetchProducts = async () => {
    if (typeof window !== 'undefined' && !window.navigator.onLine) return

    try {
      const res = await fetch('/api/products/public', {
        signal: AbortSignal.timeout(5000)
      })
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⚠️ Carga de productos cancelada por timeout')
      } else {
        console.log('ℹ️ Carga de productos pospuesta (red/fetch ocupado)')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    // Filtrar por categorías reales del sistema
    let matchesCategory = false
    
    if (selectedCategory === 'Todos') {
      matchesCategory = true
    } else if (selectedCategory === 'Físicos') {
      matchesCategory = product.category === 'PHYSICAL'
    } else if (selectedCategory === 'Digitales') {
      matchesCategory = product.category === 'DIGITAL'
    } else if (selectedCategory === 'Servicios') {
      matchesCategory = product.category === 'SERVICE'
    }
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatPrice = (priceInCOP: number) => {
    // Convertir de COP a la moneda del usuario
    const convertedPrice = CurrencyService.convertFromCOP(priceInCOP, userCurrency)
    return CurrencyService.formatPrice(convertedPrice, userCurrency)
  }

  const getPriceInUSD = (priceInCOP: number) => {
    const convertedPrice = CurrencyService.convertFromCOP(priceInCOP, userCurrency)
    const usd = CurrencyService.convertToUSD(convertedPrice, userCurrency)
    return CurrencyService.formatPrice(usd, 'USD')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  // Si no hay settings, usar valores por defecto
  const defaultSettings: StoreSettings = {
    storeName: 'Tecnovariedades D&S',
    storeSlogan: 'Tu tienda de confianza',
    description: 'Productos de calidad',
    primaryColor: '#1f2937',
    secondaryColor: '#000000',
    accentColor: '#3b82f6',
    logo: '',
    logoSquare: '',
    email: 'contacto@tienda.com',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: ''
  }

  const finalSettings = storeSettings || defaultSettings

  // Renderizar el diseño seleccionado
  if (finalSettings.layoutTemplate === 'smartjoys') {
    return (
      <SmartJoysDesign 
        products={products}
        settings={finalSettings}
        userCurrency={userCurrency}
        cartCount={cartCount}
        formatPrice={formatPrice}
        getPriceInUSD={getPriceInUSD}
      />
    )
  }

  // Diseño Moderno por defecto
  return (
    <ModernDesign 
      products={products}
      settings={finalSettings}
      userCurrency={userCurrency}
      cartCount={cartCount}
      formatPrice={formatPrice}
      getPriceInUSD={getPriceInUSD}
      setUserCurrency={setUserCurrency}
    />
  )
}
