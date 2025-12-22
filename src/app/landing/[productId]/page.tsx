import { notFound } from 'next/navigation';
import { Check, Clock, Star, Shield } from 'lucide-react';
import { prisma } from '@/lib/db';
import PaymentButtons from './PaymentButtons';

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

interface LandingContent {
  headline: string;
  subheadline: string;
  benefits: string[];
  cta: string;
  urgency: string;
  testimonial: string | null;
}

export default async function LandingPage({ params }: PageProps) {
  const { productId } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      user: true
    }
  });

  if (!product) {
    notFound();
  }

  let content: LandingContent;
  try {
    content = product.landingPageContent 
      ? JSON.parse(product.landingPageContent)
      : null;
  } catch {
    content = null as any;
  }

  // Contenido por defecto si no hay landing page generada
  if (!content) {
    content = {
      headline: product.name,
      subheadline: product.description || 'Producto de alta calidad',
      benefits: [
        'Producto de alta calidad',
        'Entrega rápida y segura',
        'Garantía de satisfacción'
      ],
      cta: '¡Compra Ahora!',
      urgency: '¡Oferta especial!',
      testimonial: null
    };
  }

  // Parsear imágenes correctamente
  let images: string[] = [];
  try {
    if (typeof product.images === 'string') {
      images = JSON.parse(product.images);
    } else if (Array.isArray(product.images)) {
      images = product.images;
    }
  } catch {
    images = [];
  }
  
  const mainImage = images.length > 0 ? images[0] : '/placeholder-product.jpg';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar Simple */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Tecnovariedades D&S</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">📞 +57 313 617 4267</span>
            </div>
          </div>
        </div>
      </div>

      {/* Producto Principal - Layout Tipo Tienda */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
        
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Galería de Imágenes - IZQUIERDA */}
            <div className="space-y-4">
              {/* Imagen Principal */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex items-center justify-center min-h-[500px]">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-auto object-contain max-h-[450px]"
                />
              </div>
              
              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 cursor-pointer transition-colors">
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-auto object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información del Producto - DERECHA */}
            <div className="space-y-6">
              {/* Breadcrumb */}
              <div className="text-sm text-gray-500">
                <span>Inicio</span> / <span>{product.category}</span> / <span className="text-gray-900">{product.name}</span>
              </div>

              {/* Título */}
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating y Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(1,234 valoraciones)</span>
                <span className="text-sm text-green-600 font-semibold">✓ En stock</span>
              </div>

              {/* Precio */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-black text-gray-900">
                    ${product.price.toLocaleString('es-CO')}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ${(product.price * 1.5).toLocaleString('es-CO')}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -33%
                  </span>
                </div>
                <p className="text-sm text-gray-600">IVA incluido • Envío gratis</p>
              </div>

              {/* Descripción Corta */}
              <div className="prose prose-sm">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || content.subheadline}
                </p>
              </div>

              {/* Botones de Compra */}
              <div className="space-y-3">
                <PaymentButtons 
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  paymentLinkPayPal={product.paymentLinkPayPal}
                  paymentLinkMercadoPago={product.paymentLinkMercadoPago}
                />
              </div>

              {/* Garantías */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">Compra Segura</p>
                </div>
                <div className="text-center">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">Garantía</p>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">Envío Rápido</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lo que obtendrás - Diseño Premium */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Título */}
          <div className="text-center mb-20">
            <span className="inline-block bg-purple-100 text-purple-700 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
              ¿Por qué elegirnos?
            </span>
            <h2 className="text-6xl font-black text-gray-900 mb-6">
              Lo que obtendrás
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Beneficios exclusivos que transformarán tu experiencia
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {content.benefits.map((benefit: string, index: number) => {
              const colors = [
                { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-200' },
                { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-50', border: 'border-purple-200' },
                { from: 'from-orange-500', to: 'to-red-500', bg: 'bg-orange-50', border: 'border-orange-200' }
              ];
              const color = colors[index % 3];
              
              return (
                <div 
                  key={index} 
                  className={`group relative ${color.bg} rounded-3xl p-10 border-2 ${color.border} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3`}
                >
                  {/* Icono grande */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${color.from} ${color.to} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                    <Check className="w-10 h-10 text-white stroke-[3]" />
                  </div>
                  
                  {/* Contenido */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {benefit}
                  </h3>
                  
                  {/* Línea decorativa */}
                  <div className={`w-16 h-1 bg-gradient-to-r ${color.from} ${color.to} rounded-full mb-4`}></div>
                  
                  {/* Descripción adicional */}
                  <p className="text-gray-600 leading-relaxed">
                    Diseñado para brindarte la mejor experiencia posible
                  </p>
                  
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonios Reales - Múltiples */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Título */}
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-wider">
              Testimonios
            </span>
            <h2 className="text-5xl font-black text-gray-900 mt-4 mb-6">
              Lo que dicen nuestros clientes
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full"></div>
          </div>

          {/* Grid de Testimonios con Fotos Reales */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonio 1 - Mujer profesional */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed italic">
                "Excelente producto, superó mis expectativas. La entrega fue rápida y el soporte increíble."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" 
                  alt="María C."
                  className="w-16 h-16 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                />
                <div>
                  <p className="font-bold text-gray-900 text-lg">María C.</p>
                  <p className="text-sm text-gray-500">Cliente verificado ✓</p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 - Hombre profesional */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed italic">
                "Muy recomendado. Calidad excepcional y precio justo. Volveré a comprar sin dudarlo."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" 
                  alt="Juan R."
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                />
                <div>
                  <p className="font-bold text-gray-900 text-lg">Juan R.</p>
                  <p className="text-sm text-gray-500">Cliente verificado ✓</p>
                </div>
              </div>
            </div>

            {/* Testimonio 3 - Mujer joven */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed italic">
                "Increíble experiencia de compra. Todo llegó perfecto y el producto es tal como se describe."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces" 
                  alt="Ana L."
                  className="w-16 h-16 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                />
                <div>
                  <p className="font-bold text-gray-900 text-lg">Ana L.</p>
                  <p className="text-sm text-gray-500">Cliente verificado ✓</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-black text-purple-600 mb-2">1000+</p>
              <p className="text-gray-600">Clientes Felices</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-green-600 mb-2">4.9/5</p>
              <p className="text-gray-600">Calificación</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-blue-600 mb-2">98%</p>
              <p className="text-gray-600">Recomiendan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Garantías - Diseño Moderno */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Compra 100% Segura</h3>
              <p className="text-gray-600 leading-relaxed">
                Transacciones protegidas con encriptación de nivel bancario
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Garantía de Satisfacción</h3>
              <p className="text-gray-600 leading-relaxed">
                Productos verificados y de la más alta calidad
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Entrega Inmediata</h3>
              <p className="text-gray-600 leading-relaxed">
                Acceso instantáneo después de confirmar tu compra
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final - Super Llamativo */}
      <div className="relative py-24 overflow-hidden">
        {/* Fondo animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMCAxLjEwNS0uODk1IDItMiAycy0yLS44OTUtMi0yIC44OTUtMiAyLTIgMiAuODk1IDIgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 text-center z-10">
          {/* Badge urgencia */}
          <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full font-bold mb-8 animate-pulse shadow-2xl">
            <Clock className="w-5 h-5" />
            <span>¡ÚLTIMA OPORTUNIDAD!</span>
          </div>
          
          {/* Título */}
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            ¿Listo para transformar tu vida?
          </h2>
          
          {/* Subtítulo */}
          <p className="text-2xl text-white/90 mb-4">
            Únete a más de <span className="font-bold text-yellow-300">1,000+ clientes satisfechos</span>
          </p>
          <p className="text-xl text-white/80 mb-12">
            No dejes pasar esta oportunidad única
          </p>
          
          {/* Precio destacado */}
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 mb-8 max-w-md mx-auto">
            <p className="text-white/80 mb-2">Precio de hoy:</p>
            <p className="text-6xl font-black text-white mb-2">
              ${product.price.toLocaleString('es-CO')}
            </p>
            <p className="text-white/70">En lugar de ${(product.price * 2).toLocaleString('es-CO')}</p>
          </div>
          
          {/* Botones de Pago Finales */}
          <div className="max-w-2xl mx-auto">
            <PaymentButtons 
              productId={product.id}
              productName={product.name}
              price={product.price}
              paymentLinkPayPal={product.paymentLinkPayPal}
              paymentLinkMercadoPago={product.paymentLinkMercadoPago}
            />
          </div>
          
          {/* Garantías rápidas */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/90">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Acceso Inmediato</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Pago Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Moderno */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Columna 1 */}
            <div>
              <h3 className="font-bold text-xl mb-4">Tecnovariedades D&S</h3>
              <p className="text-gray-400 leading-relaxed">
                Tu tienda de confianza para productos digitales y físicos de la más alta calidad.
              </p>
            </div>
            
            {/* Columna 2 */}
            <div>
              <h3 className="font-bold text-xl mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-400">
                <p>📱 WhatsApp: +57 313 617 4267</p>
                <p>📧 Email: deinermen25@gmail.com</p>
                <p>📍 Cali, Colombia</p>
              </div>
            </div>
            
            {/* Columna 3 */}
            <div>
              <h3 className="font-bold text-xl mb-4">Garantías</h3>
              <div className="space-y-2 text-gray-400">
                <p>✓ Compra 100% Segura</p>
                <p>✓ Entrega Inmediata</p>
                <p>✓ Soporte Incluido</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Tecnovariedades D&S - Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
