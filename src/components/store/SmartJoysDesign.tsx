'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Search, Phone, User, Heart, ChevronDown } from 'lucide-react'

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
  phone: string
  whatsapp: string
}

interface SmartJoysDesignProps {
  products: Product[]
  settings: StoreSettings
  userCurrency: string
  cartCount: number
  formatPrice: (price: number) => string
  getPriceInUSD: (price: number) => string
}

export default function SmartJoysDesign({
  products,
  settings,
  userCurrency,
  cartCount,
  formatPrice,
  getPriceInUSD
}: SmartJoysDesignProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  // Obtener categorías únicas de los productos
  const uniqueCategories = Array.from(new Set(products.map(p => (p as any).mainCategory).filter(Boolean)))
  
  const categoryIcons: Record<string, string> = {
    'Música': '🎵',
    'Idiomas': '🌍',
    'Programación': '💻',
    'Diseño': '🎨',
    'Ofimática': '📊',
    'Marketing Digital': '📱',
    'Finanzas': '💰',
    'Fotografía y Video': '📷',
    'Cocina': '🍳',
    'Fitness y Salud': '💪',
    'Packs y Bundles': '🎁',
    'Otros': '📦'
  }

  const categories = uniqueCategories.map(cat => ({
    name: cat,
    icon: categoryIcons[cat] || '📦'
  }))

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || (product as any).mainCategory === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      {/* Top Bar - Black */}
      <header className="bg-black text-white py-3 px-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/tienda" className="flex-shrink-0">
            {settings.logo ? (
              <Image src={settings.logo} alt={settings.storeName} width={180} height={45} className="h-10 w-auto object-contain invert" />
            ) : (
              <span className="text-2xl font-black italic tracking-tighter text-white">SMART<span className="text-red-600">JOYS</span></span>
            )}
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full bg-white text-black px-4 py-2 rounded-full pr-10 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-1 top-1 bg-red-600 p-1.5 rounded-full cursor-pointer hover:bg-red-700 transition">
                <Search className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Contact & Cart */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2">
              <div className="bg-white/10 p-2 rounded-full">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex flex-col text-[10px] leading-tight">
                <span className="text-gray-400">Línea de WhatsApp</span>
                <span className="font-bold text-sm tracking-tight">{settings.whatsapp || settings.phone}</span>
              </div>
            </div>

            <Link href="/tienda/carrito" className="flex items-center gap-3 group">
              <div className="relative">
                <ShoppingCart className="w-7 h-7 group-hover:text-red-500 transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-[10px] leading-tight">
                <span className="text-red-600 font-bold">$0</span>
                <span className="text-gray-400">0 artículos</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Nav Bar - Red (Fixed but changeable via primaryColor) */}
      <nav 
        className="text-white sticky top-[64px] z-40 shadow-md"
        style={{ backgroundColor: settings.primaryColor || '#e31e2d' }}
      >
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
          <ul className="flex items-center h-12 uppercase text-[13px] font-bold tracking-wide whitespace-nowrap">
            <li className="px-4 border-r border-white/20 h-full flex items-center hover:bg-black/10 cursor-pointer">
              <Link href="/tienda" className="flex items-center gap-2 hover:text-white/80">
                <span className="text-lg">🏪</span> Tienda
              </Link>
            </li>
            <li className="px-4 border-r border-white/20 h-full flex items-center hover:bg-black/10 cursor-pointer group relative">
              <span className="flex items-center gap-1 hover:text-white/80">
                <span className="text-lg">💻</span> Tecnología <ChevronDown className="w-3 h-3" />
              </span>
            </li>
            <li className="px-4 border-r border-white/20 h-full flex items-center hover:bg-black/10 cursor-pointer group relative">
              <span className="flex items-center gap-1 hover:text-white/80">
                <span className="text-lg">🏠</span> Hogar <ChevronDown className="w-3 h-3" />
              </span>
            </li>
            <li className="px-4 border-r border-white/20 h-full flex items-center hover:bg-black/10 cursor-pointer group relative">
              <span className="flex items-center gap-1 hover:text-white/80">
                <span className="text-lg">🕺</span> Estilo de Vida <ChevronDown className="w-3 h-3" />
              </span>
            </li>
            <li className="px-4 border-r border-white/20 h-full flex items-center hover:bg-black/10 cursor-pointer">
              <span className="flex items-center gap-2 hover:text-white/80">
                <span className="text-lg">🎁</span> Combos
              </span>
            </li>
            <li className="px-4 border-r border-white/20 h-full flex items-center hover:bg-black/10 cursor-pointer">
              <span className="flex items-center gap-2 hover:text-white/80">
                <span className="text-lg">🎅</span> Especial Navidad
              </span>
            </li>
            <li className="ml-auto flex items-center gap-6">
              <span className="flex items-center gap-2 hover:text-white/80 cursor-pointer">
                <Heart className="w-4 h-4" /> Lista de Deseos
              </span>
              <span className="flex items-center gap-2 border-l border-white/20 pl-6 h-12 hover:text-white/80 cursor-pointer">
                <User className="w-4 h-4" /> Acceso / Registro
              </span>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Banner Section */}
        <section className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden mb-12 shadow-xl group">
          <Image 
            src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=2000" 
            alt="Christmas Special" 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 text-white">
            <h3 className="text-3xl md:text-5xl font-black italic uppercase leading-none mb-2">ESPECIAL <br /><span className="text-red-500 tracking-widest text-7xl md:text-8xl">navidad</span></h3>
            <div className="flex gap-4 items-center mt-6">
              <span className="bg-white text-black font-black px-4 py-1 rounded text-xl italic uppercase">Addi</span>
              <span className="bg-white text-black font-black px-4 py-1 rounded text-xl italic uppercase">sistecrédito</span>
              <span className="bg-white text-black font-black px-4 py-1 rounded text-xl italic uppercase">SU+ Pay</span>
            </div>
            <button className="mt-8 bg-white text-black font-black px-8 py-3 rounded-full hover:bg-red-600 hover:text-white transition-all w-fit uppercase italic tracking-wider">
              Ver Productos
            </button>
          </div>
        </section>

        {/* Circular Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-black italic uppercase mb-8 ml-2">Tienda</h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 px-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4 min-w-[120px] group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <span className="text-sm font-bold text-gray-700 text-center group-hover:text-red-600 transition">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-8">
              <span className="text-gray-400 text-sm">Mostrando {filteredProducts.length} producto(s){selectedCategory !== 'Todos' ? ` en ${selectedCategory}` : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-all duration-500 relative flex flex-col h-full border border-gray-100">
                {/* Sale Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span className="bg-[#8ec63f] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">OFERTA</span>
                  <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase leading-none text-center">TOP VENTA<br/>S</span>
                </div>
                
                {/* Image */}
                <div className="relative aspect-square w-full mb-6 overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center p-4">
                    <Image 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'} 
                      alt={product.name} 
                      fill 
                      className="object-contain transition-transform duration-500 group-hover:scale-110" 
                    />
                </div>

                {/* Rating */}
                <div className="flex justify-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#ffbb00] text-sm">★</span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-center font-bold text-gray-800 line-clamp-2 px-2 h-10 mb-4 group-hover:text-red-600 transition">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-auto flex flex-col items-center">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-gray-300 line-through text-sm font-medium">$150.000</span>
                    <span className="text-red-600 font-black text-xl leading-none">{formatPrice(product.price)}</span>
                  </div>
                </div>

                {/* Add Button */}
                <div className="mt-6">
                  <Link 
                    href={`/tienda/producto/${product.id}`}
                    className="w-full bg-[#f4f7f6] text-gray-500 text-xs font-black py-4 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all uppercase tracking-widest italic"
                  >
                    Elige una opción
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer (Simplified SmartJoys Style) */}
      <footer className="bg-white mt-32 pt-16 pb-8 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="max-w-xs">
              <span className="text-3xl font-black italic tracking-tighter mb-8 block">SMART<span className="text-red-600">JOYS</span></span>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">Especialistas en tecnología, hogar y estilo de vida con los mejores precios del mercado colombiano.</p>
              <div className="flex gap-4">
                <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition cursor-pointer">f</span>
                <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition cursor-pointer">i</span>
                <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition cursor-pointer">y</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="font-black italic uppercase mb-6 text-sm">Conózcanos</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li className="hover:text-black transition cursor-pointer">Sobre nosotros</li>
                  <li className="hover:text-black transition cursor-pointer">Preguntas Frecuentes</li>
                  <li className="hover:text-black transition cursor-pointer">Contáctanos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-black italic uppercase mb-6 text-sm">Enlaces útiles</h4>
                <ul className="space-y-3 text-sm text-gray-500 font-medium">
                  <li className="hover:text-black transition cursor-pointer">Política de Privacidad</li>
                  <li className="hover:text-black transition cursor-pointer">Términos y Condiciones</li>
                  <li className="hover:text-black transition cursor-pointer">Garantías</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#f4f7f6] p-8 rounded-3xl max-w-sm">
              <h4 className="font-black italic uppercase mb-4 text-lg">Suscríbete al boletín</h4>
              <p className="text-gray-500 text-xs mb-6">Únase a nuestra lista para recibir las últimas novedades.</p>
              <div className="relative">
                <input type="email" placeholder="Su email..." className="w-full bg-white px-6 py-4 rounded-full text-sm focus:outline-none pr-32 shadow-sm" />
                <button className="absolute right-1 top-1 bg-red-600 text-white font-black text-[10px] px-6 py-3 rounded-full uppercase hover:bg-red-700 transition">Inscribirse</button>
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Pagos Seguros</p>
                <div className="flex gap-2 flex-wrap grayscale opacity-50">
                  <div className="bg-white px-2 py-1 rounded border text-[10px] font-bold">VISA</div>
                  <div className="bg-white px-2 py-1 rounded border text-[10px] font-bold">MASTERCARD</div>
                  <div className="bg-white px-2 py-1 rounded border text-[10px] font-bold">PSE</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            © 2025 SmartJoys. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a 
        href={`https://wa.me/${settings.whatsapp}`}
        target="_blank"
        className="fixed bottom-8 right-8 bg-[#25d366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition z-50"
      >
        <span className="text-2xl">💬</span>
      </a>
      
      {/* Scroll to top */}
      <button className="fixed bottom-8 right-24 bg-white text-gray-300 p-4 rounded-full shadow-xl hover:text-red-500 transition z-50">
        <span className="text-xl">↑</span>
      </button>
    </div>
  )
}
