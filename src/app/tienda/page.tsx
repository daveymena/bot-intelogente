'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShoppingCart, Heart, Star, Filter, X } from 'lucide-react'
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
}

interface CartItem extends Product {
  quantity: number
}

export default function TiendaProfesional() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    loadCart()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/public')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error:', error)
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

  const loadCart = () => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      saveCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      saveCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      saveCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getProductImages = (product: Product): string[] => {
    try {
      return product.images ? JSON.parse(product.images) : []
    } catch {
      return []
    }
  }

  const categories = [
    { value: 'all', label: 'Todos', icon: '🛍️' },
    { value: 'PHYSICAL', label: 'Productos', icon: '📦' },
    { value: 'DIGITAL', label: 'Digitales', icon: '💾' },
    { value: 'SERVICE', label: 'Servicios', icon: '🛠️' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-black text-white text-center py-2 text-sm">
        🎉 Envío GRATIS en compras superiores a $100.000 | 🎁 Regalos en productos seleccionados
      </div>

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl font-black">
                <span className="text-blue-600">SMART</span>
                <span className="text-pink-500">JOYS</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/tienda" className="text-sm hover:text-blue-600">🏪 Tienda</Link>
              <Link href="/catalogo" className="text-sm hover:text-blue-600">📋 Catálogo</Link>
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowCart(!showCart)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-full border-2 border-gray-200 focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-[400px] bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-black mb-4 animate-pulse">
              NUEVOS AIRPODS 4
            </h1>
            <p className="text-xl mb-6">Experimenta sonido de calidad</p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-8">
              Comprar ahora
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className={`whitespace-nowrap rounded-full px-6 ${
                selectedCategory === cat.value 
                  ? 'bg-gradient-to-r from-blue-600 to-pink-500 text-white' 
                  : 'border-2'
              }`}
            >
              <span className="mr-2 text-lg">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2">DALE UN VISTAZO</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-pink-500 mx-auto"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const images = getProductImages(product)
            const mainImage = images[0] || '/placeholder.svg'

            return (
              <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all border-2 hover:border-blue-500 rounded-2xl">
                <Link href={`/tienda/${product.id}`}>
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300 p-4"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                        🎁 ¡Obsequio!
                      </Badge>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold">
                        📦 Envío Gratis
                      </Badge>
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/tienda/${product.id}`}>
                    <h3 className="font-bold text-sm line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1 font-semibold">(4.8)</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(product.price * 1.3)}
                      </div>
                      <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white font-bold rounded-full"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Añadir al carrito
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-pink-50 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-bold mb-2">Envío Gratis</h3>
              <p className="text-sm text-gray-600">En compras superiores a $100.000</p>
            </div>
            <div>
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold mb-2">Compra Segura</h3>
              <p className="text-sm text-gray-600">Protección al comprador garantizada</p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-bold mb-2">Regalos Incluidos</h3>
              <p className="text-sm text-gray-600">Obsequios en productos seleccionados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b-2 bg-gradient-to-r from-blue-50 to-pink-50">
                <h2 className="text-2xl font-black">🛒 Mi Carrito ({cart.length})</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)} className="rounded-full">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Tu carrito está vacío</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const images = getProductImages(item)
                      const mainImage = images[0] || '/placeholder.svg'

                      return (
                        <div key={item.id} className="flex gap-3 border-b pb-4">
                          <div className="relative w-20 h-20 bg-gray-100 rounded">
                            <Image src={mainImage} alt={item.name} fill className="object-cover rounded" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                            <p className="text-blue-600 font-bold">{formatPrice(item.price)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(item.id)}
                                className="ml-auto text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t-2 p-6 space-y-4 bg-gradient-to-r from-blue-50 to-pink-50">
                  <div className="flex justify-between text-2xl font-black">
                    <span>Total:</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                  <Link href="/tienda/checkout">
                    <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-lg font-bold rounded-full">
                      💳 Proceder al Pago
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-3xl font-black mb-4">
                <span className="text-blue-400">SMART</span>
                <span className="text-pink-400">JOYS</span>
              </div>
              <p className="text-gray-400">Tu tienda de tecnología y accesorios de confianza</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Compra</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/tienda" className="hover:text-white">Productos</Link></li>
                <li><Link href="/catalogo" className="hover:text-white">Catálogo</Link></li>
                <li><Link href="/tienda" className="hover:text-white">Ofertas</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Ayuda</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Preguntas Frecuentes</a></li>
                <li><a href="#" className="hover:text-white">Envíos</a></li>
                <li><a href="#" className="hover:text-white">Devoluciones</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Síguenos</h3>
              <div className="flex gap-4">
                <a href="#" className="text-2xl hover:text-blue-400">📘</a>
                <a href="#" className="text-2xl hover:text-pink-400">📷</a>
                <a href="#" className="text-2xl hover:text-green-400">💬</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 SmartJoys. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
