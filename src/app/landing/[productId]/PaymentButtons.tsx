'use client';

import { Button } from '@/components/ui/button';
import { CreditCard, MessageCircle } from 'lucide-react';

interface PaymentButtonsProps {
  productId: string;
  productName: string;
  price: number;
  paymentLinkPayPal?: string | null;
  paymentLinkMercadoPago?: string | null;
}

export default function PaymentButtons({ 
  productId,
  productName, 
  price,
  paymentLinkPayPal,
  paymentLinkMercadoPago
}: PaymentButtonsProps) {
  
  const handleWhatsApp = () => {
    const whatsappNumber = '573136174267';
    const message = `Hola! Quiero comprar: ${productName} - Precio: $${price.toLocaleString('es-CO')} COP`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, 
      '_blank'
    );
  };

  const handlePayPal = () => {
    if (paymentLinkPayPal) {
      window.open(paymentLinkPayPal, '_blank');
    } else {
      // Fallback a WhatsApp si no hay link de PayPal
      handleWhatsApp();
    }
  };

  const handleMercadoPago = () => {
    if (paymentLinkMercadoPago) {
      window.open(paymentLinkMercadoPago, '_blank');
    } else {
      // Fallback a WhatsApp si no hay link de MercadoPago
      handleWhatsApp();
    }
  };

  return (
    <div className="space-y-4">
      {/* Título */}
      <p className="text-center text-white/90 font-semibold text-lg">
        Elige tu método de pago:
      </p>

      {/* Botones de Pago */}
      <div className="grid gap-4">
        {/* PayPal */}
        {paymentLinkPayPal && (
          <Button 
            onClick={handlePayPal}
            className="w-full py-6 text-xl font-bold bg-[#0070ba] hover:bg-[#005ea6] text-white shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 rounded-xl"
          >
            <CreditCard className="w-6 h-6 mr-3" />
            Pagar con PayPal
          </Button>
        )}

        {/* MercadoPago */}
        {paymentLinkMercadoPago && (
          <Button 
            onClick={handleMercadoPago}
            className="w-full py-6 text-xl font-bold bg-[#00b1ea] hover:bg-[#009dd1] text-white shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 rounded-xl"
          >
            <CreditCard className="w-6 h-6 mr-3" />
            Pagar con MercadoPago
          </Button>
        )}

        {/* WhatsApp - Siempre disponible */}
        <Button 
          onClick={handleWhatsApp}
          className="w-full py-6 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-105 rounded-xl"
        >
          <MessageCircle className="w-6 h-6 mr-3" />
          Comprar por WhatsApp
        </Button>
      </div>

      {/* Nota de seguridad */}
      <p className="text-center text-white/70 text-sm">
        🔒 Todas las transacciones son 100% seguras
      </p>
    </div>
  );
}
