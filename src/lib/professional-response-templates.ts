/**
 * PLANTILLAS DE RESPUESTAS PROFESIONALES
 * Sistema híbrido: IA inteligente + estructura profesional
 */

export interface ResponseTemplate {
  type: string;
  template: string;
  variables?: string[];
}

export const PROFESSIONAL_TEMPLATES = {
  // ==================== SALUDOS ====================
  SALUDO_INICIAL: {
    type: 'greeting',
    template: `👋 ¡Hola! Bienvenido(a) a **Tecnovariedades D&S** ✨

Gracias por escribirnos.

Soy **Dani**, tu asesor virtual 🤖💬
Estoy aquí para ayudarte a elegir el producto ideal según lo que necesitas.

📌 ¿Qué estás buscando hoy?

1️⃣ Computadores y productos físicos
2️⃣ Cursos digitales individuales
3️⃣ Megapacks de cursos
4️⃣ Dropshipping para emprender
5️⃣ Hablar con un asesor humano 👨‍💼`
  },

  SALUDO_RETORNO: {
    type: 'greeting',
    template: `¡Hola de nuevo! 😊

Me alegra verte por aquí otra vez.

¿En qué puedo ayudarte hoy?`
  },

  // ==================== PRESENTACIÓN DE PRODUCTOS ====================
  PRESENTACION_COMPUTADORES: {
    type: 'product_presentation',
    template: `🖥️ ¡Excelente elección!

En **Tecnovariedades D&S** tenemos computadores listos para entrega inmediata 🚀

💻 **Computadoras recomendadas según tu necesidad:**

• Para estudio 📘: Core i5 / 8GB RAM
• Para oficina 🧑‍💼: Core i5 / 16GB RAM / SSD
• Para diseño 🎨: Core i7 / 16–32GB RAM / Tarjeta gráfica

👉 Cuéntame: ¿para qué la necesitas? Te recomiendo la mejor al precio más bajo 💰📉`
  },

  PRESENTACION_CURSOS: {
    type: 'product_presentation',
    template: `¡Excelente elección! 😄📚

En **Tecnovariedades D&S** contamos con formación práctica y actualizada para que aprendas desde cero o refuerces tus conocimientos.

🎓 Opciones disponibles:

1️⃣ Cursos individuales (Photoshop, Illustrator, Branding, etc.)
2️⃣ Megapack Premium con todos los cursos 💥

👉 ¿Te gustaría aprender algo específico o prefieres el paquete completo?`
  },

  PRESENTACION_MEGAPACK: {
    type: 'product_presentation',
    template: `🔥 ¡Perfecto! Te presento nuestro **Megapack Premium de Cursos**:

🎓 Incluye:
• Photoshop de Cero a Profesional
• Illustrator
• Branding Avanzado
• Diseño para Redes Sociales
• Ilustración Digital
• Contenido extra y actualizaciones

📦 Acceso inmediato
📱 Compatible con celular y PC
♾️ Acceso ilimitado

💰 **Precio especial de hoy:**
✨ Menos de lo que cuesta un almuerzo 🍽️😉

¿Deseas asegurar tu acceso ahora?`
  },

  // ==================== PRODUCTO ESPECÍFICO ====================
  PRODUCTO_DETALLE: {
    type: 'product_detail',
    template: `✨ **{nombre}**

📝 {descripcion}

💰 **Precio:** ${'{precio}'}

{caracteristicas}

👉 ¿Te gustaría más información o proceder con la compra?`
  },

  // ==================== MÁS INFORMACIÓN ====================
  MAS_INFORMACION: {
    type: 'more_info',
    template: `📋 Con gusto te amplío la información:

{detalles}

¿Tienes alguna pregunta específica? Estoy aquí para ayudarte 😊`
  },

  // ==================== CIERRE DE VENTA ====================
  CIERRE_VENTA: {
    type: 'closing',
    template: `¡Excelente decisión! 🎉

💳 **Formas de pago disponibles:**
• Nequi
• Daviplata
• Bancolombia
• Transferencia

📩 Una vez realizado el pago, recibirás:
✔ {beneficio1}
✔ {beneficio2}
✔ Soporte si lo necesitas

👉 Avísame cuando realices el pago y continúo con el proceso 😊`
  },

  METODOS_PAGO: {
    type: 'payment',
    template: `💳 **Opciones de pago disponibles:**

{metodos}

📌 El proceso es rápido y seguro.

¿Con cuál método prefieres continuar?`
  },

  // ==================== CONFIRMACIÓN ====================
  CONFIRMACION_PAGO: {
    type: 'confirmation',
    template: `✅ ¡Perfecto!

He registrado tu interés en: **{producto}**

📩 Te enviaré los detalles de pago por este medio.

¿Procedo con el envío de la información?`
  },

  // ==================== DESPEDIDA ====================
  DESPEDIDA_VENTA: {
    type: 'farewell',
    template: `✨ Gracias por confiar en **Tecnovariedades D&S**

Ha sido un gusto atenderte 😊

Si más adelante necesitas:
🖥️ Computadores
📚 Más cursos
🛠️ Soporte técnico

Escríbenos en cualquier momento.

¡Que tengas un excelente día! 🌟`
  },

  DESPEDIDA_SIN_VENTA: {
    type: 'farewell',
    template: `No hay problema 😊

Tu información queda guardada para cuando decidas continuar.

📌 Recuerda: Tenemos promociones activas y cupos limitados en algunos productos.

Cuando gustes, solo escríbenos y con gusto te asesoramos ✨

¡Feliz día!`
  },

  // ==================== REDIRECCIÓN SUTIL ====================
  REDIRECCION_SUTIL: {
    type: 'redirect',
    template: `{respuesta_pregunta}

Por cierto, {transicion_venta} 😊`
  },

  // ==================== OBJECIONES ====================
  OBJECION_PRECIO: {
    type: 'objection',
    template: `Entiendo tu preocupación por el precio 😊

Te cuento que {justificacion_valor}

Además, {beneficio_adicional}

¿Te gustaría que te muestre opciones dentro de tu presupuesto?`
  },

  OBJECION_TIEMPO: {
    type: 'objection',
    template: `¡Perfecto! No hay prisa 😊

Mientras tanto, ¿te gustaría que te envíe más información para que la revises con calma?

Así cuando estés listo, ya tendrás todo claro.`
  }
};

