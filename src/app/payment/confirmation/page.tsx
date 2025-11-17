'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Download, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentConfirmationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado');
      setIsLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch('/api/notifications/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setIsValid(true);
        setPaymentData(data.token.payment);
      } else {
        setError(data.error || 'Token inválido');
      }
    } catch (err) {
      setError('Error al validar token');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Validando confirmación...</p>
        </div>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">
              <XCircle className="h-12 w-12 mx-auto mb-2" />
              Enlace Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error || 'El enlace no es válido o ha expirado'}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Recibido!</h1>
          <p className="text-gray-600">Tu pago ha sido procesado exitosamente</p>
        </div>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalles de la Transacción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Producto</p>
                <p className="font-semibold">{paymentData?.productName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monto</p>
                <p className="font-semibold text-green-600">
                  {paymentData?.amount?.toLocaleString()} {paymentData?.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID de Transacción</p>
                <p className="font-mono text-sm">{paymentData?.transactionId || paymentData?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="text-sm">
                  {paymentData?.paidAt 
                    ? new Date(paymentData.paidAt).toLocaleString('es-ES')
                    : new Date().toLocaleString('es-ES')
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Método de Pago</p>
                <p className="capitalize">{paymentData?.method || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {paymentData?.status || 'COMPLETED'}
                </span>
              </div>
            </div>

            {paymentData?.customerName && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-semibold">{paymentData.customerName}</p>
                {paymentData.customerEmail && (
                  <p className="text-sm text-gray-600">{paymentData.customerEmail}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {paymentData?.invoiceUrl && (
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Descargar Factura
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Receipt className="h-4 w-4" />
            Imprimir Recibo
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Gracias por tu compra</p>
          <p className="mt-2">Si tienes alguna pregunta, contáctanos</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PaymentConfirmationContent />
    </Suspense>
  );
}
