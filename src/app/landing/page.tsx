'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageCircle, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  BarChart3,
  Sparkles,
  Brain
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const handleGetStarted = () => {
    if (email) {
      router.push(`/register?email=${encodeURIComponent(email)}`)
    } else {
      router.push('/register')
    }
  }

  return (
    <div className="min-h-screen bg-white selection:bg-green-100 italic-text">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-emerald-50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      {/* Header Premium */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100 group-hover:rotate-6 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">
              SMART<span className="text-green-600">SALES</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#features" className="hover:text-green-600 transition">Funciones</a>
              <a href="#how-it-works" className="hover:text-green-600 transition">Cómo funciona</a>
              <a href="#pricing" className="hover:text-green-600 transition">Precios</a>
            </nav>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="text-slate-600 hover:text-slate-900 font-bold text-sm"
              >
                Ingresar
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                Pruébalo Gratis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - High Impact */}
      <section className="container mx-auto px-6 pt-24 pb-20 relative">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-8 border border-green-100 animate-bounce-subtle">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">NUEVA GENERACIÓN DE IA VENDEDORA</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter">
            Vende más por WhatsApp con <br />
            <span className="shimmer-text">IA de Élite</span>
          </h1>
          
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            No es un simple bot. Es un asistente de ventas inteligente que 
            clona tu mejor cerrador y atiende a tus clientes 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-16">
            <div className="flex-1 relative group">
              <input
                type="email"
                placeholder="Tu correo corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-green-500 focus:outline-none text-lg shadow-sm group-hover:shadow-md transition-all"
              />
            </div>
            <button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-green-200 transition-all hover:-translate-y-1 active:scale-95"
            >
              EMPEZAR AHORA
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Simular marcas o sellos de confianza */}
             <div className="font-black italic text-2xl tracking-tighter">TRUSTED BY 500+ COMPANIES</div>
          </div>
        </div>
      </section>

      {/* Features - Premium Cards */}
      <section id="features" className="container mx-auto px-6 py-24 bg-slate-50/50 rounded-[4rem]">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Diseñado para Conversiones
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Tecnología punta para negocios que no quieren perder ni una venta
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* Feature 1 */}
          <div className="premium-card p-10 rounded-[2.5rem] bg-white group">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 border border-green-100 group-hover:rotate-6 transition-transform">
              <Brain className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
              Razonamiento Elite
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Nuestra IA no solo responde, razona. Entiende objeciones y utiliza técnicas de venta persuasiva.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Memoria contextual 24h
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Manejo de objeciones
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Pagos Automáticos
            </h3>
            <p className="text-gray-600 mb-4">
              Genera links de pago dinámicos y procesa transacciones sin intervención.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>MercadoPago & PayPal</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Nequi & Daviplata</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Links instantáneos</span>
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Analytics Avanzados
            </h3>
            <p className="text-gray-600 mb-4">
              Métricas en tiempo real para optimizar tus ventas y conversiones.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Dashboard en tiempo real</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Reportes detallados</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Insights de IA</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Empieza en 3 simples pasos
            </h2>
            <p className="text-xl text-green-100">
              Configura tu bot en menos de 5 minutos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Conecta WhatsApp</h3>
              <p className="text-green-100">
                Escanea el código QR y vincula tu cuenta en segundos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Agrega Productos</h3>
              <p className="text-green-100">
                Importa tu catálogo o agrega productos uno por uno
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Empieza a Vender!</h3>
              <p className="text-green-100">
                El bot responde automáticamente y procesa ventas 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Empresas que confían en nosotros
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "Increíble cómo el bot entiende a mis clientes. Mis ventas aumentaron 3x en el primer mes."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">María González</div>
                <div className="text-sm text-gray-500">Tienda Online</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "El razonamiento profundo es impresionante. Responde como si fuera yo mismo."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Carlos Ruiz</div>
                <div className="text-sm text-gray-500">Emprendedor</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "Ahorro 10 horas semanales. El bot maneja todo mientras yo me enfoco en crecer."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Ana Martínez</div>
                <div className="text-sm text-gray-500">E-commerce</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para automatizar tus ventas?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a cientos de empresas que ya están vendiendo más con IA
          </p>
          
          <button
            onClick={() => router.push('/register')}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            Empezar Gratis Ahora
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="text-gray-400 mt-6">
            7 días gratis • Sin tarjeta • Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-white font-semibold">Smart Sales Bot Pro</span>
            </div>
            <div className="text-sm">
              © 2025 Smart Sales Bot Pro. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
