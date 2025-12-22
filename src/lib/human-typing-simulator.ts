/**
 * Simulador de Escritura Humana
 * Simula comportamiento humano al escribir para evitar detección de bots
 */

export class HumanTypingSimulator {
  /**
   * Calcula el tiempo de espera antes de responder (retraso humano)
   * ⚡ SUPER RÁPIDO: Máximo 1 segundo
   */
  static calculateResponseDelay(messageLength: number): number {
    // Tiempo base muy corto: 200-500ms
    const baseReadingTime = 200 + Math.random() * 300;
    
    // Tiempo de "pensamiento" mínimo: 100-300ms
    const thinkingTime = 100 + Math.random() * 200;
    
    // Tiempo adicional por longitud (muy reducido)
    const readingTime = messageLength * (1 + Math.random() * 2);
    
    const totalDelay = baseReadingTime + thinkingTime + readingTime;
    
    // Limitar entre 300ms y 1 segundo (SUPER RÁPIDO)
    return Math.min(Math.max(totalDelay, 300), 1000);
  }
  
  /**
   * Calcula el tiempo de "escritura" basado en la longitud de la respuesta
   * ⚡ SUPER RÁPIDO: Máximo 2 segundos
   */
  static calculateTypingTime(responseLength: number): number {
    // Velocidad super rápida: ~20 caracteres por segundo
    const charsPerSecond = 18 + Math.random() * 4; // 18-22 chars/seg (SUPER RÁPIDO)
    const baseTypingTime = (responseLength / charsPerSecond) * 1000;
    
    // Pausas mínimas
    const pauseCount = (responseLength / 150); // Pausa cada ~150 caracteres
    const pauseTime = pauseCount * (50 + Math.random() * 100); // 50-150ms por pausa
    
    const totalTypingTime = baseTypingTime + pauseTime;
    
    // Limitar entre 500ms y 2 segundos (SUPER RÁPIDO)
    return Math.min(Math.max(totalTypingTime, 500), 2000);
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
      
      // 1. Retraso inicial MÍNIMO (lectura + pensamiento) - SUPER RÁPIDO
      const responseDelay = Math.max(300, this.calculateResponseDelay(userMessageLength));
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
      
      // 3. Simular escritura RÁPIDA - SUPER OPTIMIZADO
      const typingTime = Math.max(500, this.calculateTypingTime(message.length));
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
   * ⚡ SUPER RÁPIDO: 0.5-1 segundo total
   */
  static async quickHumanizedSend(
    sock: any,
    chatId: string,
    message: string
  ): Promise<void> {
    try {
      console.log(`[HumanTyping] 🚀 ENVÍO RÁPIDO INICIADO`);
      
      // Retraso mínimo: 200-400ms
      const quickDelay = 200 + Math.random() * 200;
      console.log(`[HumanTyping] ⏳ Esperando ${(quickDelay / 1000).toFixed(1)}s...`);
      await this.sleep(quickDelay);
      
      // FORZAR escritura super rápida
      console.log(`[HumanTyping] ⌨️ Mostrando "escribiendo..."`);
      try {
        await sock.sendPresenceUpdate('composing', chatId);
      } catch (e) {
        console.error(`[HumanTyping] Error presencia:`, e);
      }
      
      const quickTyping = 300 + Math.random() * 400; // 0.3-0.7 segundos
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