// ==================== TRANSICIONES SUTILES ====================
export const TRANSICIONES_VENTA = [
  "¿sabías que tenemos productos que podrían interesarte?",
  "aprovecho para contarte que tenemos ofertas especiales esta semana",
  "por cierto, ¿has visto nuestro catálogo de {categoria}?",
  "hablando de eso, tenemos algo perfecto para ti",
  "ya que estamos en tema, déjame mostrarte algo que te puede servir"
];

// ==================== FRASES DE VALOR ====================
export const FRASES_VALOR = {
  CURSOS: [
    "aprenderás con contenido actualizado y práctico",
    "tendrás acceso ilimitado para siempre",
    "incluye soporte completo",
    "es una inversión que se paga sola"
  ],
  COMPUTADORES: [
    "garantía incluida",
    "entrega inmediata",
    "configuración personalizada según tu necesidad",
    "mejor relación calidad-precio del mercado"
  ],
  MEGAPACKS: [
    "ahorras más del 70% comprando el paquete completo",
    "acceso a todo el contenido de por vida",
    "actualizaciones gratuitas",
    "es como tener una universidad completa en tu celular"
  ]
};

// ==================== HELPER FUNCTIONS ====================
export function formatTemplate(template: string, variables: Record<string, string>): string {
  let formatted = template;
  
  for (const [key, value] of Object.entries(variables)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  
  return formatted;
}

export function getRandomTransition(): string {
  return TRANSICIONES_VENTA[Math.floor(Math.random() * TRANSICIONES_VENTA.length)];
}

export function getRandomValuePhrase(category: keyof typeof FRASES_VALOR): string {
  const phrases = FRASES_VALOR[category];
  return phrases[Math.floor(Math.random() * phrases.length)];
}
