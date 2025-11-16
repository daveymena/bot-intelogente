'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShoppingCart, MessageCircle, X, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  subcategory?: string | null
  status: string
  images?: string | string[]  // ✅ Acepta string o array
  tags?: string
}

interface CartItem extends Product {
  quantity: number
}

export default function TiendaProfesional() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    fetchProducts()
    loadCartFromStorage()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, selectedSubcategory, products])

  useEffect(() => {
    saveCartToStorage()
  }, [cart])

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const saveCartToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  const loadCartFromStorage = () => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    router.push('/tienda/checkout')
  }

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

    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory)
    }

    setFilteredProducts(filtered)
  }

  // Obtener subcategorías disponibles según la categoría seleccionada
  const getAvailableSubcategories = () => {
    let productsToCheck = products.filter(p => p.status === 'AVAILABLE')
    
    if (selectedCategory !== 'all') {
      productsToCheck = productsToCheck.filter(p => p.category === selectedCategory)
    }

    const subcats = new Set<string>()
    productsToCheck.forEach(p => {
      if (p.subcategory) {
        subcats.add(p.subcategory)
      }
    })

    return Array.from(subcats).sort()
  }

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'PHYSICAL', label: 'Productos Físicos' },
    { value: 'DIGITAL', label: 'Productos Digitales' },
    { value: 'SERVICE', label: 'Servicios' }
  ]

  const subcategoryLabels: Record<string, string> = {
    'PORTATILES': '💻 Portátiles',
    'MOTOS': '🏍️ Motos',
    'MONITORES': '🖥️ Monitores',
    'AUDIO': '🔊 Audio',
    'DIADEMAS': '🎧 Diademas',
    'IMPRESORAS': '🖨️ Impresoras',
    'ACCESORIOS': '🖱️ Accesorios',
    'COMPONENTES': '🔧 Componentes',
    'MEGAPACKS': '📦 Megapacks',
    'CURSOS_DISENO': '🎨 Cursos de Diseño',
    'CURSOS_PROGRAMACION': '💻 Cursos de Programación',
    'CURSOS_MARKETING': '📈 Cursos de Marketing',
    'CURSOS_OFFICE': '📊 Cursos de Office',
    'CURSOS_IDIOMAS': '🌍 Cursos de Idiomas',
    'CURSOS_PROFESIONALES': '👨‍🍳 Cursos Profesionales',
    'LIBROS': '📚 Libros',
    'PLANTILLAS': '📄 Plantillas',
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleWhatsAppContact = (product: Product) => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573005560186'
    const message = `Hola Tecnovariedades D&S! Me interesa el producto: ${product.name}`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const getProductImages = (product: Product): string[] => {
    try {
      if (!product.images) return []
      
      // Si ya es un array, devolverlo directamente
      if (Array.isArray(product.images)) return product.images as any
      
      // Si es un string, intentar parsearlo como JSON
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images)
          if (Array.isArray(parsed)) return parsed
          // Si no es array después de parsear, intentar split por comas
          return product.images.split(',').map(img => img.trim()).filter(img => img.length > 0)
        } catch {
          // Si falla el parse, intentar split por comas
          return product.images.split(',').map(img => img.trim()).filter(img => img.length > 0)
        }
      }
      
      return []
    } catch (error) {
      console.error('Error parsing product images:', error)
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🛍️ Nuestro Catálogo
              </h1>
              <p className="text-gray-600 mt-1">
                Explora nuestros productos y servicios
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCart(!showCart)}
                variant="outline"
                className="relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
              <Button
                onClick={() => {
                  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573005560186'
                  window.open(`https://wa.me/${phone}`, '_blank')
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Búsqueda */}
        <div className="mb-8 space-y-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categorías principales */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categorías:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory(cat.value)
                    setSelectedSubcategory('all')
                  }}
                  className="whitespace-nowrap"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Subcategorías */}
          {getAvailableSubcategories().length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Filtrar por tipo:</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedSubcategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedSubcategory('all')}
                  className="whitespace-nowrap"
                  size="sm"
                >
                  Todos
                </Button>
                {getAvailableSubcategories().map((subcat) => (
                  <Button
                    key={subcat}
                    variant={selectedSubcategory === subcat ? 'default' : 'outline'}
                    onClick={() => setSelectedSubcategory(subcat)}
                    className="whitespace-nowrap"
                    size="sm"
                  >
                    {subcategoryLabels[subcat] || subcat}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Contador de resultados */}
          <div className="text-sm text-gray-600">
            Mostrando {filteredProducts.length} de {products.filter(p => p.status === 'AVAILABLE').length} productos
          </div>
        </div>

        {/* Grid de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No se encontraron productos
            </h3>
            <p className="mt-2 text-gray-500">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const images = getProductImages(product)
              const mainImage = images[0] || '/placeholder-product.svg'

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-product.svg'
                      }}
                    />
                    <Badge className="absolute top-2 right-2">
                      {product.category === 'PHYSICAL' && '📦 Físico'}
                      {product.category === 'DIGITAL' && '💾 Digital'}
                      {product.category === 'SERVICE' && '🛠️ Servicio'}
                    </Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {product.description || 'Sin descripción'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price, product.currency)}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
                    <Button
                      onClick={() => handleWhatsAppContact(product)}
                      variant="outline"
                      className="flex-1"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Consultar
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Carrito Lateral */}
      {showCart && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">Carrito</h2>
            <button onClick={() => setShowCart(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Carrito vacío</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-3 pb-4 border-b">
                  <Image
                    src={getProductImages(item)[0] || '/placeholder-product.svg'}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded object-cover"
                    unoptimized
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm line-clamp-2">{item.name}</p>
                    <p className="text-blue-600 font-bold">{formatPrice(item.price, item.currency)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{formatPrice(cartTotal, 'COP')}</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                Proceder al Pago
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {showCart && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowCart(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              💬 ¿Tienes preguntas? Contáctanos por WhatsApp
            </p>
            <p className="text-sm text-gray-500">
              Todos los precios incluyen IVA
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
