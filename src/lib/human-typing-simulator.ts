/**
 * Simulador de Escritura Humana
 * Simula comportamiento humano al escribir para evitar detección de bots
 */

export class HumanTypingSimulator {
  /**
   * Calcula el tiempo de espera antes de responder (retraso humano)
   * Basado en la longitud del mensaje y variabilidad natural
   * ⚡ OPTIMIZADO: Más rápido pero aún natural
   */
  static calculateResponseDelay(messageLength: number): number {
    // Tiempo base de lectura: 1-2 segundos (reducido)
    const baseReadingTime = 1000 + Math.random() * 1000;
    
    // Tiempo de "pensamiento": 0.5-1.5 segundos (reducido)
    const thinkingTime = 500 + Math.random() * 1000;
    
    // Tiempo adicional por longitud del mensaje (simula lectura)
    // ~20ms por carácter (lectura rápida)
    const readingTime = messageLength * (10 + Math.random() * 20);
    
    // Total: 1.5-4.5 segundos + tiempo de lectura
    const totalDelay = baseReadingTime + thinkingTime + readingTime;
    
    // Limitar entre 1.5 y 6 segundos (reducido de 3-15)
    return Math.min(Math.max(totalDelay, 1500), 6000);
  }
  
  /**
   * Calcula el tiempo de "escritura" basado en la longitud de la respuesta
   * Simula velocidad de escritura humana variable
   * ⚡ OPTIMIZADO: Más rápido (escritura rápida pero natural)
   */
  static calculateTypingTime(responseLength: number): number {
    // Velocidad de escritura rápida: 60-100 palabras por minuto
    // Aproximadamente 300-500 caracteres por minuto
    // O 5-8.3 caracteres por segundo
    
    // Usar velocidad rápida: ~8 caracteres por segundo
    const charsPerSecond = 7 + Math.random() * 2; // 7-9 chars/seg (más rápido)
    const baseTypingTime = (responseLength / charsPerSecond) * 1000;
    
    // Agregar pausas naturales más cortas
    const pauseCount = (responseLength / 80); // Pausa cada ~80 caracteres (menos pausas)
    const pauseTime = pauseCount * (200 + Math.random() * 400); // 200-600ms por pausa (más cortas)
    
    const totalTypingTime = baseTypingTime + pauseTime;
    
    // Limitar entre 1 y 15 segundos (optimizado para respuesta rápida)
    return Math.min(Math.max(totalTypingTime, 1000), 15000);
  }
  
  /**
   * Envía el indicador de "escribiendo..." por un tiempo realista
   */
  static async simulateTyping(
    sock: any,
    chatId: string,
    responseLength: number
  ): Promise<void> {
    try {
      const typingTime = this.calculateTypingTime(responseLength);
      
      // Enviar estado "escribiendo"
      await sock.sendPresenceUpdate('composing', chatId);
      
      // Simular escritura con pausas naturales
      const pauseInterval = 3000 + Math.random() * 2000; // Pausas cada 3-5 seg
      const pauseCount = Math.floor(typingTime / pauseInterval);
      
      for (let i = 0; i < pauseCount; i++) {
        await this.sleep(pauseInterval);
        
        // Ocasionalmente "dejar de escribir" brevemente (más natural)
        if (Math.random() < 0.3) { // 30% de probabilidad
          await sock.sendPresenceUpdate('paused', chatId);
          await this.sleep(500 + Math.random() * 1000); // Pausa 0.5-1.5 seg
          await sock.sendPresenceUpdate('composing', chatId);
        }
      }
      
      // Tiempo restante
      const remainingTime = typingTime - (pauseCount * pauseInterval);
      if (remainingTime > 0) {
        await this.sleep(remainingTime);
      }
      
      // Volver a estado "disponible"
      await sock.sendPresenceUpdate('available', chatId);
      
    } catch (error) {
      console.error('[HumanTyping] Error simulando escritura:', error);
      // Continuar sin simular si hay error
    }
  }
  
