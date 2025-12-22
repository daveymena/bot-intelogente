'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function SubscriptionFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Pago Cancelado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-center text-gray-700 mb-4">
              Tu pago no pudo ser procesado o fue cancelado.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Posibles razones:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                <li>Cancelaste el pago</li>
                <li>Fondos insuficientes</li>
                <li>Problema con el método de pago</li>
                <li>Error de conexión</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de Nuevo
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>Consejo:</strong> Verifica que tu método de pago esté activo y tenga fondos suficientes.
            </p>
          </div>

          <p className="text-xs text-center text-gray-500">
            ¿Necesitas ayuda? Contáctanos en soporte@tecnovariedades.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
