/**
 * Knowledge Base del Negocio
 * Información que el bot debe conocer para responder profesionalmente
 */

export const BusinessKnowledge = {
  // Información básica del negocio
  negocio: {
    nombre: "Tecnovariedades D&S",
    eslogan: "Tu aliado en tecnología y educación digital",
    descripcion: "Especialistas en equipos de computación, cursos digitales y tecnología",
    ubicacion: "Centro Comercial El Diamante 2, San Nicolás, Cali, Colombia",
    whatsapp: "+57 304 274 8687",
    email: "deinermen25@gmail.com"
  },

  // Horarios de atención
  horarios: {
    dias: "Lunes a Sábado",
    horario: "9:00 AM - 6:00 PM",
    domingos: "Cerrado",
    respuestaRapida: "Respondemos mensajes en horario laboral. Fuera de horario, te responderemos al día siguiente."
  },

  // Métodos de pago aceptados
  metodosPago: {
    disponibles: [
      "Nequi",
      "Daviplata", 
      "Transferencia Bancaria (Bancolombia)",
      "PayPal",
      "MercadoPago",
      "Efectivo (solo en tienda física)"
    ],
    preferido: "Nequi o Daviplata para envíos inmediatos",
    explicacion: "Para productos digitales el pago es inmediato. Para productos físicos, procesamos tu pedido apenas confirmemos el pago."
  },

  // Política de garantías
  garantias: {
    productosDigitales: "Los cursos y megapacks tienen garantía de satisfacción. Si no te sirve el contenido en las primeras 24h, te devolvemos tu dinero.",
    productosElectronicos: "Todos nuestros portátiles y equipos nuevos tienen garantía del fabricante (Asus: 1 año, Acer: 1 año, HP: 1 año).",
    defectos: "Si el producto llega con defecto de fábrica, lo cambiamos o devolvemos el 100% del dinero.",
    productosFisicos: "7 días para cambio por defecto de fábrica (debe estar sin usar y con empaque original)"
  },

  // Información de envíos
  envios: {
    nacional: "Enviamos a toda Colombia mediante Servientrega o Coordinadora",
    cali: "En Cali: Domicilio el mismo día o al día siguiente (según disponibilidad)",
    costoEnvio: "El costo de envío varía según la ciudad. Te cotizamos antes de confirmar",
    productosDigitales: "Los cursos y megapacks son ENTREGA INMEDIATA por WhatsApp o email tras confirmar pago",
    tiempoEntrega: "2-5 días hábiles según ciudad (Bogotá, Medellín: 2-3 días; otras ciudades: 3-5 días)"
  },

  // Preguntas Frecuentes (FAQ)
  faq: {
    "¿Aceptan tarjeta de crédito?": "Por el momento aceptamos Nequi, Daviplata, transferencia bancaria, PayPal y MercadoPago. Estamos trabajando en habilitar pagos con tarjeta de crédito directamente.",
    
    "¿Los productos son nuevos o usados?": "Todos nuestros portátiles y equipos electrónicos son NUEVOS y sellados de fábrica con garantía del fabricante.",
    
    "¿Los cursos tienen certificado?": "Nuestros megapacks son material educativo de alta calidad. Algunos cursos incluyen certificados internos, pero no son certificaciones oficiales. Son perfectos para aprender habilidades prácticas.",
    
    "¿Puedo ir a ver el producto antes de comprarlo?": "¡Claro! Estamos en Centro Comercial El Diamante 2, San Nicolás, Cali. Te esperamos de lunes a sábado de 9am a 6pm.",
    
    "¿Hacen domicilios en Cali?": "Sí, hacemos domicilios en Cali el mismo día o al día siguiente. El costo depende de la zona.",
    
    "¿Cuánto demora la entrega de un curso digital?": "¡INMEDIATA! En cuanto confirmes el pago, te enviamos el acceso por WhatsApp o email en menos de 30 minutos.",
    
    "¿Puedo pagar contra entrega?": "Por el momento no manejamos pago contra entrega. Aceptamos Nequi, Daviplata, transferencia, PayPal y MercadoPago.",
    
    "¿Dan factura?": "Sí, emitimos factura electrónica para todas las compras. Solo necesitamos tus datos (nombre completo, cédula, email)."
  },

  // Objeciones comunes y cómo manejarlas
  objeciones: {
    "Es muy caro": "Entiendo tu preocupación por el precio. Nuestros equipos son nuevos con garantía de fábrica, lo que te asegura calidad y soporte. Además, puedes comparar con otras tiendas y verás que nuestros precios son muy competitivos. ¿Te gustaría ver opciones en diferentes rangos de precio?",
    
    "Lo voy a pensar": "¡Perfecto! Es una decisión importante. ¿Hay algo específico que te gustaría saber para ayudarte a decidir? Puedo darte más info sobre garantía, formas de pago o comparar modelos.",
    
    "¿Es original?": "¡100% original y nuevo! Todos nuestros equipos vienen sellados de fábrica con garantía del fabricante. Puedes verificar el serial en la página oficial de la marca.",
    
    "Vi más barato en otro lado": "Te entiendo. A veces hay ofertas puntuales. Nosotros garantizamos producto nuevo, factura, garantía y servicio posventa. Si encuentras un precio significativamente menor, compárteme el link y veo qué puedo hacer por ti.",
    
    "No confío en compras por internet": "Tu seguridad es importante. Por eso trabajamos con métodos de pago seguros. Si estás en Cali, puedes venir a nuestra tienda física a ver el producto antes de comprarlo. ¿Te gustaría visitarnos?"
  },

  // Características de productos por categoría (para asesoramiento)
  asesoramiento: {
    portatilesParaEstudio: "Para estudiantes recomiendo mínimo Core i5 u 8GB RAM para que corra Office, navegadores y software educativo sin problemas.",
    
    portatilesParaEdicion: "Para edición de video/fotos necesitas mínimo Core i7, 16GB RAM y SSD. Los modelos con estas specs corren Adobe Premiere, Photoshop y DaVinci sin lag.",
    
    portatilesParaGaming: "Para gaming casual (Fortnite, Minecraft) sirven modelos con Core i5/Ryzen 5 y 8GB. Para gaming más exigente recomiendo Core i7/Ryzen 7 con 16GB.",
    
    cursosDigitales: "Nuestros megapacks son bibliotecas completas de cursos. Si buscas aprender una habilidad específica (diseño, programación, marketing), tenemos packs especializados con decenas de cursos por menos de lo que cuesta 1 curso individual.",
    
    impresoras: "Para uso casero recomiendo las de tinta continua (Epson EcoTank, Canon). Son más económicas a largo plazo que las de cartucho."
  }
};

