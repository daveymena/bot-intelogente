/**
 * 👋 DETECTOR DE SALUDOS
 * Detecta saludos simples y genera respuestas predeterminadas SIN GASTAR TOKENS
 */

export class GreetingDetector {
  private static greetingPatterns = [
    'hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buen dia',
    'saludos', 'hey', 'ola', 'buenas', 'que tal', 'como estas',
    'hola!', 'hola?', 'holaaa', 'holaa', 'buenas!', 'buenas?',
    'buenos días', 'buenas tardes', 'buenas noches', 'buen día',
    'qué tal', 'cómo estás', 'como esta', 'cómo está'
  ];

  /**
   * Detecta si el mensaje es un saludo simple
   */
  static isGreeting(message: string): boolean {
    const messageLower = message.toLowerCase().trim();
    
    // Eliminar signos de puntuación
    const cleanMessage = messageLower.replace(/[¿?¡!.,;:]/g, '').trim();
    
    // Es saludo si:
    // 1. Es exactamente una palabra de saludo
    // 2. O empieza con saludo y tiene menos de 25 caracteres
    return this.greetingPatterns.some(pattern => 
      cleanMessage === pattern || 
      (cleanMessage.startsWith(pattern) && cleanMessage.length < 25)
    );
  }

  /**
   * Genera respuesta de saludo predeterminada (sin gastar tokens)
   */
  static generateGreetingResponse(userName?: string): string {
    const greetings = [
      `¡Hola${userName ? ' ' + userName : ''}! 😊 Bienvenido a Tecnovariedades D&S 🎉\n\n¿En qué puedo ayudarte hoy? Tenemos:\n\n💻 Laptops y computadores\n🏍️ Motos\n🎓 Cursos digitales y megapacks\n📱 Accesorios tecnológicos\n\n¿Qué te interesa? 😄`,
      
      `¡Hola${userName ? ' ' + userName : ''}! 👋 ¿Cómo estás?\n\nSoy tu asistente de Tecnovariedades D&S ✨\n\nPuedo ayudarte con:\n✅ Información de productos\n✅ Precios y disponibilidad\n✅ Métodos de pago\n✅ Cursos digitales\n\n¿Qué necesitas? 😊`,
      
      `¡Hola${userName ? ' ' + userName : ''}! 😄 ¡Qué bueno verte por aquí!\n\nEstoy aquí para ayudarte con todo lo que necesites de Tecnovariedades D&S 🚀\n\n¿Buscas algo en particular? 🔍`
    ];
    
    // Seleccionar saludo aleatorio
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Detecta si el mensaje es una despedida
   */
  static isFarewell(message: string): boolean {
    const farewellPatterns = [
      'gracias', 'muchas gracias', 'ok gracias', 'perfecto gracias',
      'entendido', 'ok', 'vale', 'perfecto', 'listo',
      'adios', 'adiós', 'chao', 'hasta luego', 'nos vemos',
      'bye', 'hasta pronto', 'que tengas buen dia', 'buen día'
    ];
    
    const messageLower = message.toLowerCase().trim();
    const cleanMessage = messageLower.replace(/[¿?¡!.,;:]/g, '').trim();
    
    return farewellPatterns.some(pattern => 
      cleanMessage === pattern || 
      (cleanMessage.includes(pattern) && cleanMessage.length < 30)
    );
  }

  /**
   * Genera respuesta de despedida predeterminada
   */
  static generateFarewellResponse(): string {
    const farewells = [
      '¡De nada! 😊 Estoy aquí si necesitas algo más. ¡Que tengas un excelente día! 👋',
      '¡Un placer ayudarte! 😄 Cualquier cosa, aquí estoy. ¡Hasta pronto! 🚀',
      '¡Perfecto! 👍 Si necesitas algo más, no dudes en escribirme. ¡Que te vaya muy bien! ✨'
    ];
    
    return farewells[Math.floor(Math.random() * farewells.length)];
  }
}
