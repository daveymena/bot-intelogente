'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Check, Star, ShoppingCart, Clock, Shield, Zap, Package, 
  Truck, Phone, Mail, MapPin, ChevronLeft, ChevronRight, CreditCard
} from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  userId?: string
  tags?: string[]
}

interface StoreSettings {
  storeName: string
  storeSlogan: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: string
  whatsapp: string
  email?: string
  phone?: string
  address?: string
}

export default function LandingPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = React.use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    department: '',
    city: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    fetchProduct()
  }, [resolvedParams.productId])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${resolvedParams.productId}`)
      const data = await res.json()
      setProduct(data.product)
      
      const userId = data.product?.userId || 'default'
      const settingsRes = await fetch(`/api/store-settings/public?userId=${userId}`)
      const settingsData = await settingsRes.json()
      setStoreSettings(settingsData.settings)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleWhatsApp = () => {
    const phone = storeSettings?.whatsapp || '573136174267'
    const message = `🛒 ¡Hola! Quiero comprar:\n\n📦 ${product?.name}\n💰 ${formatPrice((product?.price || 0) * quantity)}\n📊 Cantidad: ${quantity}${selectedColor ? `\n🎨 Color: ${selectedColor}` : ''}\n\n¿Está disponible?`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product) return

    try {
      // Enviar pedido al backend (email + notificaciones)
      const orderData = {
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
        total: product.price * quantity,
        color: selectedColor,
        customerData: {
          name: formData.name,
          address: formData.address,
          department: formData.department,
          city: formData.city,
          phone: formData.phone,
          email: formData.email
        },
        paymentMethod: 'contraentrega',
        userId: product.userId
      }

      // Enviar al backend
      await fetch('/api/orders/contraentrega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      // También enviar por WhatsApp
      const phone = storeSettings?.whatsapp || '573136174267'
      const message = `🛒 NUEVO PEDIDO - CONTRAENTREGA\n\n📦 Producto: ${product.name}\n💰 Total: ${formatPrice(product.price * quantity)}\n📊 Cantidad: ${quantity}${selectedColor ? `\n🎨 Color: ${selectedColor}` : ''}\n\n👤 DATOS DEL CLIENTE:\nNombre: ${formData.name}\nDirección: ${formData.address}\nDepartamento: ${formData.department}\nCiudad: ${formData.city}\nTeléfono: ${formData.phone}\nEmail: ${formData.email || 'No proporcionado'}`
      
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
      
      // Mostrar confirmación
      alert('✅ ¡Pedido enviado! Te contactaremos pronto por WhatsApp.')
      
      // Limpiar formulario
      setFormData({
        name: '',
        address: '',
        department: '',
        city: '',
        phone: '',
        email: ''
      })
      setQuantity(1)
      setSelectedColor('')
    } catch (error) {
      console.error('Error enviando pedido:', error)
      // Aún así enviar por WhatsApp como fallback
      const phone = storeSettings?.whatsapp || '573136174267'
      const message = `🛒 NUEVO PEDIDO - CONTRAENTREGA\n\n📦 Producto: ${product.name}\n💰 Total: ${formatPrice(product.price * quantity)}\n📊 Cantidad: ${quantity}${selectedColor ? `\n🎨 Color: ${selectedColor}` : ''}\n\n👤 DATOS DEL CLIENTE:\nNombre: ${formData.name}\nDirección: ${formData.address}\nDepartamento: ${formData.department}\nCiudad: ${formData.city}\nTeléfono: ${formData.phone}\nEmail: ${formData.email || 'No proporcionado'}`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const nextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Producto no encontrado</h2>
          <p className="text-gray-600 mb-6">Lo sentimos, este producto no está disponible</p>
          <Link href="/tienda" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  const isDigital = product.category?.toLowerCase().includes('curso') || 
                    product.category?.toLowerCase().includes('megapack') ||
                    product.category?.toLowerCase().includes('digital')
  
  const features = product.tags || []
  const colors = ['Negro', 'Blanco', 'Azul', 'Rosa'] // Colores de ejemplo

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-black text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-8 text-sm">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Envío gratis
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Compra segura
            </span>
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Paga en casa
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/tienda" className="flex items-center gap-3">
              {storeSettings?.logo ? (
                <Image
                  src={storeSettings.logo}
                  alt={storeSettings.storeName}
                  width={150}
                  height={50}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <span className="text-2xl font-black text-gray-900">
                  {storeSettings?.storeName || 'Smart Sales Bot'}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section con Imagen Principal */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Galería de Imágenes */}
          <div>
            {/* Imagen Principal */}
            <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden mb-4 group">
              {product.images && product.images.length > 0 ? (
                <>
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    priority
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-3 transition ${
                      selectedImage === idx 
                        ? 'border-blue-600 ring-4 ring-blue-200 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img} alt={`Vista ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            {/* Título */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {product.description.split('\n')[0].substring(0, 150)}
              </p>
            </div>

            {/* Calificación */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600 font-semibold">5 reseñas</span>
            </div>

            {/* Precio */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-black text-gray-900">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
              {quantity > 1 && (
                <p className="text-gray-600">
                  Precio unitario: {formatPrice(product.price)}
                </p>
              )}
            </div>

            {/* Badges de Confianza */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">COMPRA</p>
                <p className="text-xs text-gray-600">SEGURA</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">CALIDAD</p>
                <p className="text-xs text-gray-600">GARANTIZADA</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">DATOS</p>
                <p className="text-xs text-gray-600">PROTEGIDOS</p>
              </div>
            </div>

            {/* Texto de Envío - Solo Productos Físicos */}
            {!isDigital && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-xl font-bold">
                ENVÍO GRATIS Y PAGO CONTRAENTREGA
              </div>
            )}

            {/* Productos Digitales - Acceso Inmediato */}
            {isDigital && (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-3 rounded-xl font-bold">
                ⚡ ACCESO INMEDIATO DESPUÉS DEL PAGO
              </div>
            )}

            {/* Botones de Pago según tipo de producto */}
            {!isDigital ? (
              // Productos Físicos - Contraentrega
              <button
                onClick={handleWhatsApp}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-6 px-8 rounded-2xl font-black text-2xl shadow-xl hover:scale-105 transition-all duration-200"
              >
                PAGA CONTRAENTREGA
              </button>
            ) : (
              // Productos Digitales - Pagos Online
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = `/tienda/producto/${resolvedParams.productId}`}
                  className="w-full bg-[#00B1EA] hover:bg-[#009DD1] text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-6 h-6" />
                  PAGAR CON MERCADOPAGO
                </button>

                <button
                  onClick={() => window.location.href = `/tienda/producto/${resolvedParams.productId}`}
                  className="w-full bg-[#0070BA] hover:bg-[#005A92] text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-6 h-6" />
                  PAGAR CON PAYPAL
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Phone className="w-6 h-6" />
                  PAGAR POR CONSIGNACIÓN
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonios con Fotos Reales */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-12 text-gray-900">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                avatar: '👩',
                text: `Me encanta ${product.name}, superó todas mis expectativas. Lo uso todos los días y nunca me ha fallado.`,
                name: 'María R.',
                location: 'Bogotá'
              },
              {
                avatar: '👨',
                text: `Trabajo desde casa y ${product.name} me ha ayudado mucho. La calidad es excelente y el precio muy justo.`,
                name: 'Luis F.',
                location: 'Medellín'
              },
              {
                avatar: '👩‍💼',
                text: `¡No puedo estar más feliz con mi compra! ${product.name} es exactamente lo que necesitaba.`,
                name: 'Camila S.',
                location: 'Cali'
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic text-lg">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Completa los datos para hacer tu pedido - SOLO PRODUCTOS FÍSICOS */}
      {!isDigital && (
        <section className="py-16 bg-gradient-to-br from-green-50 to-cyan-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-black text-center mb-4 text-gray-900">
                Completa los datos para hacer tu pedido
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Recuerda que el envío es totalmente <span className="font-bold text-green-600">GRATIS</span> y pagas solo cuando recibas.
              </p>

            <form onSubmit={handleSubmitOrder} className="bg-white rounded-3xl p-8 shadow-2xl space-y-4">
              <input
                type="text"
                placeholder="Nombres y apellidos"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                required
              />
              
              <input
                type="text"
                placeholder="Dirección exacta"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                required
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Departamento"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  required
                />
              </div>

              <input
                type="tel"
                placeholder="📱 Celular"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                required
              />

              <input
                type="email"
                placeholder="Correo electrónico (Opcional)"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />

              {/* Cantidad */}
              <div>
                <label className="block text-lg font-bold mb-3 text-gray-900">Cantidad</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {product.name} x {formatPrice(product.price * num)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selecciona el color */}
              {!isDigital && (
                <div>
                  <label className="block text-lg font-bold mb-3 text-gray-900">Selecciona el color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    required
                  >
                    <option value="">---</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-6 px-8 rounded-2xl font-black text-2xl shadow-xl hover:scale-105 transition-all duration-200"
              >
                Realizar mi pedido
              </button>
            </form>
          </div>
        </div>
      </section>
      )}

      {/* Descripción Completa del Producto */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Título Persuasivo */}
            <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-gray-900 leading-tight">
              {isDigital 
                ? `¿Listo para dominar ${product.name}?`
                : `¿Cansado de productos de baja calidad que no duran?`
              }
            </h2>

            {/* Descripción Completa */}
            <div className="bg-white rounded-3xl p-8 mb-12">
              <div className="prose prose-lg max-w-none">
                {product.description.split('\n').map((paragraph, idx) => {
                  const trimmed = paragraph.trim()
                  if (!trimmed) return null
                  
                  // Si es un título (corto o con emoji)
                  if (trimmed.length < 80 && /^[🎵🎹🎼🎸🎺🎻🎤🎧🎬📚📖📝✅☑️✔️💡🎯🎓📊📈🔥⭐🌟💪🎁🎉🏆📦📱💻🖥️⚡🚀]/.test(trimmed)) {
                    return (
                      <h3 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                        {trimmed}
                      </h3>
                    )
                  }
                  
                  // Si es una lista
                  if (/^[+\-*•✓✔☑]/.test(trimmed)) {
                    return (
                      <div key={idx} className="flex items-start gap-3 mb-3">
                        <span className="text-green-600 text-xl mt-1">✓</span>
                        <p className="text-gray-700 text-lg leading-relaxed m-0">
                          {trimmed.replace(/^[+\-*•✓✔☑]\s*/, '')}
                        </p>
                      </div>
                    )
                  }
                  
                  // Texto normal
                  return (
                    <p key={idx} className="text-gray-700 text-lg leading-relaxed mb-4">
                      {trimmed}
                    </p>
                  )
                })}
              </div>
            </div>

            {/* Imagen de Lifestyle si hay más de 2 fotos */}
            {product.images && product.images.length > 2 && (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12">
                <Image
                  src={product.images[1]}
                  alt={`${product.name} en uso`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Beneficios Destacados con Checkmarks */}
            {features.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-3xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  ✓ Beneficios Clave
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-800 font-semibold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Métodos de Pago - SOLO PRODUCTOS DIGITALES */}
      {isDigital && (
        <section className="py-16 bg-gradient-to-br from-green-50 to-cyan-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-black text-center mb-4 text-gray-900">
                Métodos de Pago Disponibles
              </h2>
              <p className="text-center text-xl text-gray-600 mb-12">
                Elige tu método de pago preferido y recibe acceso inmediato
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* MercadoPago */}
                <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                  <div className="w-20 h-20 bg-[#00B1EA] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">MercadoPago</h3>
                  <p className="text-gray-600 mb-4">Tarjetas de crédito/débito, PSE, efectivo</p>
                  <button
                    onClick={() => window.location.href = `/tienda/producto/${resolvedParams.productId}`}
                    className="w-full bg-[#00B1EA] hover:bg-[#009DD1] text-white py-3 px-6 rounded-xl font-bold transition"
                  >
                    Pagar Ahora
                  </button>
                </div>

                {/* PayPal */}
                <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                  <div className="w-20 h-20 bg-[#0070BA] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">PayPal</h3>
                  <p className="text-gray-600 mb-4">Pago internacional seguro</p>
                  <button
                    onClick={() => window.location.href = `/tienda/producto/${resolvedParams.productId}`}
                    className="w-full bg-[#0070BA] hover:bg-[#005A92] text-white py-3 px-6 rounded-xl font-bold transition"
                  >
                    Pagar Ahora
                  </button>
                </div>

                {/* Consignación */}
                <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Consignación</h3>
                  <p className="text-gray-600 mb-4">Transferencia o depósito bancario</p>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-bold transition"
                  >
                    Solicitar Datos
                  </button>
                </div>
              </div>

              {/* Información de Acceso Inmediato */}
              <div className="mt-12 bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-start gap-4">
                  <Zap className="w-12 h-12 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      ⚡ Acceso Inmediato Después del Pago
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Una vez confirmado tu pago, recibirás acceso inmediato a <strong>{product.name}</strong> por email y WhatsApp. 
                      No hay esperas, comienza a disfrutar de tu producto digital al instante.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* El Paquete Incluye */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-4 text-gray-900">
            EL PAQUETE INCLUYE
          </h2>
          <p className="text-center text-2xl text-gray-600 mb-12">
            • 1 {product.name}
          </p>

          {/* Imagen de especificaciones */}
          {product.images && product.images.length > 1 && (
            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={product.images[1]}
                  alt="Especificaciones"
                  fill
                  className="object-contain bg-gradient-to-br from-gray-100 to-gray-200"
                />
              </div>
            </div>
          )}

          {/* Beneficios Clave con Emojis Grandes */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-black text-center mb-8 text-gray-900 flex items-center justify-center gap-3">
              <Check className="w-10 h-10 text-green-600" />
              Beneficios Clave de {product.name}
            </h3>
            
            <div className="space-y-4">
              {features.length > 0 ? (
                features.map((feature, idx) => {
                  const emojis = ['🔊', '📞', '⚡', '💡', '🎨', '🎯', '💪', '🏆', '⭐', '🚀']
                  const gradients = [
                    'from-blue-50 to-cyan-50',
                    'from-green-50 to-emerald-50',
                    'from-yellow-50 to-orange-50',
                    'from-purple-50 to-pink-50',
                    'from-pink-50 to-rose-50',
                    'from-indigo-50 to-blue-50',
                    'from-teal-50 to-cyan-50',
                    'from-orange-50 to-red-50'
                  ]
                  return (
                    <div key={idx} className={`flex items-center gap-4 bg-gradient-to-r ${gradients[idx % gradients.length]} p-6 rounded-2xl shadow-sm hover:shadow-md transition`}>
                      <span className="text-5xl">{emojis[idx % emojis.length]}</span>
                      <p className="text-xl font-bold text-gray-900">{feature}</p>
                    </div>
                  )
                })
              ) : (
                // Beneficios por defecto si no hay tags
                <>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-sm">
                    <span className="text-5xl">✓</span>
                    <p className="text-xl font-bold text-gray-900">Calidad premium garantizada</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm">
                    <span className="text-5xl">✓</span>
                    <p className="text-xl font-bold text-gray-900">Diseño moderno y funcional</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-sm">
                    <span className="text-5xl">✓</span>
                    <p className="text-xl font-bold text-gray-900">Fácil de usar</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-sm">
                    <span className="text-5xl">✓</span>
                    <p className="text-xl font-bold text-gray-900">Durabilidad excepcional</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Galería de Lifestyle */}
      {product.images && product.images.length > 2 && (
        <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {product.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={img}
                    alt={`Lifestyle ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tecnología que Te Entiende */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-8 text-gray-900">
              Tecnología que Te Entiende
            </h2>

            {product.images && product.images.length > 2 && (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl mb-8">
                <Image
                  src={product.images[2]}
                  alt="Tecnología"
                  fill
                  className="object-contain bg-gradient-to-br from-gray-100 to-gray-200"
                />
              </div>
            )}

            <div className="space-y-6 text-left">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                  <Phone className="w-8 h-8 text-blue-600" />
                  ¡Llamadas sin ruido de fondo!
                </h3>
                <p className="text-lg text-gray-700">
                  Gracias a su <span className="font-bold">AI HD Call</span>, tu voz suena limpia y clara en cada conversación.
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-600" />
                  ¡Carga en minutos, disfruta horas!
                </h3>
                <p className="text-lg text-gray-700">
                  Con su <span className="font-bold">puerto Type-C Flash Charging</span>, unos minutos de carga te dan horas de música.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-3">
                  <Package className="w-8 h-8 text-purple-600" />
                  ¡Cero molestias, 100% confort!
                </h3>
                <p className="text-lg text-gray-700">
                  Su diseño ergonómico <span className="font-bold">"Open Wearing"</span> se adapta perfectamente a tus oídos, <span className="font-bold">olvidarás que los llevas puestos.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-black mb-6">
            {isDigital 
              ? `¿Listo para dominar ${product.name}?`
              : `¿Listo para disfrutar de ${product.name}?`
            }
          </h2>
          <p className="text-2xl mb-8 opacity-90">
            {isDigital
              ? '¡No esperes más! Obtén acceso inmediato después del pago.'
              : '¡No esperes más! Haz tu pedido ahora y recíbelo en tu casa.'
            }
          </p>
          
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 mb-8">
            <p className="text-3xl font-black mb-2">PRECIO ESPECIAL</p>
            <p className="text-6xl font-black">{formatPrice(product.price)}</p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-8 px-16 rounded-2xl font-black text-3xl shadow-2xl hover:scale-105 transition-all duration-200 inline-block"
          >
            {isDigital ? 'COMPRAR AHORA' : 'PEDIR AHORA POR WHATSAPP'}
          </button>

          <p className="mt-6 text-lg opacity-80">
            {isDigital
              ? '✓ Acceso Inmediato ✓ Descarga Instantánea ✓ Soporte Incluido'
              : '✓ Envío GRATIS ✓ Pago Contraentrega ✓ Garantía Incluida'
            }
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-3xl font-bold">
              {storeSettings?.storeName || 'Smart Sales Bot'}
            </h3>
            {storeSettings?.storeSlogan && (
              <p className="text-xl text-gray-400">{storeSettings.storeSlogan}</p>
            )}
            
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              {storeSettings?.whatsapp && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>WhatsApp: {storeSettings.whatsapp}</span>
                </div>
              )}
              {storeSettings?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>{storeSettings.email}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 pt-6 mt-6">
              <p className="text-gray-500">
                © 2024 {storeSettings?.storeName || 'Smart Sales Bot'} - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href={`https://wa.me/${storeSettings?.whatsapp || '573136174267'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1EBE57] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 z-50 animate-bounce"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  )
}
