/**
 * Agente de Preguntas Generales
 * Maneja preguntas que NO son sobre productos usando IA
 */

import { BaseAgent, AgentResponse } from './base-agent';
import { SharedMemory } from './shared-memory';

export class GeneralQAAgent extends BaseAgent {
  constructor() {
    super('GeneralQAAgent');
  }
  
  /**
   * Ejecuta el agente
   */
  async execute(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('🤔 Manejando pregunta general con IA');
    
    // Siempre usar IA para preguntas generales
    return this.handleWithAI(message, memory);
  }
  
  /**
   * Determina si puede manejar localmente (nunca)
   */
  canHandleLocally(message: string, memory: SharedMemory): boolean {
    return false; // Siempre usar IA para preguntas generales
  }
  
  /**
   * Maneja localmente (no implementado)
   */
  async handleLocally(message: string, memory: SharedMemory): Promise<AgentResponse> {
    // No se usa, pero debe implementarse
    return this.handleWithAI(message, memory);
  }
  
  /**
   * Maneja con IA
   */
  async handleWithAI(message: string, memory: SharedMemory): Promise<AgentResponse> {
    this.log('Usando IA para responder pregunta general');
    
    try {
      const { AIMultiProvider } = await import('@/lib/ai-multi-provider');
      
      // Construir contexto
      const context = this.buildContext(memory);
      
      // Prompt especializado para preguntas generales
      const systemPrompt = `Eres un asistente de ventas de Tecnovariedades D&S.

Tu rol es responder preguntas generales del cliente de forma amigable y profesional.

REGLAS IMPORTANTES:
1. Si la pregunta es sobre productos que NO vendes, di que no los tienes pero ofrece alternativas
2. Si la pregunta es sobre servicios, explica qué servicios ofreces
3. Si la pregunta es sobre horarios, ubicación, contacto, proporciona la información
4. Si no sabes algo, sé honesto y ofrece contactar al equipo
5. Mantén respuestas cortas (máximo 3-4 líneas)
6. Siempre menciona "Tecnovariedades D&S" al menos una vez
7. Termina preguntando si necesita algo más

INFORMACIÓN DE LA EMPRESA:
- Nombre: Tecnovariedades D&S
- Productos: Computadores, laptops, motos, cursos digitales, megapacks educativos
- Servicios: Reparación de computadores, mantenimiento, asesoría técnica
- Métodos de pago: MercadoPago, PayPal, Nequi, Daviplata, Contraentrega
- Envíos: A toda Colombia
- Contacto: WhatsApp +57 304 274 8687

${context}`;

      const userPrompt = `Pregunta del cliente: "${message}"

Responde de forma amigable y profesional.`;

      const response = await AIMultiProvider.generateResponse(
        systemPrompt,
        userPrompt,
        {
          temperature: 0.7,
          maxTokens: 200,
        }
      );
      
      return {
        text: response,
        nextAgent: 'search',
        confidence: 0.8,
      };
      
    } catch (error) {
      this.log('Error usando IA:', error);
      
      // Fallback si la IA falla
      return {
        text: `Disculpa, no entendí bien tu pregunta 😅

¿Podrías reformularla o decirme qué producto o servicio te interesa?

En Tecnovariedades D&S tenemos:
• Computadores y laptops
• Motos
• Cursos digitales
• Servicios técnicos

¿Qué necesitas? 😊`,
        nextAgent: 'search',
        confidence: 0.5,
      };
    }
  }
  
  /**
   * Construye contexto de la conversación
   */
  private buildContext(memory: SharedMemory): string {
    let context = '';
    
    if (memory.currentProduct) {
      context += `\nProducto actual en conversación: ${memory.currentProduct.name}`;
    }
    
    if (memory.interestedProducts.length > 0) {
      context += `\nProductos que ha visto: ${memory.interestedProducts.map(p => p.name).join(', ')}`;
    }
    
    if (memory.lastQuery) {
      context += `\nÚltima búsqueda: ${memory.lastQuery}`;
    }
    
    return context;
  }
}
