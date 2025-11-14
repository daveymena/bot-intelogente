'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  X, 
  Filter,
  ChevronDown,
  Star,
  TrendingUp,
  Zap,
  Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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
}

interface CartItem extends Product {
  quantity: number
}

// Mapeo de categor├¡as
const getCategoryDisplay = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'PHYSICAL': 'Producto F├¡sico',
    'DIGITAL': 'Producto Digital',
    'SERVICE': 'Servicio',
  }
  return categoryMap[category] || category
}

// Skeleton Loader Mejorado
const ProductSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded-full w-1/3" />
      <div className="h-5 bg-gray-200 rounded-full w-3/4" />
      <div className="h-4 bg-gray-200 rounded-full w-1/2" />
      <div className="h-10 bg-gray-200 rounded-full w-full mt-4" />
    </div>
  </div>
)

// Product Card Ultra Profesional
const ProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite }: any) => {
  const [isHovered, setIsHovered] = useState(false)

  const getImageUrl = () => {
    if (!product.images) return '/placeholder-product.svg'
    try {
      if (Array.isArray(product.images)) {
        return product.images[0] || '/placeholder-product.svg'
      }
      if (typeof product.images === 'string') {
        if (product.images.trim() === '') return '/placeholder-product.svg'
        try {
          const parsed = JSON.parse(product.images)
          if (Array.isArray(parsed)) return parsed[0] || '/placeholder-product.svg'
        } catch {
          const split = product.images.split(',').map(s => s.trim()).filter(s => s !== '')
          if (split.length > 0) return split[0]
        }
        return product.images
      }
      return '/placeholder-product.svg'
    } catch (error) {
      return '/placeholder-product.svg'
    }
  }

  const imageUrl = getImageUrl()
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: product.currency || 'COP',
    minimumFractionDigits: 0
  }).format(product.price)

  const isNew = product.tags?.includes('nuevo')
  const isTrending = product.tags?.includes('trending')
  const hasDiscount = product.tags?.includes('descuento')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Image Container con Overlay Gradient */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          unoptimized
        />
        
        {/* Gradient Overlay en Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Badges Superiores */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg backdrop-blur-sm">
              <Zap className="w-3 h-3 mr-1" />
              Nuevo
            </Badge>
          )}
          {isTrending && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg backdrop-blur-sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg backdrop-blur-sm">
              -20%
            </Badge>
          )}
        </div>

        {/* Bot├│n Favorito */}
        <button
          onClick={() => onToggleFavorite(product.id)}
          className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-10 hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Quick Actions en Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 flex gap-2"
            >
              <Link href={`/producto/${product.id}`} className="flex-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full bg-white/95 backdrop-blur-md hover:bg-white shadow-lg"
                >
                  Ver Detalles
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info - Optimizado para m├│vil */}
      <div className="p-4 space-y-2">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs font-medium bg-green-50 text-green-700 border-green-200">
            {getCategoryDisplay(product.category)}
          </Badge>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-semibold text-gray-700">4.8</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-bold text-base text-gray-900 line-clamp-2 min-h-[3rem] leading-snug">
          {product.name}
        </h3>

        {/* Description - Solo en desktop */}
        <p className="hidden sm:block text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Price & Stock */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Precio</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formattedPrice}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full px-4 h-10 shadow-lg hover:shadow-xl transition-all"
          >
            <ShoppingCart className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function TiendaProfesional() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showCart, setShowCart] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
    loadCartFromStorage()
    loadFavoritesFromStorage()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, products])

  useEffect(() => {
    saveCartToStorage()
  }, [cart])

  useEffect(() => {
    saveFavoritesToStorage()
  }, [favorites])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/public')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products.filter(p => p.status === 'AVAILABLE')

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const loadCartFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart')
      if (saved) {
        try {
          setCart(JSON.parse(saved))
        } catch (e) {
          console.error('Error loading cart:', e)
        }
      }
    }
  }

  const saveCartToStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }

  const loadFavoritesFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites')
      if (saved) {
        try {
          setFavorites(new Set(JSON.parse(saved)))
        } catch (e) {
          console.error('Error loading favorites:', e)
        }
      }
    }
  }

  const saveFavoritesToStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)))
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const categories = [
    { value: 'all', label: 'Todos', icon: Package },
    { value: 'PHYSICAL', label: 'F├¡sicos', icon: Package },
    { value: 'DIGITAL', label: 'Digitales', icon: Zap },
    { value: 'SERVICE', label: 'Servicios', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Sticky Profesional */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Tecnovariedades
                </h1>
                <p className="text-xs text-gray-500">Tu tienda de confianza</p>
              </div>
            </Link>

            {/* Search Bar - Responsive */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-12 rounded-full border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-full hover:bg-gray-100"
              >
                <Filter className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCart(!showCart)}
                className="relative rounded-full hover:bg-gray-100"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Category Pills - Mobile Optimized */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              <strong className="text-green-700">{filteredProducts.length}</strong> productos disponibles
            </span>
            <span className="text-gray-700">
              <strong className="text-green-700">{favorites.size}</strong> favoritos
            </span>
          </div>
        </div>

        {/* Products Grid - Responsive */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">Intenta con otra b├║squeda o categor├¡a</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.has(product.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar - Mejorado */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Cart Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Carrito</h2>
                    <p className="text-sm text-gray-600">{cartItemsCount} productos</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCart(false)}
                    className="rounded-full hover:bg-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">Tu carrito est├í vac├¡o</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    // Manejar images como string o array
                    let imageUrl = '/placeholder-product.svg'
                    try {
                      if (item.images) {
                        if (Array.isArray(item.images)) {
                          imageUrl = item.images[0] || '/placeholder-product.svg'
                        } else if (typeof item.images === 'string') {
                          const parsed = JSON.parse(item.images)
                          imageUrl = Array.isArray(parsed) ? parsed[0] : item.images.split(',')[0]
                        }
                      }
                    } catch {
                      imageUrl = typeof item.images === 'string' ? item.images.split(',')[0] : '/placeholder-product.svg'
                    }

                    return (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: item.currency,
                            minimumFractionDigits: 0
                          }).format(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 rounded-full"
                            onClick={() => {
                              setCart(prev =>
                                prev.map(i =>
                                  i.id === item.id && i.quantity > 1
                                    ? { ...i, quantity: i.quantity - 1 }
                                    : i
                                )
                              )
                            }}
                          >
                            -
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 rounded-full"
                            onClick={() => {
                              setCart(prev =>
                                prev.map(i =>
                                  i.id === item.id
                                    ? { ...i, quantity: i.quantity + 1 }
                                    : i
                                )
                              )
                            }}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setCart(prev => prev.filter(i => i.id !== item.id))
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    )
                  })
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0
                      }).format(cartTotal)}
                    </span>
                  </div>
                  <Link href="/tienda/checkout" className="block">
                    <Button className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all">
                      Proceder al Pago
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button - Mobile */}
      {!showCart && cartItemsCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform sm:hidden"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
            {cartItemsCount}
          </span>
        </motion.button>
      )}
    </div>
  )
}
