'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const planes = [
  {
    id: 'trial',
    nombre: 'Prueba Gratuita',
    precio: 0,
    duracion: '10 días',
    descripcion: 'Se activa automáticamente al registrarte',
    caracteristicas: [
      '✅ Activación automática al verificar email',
      '10 días de acceso completo',
      'Todas las funciones incluidas',
      'Sin tarjeta de crédito',
      'Soporte por email',
      'Catálogo ilimitado',
      'IA para respuestas automáticas'
    ],
    isTrial: true,
    badge: '🎁 AUTOMÁTICO'
  },
  {
    id: 'monthly',
    nombre: 'Plan Mensual',
    precio: 30000,
    duracion: 'mes',
    descripcion: 'Perfecto para empezar',
    caracteristicas: [
      'Mensajes WhatsApp ilimitados',
      'Catálogo de productos ilimitado',
      'IA avanzada para respuestas',
      'Dashboard completo',
      'Soporte prioritario',
      'Actualizaciones automáticas',
      'Sin permanencia'
    ],
    badge: '💼 POPULAR'
  },
  {
    id: 'quarterly',
    nombre: 'Plan Trimestral',
    precio: 80000,
    precioMensual: 26667,
    duracion: '3 meses',
    ahorro: 10000,
    descripcion: 'Ahorra $10,000',
    caracteristicas: [
      'Todo del plan mensual',
      'Ahorro de $10,000',
      'Facturación trimestral',
      'Soporte prioritario 24/7',
      'Reportes avanzados',
      'Acceso anticipado a nuevas funciones'
    ],
    popular: true,
    badge: '⭐ AHORRA 11%'
  },
  {
    id: 'annual',
    nombre: 'Plan Anual',
    precio: 240000,
    precioMensual: 20000,
    duracion: 'año',
    ahorro: 120000,
    descripcion: 'Máximo ahorro',
    caracteristicas: [
      'Todo del plan trimestral',
      'Ahorra $120,000 al año',
      'Solo $20,000/mes',
      'Soporte VIP 24/7',
      'Consultoría personalizada',
      'Configuración incluida',
      'Capacitación del equipo',
      '2 meses GRATIS'
    ],
    badge: '🔥 AHORRA 33%'
  }
];

export default function MembresiasPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleActivarPrueba = async (planId: string) => {
    setLoading(planId);
    setError('');

    try {
      const response = await fetch('/api/memberships/activate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al activar prueba');
      }

      // Redirigir al dashboard
      router.push('/dashboard?trial=activated');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al activar la prueba');
      setLoading(null);
    }
  };

  const handlePagar = async (planId: string, metodo: 'mercadopago' | 'paypal') => {
    setLoading(planId);
    setError('');

    try {
      const plan = planes.find(p => p.id === planId);
      if (!plan) throw new Error('Plan no encontrado');

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            title: `${plan.nombre} - ${plan.duracion}`,
            description: plan.descripcion,
            quantity: 1,
            unit_price: plan.precio,
            currency_id: 'COP'
          }],
          paymentMethod: metodo,
          metadata: {
            type: 'membership',
            planId: plan.id,
            duration: plan.duracion
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      // Redirigir al checkout
      if (data.init_point || data.approvalUrl) {
        window.location.href = data.init_point || data.approvalUrl;
      } else {
        throw new Error('No se recibió URL de pago');
      }

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al procesar el pago');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige tu Plan de Membresía
          </h1>
          <p className="text-xl text-gray-600">
            Selecciona el plan que mejor se adapte a tu negocio
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition hover:scale-105 ${
                plan.popular ? 'ring-4 ring-indigo-500 scale-105' : ''
              } ${plan.isTrial ? 'ring-2 ring-green-400' : ''}`}
            >
              {(plan.badge) && (
                <div className={`text-white text-center py-2 font-semibold text-sm ${
                  plan.popular ? 'bg-indigo-500' : 
                  plan.isTrial ? 'bg-green-500' : 
                  'bg-orange-500'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{plan.descripcion}</p>

                <div className="mb-6">
                  {plan.precio === 0 ? (
                    <div>
                      <span className="text-4xl font-bold text-green-600">GRATIS</span>
                      <p className="text-sm text-gray-600 mt-1">{plan.duracion}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        ${(plan.precio / 1000).toFixed(0)}k
                      </span>
                      <span className="text-gray-600">/{plan.duracion}</span>
                      {plan.precioMensual && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          ${(plan.precioMensual / 1000).toFixed(0)}k/mes
                        </p>
                      )}
                      {plan.ahorro && (
                        <p className="text-xs text-orange-600 font-semibold">
                          Ahorras ${(plan.ahorro / 1000).toFixed(0)}k
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.caracteristicas.map((caracteristica, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{caracteristica}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  {plan.isTrial ? (
                    <button
                      onClick={() => handleActivarPrueba(plan.id)}
                      disabled={loading === plan.id}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading === plan.id ? 'Activando...' : '🎁 Activar Prueba Gratis'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePagar(plan.id, 'mercadopago')}
                        disabled={loading === plan.id}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loading === plan.id ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Procesando...
                          </span>
                        ) : (
                          '💳 Mercado Pago'
                        )}
                      </button>

                      <button
                        onClick={() => handlePagar(plan.id, 'paypal')}
                        disabled={loading === plan.id}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loading === plan.id ? 'Procesando...' : '🌐 PayPal'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">🔒 Pagos 100% seguros</p>
          <p className="text-sm">Puedes cancelar tu suscripción en cualquier momento</p>
        </div>
      </div>
    </div>
  );
}
