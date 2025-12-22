/**
 * Tipos del sistema limpio
 */

export interface UserContext {
  productId?: string | null;
  productName?: string | null;
  lastIntent?: string | null;
  lastMessage?: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  category: string;
  stock?: number | null;
  images?: string | null;
}

export interface DetectedIntent {
  intent: 'producto' | 'precio' | 'disponibilidad' | 'pago' | 'saludo' | 'despedida' | 'otro';
  productMentioned?: string | null;
  confidence: number;
}

export interface BotResponse {
  text: string;
  productId?: string;
}
