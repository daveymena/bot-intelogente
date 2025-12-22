/**
 * Exportaciones del Sistema de Agentes
 */

// Agentes
export { Orchestrator } from './orchestrator';
export { GreetingAgent } from './greeting-agent';
export { SearchAgent } from './search-agent';
export { ProductAgent } from './product-agent';
export { PaymentAgent } from './payment-agent';
export { PhotoAgent } from './photo-agent';
export { ClosingAgent } from './closing-agent';

// Base
export { BaseAgent } from './base-agent';
export type { AgentResponse, AgentAction } from './base-agent';

// Memoria
export { SharedMemoryService } from './shared-memory';
export type { SharedMemory, Product, Message, SalesStage } from './shared-memory';

// Utilidades
export { IntentDetector } from './utils/intent-detector';
export type { Intent, IntentResult } from './utils/intent-detector';
