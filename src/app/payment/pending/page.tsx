'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago Pendiente
          </h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado
          </p>
        </div>

        {paymentId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">ID de pago:</span> {paymentId}
            </p>
            <p className="text-sm text-yellow-800">
              Estamos esperando la confirmación del pago. Esto puede tomar unos minutos.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-gray-700 mb-4">
            Te notificaremos por correo cuando el pago sea confirmado.
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
          Si tienes dudas, contáctanos
        </p>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
