import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula el tiempo de "escribiendo" basado en la longitud del mensaje
 * Mínimo 1 segundo, máximo 3 segundos
 */
export function calculateTypingDelay(responseLength: number): number {
  const baseDelay = 1000 // 1 segundo mínimo
  const charDelay = 10 // 10ms por caracter
  const calculated = baseDelay + Math.min(responseLength * charDelay, 2000)
  return Math.min(calculated, 3000) // Máximo 3 segundos
}

/**
 * Espera simulando que el bot está escribiendo
 */
export async function simulateTyping(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs))
}
