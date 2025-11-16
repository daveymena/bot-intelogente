'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShoppingCart, MessageCircle, Filter, Store } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

interface UserInfo {
  businessName?: string
  whatsappNumber?: string
  email?: string
}

export default function TiendaUsuario() {
  const params = useParams()
  const userId = params.userId as string

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchUserProducts()
    }
  }, [userId])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, products])

  const fetchUserProducts = async () => {
    try {
      const response = await fetch(`/api/products/by-user/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setUserInfo(data.userInfo || {})
      } else {
        setError('Usuario no encontrado o sin productos')
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
      setError('Error al cargar la tienda')
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

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'PHYSICAL', label: 'Productos Físicos' },
    { value: 'DIGITAL', label: 'Productos Digitales' },
    { value: 'SERVICE', label: 'Servicios' }
  ]

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleWhatsAppContact = (product: Product) => {
    const phone = userInfo.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573005560186'
    const message = `Hola! Me interesa el producto: ${product.name}`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const getProductImages = (product: Product): string[] => {
    try {
      return product.images ? JSON.parse(product.images) : []
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tienda no encontrada</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/tienda'}>
            Ver tienda general
          </Button>
        </div>
      </div>
    )
  }

  const businessName = userInfo.businessName || 'Nuestra Tienda'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="h-8 w-8 text-blue-600" />
                {businessName}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} productos disponibles
              </p>
            </div>
            <Button
              onClick={() => {
                const phone = userInfo.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573005560186'
                window.open(`https://wa.me/${phone}`, '_blank')
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contactar por WhatsApp
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Búsqueda */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="whitespace-nowrap"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {cat.label}
                </Button>
              ))}
            </div>
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
              {searchTerm || selectedCategory !== 'all' 
                ? 'Intenta con otros términos de búsqueda'
                : 'Esta tienda aún no tiene productos disponibles'}
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

                  <CardFooter className="flex flex-col gap-2">
                    <Link href={`/producto/${product.id}`} className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Ver Producto
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleWhatsAppContact(product)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Consultar WhatsApp
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>

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
