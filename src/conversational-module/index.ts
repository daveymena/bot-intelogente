/**
 * Módulo Conversacional Smart Sales Bot Pro
 * Punto de entrada principal
 */

export { 
  procesarMensaje, 
  obtenerEstadisticas, 
  reiniciarEstadisticas 
} from './ai/conversacionController';

export { detectarIntencion, extraerEntidades } from './utils/detectarIntencion';
export { obtenerContexto, actualizarContexto, limpiarContexto } from './utils/obtenerContexto';
export { sendWithFallback } from './ai/groqClient';
export { tryLocalResponse, LocalResponseStats } from './utils/localResponseHandler';

// Servicios integrados
export { generarLinksPago, formatearLinksPago, generarLinkMercadoPago } from './services/paymentService';
export { obtenerFotosProducto, detectarSolicitudFotos, tienefotos } from './services/photoService';
export { procesarAudio, transcribirAudio } from './services/audioService';
export { 
  analizarConRazonamientoProfundo, 
  necesitaRazonamientoProfundo,
  generarRespuestaAmigable 
} from './services/deepReasoningService';

export type { Intencion, ResultadoIntencion } from './utils/detectarIntencion';
export type { ContextoConversacion } from './utils/obtenerContexto';
export type { ProductoInfo, InfoNegocio } from './ai/promptBuilder';
export type { GroqMessage, GroqResponse } from './ai/groqClient';
export type { LocalResponse } from './utils/localResponseHandler';
export type { PaymentLink } from './services/paymentService';
export type { ProductPhoto } from './services/photoService';
export type { ReasoningResult } from './services/deepReasoningService';
