'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, Heart, Bell, Home, X, Plus, Minus, CreditCard, Truck, Lock } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  subcategory?: string | null
  status: string
  images?: string | string[]
}

interface CartItem extends Product {
  quantity: number
}

export default function TiendaProfesional() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'mercadopago'
  })

  useEffect(() => {
    fetchProducts()
    loadCart()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, products])

  useEffect(() => {
    saveCart()
    
    // Si el carrito solo tiene productos digitales/servicios y está seleccionado contraentrega, cambiar a mercadopago
    if (hasOnlyDigitalOrServices && formData.paymentMethod === 'contraentrega') {
      setFormData({ ...formData, paymentMethod: 'mercadopago' })
    }
  }, [cart])

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

  const loadCart = () => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }

  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  const filterProducts = () => {
    let filtered = products.filter(p => p.status === 'AVAILABLE')
    
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'Todos') {
      const categoryMap: Record<string, string> = {
        'Físicos': 'PHYSICAL',
        'Digitales': 'DIGITAL',
        'Servicios': 'SERVICE'
      }
      filtered = filtered.filter(p => p.category === categoryMap[selectedCategory])
    }

    setFilteredProducts(filtered)
  }

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  // Verificar si hay productos físicos en el carrito
  const hasPhysicalProducts = cart.some(item => item.category === 'PHYSICAL')
  const hasOnlyDigitalOrServices = cart.every(item => item.category === 'DIGITAL' || item.category === 'SERVICE')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getProductImages = (product: Product): string[] => {
    try {
      if (!product.images) return []
      if (Array.isArray(product.images)) return product.images
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images)
          if (Array.isArray(parsed)) return parsed
          return product.images.split(',').map(img => img.trim()).filter(img => img.length > 0)
        } catch {
          return product.images.split(',').map(img => img.trim()).filter(img => img.length > 0)
        }
      }
      return []
    } catch {
      return []
    }
  }

  const handleCheckout = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        items: cart,
        total: cartTotal,
        paymentMethod: formData.paymentMethod,
        status: 'pending'
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Error al crear orden')

      const { orderId } = await response.json()

      // Generar link de pago según método
      let paymentUrl = ''
      
      if (formData.paymentMethod === 'mercadopago' || formData.paymentMethod === 'transferencia') {
        // MercadoPago incluye: Tarjetas, PSE, Nequi, Daviplata, Efectivo, etc.
        const paymentResponse = await fetch('/api/payments/generate-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: cart[0].id })
        })
        
        if (paymentResponse.ok) {
          const data = await paymentResponse.json()
          paymentUrl = data.paymentLinks?.methods?.mercadopago || ''
          console.log('✅ MercadoPago link generado:', paymentUrl)
        } else {
          console.error('❌ Error generando link MercadoPago')
        }
      } else if (formData.paymentMethod === 'paypal') {
        const paymentResponse = await fetch('/api/payments/generate-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: cart[0].id })
        })
        
        if (paymentResponse.ok) {
          const data = await paymentResponse.json()
          paymentUrl = data.paymentLinks?.methods?.paypal || ''
          console.log('✅ PayPal link generado:', paymentUrl)
        } else {
          console.error('❌ Error generando link PayPal')
        }
      } else if (formData.paymentMethod === 'contraentrega') {
        // Para contra entrega, enviar por WhatsApp
        const phone = '573102345678'
        const message = `Hola! Pedido #${orderId} - CONTRA ENTREGA\n\nProductos:\n${cart.map(item => 
          `${item.quantity}x ${item.name} - ${formatPrice(item.price)}`
        ).join('\n')}\n\nTotal: ${formatPrice(cartTotal)}\n\nDatos:\n${formData.name}\n${formData.email}\n${formData.phone}\n${formData.address}, ${formData.city}`
        paymentUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      } else if (formData.paymentMethod === 'whatsapp') {
        const phone = '573102345678'
        const message = `Hola! Pedido #${orderId}\n\nProductos:\n${cart.map(item => 
          `${item.quantity}x ${item.name} - ${formatPrice(item.price)}`
        ).join('\n')}\n\nTotal: ${formatPrice(cartTotal)}\n\nDatos:\n${formData.name}\n${formData.email}\n${formData.phone}`
        paymentUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      }

      if (paymentUrl) {
        window.open(paymentUrl, '_blank')
        setCart([])
        setShowCheckout(false)
        setShowCart(false)
        alert(`Pedido #${orderId} creado exitosamente`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el pedido')
    }
  }

  const handleWhatsApp = () => {
    window.open('https://wa.me/573102345678', '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Rojo */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 border-b border-red-500">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span className="text-sm font-bold">TECNOVARIEDADES D&S</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:bg-red-500 p-2 rounded-full transition">
                <User className="w-5 h-5" />
              </button>
              <button className="hover:bg-red-500 p-2 rounded-full transition">
                <Heart className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowCart(true)}
                className="relative hover:bg-red-500 p-2 rounded-full transition"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button className="hover:bg-red-500 p-2 rounded-full transition">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">🏪 Tecnovariedades D&S</h1>
                <p className="text-red-100 text-sm">{products.filter(p => p.status === 'AVAILABLE').length} productos disponibles</p>
              </div>
              <button
                onClick={handleWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contactar por WhatsApp
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-6 py-3 text-sm">
            <button onClick={() => setSelectedCategory('Todos')} className="hover:text-red-200 transition">
              Todos
            </button>
            <button onClick={() => setSelectedCategory('Físicos')} className="hover:text-red-200 transition">
              Tecnología
            </button>
            <button onClick={() => setSelectedCategory('Digitales')} className="hover:text-red-200 transition">
              Cursos Digitales
            </button>
            <button onClick={() => setSelectedCategory('Servicios')} className="hover:text-red-200 transition">
              Servicios
            </button>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="text-sm text-gray-600">
            Home / Tienda
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              {['Todos', 'Físicos', 'Digitales', 'Servicios'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          <span className="font-bold text-green-600">{filteredProducts.length}</span> productos disponibles
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const images = getProductImages(product)
            const mainImage = images[0] || '/placeholder-product.svg'

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden group">
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-product.svg'
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.category === 'PHYSICAL' && 'Físico'}
                    {product.category === 'DIGITAL' && 'Digital'}
                    {product.category === 'SERVICE' && 'Servicio'}
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description || 'Sin descripción'}
                  </p>
                  
                  <div className="text-2xl font-bold text-red-600 mb-4">
                    {formatPrice(product.price)}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Agregar al Carrito
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition"
                    >
                      Consultar WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Carrito Lateral */}
      {showCart && !showCheckout && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b bg-gradient-to-r from-red-50 to-red-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-600">🛒 Tu Carrito</h2>
              <button onClick={() => setShowCart(false)} className="hover:bg-red-200 p-1 rounded">
                <X className="h-6 w-6 text-red-600" />
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
                      <p className="text-red-600 font-bold">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-red-200 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-red-200 rounded"
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
              <div className="p-4 border-t bg-gradient-to-r from-red-50 to-red-100 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-red-600">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => {
                    setShowCart(false)
                    setShowCheckout(true)
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-12 font-bold text-lg rounded-lg"
                >
                  <Lock className="inline mr-2 h-5 w-5" />
                  Proceder al Pago
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Checkout */}
      {showCheckout && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-xl my-8">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Finalizar Compra
                  </h2>
                  <button onClick={() => setShowCheckout(false)} className="hover:bg-red-500 p-1 rounded">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Información de Contacto */}
                <div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">Correo Electrónico *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">Ciudad</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                        placeholder="Bogotá"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">Dirección</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                        placeholder="Calle 123 #45-67"
                      />
                    </div>
                  </div>
                </div>

                {/* Método de Pago */}
                <div className="border-t pt-4">
                  <h3 className="font-bold text-base mb-3">Método de Pago</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-red-600 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="mercadopago"
                        checked={formData.paymentMethod === 'mercadopago'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xs">MP</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">MercadoPago</div>
                        <div className="text-xs text-gray-500">Tarjetas, PSE, Efectivo</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-red-600 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xs">PP</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">PayPal</div>
                        <div className="text-xs text-gray-500">Pago internacional seguro</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-red-600 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="transferencia"
                        checked={formData.paymentMethod === 'transferencia'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div className="w-10 h-10 bg-purple-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xs">PSE</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">PSE / Transferencia</div>
                        <div className="text-xs text-gray-500">Nequi, Daviplata, PSE, Bancolombia</div>
                      </div>
                    </label>

                    {hasPhysicalProducts && (
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-green-600 transition">
                        <input
                          type="radio"
                          name="payment"
                          value="contraentrega"
                          checked={formData.paymentMethod === 'contraentrega'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="mr-3"
                        />
                        <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center mr-3">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Contra Entrega</div>
                          <div className="text-xs text-gray-500">Paga al recibir (solo físicos)</div>
                        </div>
                      </label>
                    )}
                    
                    {hasOnlyDigitalOrServices && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          ℹ️ <strong>Productos digitales:</strong> Solo pagos online disponibles. Recibirás tu producto por email inmediatamente después del pago.
                        </p>
                      </div>
                    )}

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-green-600 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="whatsapp"
                        checked={formData.paymentMethod === 'whatsapp'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xs">WA</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">WhatsApp</div>
                        <div className="text-xs text-gray-500">Coordina tu pago directamente</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <h3 className="font-bold text-sm mb-2">Resumen del Pedido</h3>
                  <div className="space-y-1.5">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-gray-700">{item.quantity}x {item.name.substring(0, 30)}...</span>
                        <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-red-200 pt-2 flex justify-between text-base font-bold">
                      <span>Total:</span>
                      <span className="text-red-600">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 border border-gray-300 hover:bg-gray-100 py-2.5 rounded-lg font-semibold text-sm transition"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 rounded-lg font-semibold text-sm transition"
                  >
                    <Lock className="inline mr-1 h-4 w-4" />
                    Finalizar Compra
                  </button>
                </div>

                <div className="text-center text-xs text-gray-600">
                  🔒 Pago 100% seguro y encriptado
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-red-600 to-red-700 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="mb-2 text-lg font-bold">
              💬 ¿Tienes preguntas? Contáctanos por WhatsApp
            </p>
            <p className="text-sm text-red-100">
              Todos los precios incluyen IVA • Envío gratis en compras digitales • Soporte 24/7
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
