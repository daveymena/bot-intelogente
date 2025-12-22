'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Simular procesamiento del pago
    const timer = setTimeout(() => {
      setProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Procesando tu pago...</h2>
            <p className="text-gray-600">
              Estamos confirmando tu suscripción. Esto puede tomar unos segundos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">¡Pago Exitoso!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-center text-gray-700 mb-4">
              Tu suscripción ha sido activada exitosamente.
            </p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="font-semibold text-green-600">Activa</span>
              </div>
              <div className="flex justify-between">
                <span>Duración:</span>
                <span className="font-semibold">30 días</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📧 Recibirás un email de confirmación con los detalles de tu suscripción.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push('/')}
              className="w-full"
              size="lg"
            >
              Ir al Dashboard
            </Button>
            
            <Button
              onClick={() => router.push('/pricing')}
              variant="outline"
              className="w-full"
            >
              Ver Planes
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            ¿Tienes preguntas? Contáctanos en soporte@tecnovariedades.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
