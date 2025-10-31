'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago Cancelado
          </h1>
          <p className="text-gray-600">
            Tu pago no pudo ser procesado
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">
            {status === 'rejected' 
              ? 'El pago fue rechazado. Por favor, verifica tus datos e intenta nuevamente.'
              : 'El pago fue cancelado. No se realizó ningún cargo.'}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/membresias"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Intentar Nuevamente
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
          >
            Volver al Inicio
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">¿Necesitas ayuda?</p>
          <p className="text-indigo-600 font-medium">Contáctanos por WhatsApp</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
