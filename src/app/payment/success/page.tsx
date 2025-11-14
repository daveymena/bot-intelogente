'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id') || searchParams.get('token');
    const status = searchParams.get('status');
    const planId = searchParams.get('plan');
    
    setPaymentInfo({
      paymentId,
      status,
      planId,
      collection_status: searchParams.get('collection_status'),
      preference_id: searchParams.get('preference_id'),
    });

    // Activar membresía automáticamente si hay planId
    if (paymentId && planId && !activating) {
      setActivating(true);
      fetch('/api/memberships/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          paymentId,
          paymentMethod: searchParams.get('payment_type') || 'mercadopago',
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Membresía activada:', data);
        })
        .catch(err => {
          console.error('Error activando membresía:', err);
        });
    }
  }, [searchParams, activating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Tu pago ha sido procesado correctamente
          </p>
        </div>

        {paymentInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Detalles del pago:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {paymentInfo.paymentId && (
                <p>
                  <span className="font-medium">ID:</span> {paymentInfo.paymentId}
                </p>
              )}
              {paymentInfo.status && (
                <p>
                  <span className="font-medium">Estado:</span>{' '}
                  <span className="text-green-600 font-semibold">
                    {paymentInfo.status}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-gray-700 mb-4">
            Recibirás un correo de confirmación con los detalles de tu membresía.
          </p>

          <Link
            href="/dashboard"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Ir al Dashboard
          </Link>

          <Link
            href="/membresias"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
          >
            Ver Planes
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Si tienes alguna pregunta, contáctanos
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
