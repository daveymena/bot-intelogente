'use client';

import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface WhatsAppButtonProps {
  productName: string;
  message: string;
  className?: string;
  children: ReactNode;
}

export default function WhatsAppButton({ 
  productName, 
  message, 
  className, 
  children 
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const whatsappNumber = '573136174267';
    const fullMessage = `${message} ${productName}`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullMessage)}`, 
      '_blank'
    );
  };

  return (
    <Button 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
