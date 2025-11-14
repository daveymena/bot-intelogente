'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Loader2, 
  MessageCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  Star
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

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
  userId?: string
  paymentLinkMercadoPago?: string
  paymentLinkPayPal?: string
  paymentLinkCustom?: string
}

export default function ProductoDetalle() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [paymentLinks, setPaymentLinks] = useState<{
    mercadopago?: string
    paypal?: string
    hotmart?: string
  }>({})
  const [loadingPaymentLinks, setLoadingPaymentLinks] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchPaymentLinks()
    }
  }, [productId])

  const fetchPaymentLinks = async () => {
    if (!productId) {
      console.log('ÔØî No productId available')
      return
    }
    
    console.log('­ƒöì Fetching payment links for product:', productId)
    setLoadingPaymentLinks(true)
    
    try {
      const url = `/api/payment/generate-link?productId=${productId}`
      console.log('­ƒôí Calling:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('­ƒôÑ Response:', data)
      
      if (response.ok && data.success && data.paymentLinks) {
        setPaymentLinks(data.paymentLinks)
        console.log('Ô£à Payment links loaded:', data.paymentLinks)
      } else {
        console.error('ÔØî Error in response:', data)
        // Usar links manuales si existen
        if (product) {
          setPaymentLinks({
            mercadopago: product.paymentLinkMercadoPago,
            paypal: product.paymentLinkPayPal,
            hotmart: product.paymentLinkCustom
          })
        }
      }
    } catch (error) {
      console.error('ÔØî Error fetching payment links:', error)
      // Fallback a links manuales
      if (product) {
        setPaymentLinks({
          mercadopago: product.paymentLinkMercadoPago,
          paypal: product.paymentLinkPayPal,
          hotmart: product.paymentLinkCustom
        })
      }
    } finally {
      setLoadingPaymentLinks(false)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        toast({
          title: 'Error',
          description: 'Producto no encontrado',
          variant: 'destructive'
        })
        router.push('/tienda')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar el producto',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getImages = (): string[] => {
    if (!product?.images) return ['/placeholder-product.svg']
    try {
      if (Array.isArray(product.images)) {
        const filtered = product.images.filter(img => img && img.trim() !== '')
        return filtered.length > 0 ? filtered : ['/placeholder-product.svg']
      }
      if (typeof product.images === 'string') {
        if (product.images.trim() === '') return ['/placeholder-product.svg']

        try {
          const parsed = JSON.parse(product.images)
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(img => img && img.trim() !== '')
            return filtered.length > 0 ? filtered : ['/placeholder-product.svg']
          }
        } catch {
          // Si no es JSON, intentar split por comas
          const split = product.images.split(',').map(s => s.trim()).filter(s => s !== '')
          return split.length > 0 ? split : ['/placeholder-product.svg']
        }
      }
      return ['/placeholder-product.svg']
    } catch {
      return ['/placeholder-product.svg']
    }
  }

  const images = getImages()

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const addToCart = () => {
    if (!product) return

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existing = cart.find((item: any) => item.id === product.id)

      if (existing) {
        existing.quantity += quantity
      } else {
        cart.push({ ...product, quantity })
      }

      localStorage.setItem('cart', JSON.stringify(cart))

      toast({
        title: 'Ô£à Agregado al carrito',
        description: `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${product.name}`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'No se pudo agregar al carrito',
        variant: 'destructive'
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Enlace copiado',
        description: 'El enlace se copi├│ al portapapeles'
      })
    }
  }

  const handleWhatsAppContact = () => {
    if (!product) return
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573005560186'
    const message = `Hola! Me interesa el producto: ${product.name} - ${window.location.href}`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Profesional */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/tienda">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la tienda
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold hidden md:block">Tecnovariedades D&S</h1>
            </div>

            <Link href="/tienda/checkout">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-green-50/30">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Galer├¡a de Im├ígenes */}
          <div className="space-y-4">
            {/* Badge de Recomendado */}
            {product.tags?.includes('recomendado') && (
              <Badge className="bg-yellow-500 text-black font-bold px-4 py-1">
                Producto Recomendado
              </Badge>
            )}

            {/* Imagen Principal */}
            <Card className="overflow-hidden shadow-xl border-2">
              <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-green-50">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-product.svg'
                  }}
                />
                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                  <Share2 className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </Card>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                      ? 'border-green-600 ring-2 ring-green-600'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informaci├│n del Producto */}
          <div className="space-y-6">
            {/* Categor├¡a y Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">{product.category}</Badge>
              {product.status === 'AVAILABLE' && (
                <Badge className="bg-green-600 text-sm">Disponible</Badge>
              )}
              {product.tags?.includes('nuevo') && (
                <Badge className="bg-blue-600 text-sm">Nuevo</Badge>
              )}
            </div>

            {/* T├¡tulo y Rating */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.5)</span>
              </div>

              {/* Precio */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                <p className="text-5xl font-bold text-gray-900 mb-2">
                  {formatPrice(product.price, product.currency)}
                </p>
                <p className="text-sm text-gray-600">
                  Env├¡o a todo el pa├¡s con
                </p>
              </div>
            </div>

            {/* Descripci├│n */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Descripci├│n
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {product.description || 'Sin descripci├│n disponible'}
              </p>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Botones de Acci├│n */}
            <div className="space-y-4">
              {/* Bot├│n Principal - Agregar al Carrito */}
              <Button
                onClick={addToCart}
                className="w-full bg-black hover:bg-gray-800 h-14 text-lg font-semibold"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                A├æADIR AL CARRITO
              </Button>

              {/* M├®todos de Pago */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                  Medios de pago
                </p>
                
                {/* Botones de Pago con Logos */}
                <div className="space-y-3">
                  {/* MercadoPago */}
                  <Button
                    onClick={() => {
                      const link = product.paymentLinkMercadoPago || paymentLinks.mercadopago
                      
                      if (link) {
                        window.open(link, '_blank')
                        toast({
                          title: 'Ô£à Redirigiendo a MercadoPago',
                          description: 'Abriendo p├ígina de pago segura...'
                        })
                      } else {
                        toast({
                          title: 'Generando link de pago...',
                          description: 'Por favor espera un momento',
                        })
                      }
                    }}
                    disabled={loadingPaymentLinks}
                    className="w-full h-14 bg-[#009EE3] hover:bg-[#0082C3] text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
                  >
                    {loadingPaymentLinks ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="h-6 w-6" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" />
                        </svg>
                        <span>Pagar con Mercado Pago</span>
                      </div>
                    )}
                  </Button>

                  {/* PayPal */}
                  <Button
                    onClick={() => {
                      const link = product.paymentLinkPayPal || paymentLinks.paypal
                      
                      if (link) {
                        window.open(link, '_blank')
                        toast({
                          title: 'Ô£à Redirigiendo a PayPal',
                          description: 'Abriendo p├ígina de pago segura...'
                        })
                      } else {
                        toast({
                          title: 'Generando link de pago...',
                          description: 'Por favor espera un momento',
                        })
                      }
                    }}
                    disabled={loadingPaymentLinks}
                    className="w-full h-14 bg-[#0070BA] hover:bg-[#005A92] text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
                  >
                    {loadingPaymentLinks ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="h-6 w-6" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M30 20 Q50 10 70 20 Q80 30 75 45 Q70 60 50 65 L40 65 L35 85 L20 85 L30 20 Z" />
                          <path d="M45 30 Q60 25 70 35 Q75 45 70 55 Q65 65 50 68 L42 68 L38 82 L28 82 L35 45 Z" />
                        </svg>
                        <span>Pagar con PayPal</span>
                      </div>
                    )}
                  </Button>

                  {/* WhatsApp - Contacto Directo */}
                  <Button
                    onClick={handleWhatsAppContact}
                    variant="outline"
                    className="w-full h-12 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold transition-all"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Consultar por WhatsApp
                  </Button>
                </div>

                {/* Tarjetas Aceptadas con Logos */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs font-medium text-gray-600 mb-3 text-center">
                    Tarjetas de cr├®dito y d├®bito aceptadas
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {/* Visa */}
                    <div className="h-8 px-3 bg-white rounded border flex items-center justify-center shadow-sm">
                      <svg className="h-5" viewBox="0 0 48 16" fill="none">
                        <path d="M20.5 2L17 14h-3l3.5-12h3zm8.5 7.5c0-2-2.5-2.5-2.5-3.5 0-.5.5-1 1.5-1 1 0 2 .5 2.5.5l.5-2.5c-.5-.5-1.5-.5-2.5-.5-3 0-5 1.5-5 3.5 0 1.5 1.5 2.5 2.5 3 1 .5 1.5 1 1.5 1.5 0 1-1 1.5-2 1.5-1 0-2-.5-2.5-.5l-.5 2.5c.5.5 2 .5 3 .5 3 0 5-1.5 5-4zm7.5 4.5h2.5l-2-12h-2.5c-.5 0-1 .5-1.5 1l-4.5 11h3l.5-1.5h3.5l.5 1.5zm-3-4l1.5-4 1 4h-2.5zM15 2l-3 8-1-5c0-.5-.5-1-1-1H5l0 .5c1 .5 2 1 3 1.5l2.5 9.5h3L18 2h-3z" fill="#1434CB"/>
                      </svg>
                    </div>
                    
                    {/* Mastercard */}
                    <div className="h-8 px-3 bg-white rounded border flex items-center justify-center shadow-sm">
                      <svg className="h-5" viewBox="0 0 48 32" fill="none">
                        <circle cx="16" cy="16" r="12" fill="#EB001B"/>
                        <circle cx="32" cy="16" r="12" fill="#F79E1B"/>
                        <path d="M24 8c-2.5 2-4 5-4 8s1.5 6 4 8c2.5-2 4-5 4-8s-1.5-6-4-8z" fill="#FF5F00"/>
                      </svg>
                    </div>
                    
                    {/* American Express */}
                    <div className="h-8 px-3 bg-white rounded border flex items-center justify-center shadow-sm">
                      <svg className="h-5" viewBox="0 0 48 16" fill="none">
                        <rect width="48" height="16" rx="2" fill="#006FCF"/>
                        <text x="24" y="12" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">AMEX</text>
                      </svg>
                    </div>
                    
                    {/* Diners */}
                    <div className="h-8 px-3 bg-white rounded border flex items-center justify-center shadow-sm">
                      <svg className="h-5" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#0079BE"/>
                        <circle cx="12" cy="16" r="8" fill="white"/>
                        <circle cx="20" cy="16" r="8" fill="white"/>
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Pago 100% seguro con encriptaci├│n SSL
                  </p>
                </div>
              </div>

              {/* Botones Secundarios */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex-1"
                >
                  <Heart
                    className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''
                      }`}
                  />
                  {isFavorite ? 'Guardado' : 'Guardar'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Caracter├¡sticas de Servicio */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">Env├¡o Gratis</p>
                <p className="text-xs text-gray-500 mt-1">A todo el pa├¡s</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-green-50 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">Compra Segura</p>
                <p className="text-xs text-gray-500 mt-1">Protecci├│n total</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-purple-50 rounded-full">
                    <RefreshCw className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">Devoluciones</p>
                <p className="text-xs text-gray-500 mt-1">30 d├¡as</p>
              </div>
            </div>

            {/* Informaci├│n Adicional */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Categor├¡a:</span>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado:</span>
                    <Badge className="bg-green-600">
                      {product.status === 'AVAILABLE' ? 'Hay existencias' : 'No disponible'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moneda:</span>
                    <span className="font-medium">{product.currency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valoraci├│n:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
