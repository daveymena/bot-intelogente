/**
 * 👋 DETECTOR DE SALUDOS
 * Detecta saludos simples y genera respuestas predeterminadas SIN GASTAR TOKENS
 * Incluye presentación profesional del negocio
 */

export class GreetingDetector {
  private static greetingPatterns = [
    // Saludos básicos
    'hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buen dia',
    'saludos', 'hey', 'ola', 'buenas', 'que tal', 'como estas',
    'hola!', 'hola?', 'holaaa', 'holaa', 'buenas!', 'buenas?',
    'buenos días', 'buenas tardes', 'buenas noches', 'buen día',
    'qué tal', 'cómo estás', 'como esta', 'cómo está',
    
    // Saludos profesionales
    'buen día', 'muy buenos días', 'muy buenas tardes', 'muy buenas noches',
    'cordial saludo', 'un cordial saludo', 'reciba un cordial saludo',
    'estimado', 'estimada', 'apreciado', 'apreciada',
    'señor', 'señora', 'señorita', 'don', 'doña',
    
    // Variaciones formales
    'permiso', 'disculpe', 'disculpa', 'con permiso',
    'buenas tardes señor', 'buenas tardes señora',
    'buenos días señor', 'buenos días señora',
    'hola buenas', 'hola buen día', 'hola buenas tardes',
    
    // Saludos casuales adicionales
    'que hubo', 'qué hubo', 'quiubo', 'quihubo', 'quibo',
    'holi', 'holiwis', 'holiss', 'holitas',
    'wenas', 'wena', 'weenas'
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
   * Incluye presentación profesional del negocio
   */
  static generateGreetingResponse(userName?: string): string {
    const greetings = [
      // Saludos con presentación completa del negocio
      `👋 ¡Hola${userName ? ' ' + userName : ''}! Bienvenido a *Tecnovariedades D&S* 😄💻

Aquí encontrarás tecnología, soporte, cursos y herramientas digitales para potenciar tu día a día.

📦 *Nuestros productos:*
💻 Laptops y computadores
🏍️ Motos
🎓 Cursos digitales y megapacks
📱 Accesorios tecnológicos

¿Buscas algún producto, servicio o información en especial? 🔍`,

      `¡Hola${userName ? ' ' + userName : ''}! 😊 Bienvenido a *Tecnovariedades D&S* 🎉

Somos tu tienda de confianza para:
✅ Computadores y laptops de alta calidad
✅ Motos y vehículos
✅ Cursos digitales profesionales
✅ Megapacks de contenido educativo

¿En qué puedo ayudarte hoy? 💬`,

      `👋 ¡Hola${userName ? ' ' + userName : ''}! Qué gusto saludarte �

Soy tu asistente de *Tecnovariedades D&S* ✨

Puedo ayudarte con:
📱 Información de productos
💰 Precios y disponibilidad
💳 Métodos de pago
🎓 Cursos y megapacks digitales

¿Qué necesitas? 🚀`,

      `¡Bienvenido${userName ? ' ' + userName : ''}! 🌟

Gracias por contactar a *Tecnovariedades D&S*

Ofrecemos:
💻 Tecnología de última generación
🏍️ Vehículos y motos
📚 Contenido educativo digital
🛠️ Soporte y asesoría

¿Qué te interesa conocer? 😊`,

      `¡Hola${userName ? ' ' + userName : ''}! 👋 Bienvenido a *Tecnovariedades D&S* 💙

Tu tienda de tecnología y educación digital en Cali 🎯

Tenemos disponibles:
• Laptops para estudio, trabajo y gaming
• Motos y vehículos
• Cursos profesionales
• Megapacks educativos

¿Buscas algo en particular? 🔍`,

      // Saludos profesionales con presentación
      `¡Buen día${userName ? ' ' + userName : ''}! 🌟

Bienvenido a *Tecnovariedades D&S*
Tu aliado en tecnología y educación digital 💼

Ofrecemos:
💻 Equipos de cómputo
🏍️ Vehículos
🎓 Formación digital
📦 Soluciones tecnológicas

¿En qué puedo colaborarte hoy? 😊`,

      `¡Muy buenos días${userName ? ' ' + userName : ''}! ☀️

Es un gusto atenderte en *Tecnovariedades D&S*

Somos especialistas en:
✅ Tecnología y computación
✅ Vehículos y motos
✅ Educación digital
✅ Herramientas profesionales

¿Cómo puedo asistirte? 💬`,

      `¡Saludos${userName ? ' ' + userName : ''}! 👋

Gracias por contactar a *Tecnovariedades D&S*
Tu centro de tecnología en Cali 🎯

Disponemos de:
📱 Tecnología de punta
🏍️ Motos y vehículos
📚 Cursos digitales
💼 Soluciones tecnológicas

¿Qué información requieres? �`
    ];
    
    // Seleccionar saludo aleatorio
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Detecta si el mensaje es una despedida
   */
  static isFarewell(message: string): boolean {
    const farewellPatterns = [
      // Agradecimientos
      'gracias', 'muchas gracias', 'ok gracias', 'perfecto gracias',
      'mil gracias', 'muchísimas gracias', 'te agradezco', 'le agradezco',
      'muy amable', 'muy gentil', 'gracias por todo', 'gracias por la info',
      'gracias por la información', 'agradecido', 'agradecida',
      
      // Confirmaciones
      'entendido', 'ok', 'vale', 'perfecto', 'listo', 'excelente',
      'muy bien', 'está bien', 'de acuerdo', 'entiendo',
      
      // Despedidas
      'adios', 'adiós', 'chao', 'hasta luego', 'nos vemos',
      'bye', 'hasta pronto', 'que tengas buen dia', 'buen día',
      'hasta mañana', 'nos hablamos', 'hablamos luego',
      'cuídate', 'cuidate', 'que estés bien', 'que estes bien',
      'bendiciones', 'saludos', 'un abrazo', 'abrazo',
      
      // Despedidas profesionales
      'que tenga buen día', 'que tenga buena tarde',
      'feliz día', 'feliz tarde', 'feliz noche',
      'hasta la próxima', 'hasta otra ocasión'
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
   * Incluye variaciones profesionales y casuales
   */
  static generateFarewellResponse(): string {
    const farewells = [
      // Despedidas casuales amigables
      '¡De nada! 😊 Estoy aquí si necesitas algo más. ¡Que tengas un excelente día! 👋',
      
      '¡Un placer ayudarte! 😄 Cualquier cosa, aquí estoy. ¡Hasta pronto! 🚀',
      
      '¡Perfecto! 👍 Si necesitas algo más, no dudes en escribirme. ¡Que te vaya muy bien! ✨',
      
      '¡Con gusto! 😊 Aquí estaré cuando me necesites. ¡Cuídate mucho! 💙',
      
      '¡Listo! 🎉 Fue un placer atenderte. ¡Nos vemos pronto! 👋',
      
      // Despedidas profesionales
      '¡Excelente! 🌟 Quedo atento a cualquier consulta adicional. ¡Que tenga un buen día! 💼',
      
      '¡Perfecto! 👍 Estoy disponible cuando lo requieras. ¡Feliz día! ☀️',
      
      '¡Entendido! 📋 Gracias por tu confianza. Estoy aquí para servirte. ¡Hasta pronto! 🙂',
      
      '¡De acuerdo! ✅ Cualquier duda adicional, no dudes en contactarme. ¡Que tengas excelente día! 😊',
      
      // Despedidas mixtas (profesional-amigable)
      '¡Genial! 😊 Gracias por escribirnos. Estoy disponible 24/7 para ayudarte. ¡Hasta luego! 👋',
      
      '¡Perfecto! 🎯 Fue un gusto asistirte. Aquí estaré cuando me necesites. ¡Bendiciones! 🙏',
      
      '¡Listo! ✨ Gracias por tu tiempo. Estoy aquí para lo que necesites. ¡Que te vaya muy bien! 🚀',
      
      '¡Excelente! 😄 Cualquier cosa adicional, con confianza me escribes. ¡Hasta la próxima! 👋',
      
      '¡Perfecto! 💯 Gracias por contactarnos. Estoy disponible para ayudarte siempre. ¡Cuídate! 💙'
    ];
    
    return farewells[Math.floor(Math.random() * farewells.length)];
  }
}
