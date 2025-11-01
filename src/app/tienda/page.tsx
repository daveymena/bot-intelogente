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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              TecnoVariedades D&S
            </Link>
            
            <div className="flex items-center gap-4">
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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className="whitespace-nowrap"
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const images = getProductImages(product)
            const mainImage = images[0] || '/placeholder.svg'

            return (
              <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all">
                <Link href={`/tienda/${product.id}`}>
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-2 right-2 bg-white text-black">
                      {product.category === 'PHYSICAL' && '📦'}
                      {product.category === 'DIGITAL' && '💾'}
                      {product.category === 'SERVICE' && '🛠️'}
                    </Badge>
                  </div>
                </Link>

                <div className="p-3">
                  <Link href={`/tienda/${product.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">Carrito ({cart.length})</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
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
                <div className="border-t p-4 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatPrice(getCartTotal())}</span>
                  </div>
                  <Link href="/tienda/checkout">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Proceder al Pago
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
