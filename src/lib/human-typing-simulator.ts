/**
 * Simulador de Escritura Humana
 * Simula comportamiento humano al escribir para evitar detección de bots
 */

export class HumanTypingSimulator {
  /**
   * Calcula el tiempo de espera antes de responder (retraso humano)
   * Basado en la longitud del mensaje y variabilidad natural
   * ⚡ ULTRA OPTIMIZADO: Rápido pero natural (máx 3s)
   */
  static calculateResponseDelay(messageLength: number): number {
    // Tiempo base de lectura: 0.5-1 segundo (muy reducido)
    const baseReadingTime = 500 + Math.random() * 500;
    
    // Tiempo de "pensamiento": 0.3-0.8 segundos (muy reducido)
    const thinkingTime = 300 + Math.random() * 500;
    
    // Tiempo adicional por longitud del mensaje (simula lectura rápida)
    // ~5ms por carácter (lectura muy rápida)
    const readingTime = messageLength * (3 + Math.random() * 5);
    
    // Total: 0.8-2.3 segundos + tiempo de lectura
    const totalDelay = baseReadingTime + thinkingTime + readingTime;
    
    // Limitar entre 0.8 y 3 segundos (muy reducido)
    return Math.min(Math.max(totalDelay, 800), 3000);
  }
  
  /**
   * Calcula el tiempo de "escritura" basado en la longitud de la respuesta
   * Simula velocidad de escritura humana variable
   * ⚡ ULTRA OPTIMIZADO: Muy rápido (máx 5s)
   */
  static calculateTypingTime(responseLength: number): number {
    // Velocidad de escritura muy rápida: 100-120 palabras por minuto
    // Aproximadamente 500-600 caracteres por minuto
    // O 10-12 caracteres por segundo
    
    // Usar velocidad muy rápida: ~12 caracteres por segundo
    const charsPerSecond = 10 + Math.random() * 4; // 10-14 chars/seg (muy rápido)
    const baseTypingTime = (responseLength / charsPerSecond) * 1000;
    
    // Agregar pausas naturales muy cortas
    const pauseCount = (responseLength / 100); // Pausa cada ~100 caracteres (pocas pausas)
    const pauseTime = pauseCount * (100 + Math.random() * 200); // 100-300ms por pausa (muy cortas)
    
    const totalTypingTime = baseTypingTime + pauseTime;
    
    // Limitar entre 0.8 y 5 segundos (muy reducido)
    return Math.min(Math.max(totalTypingTime, 800), 5000);
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
      
      // 1. Retraso inicial FORZADO (lectura + pensamiento) - ULTRA OPTIMIZADO
      const responseDelay = Math.max(800, this.calculateResponseDelay(userMessageLength));
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
      
      // 3. Simular escritura (tiempo fijo mínimo) - ULTRA OPTIMIZADO
      const typingTime = Math.max(1500, this.calculateTypingTime(message.length));
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
   * ⚡ ULTRA RÁPIDO: 1-2 segundos total
   */
  static async quickHumanizedSend(
    sock: any,
    chatId: string,
    message: string
  ): Promise<void> {
    try {
      console.log(`[HumanTyping] 🚀 ENVÍO RÁPIDO INICIADO`);
      
      // Retraso muy corto: 0.5-1 segundo
      const quickDelay = 500 + Math.random() * 500;
      console.log(`[HumanTyping] ⏳ Esperando ${(quickDelay / 1000).toFixed(1)}s...`);
      await this.sleep(quickDelay);
      
      // FORZAR escritura muy rápida
      console.log(`[HumanTyping] ⌨️ Mostrando "escribiendo..."`);
      try {
        await sock.sendPresenceUpdate('composing', chatId);
      } catch (e) {
        console.error(`[HumanTyping] Error presencia:`, e);
      }
      
      const quickTyping = 800 + Math.random() * 700; // 0.8-1.5 segundos
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
   * Helper: Sleep con Promise (público para uso externo)
   */
  static sleep(ms: number): Promise<void> {
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
