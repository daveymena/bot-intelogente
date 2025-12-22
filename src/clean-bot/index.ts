/**
 * Punto de entrada del bot limpio
 * Exporta la función principal
 */

export { handleMessage } from './controllers/message-handler';
export type { BotResponse, UserContext, Product, DetectedIntent } from './types';
