'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Share2, Plus, Minus, Truck, Shield, CreditCard, Info, Star } from 'lucide-react'
import CurrencySelector from '@/components/CurrencySelector'
import ContraentregaForm from '@/components/ContraentregaForm'

interface Product {
  id: number
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  userId?: string
}

interface StoreSettings {
  storeName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo: string
  whatsapp: string
}

interface ModernProductDetailProps {
  product: Product
  settings: StoreSettings
  selectedImage: number
  setSelectedImage: (idx: number) => void
  quantity: number
  setQuantity: (q: number) => void
  generatingPayment: boolean
  userCurrency: string
  formatPrice: (p: number) => string
  getPriceInUSD: (p: number) => string
  handleGeneratePaymentLink: (method: 'mercadopago' | 'paypal') => void
  handleWhatsApp: () => void
  handleShare: () => void
  handleAddToCart: () => void
  showContraentregaForm: boolean
  setShowContraentregaForm: (s: boolean) => void
  formatDescription: (d: string) => React.ReactNode
  setUserCurrency: (c: string) => void
}

export default function ModernProductDetail({
  product,
  settings,
  selectedImage,
  setSelectedImage,
  quantity,
  setQuantity,
  generatingPayment,
  userCurrency,
  formatPrice,
  getPriceInUSD,
  handleGeneratePaymentLink,
  handleWhatsApp,
  handleShare,
  handleAddToCart,
  showContraentregaForm,
  setShowContraentregaForm,
  formatDescription,
  setUserCurrency
}: ModernProductDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header 
        className="text-white sticky top-0 z-50 shadow-lg"
        style={{
          background: settings?.primaryColor 
            ? `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor || settings.primaryColor})`
            : 'linear-gradient(to right, #1f2937, #000000)'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/tienda" className="flex items-center space-x-2 hover:opacity-80 transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold text-base">{settings?.storeName || 'Smart Sales Bot'}</span>
            </Link>
            <div className="flex items-center gap-2">
              <CurrencySelector onCurrencyChange={(currency) => setUserCurrency(currency.code)} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="p-6">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                {product.images?.[selectedImage] ? (
                  <Image src={product.images[selectedImage]} alt={product.name} fill className="object-contain p-4" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">📦</div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images?.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200'}`}>
                    <Image src={img} alt={product.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
               <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase mb-4 inline-block">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="text-4xl font-bold text-blue-600 mb-6">{formatPrice(product.price * quantity)}</div>

              <div className="prose prose-sm mb-8">{formatDescription(product.description)}</div>

              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 bg-gray-100 rounded-lg"><Minus className="w-5 h-5" /></button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 bg-gray-100 rounded-lg"><Plus className="w-5 h-5" /></button>
              </div>

              <div className="grid gap-4">
                <button onClick={handleAddToCart} className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg">AGREGAR AL CARRITO</button>
                <button onClick={() => handleGeneratePaymentLink('mercadopago')} className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold shadow-md">Pagar con MercadoPago</button>
                <button onClick={handleWhatsApp} className="w-full py-4 bg-green-500 text-white rounded-xl font-bold shadow-md">Consultar WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showContraentregaForm && (
        <ContraentregaForm
          product={{ id: product.id, name: product.name, price: product.price }}
          quantity={quantity}
          onClose={() => setShowContraentregaForm(false)}
          formatPrice={formatPrice}
        />
      )}
    </div>
  )
}
