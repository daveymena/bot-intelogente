'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Share2, Plus, Minus, Truck, Shield, CreditCard, Info, Star, CheckCircle2, Heart, Phone, Globe } from 'lucide-react'
import ContraentregaForm from '@/components/ContraentregaForm'
import CurrencySelector from '@/components/CurrencySelector'

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
  phone: string
}

interface SmartJoysProductDetailProps {
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
  setUserCurrency?: (c: string) => void
}

export default function SmartJoysProductDetail({
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
}: SmartJoysProductDetailProps) {
  
  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      {/* Black Header (Matches Store Header) */}
      <header className="bg-black text-white py-4 px-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/tienda" className="flex items-center gap-4 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5 text-red-600" />
            <span className="text-xl font-black italic tracking-tighter text-white">SMART<span className="text-red-600">JOYS</span></span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
             {setUserCurrency && (
                <div className="hidden sm:block">
                   <CurrencySelector onCurrencyChange={(currency) => setUserCurrency(currency.code)} />
                </div>
             )}
             <div className="hidden sm:flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold">{settings.whatsapp || settings.phone}</span>
             </div>
             <Link href="/tienda/carrito" className="relative group p-2 hover:bg-white/10 rounded-full transition">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-black">0</span>
             </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3 px-4 mb-8">
        <div className="container mx-auto text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
           <Link href="/tienda" className="hover:text-black">Inicio</Link>
           <span>/</span>
           <span className="text-gray-300">{product.category || 'Tecnología'}</span>
           <span>/</span>
           <span className="text-black truncate">{product.name}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Gallery (5 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col md:flex-row gap-4">
             {/* Thumbnails */}
             <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto no-scrollbar md:w-20">
                {product.images?.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white border-2 transition-all p-1 ${
                      selectedImage === idx ? 'border-red-600 shadow-md' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-full h-full">
                       <Image src={img} alt={product.name} fill className="object-contain" />
                    </div>
                  </button>
                ))}
             </div>
             {/* Main Image */}
             <div className="flex-1 order-1 md:order-2 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 aspect-square relative flex items-center justify-center">
                <Image 
                  src={product.images?.[selectedImage] || ''} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-8"
                  priority 
                />
                <button 
                  onClick={handleShare}
                  className="absolute top-6 right-6 bg-gray-50 p-3 rounded-full hover:bg-red-600 hover:text-white transition shadow-sm"
                >
                  <Share2 className="w-5 h-5" />
                </button>
             </div>
          </div>

          {/* Column 2: Info (4 cols) */}
          <div className="lg:col-span-7 xl:col-span-4 flex flex-col gap-8">
             <div>
                <div className="flex items-center gap-2 mb-4">
                   <div className="bg-[#8ec63f] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase italic tracking-widest">TOP VENTA</div>
                   <div className="flex gap-0.5 text-[#ffbb00]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                   </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-none tracking-tight text-gray-900 mb-6">
                  {product.name}
                </h1>
                
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium">
                  {formatDescription(product.description)}
                </div>
             </div>

             {/* Features List */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="bg-red-100 text-red-600 p-2 rounded-lg"><Truck className="w-5 h-5" /></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-400">Envío</span>
                      <span className="text-xs font-bold">Todo el país</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="bg-green-100 text-green-600 p-2 rounded-lg"><Shield className="w-5 h-5" /></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-400">Garantía</span>
                      <span className="text-xs font-bold">12 Meses</span>
                   </div>
                </div>
             </div>

             {/* Protection Banner */}
             <div className="bg-black text-white p-6 rounded-3xl flex items-center justify-between relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="font-black italic uppercase text-lg leading-tight">Compra <br/><span className="text-red-600 text-2xl">Protegida</span></h4>
                   <p className="text-[10px] text-gray-400 mt-2 font-bold tracking-widest uppercase">Garantía de satisfacción</p>
                </div>
                <Shield className="w-16 h-16 text-white/10 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform duration-500" />
                <button className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-full uppercase hover:bg-red-600 hover:text-white transition">Saber más</button>
             </div>
          </div>

          {/* Column 3: Buy Card (3 cols) */}
          <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-6 sticky top-24">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden relative">
                {/* Accent Background */}
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
                
                <div className="text-center mb-8 pt-4">
                   <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Inicia desde</span>
                   <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-red-600 font-black text-5xl leading-none italic">{formatPrice(product.price * quantity)}</span>
                   </div>
                   {userCurrency !== 'USD' && (
                     <div className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-widest">
                       aprox. {getPriceInUSD(product.price * quantity)}
                     </div>
                   )}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between bg-[#f4f7f6] rounded-2xl p-2 mb-8">
                   <button 
                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
                     className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-black hover:text-white transition shadow-sm"
                   >
                     <Minus className="w-4 h-4" />
                   </button>
                   <span className="font-black text-xl italic">{quantity}</span>
                   <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-black hover:text-white transition shadow-sm"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>

                {/* Main Actions */}
                <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleAddToCart}
                     className="w-full bg-black text-white py-5 rounded-2xl font-black italic uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-lg"
                   >
                      <ShoppingCart className="w-5 h-5" /> Añadir al carrito
                   </button>
                   
                   <button 
                     onClick={() => setShowContraentregaForm(true)}
                     className="w-full bg-red-600 text-white py-5 rounded-2xl font-black italic uppercase tracking-widest hover:bg-black transition-all flex flex-col items-center justify-center relative overflow-hidden group shadow-lg"
                   >
                      <span className="relative z-10 flex items-center gap-2 text-sm"><Truck className="w-4 h-4" /> Pagar al recibir</span>
                      <span className="relative z-10 text-[9px] text-white/80 font-bold uppercase tracking-widest mt-0.5">CONTRAENTREGA</span>
                      <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                   </button>

                   <div className="flex items-center gap-2 text-gray-400 mt-4">
                      <div className="h-[1px] flex-1 bg-gray-100" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Pago con Tarjeta / PayPal</span>
                      <div className="h-[1px] flex-1 bg-gray-100" />
                   </div>

                   <button 
                     onClick={() => handleGeneratePaymentLink('mercadopago')}
                     className="w-full bg-[#00B1EA] text-white py-4 rounded-2xl font-black italic uppercase tracking-widest hover:bg-[#009ed2] transition-all flex items-center justify-center gap-4 shadow-lg group"
                   >
                      <div className="h-6 relative w-24 invert brightness-0">
                         <Image src="https://logotyp.us/file/mercadopago.svg" alt="MercadoPago" fill className="object-contain" />
                      </div>
                      <span className="group-hover:translate-x-1 transition-transform">Pagar ahora</span>
                   </button>

                   <button 
                     onClick={() => handleGeneratePaymentLink('paypal')}
                     className="w-full bg-[#0070BA] text-white py-4 rounded-2xl font-black italic uppercase tracking-widest hover:bg-[#005ea6] transition-all flex items-center justify-center gap-4 shadow-lg group"
                   >
                      <div className="h-6 relative w-20 invert brightness-0">
                         <Image src="https://logotyp.us/file/paypal.svg" alt="PayPal" fill className="object-contain" />
                      </div>
                      <span className="group-hover:translate-x-1 transition-transform text-xs">PayPal / Tarjeta</span>
                   </button>

                   <button 
                     onClick={handleWhatsApp}
                     className="w-full mt-2 bg-[#25d366]/10 text-[#25d366] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#25d366] hover:text-white transition shadow-sm"
                   >
                      Dudas por WhatsApp
                   </button>
                </div>
             </div>

             {/* Shipping Promo */}
             <div className="bg-[#8ec63f]/10 p-5 rounded-3xl border border-[#8ec63f]/20 flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-[#8ec63f]" />
                <div className="flex flex-col">
                   <span className="text-xs font-black uppercase italic text-[#8ec63f]">Envío Prioritario</span>
                   <span className="text-[10px] font-bold text-gray-500">Recibe entre 24h a 72h</span>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
         <button className="bg-white text-gray-400 p-4 rounded-full shadow-2xl hover:text-red-600 transition">
            <Heart className="w-6 h-6" />
         </button>
         <a 
           href={`https://wa.me/${settings.whatsapp}`}
           target="_blank"
           className="bg-[#25d366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition"
         >
           <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width={24} height={24} alt="WA" className="invert" />
         </a>
      </div>

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
