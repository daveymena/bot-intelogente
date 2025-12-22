'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, X, Star } from 'lucide-react'
import CurrencySelector from '@/components/CurrencySelector'
import { CurrencyService } from '@/lib/currency-service'

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
    try {
      // Agregar timestamp para evitar caché
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/store-settings/public?userId=default&t=${timestamp}`)
      const data = await res.json()
      console.log('🎨 Configuración de tienda cargada:', data.settings)
      if (data.settings) {
        setStoreSettings(data.settings)
        console.log('✅ Colores aplicados:', {
          primary: data.settings.primaryColor,
          secondary: data.settings.secondaryColor,
          accent: data.settings.accentColor
        })
      }
    } catch (error) {
      console.error('Error cargando configuración de tienda:', error)
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
    try {
      const res = await fetch('/api/products/public')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error loading products:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con colores personalizados */}
      <header 
        className="text-white sticky top-0 z-50 shadow-xl border-b"
        style={{
          background: storeSettings?.primaryColor 
            ? `linear-gradient(to right, ${storeSettings.primaryColor}, ${storeSettings.secondaryColor || storeSettings.primaryColor})`
            : 'linear-gradient(to right, #1f2937, #000000, #1f2937)',
          borderBottomColor: storeSettings?.primaryColor ? `${storeSettings.primaryColor}80` : '#1f2937'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Personalizado */}
            <Link href="/tienda" className="flex items-center space-x-2 hover:opacity-90 transition">
              {storeSettings?.logo ? (
                <div className="flex items-center gap-2">
                  <Image
                    src={storeSettings.logo}
                    alt={storeSettings.storeName}
                    width={40}
                    height={40}
                    className="h-8 w-8 object-contain rounded-lg"
                  />
                  <span className="font-bold text-base hidden sm:block">
                    {storeSettings?.storeName || 'Smart Sales Bot'}
                  </span>
                </div>
              ) : (
                <>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base shadow-lg"
                    style={{
                      background: storeSettings?.accentColor 
                        ? `linear-gradient(to bottom right, ${storeSettings.accentColor}, ${storeSettings.secondaryColor})`
                        : 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)'
                    }}
                  >
                    {storeSettings?.storeName?.charAt(0) || 'S'}
                  </div>
                  <span className="font-bold text-base hidden sm:block">
                    {storeSettings?.storeName || 'Smart Sales Bot'}
                  </span>
                </>
              )}
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos, marcas, categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2.5 pl-12 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Currency Selector, Cart & Menu */}
            <div className="flex items-center space-x-3">
              <CurrencySelector onCurrencyChange={(currency) => setUserCurrency(currency.code)} />
              <Link href="/tienda/carrito" className="relative p-2.5 hover:bg-white/10 rounded-lg transition group">
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2.5 hover:bg-white/10 rounded-lg transition"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-11 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Categorías con colores personalizados */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm ${
                  selectedCategory === category
                    ? 'text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                style={selectedCategory === category ? {
                  background: storeSettings?.primaryColor 
                    ? `linear-gradient(to right, ${storeSettings.primaryColor}, ${storeSettings.secondaryColor || storeSettings.primaryColor})`
                    : 'linear-gradient(to right, #2563eb, #9333ea)'
                } : {}}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb y contador */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'Todos' ? 'Todos los Productos' : selectedCategory}
            </h1>
            <p className="text-sm text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/tienda/producto/${product.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-300 text-5xl">📦</span>
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                        Agotado
                      </span>
                    </div>
                  )}
                  {/* Badge de categoría */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full shadow-md">
                      {product.category === 'PHYSICAL' ? '📦 Físico' : 
                       product.category === 'DIGITAL' ? '💾 Digital' : 
                       '🛠️ Servicio'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Título */}
                  <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[2.5rem] leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Rating simulado */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                  </div>
                  
                  {/* Descripción */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Precio y botón */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Precio */}
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900 leading-none">
                          {formatPrice(product.price)}
                        </span>
                        {userCurrency !== 'USD' && (
                          <span className="text-xs text-gray-500 mt-1">
                            ≈ {getPriceInUSD(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Botón */}
                    <button 
                      className="w-full text-white py-2.5 rounded-lg transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                      style={{
                        background: storeSettings?.primaryColor 
                          ? `linear-gradient(to right, ${storeSettings.primaryColor}, ${storeSettings.secondaryColor || storeSettings.primaryColor})`
                          : 'linear-gradient(to right, #2563eb, #9333ea)'
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer Personalizado */}
      <footer 
        className="text-white mt-20 py-12 border-t"
        style={{
          background: storeSettings?.primaryColor 
            ? `linear-gradient(to right, ${storeSettings.primaryColor}, ${storeSettings.secondaryColor || storeSettings.primaryColor})`
            : 'linear-gradient(to right, #1f2937, #000000, #1f2937)',
          borderTopColor: storeSettings?.primaryColor ? `${storeSettings.primaryColor}80` : '#1f2937'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Columna 1: Logo y descripción */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {storeSettings?.logoSquare ? (
                  <Image
                    src={storeSettings.logoSquare}
                    alt={storeSettings.storeName}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain rounded-lg"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg"
                    style={{
                      background: storeSettings?.accentColor || '#3b82f6'
                    }}
                  >
                    {storeSettings?.storeName?.charAt(0) || 'S'}
                  </div>
                )}
                <span className="font-bold text-lg">
                  {storeSettings?.storeName || 'Smart Sales Bot Pro'}
                </span>
              </div>
              {storeSettings?.description && (
                <p className="text-sm opacity-90 mb-4">
                  {storeSettings.description}
                </p>
              )}
              {storeSettings?.storeSlogan && (
                <p className="text-xs opacity-75 italic">
                  {storeSettings.storeSlogan}
                </p>
              )}
            </div>

            {/* Columna 2: Contacto */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <div className="space-y-2 text-sm opacity-90">
                {storeSettings?.email && (
                  <p>📧 {storeSettings.email}</p>
                )}
                {storeSettings?.phone && (
                  <p>📞 {storeSettings.phone}</p>
                )}
                {storeSettings?.whatsapp && (
                  <p>💬 WhatsApp: {storeSettings.whatsapp}</p>
                )}
              </div>
            </div>

            {/* Columna 3: Redes Sociales */}
            <div>
              <h3 className="font-bold text-lg mb-4">Síguenos</h3>
              <div className="flex gap-3">
                {storeSettings?.facebook && (
                  <a 
                    href={storeSettings.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  >
                    <span className="text-xl">f</span>
                  </a>
                )}
                {storeSettings?.instagram && (
                  <a 
                    href={storeSettings.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  >
                    <span className="text-xl">📷</span>
                  </a>
                )}
                {storeSettings?.twitter && (
                  <a 
                    href={storeSettings.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  >
                    <span className="text-xl">𝕏</span>
                  </a>
                )}
                {storeSettings?.tiktok && (
                  <a 
                    href={storeSettings.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  >
                    <span className="text-xl">🎵</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-8 border-t border-white/20">
            <p className="text-sm opacity-75">
              © 2024 {storeSettings?.storeName || 'Smart Sales Bot Pro'} - Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