  /**
   * Proceso completo: esperar + simular escritura + enviar
   */
  static async humanizedSend(
    sock: any,
    chatId: string,
    message: string,
    userMessageLength: number
  ): Promise<void> {
    try {
      console.log(`[HumanTyping] 🎭 INICIANDO SIMULACIÓN HUMANA`);
      console.log(`[HumanTyping] Chat: ${chatId}`);
      console.log(`[HumanTyping] Mensaje: ${message.substring(0, 50)}...`);
      
      // 1. Retraso inicial FORZADO (lectura + pensamiento) - OPTIMIZADO
      const responseDelay = Math.max(2000, this.calculateResponseDelay(userMessageLength));
      console.log(`[HumanTyping] ⏳ Esperando ${(responseDelay / 1000).toFixed(1)}s antes de responder...`);
      await this.sleep(responseDelay);
      
      // 2. FORZAR estado "escribiendo..."
      console.log(`[HumanTyping] ⌨️ FORZANDO indicador "escribiendo..."`);
      try {
        await sock.sendPresenceUpdate('composing', chatId);
        console.log(`[HumanTyping] ✅ Indicador "escribiendo..." enviado`);
      } catch (e) {
        console.error(`[HumanTyping] ❌ Error enviando presencia:`, e);
      }
      
      // 3. Simular escritura (tiempo fijo mínimo) - OPTIMIZADO
      const typingTime = Math.max(3000, this.calculateTypingTime(message.length));
      console.log(`[HumanTyping] ⌨️ Simulando escritura por ${(typingTime / 1000).toFixed(1)}s...`);
      await this.sleep(typingTime);
      
      // 4. Volver a disponible
      try {
        await sock.sendPresenceUpdate('available', chatId);
        console.log(`[HumanTyping] ✅ Estado cambiado a "disponible"`);
      } catch (e) {
        console.error(`[HumanTyping] ❌ Error cambiando presencia:`, e);
      }
      
      // 5. Enviar mensaje
      console.log(`[HumanTyping] 📤 Enviando mensaje...`);
      await sock.sendMessage(chatId, { text: message });
      console.log(`[HumanTyping] ✅ Mensaje enviado exitosamente`);
      
    } catch (error) {
      console.error('[HumanTyping] ❌ Error en envío humanizado:', error);
      // Fallback: enviar directamente
      console.log('[HumanTyping] 🔄 Usando fallback directo');
      await sock.sendMessage(chatId, { text: message });
    }
  }
  
  /**
   * Versión simplificada para mensajes cortos (saludos, confirmaciones)
   */
  static async quickHumanizedSend(
    sock: any,
    chatId: string,
    message: string
  ): Promise<void> {
    try {
      console.log(`[HumanTyping] 🚀 ENVÍO RÁPIDO INICIADO`);
      
      // Retraso corto FORZADO: 2-4 segundos
      const quickDelay = 2000 + Math.random() * 2000;
      console.log(`[HumanTyping] ⏳ Esperando ${(quickDelay / 1000).toFixed(1)}s...`);
      await this.sleep(quickDelay);
      
      // FORZAR escritura rápida
      console.log(`[HumanTyping] ⌨️ Mostrando "escribiendo..."`);
      try {
        await sock.sendPresenceUpdate('composing', chatId);
      } catch (e) {
        console.error(`[HumanTyping] Error presencia:`, e);
      }
      
      const quickTyping = 1500 + Math.random() * 1500; // 1.5-3 segundos
      console.log(`[HumanTyping] ⌨️ Escribiendo por ${(quickTyping / 1000).toFixed(1)}s...`);
      await this.sleep(quickTyping);
      
      try {
        await sock.sendPresenceUpdate('available', chatId);
      } catch (e) {
        console.error(`[HumanTyping] Error presencia:`, e);
      }
      
      // Enviar
      console.log(`[HumanTyping] 📤 Enviando mensaje`);
      await sock.sendMessage(chatId, { text: message });
      console.log(`[HumanTyping] ✅ Enviado`);
      
    } catch (error) {
      console.error('[HumanTyping] ❌ Error en envío rápido:', error);
      await sock.sendMessage(chatId, { text: message });
    }
  }
  
  /**
   * Helper: Sleep con Promise
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Calcula si debe usar envío rápido o normal
   */
  static shouldUseQuickSend(message: string): boolean {
    // Mensajes cortos (< 50 caracteres) usan envío rápido
    return message.length < 50;
  }
  
  /**
   * Variación aleatoria de tiempo (±20%)
   * Para hacer los tiempos menos predecibles
   */
  static addRandomVariation(baseTime: number): number {
    const variation = baseTime * 0.2; // ±20%
    return baseTime + (Math.random() * variation * 2 - variation);
  }
}
