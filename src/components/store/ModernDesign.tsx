'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, X, Star } from 'lucide-react'
import CurrencySelector from '@/components/CurrencySelector'

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
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: string
  logoSquare: string
  description: string
  email: string
  phone: string
  whatsapp: string
  facebook: string
  instagram: string
  twitter: string
  tiktok: string
}

interface ModernDesignProps {
  products: Product[]
  settings: StoreSettings
  userCurrency: string
  cartCount: number
  formatPrice: (price: number) => string
  getPriceInUSD: (price: number) => string
  setUserCurrency: (currency: string) => void
}

export default function ModernDesign({
  products,
  settings,
  userCurrency,
  cartCount,
  formatPrice,
  getPriceInUSD,
  setUserCurrency
}: ModernDesignProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const categories = ['Todos', 'Físicos', 'Digitales', 'Servicios']

  const filteredProducts = products.filter(product => {
    let matchesCategory = false
    if (selectedCategory === 'Todos') matchesCategory = true
    else if (selectedCategory === 'Físicos') matchesCategory = product.category === 'PHYSICAL'
    else if (selectedCategory === 'Digitales') matchesCategory = product.category === 'DIGITAL'
    else if (selectedCategory === 'Servicios') matchesCategory = product.category === 'SERVICE'
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header 
        className="text-white sticky top-0 z-50 shadow-xl border-b"
        style={{
          background: settings?.primaryColor 
            ? `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor || settings.primaryColor})`
            : 'linear-gradient(to right, #1f2937, #000000, #1f2937)',
          borderBottomColor: settings?.primaryColor ? `${settings.primaryColor}80` : '#1f2937'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/tienda" className="flex items-center space-x-2">
              {settings?.logo ? (
                <div className="flex items-center gap-2">
                  <Image src={settings.logo} alt={settings.storeName} width={40} height={40} className="h-8 w-8 object-contain rounded-lg" />
                  <span className="font-bold text-base hidden sm:block">{settings?.storeName || 'Smart Sales Bot'}</span>
                </div>
              ) : (
                <span className="font-bold text-base">{settings?.storeName || 'Smart Sales Bot'}</span>
              )}
            </Link>

            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2.5 pl-12 bg-white/10 text-white rounded-lg focus:outline-none"
                />
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CurrencySelector onCurrencyChange={(currency) => setUserCurrency(currency.code)} />
              <Link href="/tienda/carrito" className="relative p-2.5">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition text-sm ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
              style={selectedCategory === cat ? { background: settings?.primaryColor } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/tienda/producto/${product.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition">
              <div className="relative h-48 bg-gray-100">
                {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center">📦</div>}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2">{product.description}</p>
                <div className="mt-auto">
                  <span className="text-xl font-bold">{formatPrice(product.price)}</span>
                  <button className="w-full mt-4 py-2 hover:opacity-90 rounded-lg text-white font-medium" style={{ background: settings?.primaryColor || '#2563eb' }}>Ver Detalles</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-4 text-center">
          <p>© 2024 {settings?.storeName} - Todos los derechos reservados</p>
      </footer>
    </div>
  )
}