/**
 * Obtiene información del knowledge base según la pregunta
 */
export function getBusinessInfo(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  // Horarios
  if (/(horario|hora|abierto|atienden|cuando|abren|cierran)/i.test(queryLower)) {
    return `Atendemos ${BusinessKnowledge.horarios.dias} de ${BusinessKnowledge.horarios.horario}. ${BusinessKnowledge.horarios.domingos}. ${BusinessKnowledge.horarios.respuestaRapida}`;
  }
  
  // Ubicación
  if (/(donde|ubicación|ubicacion|dirección|direccion|tienda|local)/i.test(queryLower)) {
    return `Estamos ubicados en ${BusinessKnowledge.negocio.ubicacion}. ¡Te esperamos!`;
  }
  
  // Métodos de pago
  if (/(pago|pagar|metodo|forma|como pago|acepta)/i.test(queryLower)) {
    return `Aceptamos: ${BusinessKnowledge.metodosPago.disponibles.join(', ')}. ${BusinessKnowledge.metodosPago.explicacion}`;
  }
  
  // Garantía
  if (/(garantía|garantia|devol|cambio|defecto)/i.test(queryLower)) {
    return `${BusinessKnowledge.garantias.productosElectronicos} ${BusinessKnowledge.garantias.defectos}`;
  }
  
  // Envíos
  if (/(envío|envio|entrega|domicilio|despacho)/i.test(queryLower)) {
    return `${BusinessKnowledge.envios.nacional}. ${BusinessKnowledge.envios.cali} ${BusinessKnowledge.envios.tiempoEntrega}`;
  }
  
  // Buscar en FAQ
  for (const [pregunta, respuesta] of Object.entries(BusinessKnowledge.faq)) {
    if (queryLower.includes(pregunta.toLowerCase().slice(0, 15))) {
      return respuesta;
    }
  }
  
  return null;
}
