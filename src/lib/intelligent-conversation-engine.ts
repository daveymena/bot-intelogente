/**
 * Motor de Conversación Inteligente con Razonamiento Real
 * Usa IA para entender contexto, mantener memoria y razonar sobre las intenciones
 */

import Groq from 'groq-sdk';
import { db as prisma } from './db';
import { LocalKnowledgeBase } from './local-knowledge-base';
import { OllamaService } from './ollama-service';
// Sistema híbrido local/IA - Permite funcionar sin tokens en 80% de casos
import { ProductScorer } from './product-scorer';
import { DynamicProductIntelligence } from './dynamic-product-intelligence';
import { ResponseValidator } from './response-validator';
import { NaturalLanguageEnhancer, HumanTypingSimulator } from './natural-language-enhancer';
import { IntelligentReasoningEngine } from './intelligent-reasoning-engine';


interface ConversationMemory {
  chatId: string;
  userName?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  context: {
    currentProduct?: any;
    interestedProducts?: any[];
    lastQuery?: string;
    paymentIntent?: boolean;
    preferredPaymentMethod?: string;
    budget?: number;
    needs?: string[];
    imageSent?: string; // ID del producto cuya imagen ya se envió
  };
  lastUpdate: number;
}

export class IntelligentConversationEngine {
  private groq: Groq;
  private memories: Map<string, ConversationMemory> = new Map();
  private readonly MEMORY_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private currentKeyIndex = 0;
  private apiKeys: string[] = [];

  constructor(apiKey: string) {
    // Recopilar todas las API keys disponibles
    this.apiKeys = [
      apiKey,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
      process.env.GROQ_API_KEY_5,
      process.env.GROQ_API_KEY_6,
      process.env.GROQ_API_KEY_7,
      process.env.GROQ_API_KEY_8
    ].filter(Boolean) as string[];

    console.log(`[IntelligentEngine] 🔑 ${this.apiKeys.length} API keys de Groq disponibles`);
    
    this.groq = new Groq({ apiKey: this.apiKeys[0] });
  }

  /**
   * Rotar a la siguiente API key cuando hay rate limit
   */
  private rotateApiKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    const newKey = this.apiKeys[this.currentKeyIndex];
    
    console.log(`[IntelligentEngine] 🔄 Rotando a API key #${this.currentKeyIndex + 1}`);
    
    this.groq = new Groq({ apiKey: newKey });
  }

  /**
   * Procesa un mensaje con razonamiento completo
   */
  async processMessage(params: {
    chatId: string;
    userName?: string;
    message: string;
    userId: string;
  }) {
    const { chatId, userName, message, userId } = params;

    console.log('[IntelligentEngine] 📥 Procesando mensaje:', {
      chatId,
      mensaje: message,
      usuario: userName || 'desconocido'
    });

    // 🎯 PASO 0: DETECCIÓN TEMPRANA de preguntas fuera de alcance
    // Esto previene que el bot malinterprete frases como "nos veamos" como búsqueda de productos
    try {
      const { KnowledgeService } = await import('@/lib/knowledge-service');
      
      // Obtener memoria actual para contexto
      const memory = this.getOrCreateMemory(chatId, userName);
      const productId = memory.context.currentProduct?.id;
      const productName = memory.context.currentProduct?.name;
      
      console.log('[IntelligentEngine] 🔍 Verificando si es pregunta fuera de alcance...');
      const quickAnswer = await KnowledgeService.answerProductQuestion(
        message,
        productId,
        productName
      );
      
      // Si es pregunta fuera de alcance (reunión, personal, etc.), responder inmediatamente
      if (quickAnswer.confidence === 'high' && 
          (quickAnswer.question === 'reunión presencial' || 
           quickAnswer.question === 'solicitud personal' ||
           quickAnswer.question === 'fuera de alcance')) {
        console.log('[IntelligentEngine] ⚠️ Pregunta fuera de alcance detectada:', quickAnswer.question);
        
        // Agregar a memoria
        this.addToMemory(memory, 'user', message);
        this.addToMemory(memory, 'assistant', quickAnswer.answer);
        
        return {
          text: quickAnswer.answer,
          actions: [],
          context: memory.context,
          confidence: 0.95
        };
      }
      
      console.log('[IntelligentEngine] ✅ No es pregunta fuera de alcance, continuando con agentes');
    } catch (error) {
      console.error('[IntelligentEngine] ⚠️ Error en detección temprana:', error);
      // Continuar con el flujo normal si hay error
    }

    // 🎯 PASO 1: Intentar usar el sistema de agentes
    try {
      const { Orchestrator } = await import('@/agents/orchestrator');
      const { SharedMemoryService } = await import('@/agents/shared-memory');
      
      const orchestrator = new Orchestrator();
      const sharedMemoryService = SharedMemoryService.getInstance();
      
      console.log('[IntelligentEngine] 🤖 Usando sistema de agentes especializados');
      
      // 🔄 SINCRONIZAR: Obtener memoria del Orchestrator ANTES de procesar
      const sharedMemory = sharedMemoryService.get(chatId, userId);
      console.log('[IntelligentEngine] 🔄 Memoria compartida:', {
        producto: sharedMemory.currentProduct?.name || 'ninguno',
        productosInteresados: sharedMemory.interestedProducts.length,
        historial: sharedMemory.productHistory.length
      });
      
      const agentResponse = await orchestrator.processMessage({
        chatId,
        userId,
        message,
        userName
      });
      
      console.log('[IntelligentEngine] ✅ Respuesta de agentes:', {
        confianza: ((agentResponse.confidence || 0.8) * 100).toFixed(0) + '%',
        acciones: agentResponse.actions?.length || 0
      });
      
      // 🔄 SINCRONIZAR: Actualizar memoria local con la del Orchestrator DESPUÉS de procesar
      const updatedSharedMemory = sharedMemoryService.get(chatId, userId);
      const localMemory = this.getOrCreateMemory(chatId, userName);
      
      // Sincronizar producto actual
      if (updatedSharedMemory.currentProduct) {
        localMemory.context.currentProduct = updatedSharedMemory.currentProduct;
        console.log('[IntelligentEngine] 🔄 Sincronizado producto actual:', updatedSharedMemory.currentProduct.name);
      }
      
      // Sincronizar productos de interés
      if (updatedSharedMemory.interestedProducts.length > 0) {
        localMemory.context.interestedProducts = updatedSharedMemory.interestedProducts;
        console.log('[IntelligentEngine] 🔄 Sincronizados productos de interés:', updatedSharedMemory.interestedProducts.length);
      }
      
      // Sincronizar intención de pago
      if (updatedSharedMemory.paymentIntent) {
        localMemory.context.paymentIntent = true;
        console.log('[IntelligentEngine] 🔄 Sincronizada intención de pago');
      }
      
      // Sincronizar método de pago preferido
      if (updatedSharedMemory.preferredPaymentMethod) {
        localMemory.context.preferredPaymentMethod = updatedSharedMemory.preferredPaymentMethod;
        console.log('[IntelligentEngine] 🔄 Sincronizado método de pago:', updatedSharedMemory.preferredPaymentMethod);
      }
      
      // ✅ CRÍTICO: RETORNAR INMEDIATAMENTE - NO continuar con fallback
      console.log('[IntelligentEngine] ✅ Respuesta de agentes exitosa, retornando SIN fallback');
      
      // Convertir respuesta de agentes al formato esperado
      return {
        text: agentResponse.text,
        actions: agentResponse.actions || [],
        context: agentResponse.context || {},
        confidence: agentResponse.confidence || 0.8,
        metadata: agentResponse.metadata || undefined  // 🎯 PASAR METADATA DEL AGENTE
      };
    } catch (error) {
      console.error('[IntelligentEngine] ⚠️ Error con sistema de agentes, usando fallback:', error);
      // Solo continuar con fallback si hay error
    }

    // FALLBACK: Sistema anterior con IA
    console.log('[IntelligentEngine] 🔄 Usando sistema de fallback con IA');

    // Obtener o crear memoria de conversación
    const memory = this.getOrCreateMemory(chatId, userName);

    console.log('[IntelligentEngine] 🧠 Contexto ANTES de procesar:', {
      producto: memory.context.currentProduct?.name || 'ninguno',
      intencionPago: memory.context.paymentIntent || false,
      metodoPago: memory.context.preferredPaymentMethod || 'ninguno',
      mensajesEnMemoria: memory.messages.length
    });

    // Agregar mensaje del usuario a la memoria
    this.addToMemory(memory, 'user', message);

    // 🎯 OPTIMIZACIÓN: Evitar búsquedas duplicadas de productos
    // El sistema de agentes ya buscó productos, solo buscar si es necesario
    let relevantProducts: any[] = [];
    
    const lowerMessage = message.toLowerCase();
    const isPaymentMethodQuestion = 
      (lowerMessage.includes('método') || lowerMessage.includes('metodo')) &&
      (lowerMessage.includes('pago') || lowerMessage.includes('pagar'));
    
    const hasProductInContext = !!memory.context.currentProduct;
    
    if (isPaymentMethodQuestion && hasProductInContext) {
      // NO buscar productos, mantener el producto actual
      console.log('[IntelligentEngine] 🔒 Pregunta sobre métodos de pago - MANTENIENDO producto actual');
      relevantProducts = [memory.context.currentProduct];
    } else if (!hasProductInContext) {
      // Solo buscar si NO hay producto en contexto
      relevantProducts = await this.searchRelevantProducts(message, userId);
      console.log('[IntelligentEngine] 🔍 Productos encontrados:', relevantProducts.length);
    } else {
      // Ya hay producto en contexto, usarlo
      console.log('[IntelligentEngine] ♻️ Reutilizando producto en contexto:', memory.context.currentProduct.name);
      relevantProducts = [memory.context.currentProduct];
    }

    // Construir contexto enriquecido para la IA
    const systemPrompt = this.buildSystemPrompt(memory, relevantProducts);

    // Obtener respuesta razonada de la IA (con respaldo de conocimiento local)
    const aiResponse = await this.getIntelligentResponse(
      systemPrompt,
      memory.messages,
      message, // Consulta del usuario para guardar en conocimiento
      memory.context.currentProduct?.id, // ID del producto en contexto
      userId, // ID del usuario para búsqueda de productos
      chatId, // ID del chat para obtener memoria
      userName // Nombre del usuario
    );

    // Analizar la respuesta para extraer intenciones y actualizar contexto
    await this.updateContextFromResponse(memory, aiResponse, relevantProducts);

    console.log('[IntelligentEngine] 🧠 Contexto DESPUÉS de procesar:', {
      producto: memory.context.currentProduct?.name || 'ninguno',
      intencionPago: memory.context.paymentIntent || false,
      metodoPago: memory.context.preferredPaymentMethod || 'ninguno',
      mensajesEnMemoria: memory.messages.length
    });

    // Agregar respuesta a la memoria
    this.addToMemory(memory, 'assistant', aiResponse.text);

    // Generar acciones basadas en el contexto
    const actions = await this.generateActions(memory, aiResponse);

    console.log('[IntelligentEngine] ⚡ Acciones generadas:', actions.length);

    return {
      text: aiResponse.text,
      actions,
      context: memory.context,
      confidence: aiResponse.confidence
    };
  }

  /**
   * Construye el prompt del sistema con contexto completo
   */
  private buildSystemPrompt(
    memory: ConversationMemory,
    products: any[]
  ): string {
    const contextInfo = memory.context;
    const hasProducts = products.length > 0;

    let prompt = `Eres un asistente de ventas profesional para Tecnovariedades D&S.

🧠 INSTRUCCIONES GENERALES:
Representas la tienda Tecnovariedades D&S y debes responder como un asesor de ventas profesional, con lenguaje natural, amable y directo. Tu objetivo es guiar, informar y cerrar ventas, sin dar respuestas genéricas ni inventadas.

⚠️ REGLA CRÍTICA - NO INVENTAR:
- SOLO usa la información EXACTA de los productos listados abajo
- NUNCA inventes precios, descripciones o características
- Si un producto NO está en la lista, di "No tengo ese producto disponible"
- USA EXACTAMENTE el precio que aparece en la lista de productos
- USA EXACTAMENTE la descripción que aparece en la lista de productos

INFORMACIÓN DEL NEGOCIO:
- Nombre: Tecnovariedades D&S
- Vendemos: Laptops, computadores, motos, cursos digitales, megapacks
- Métodos de pago: MercadoPago, PayPal, Nequi, Daviplata
- Moneda: Pesos colombianos (COP)
- PRECIO MEGAPACKS INDIVIDUALES: $20.000 COP (SIEMPRE)
- PRECIO PACK COMPLETO 40 MEGAPACKS: $60.000 COP (SIEMPRE)

📚 ENTREGA DE CURSOS DIGITALES (INFORMACIÓN EXACTA):
Los cursos son pregrabados y se entregan de dos formas:

1. **Google Drive** 📁
   - Los cursos están alojados en Google Drive
   - Se envían directamente al correo Gmail del cliente
   - Acceso inmediato después de confirmar el pago
   - El cliente recibe un enlace de acceso a la carpeta compartida

2. **Hotmart** 🎓
   - También usamos la plataforma Hotmart para entrega
   - El cliente recibe acceso a través de Hotmart
   - Incluye área de miembros organizada
   - Acceso de por vida

**Proceso de entrega:**
- Después del pago, el cliente recibe un correo (verificar spam)
- El correo contiene el enlace de acceso a Google Drive o Hotmart
- Acceso de por vida a todo el contenido
- Puede descargar o ver online desde cualquier dispositivo

**IMPORTANTE**: NO inventes plataformas o métodos de entrega. Solo menciona Google Drive y Hotmart.

TU PERSONALIDAD Y ESTILO:
✅ Directo, amable y con seguridad
✅ No inventar información
✅ No dar respuestas vacías ("no sé", "no tengo esa info")
✅ Usar emojis y un tono conversacional ligero, pero profesional
✅ Priorizar respuestas cortas, claras y orientadas a resolver
- Entiendes el contexto de la conversación
- Recuerdas lo que el cliente ha preguntado antes
- Eres proactivo en ofrecer soluciones
- No pides información que ya tienes
- Formateas las respuestas de forma clara y organizada

📸 ENVÍO DE FOTOS:
⚠️ IMPORTANTE: SÍ PUEDES ENVIAR FOTOS
- Cuando el cliente pida fotos, di: "¡Claro! Te envío la foto del producto 📸"
- NUNCA digas "no puedo enviar fotos" o "no tengo acceso a fotos"
- El sistema enviará automáticamente las fotos del producto
- Mantén tu respuesta corta y confirma que las fotos van en camino

FORMATO DE RESPUESTAS:
✅ USA emojis relevantes (💻 📱 🏍️ 💰 📦 ✅ 🎯)
✅ USA negritas con * para destacar información importante
✅ Separa secciones con saltos de línea
✅ Usa viñetas o números para listas
✅ Mantén párrafos cortos (máximo 2-3 líneas)

Ejemplo de formato correcto:
- Claro! 😊 Te cuento sobre el *Portátil Acer A15*
- 💻 *Especificaciones:*
- • Procesador: Intel Core i5
- • RAM: 16GB
- • Almacenamiento: 512GB SSD
- • Pantalla: 15.6" Full HD
- 💰 *Precio:* $2.500.000 COP
- Te gustaría más información? 🤔

🎓 CURSOS DIGITALES - REGLAS ESPECÍFICAS:

1. IDENTIFICACIÓN DE PRODUCTOS:
   - Megapack de 40 cursos → también conocido como: "super megapack", "megapack completo", "megapack de 40 cursos", "megapack de 30 cursos" (todos equivalen al mismo producto, precio $60.000 COP)
   - Megapack por tema → ejemplos: "megapack de diseño gráfico", "megapack de programación", "megapack de marketing", "megapack de piano" (cada uno es un grupo de cursos específicos de una sola área)
   - Curso individual → cuando el cliente menciona solo un curso o nombre específico (ej. "curso de Excel", "curso de Photoshop", etc.)

2. COMPORTAMIENTO DE RESPUESTA:
   👉 Si el cliente pregunta por un curso específico: 
      - Muestra SOLO el nombre, precio EXACTO y descripción EXACTA del producto
      - NO inventes contenido, lecciones o características
      - USA EXACTAMENTE lo que está en la descripción del producto
      - NO preguntes nada al final
   👉 Si el cliente menciona "megapack": 
      - Muestra el nombre, precio EXACTO ($20.000) y descripción EXACTA
      - NO inventes contenido
   👉 Si el cliente menciona "super megapack", "todos los cursos" o "megapack completo": 
      - Ofrecer el megapack de 40 cursos ($60.000 COP) INMEDIATAMENTE
   👉 NUNCA preguntes "¿Te gustaría saber más?" o "¿Qué te parece?" o "¿Proceder con la compra?"
   👉 NUNCA ofrezcas otros productos a menos que el cliente EXPLÍCITAMENTE pregunte
   👉 TERMINA tu respuesta con la información del producto, SIN preguntas

💻 PRODUCTOS FÍSICOS (tecnología, accesorios, etc.) - REGLAS ESPECÍFICAS:

1. Si el cliente pide un producto con especificación concreta:
   👉 Responder SOLO sobre ese producto, con su descripción, precio y foto. (NO ofrecer otros a menos que pregunte).

2. Si el cliente pregunta de forma general (Ejemplo: "¿Tienes portátiles?", "¿Vendes mouses?", "¿Tienes impresoras?"):
   👉 Confirmar disponibilidad brevemente
   👉 Mostrar MÁXIMO 3-4 opciones en formato LIMPIO:
   
   Formato correcto para múltiples productos:
   ---
   Sí, tenemos portátiles disponibles! 💻
   
   Te muestro algunos modelos:
   
   📦 *Portátil Acer A15*
   • Intel Core i5, 16GB RAM, 512GB SSD
   • Pantalla 15.6" Full HD
   💰 $1.899.900 COP
   
   📦 *Portátil Asus Vivobook*
   • AMD Ryzen 7, 16GB RAM, 1TB SSD
   • Pantalla 15.6" Full HD
   💰 $2.179.900 COP
   
   📦 *Portátil Asus Vivobook 16*
   • Intel Core i7, 16GB RAM, 1TB SSD
   • Pantalla 16.0" Full HD
   💰 $2.449.900 COP
   
   ¿Te gustaría saber más sobre alguno? 🤔
   ---
   
   ⚠️ IMPORTANTE: Cuando muestres MÚLTIPLES productos:
   - NO envíes fotos (confunde al cliente)
   - Usa formato limpio con separadores
   - Máximo 3-4 productos
   - Información breve de cada uno
   - Pregunta cuál le interesa

🔧 SERVICIOS TÉCNICOS (reparación y mantenimiento):
   👉 Siempre preguntar: "¿Qué producto tiene o qué servicio necesita?"
   👉 Con base en eso, ofrecer: Diagnóstico o revisión del dispositivo. Agendar una cita en el taller o servicio técnico.
   👉 El objetivo es identificar el problema y programar la revisión.

📝 FORMATO DE RESPUESTAS - REGLAS DE ESPACIADO:

**IMPORTANTE**: Las respuestas deben ser LIGERAS y FÁCILES DE LEER:

1. PRIMERA RESPUESTA (cuando preguntan por un producto):
   - Saludo breve + Confirmacion de disponibilidad
   - Resumen corto (2-3 lineas maximo)
   - Precio
   - Pregunta si quiere mas informacion

2. SEGUNDA RESPUESTA (si pide mas informacion):
   - Ahora si, envia la descripcion completa
   - Usa separadores visuales (lineas) entre secciones
   - Agrupa informacion relacionada
   - Usa lineas separadoras para dividir secciones
   - Deja linea en blanco entre secciones
   - Agrupa informacion con titulos en MAYUSCULAS

3. ESPACIADO Y FORMATO:
   - Usa lineas separadoras entre secciones importantes
   - Deja linea en blanco entre secciones
   - Agrupa informacion con titulos en MAYUSCULAS
   - Usa emojis relevantes (precio, disponible, envio, etc.)
   - NO satures con demasiada informacion de golpe

4. PROGRESION DE INFORMACION:
   - Primera pregunta: Resumen corto
   - Mas informacion: Descripcion completa
   - Como pagar: Metodos de pago
   - Selecciona metodo: Link de pago

CONTEXTO ACTUAL DE LA CONVERSACIÓN:`;

    if (memory.userName) {
      prompt += `\n- Cliente: ${memory.userName}`;
    }

    if (contextInfo.currentProduct) {
      prompt += `\n- Producto en discusión: ${contextInfo.currentProduct.name} ($${contextInfo.currentProduct.price.toLocaleString('es-CO')} COP)`;
      prompt += `\n- ⚠️ CRÍTICO: Este es el ÚNICO producto que debes mencionar. NO menciones otros productos ni sus precios.`;
    }

    if (contextInfo.interestedProducts && contextInfo.interestedProducts.length > 0) {
      prompt += `\n- Productos que ha visto: ${contextInfo.interestedProducts.map(p => p.name).join(', ')}`;
    }

    if (contextInfo.lastQuery) {
      prompt += `\n- Última consulta: ${contextInfo.lastQuery}`;
    }

    if (contextInfo.paymentIntent) {
      prompt += `\n- El cliente ha mostrado intención de comprar`;
    }

    if (contextInfo.preferredPaymentMethod) {
      prompt += `\n- Método de pago preferido: ${contextInfo.preferredPaymentMethod}`;
    }

    if (contextInfo.needs && contextInfo.needs.length > 0) {
      prompt += `\n- Necesidades identificadas: ${contextInfo.needs.join(', ')}`;
    }

    if (hasProducts) {
      prompt += `\n\nPRODUCTOS RELEVANTES DISPONIBLES:\n`;
      products.slice(0, 5).forEach((product, idx) => {
        prompt += `\n${idx + 1}. ${product.name}`;
        prompt += `\n   - Precio: $${product.price.toLocaleString('es-CO')} COP`;
        if (product.description) {
          // Enviar descripción COMPLETA (hasta 2000 caracteres para no exceder límites)
          prompt += `\n   - Descripción COMPLETA: ${product.description.substring(0, 2000)}`;
        }
        if (product.stock !== null) {
          prompt += `\n   - Stock: ${product.stock > 0 ? 'Disponible' : 'Agotado'}`;
        }
        if (product.category) {
          prompt += `\n   - Categoría: ${product.category}`;
        }
        prompt += '\n';
      });
    }

    prompt += `\n\n⚠️ INSTRUCCIONES CRÍTICAS - PROHIBIDO INVENTAR:
1. USA SOLO LA INFORMACIÓN EXACTA DE LOS PRODUCTOS LISTADOS ARRIBA
2. NUNCA INVENTES: precios, descripciones, características, contenido
3. USA EL PRECIO EXACTO que aparece en la lista (NO lo cambies, NO lo inventes)
4. USA LA DESCRIPCIÓN EXACTA que aparece en la lista (NO agregues información)
5. Si hay productos disponibles, MUESTRA INMEDIATAMENTE:
   - Nombre EXACTO del producto
   - Precio EXACTO (tal como aparece en la lista)
   - Descripción EXACTA (tal como aparece en la lista)
6. CÉNTRATE EXCLUSIVAMENTE EN EL PRIMER PRODUCTO DE LA LISTA
7. NO menciones otros productos a menos que el cliente EXPLÍCITAMENTE pregunte
8. NO hagas preguntas al final como "¿Te gustaría saber más?" o "¿Proceder con la compra?"
9. TERMINA tu respuesta con la información del producto, SIN preguntas adicionales
10. Si el producto NO tiene descripción en la lista, di solo el nombre y precio, NO inventes contenido

**DETECCIÓN DE SOLICITUD DE MÉTODOS DE PAGO:**
7. Si el cliente pregunta CUALQUIERA de estas frases, usa [SHOW_ALL_PAYMENT_METHODS]:
   - "¿Cómo puedo pagar?"
   - "¿Qué métodos de pago tienen?"
   - "¿Cómo pago?"
   - "Métodos de pago"
   - "Formas de pago"
   - "¿Puedo pagar con...?"
   - "¿Aceptan...?"
   - "Quiero pagar"
   - "Voy a pagar"
   - "Proceder con el pago"
   - "Realizar el pago"
   - "Hacer el pago"
   - O CUALQUIER variación que indique que quiere saber cómo pagar

8. **IMPORTANTE**: Cuando detectes solicitud de métodos de pago, responde:
   "Perfecto 💪 Puedes pagarlo por los siguientes métodos 👇
   
   [SHOW_ALL_PAYMENT_METHODS]
   
   ¿Con cuál prefieres continuar? 😄"

9. Para productos digitales, la imagen se envía automáticamente (NO uses [SEND_IMAGE])
10. Sé natural y conversacional, pero PRECISO con la información del catálogo
11. NO digas "también tengo otro curso" o "tengo otras opciones" sin que el cliente lo pida
12. **MANTÉN EL CONTEXTO**: Si ya estás hablando de un producto, mantén ese contexto en toda la conversación
13. **DESPEDIDAS Y AGRADECIMIENTOS**: Si el cliente dice "gracias", "ok", "perfecto", "entendido" o se despide, responde de forma breve y amable SIN mencionar métodos de pago ni productos. Ejemplo: "¡De nada! 😊 Estoy aquí si necesitas algo más. ¡Que tengas un excelente día! 👋"

14. **SELECCIÓN DE MÉTODO DE PAGO**: Si acabas de mostrar los métodos de pago y el cliente responde con SOLO el nombre de uno, el sistema generará el link automáticamente.
   
   **TU RESPUESTA DEBE SER MUY BREVE (máximo 2 líneas):**
   
   Ejemplos de respuestas del cliente que activan link:
   - "MercadoPago" → Responde: "¡Perfecto! 💳 Aquí está tu link de pago:"
   - "PayPal" → Responde: "¡Perfecto! 💳 Aquí está tu link de pago:"
   - "Nequi" → Responde: "¡Perfecto! 📱 Aquí está el número:"
   - "Daviplata" → Responde: "¡Perfecto! 📱 Aquí está el número:"
   - "Transferencia" → Responde: "¡Perfecto! 🏦 Aquí están los datos:"
   
   **CRÍTICO - PROHIBIDO CUANDO EL CLIENTE SELECCIONA UN MÉTODO:**
   ❌ NO menciones Google Drive
   ❌ NO menciones Hotmart
   ❌ NO menciones certificados
   ❌ NO menciones "de dos formas"
   ❌ NO menciones "área de miembros"
   ❌ NO menciones "descargar o ver online"
   ❌ NO menciones "después de confirmar tu pago"
   ❌ NO menciones "recibirás el curso"
   ❌ NO inventes NINGUNA información adicional
   ❌ NO expliques el proceso de entrega
   
   **SOLO** di "¡Perfecto! 💳 Aquí está tu link de pago:" y el sistema agregará el link automáticamente.

FORMATO DE RESPUESTA (USA ESTE ESTILO):

Ejemplo 1 - PRIMERA RESPUESTA (Resumen corto):
Hola! Si, el Curso Completo de Piano esta disponible

Aprende piano desde cero hasta nivel avanzado con mas de 100 lecciones
Precio: $65.000 COP

Te gustaria conocer todo el contenido del curso?

Ejemplo 2 - Mostrar metodos de pago (con formato mejorado):
Perfecto! Puedes pagarlo por los siguientes metodos:

METODOS DE PAGO:

MercadoPago - Tarjeta, PSE o efectivo
PayPal - Tarjeta internacional
Nequi - Transferencia movil
Daviplata - Transferencia movil

Con cual prefieres continuar?

Ejemplo 3 - Generar link de pago (cuando el cliente CONFIRMA el metodo):
Cliente responde con SOLO el nombre del metodo: MercadoPago, PayPal, Nequi, Daviplata, Transferencia

Respuesta BREVE: Perfecto! Aqui esta tu enlace de pago

[PAYMENT_LINK:producto_id:mercadopago]

Una vez pagues, recibiras acceso inmediato

**CRÍTICO**: 
- Si el cliente responde con SOLO el nombre de un método de pago (sin hacer pregunta), es una CONFIRMACIÓN
- Genera el link INMEDIATAMENTE con respuesta BREVE (máximo 3 líneas)
- NO repitas información sobre entrega, Google Drive, Hotmart, certificados, etc.
- NO preguntes si quiere guía paso a paso
- Solo: Saludo breve + Link + Confirmación de acceso

**IMPORTANTE**: Si el cliente responde SOLO con el nombre del método (sin hacer pregunta), es una CONFIRMACIÓN - genera el link inmediatamente

**🚨 REGLA CRÍTICA - NO MEZCLAR PRODUCTOS:**
- NUNCA menciones información de un producto diferente al que está en contexto
- Si el producto en contexto es "Curso Completo de Piano", SOLO habla de ese curso
- Si el producto en contexto es "Mega Pack 09", SOLO habla de ese megapack
- NO mezcles precios de diferentes productos
- NO mezcles descripciones de diferentes productos
- USA SOLO el nombre, precio y descripción del producto ACTUAL en contexto
- Cuando muestres métodos de pago, USA SOLO el nombre y precio del producto ACTUAL

Ejemplo 4 - SEGUNDA RESPUESTA (Informacion completa con formato):
Claro! Te cuento todo sobre el curso:

CONTENIDO COMPLETO:

[AQUI USA TODA LA DESCRIPCION COMPLETA DEL CATALOGO - No resumas, da todos los detalles]

PRECIO Y ACCESO:

Precio: $65.000 COP
Acceso: De por vida
Acceso vitalicio

Te gustaria proceder con la compra?

Ejemplo 5 - Multiples productos (PRESENTA SOLO EL PRIMERO con resumen corto):
Hola! Si, el Curso Completo de Piano esta disponible

Curso completo desde nivel basico hasta avanzado
Precio: $65.000 COP

Te gustaria conocer el contenido completo?

Ejemplo 6 - Despedida o Agradecimiento (NO MENCIONAR METODOS DE PAGO):
Cliente: Muchas gracias o Ok, gracias o Perfecto, entendido
Respuesta: De nada! Estoy aqui si necesitas algo mas. Que tengas un excelente dia!

IMPORTANTE: NO menciones metodos de pago ni productos cuando el cliente se despide o agradece.

Ejemplo 7 - Pregunta sobre entrega del curso:
Cliente: Como recibo el curso despues de pagar?
Respuesta: Despues de confirmar tu pago, recibiras el curso de dos formas:

Google Drive:
- Te enviaremos un enlace directo a tu correo Gmail
- Acceso inmediato a todos los videos y materiales
- Puedes descargar o ver online

Hotmart:
- Tambien recibiras acceso a traves de Hotmart
- Area de miembros organizada
- Acceso de por vida

Acceso de por vida
Desde cualquier dispositivo
Soporte incluido

Recuerda revisar tu bandeja de spam si no ves el correo.

Tienes alguna otra pregunta?

REGLAS CRITICAS DE COMPORTAMIENTO:

1. PRODUCTO ESPECIFICO: Si el cliente pregunta por un producto especifico, dar informacion SOLO de ese producto. NO mencionar otros productos. NO decir "tambien tengo", "tengo otros", "productos similares", etc.

2. ENFOQUE TOTAL: Cuando hablas de un producto, habla MARAVILLAS de el. Convence al cliente de lo increible que es ESE producto. NO distraigas mencionando otros.

3. PREGUNTA GENERAL: Si el cliente pregunta de forma general (ej: "tienes laptops?"), preguntar que tipo busca ANTES de mostrar opciones.

4. MAS INFORMACION: Si el cliente pide "mas informacion", usar TODA LA DESCRIPCION COMPLETA del catalogo del producto actual. NO resumir. NO mencionar otros productos.

5. SERVICIOS TECNICOS: SIEMPRE preguntar primero que necesita antes de ofrecer algo.

6. NO INVENTAR: NO inventar informacion que no este en el catalogo.

7. PALABRAS CLAVE INTERNAS: Las palabras clave son para uso interno del sistema. NUNCA mostrarlas al cliente. NO decir "Palabras clave: megapack completo, super megapack..."

8. UN PRODUCTO A LA VEZ: El cliente pidio UN producto. Enfocate en ESE. Habla de sus beneficios, ventajas, contenido. Convencelo de comprarlo. NO menciones que tienes otros productos.

USA ESTE FORMATO CON EMOJIS Y ORGANIZACIÓN CLARA.`;

    return prompt;
  }

  /**
   * Obtiene respuesta inteligente con prioridad:
   * 1. Ollama (local, ilimitado)
   * 2. Groq (8 API keys con rotación)
   * 3. Base de conocimiento local
   * 4. Búsqueda directa de productos (sin IA)
   */
  private async getIntelligentResponse(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    userQuery?: string,
    productId?: string,
    userId?: string,
    chatId?: string,
    userName?: string
  ) {
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    // 🚀 PRIORIDAD 1: Intentar con Groq (rápido, preciso, rotación de 8 API keys)
    console.log('[IntelligentEngine] 🚀 Intentando con Groq (llama-3.3-70b)...');
    
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      try {
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9
        });

        const text = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';
        const baseConfidence = completion.choices[0]?.finish_reason === 'stop' ? 0.9 : 0.7;

        console.log(`[IntelligentEngine] ✅ Respuesta generada con Groq (API key #${this.currentKeyIndex + 1})`);

        // 🎯 NUEVO: Aplicar razonamiento inteligente
        let finalText = text;
        let finalConfidence = baseConfidence;
        
        try {
          // Obtener memoria para contexto
          const memory = chatId ? this.getOrCreateMemory(chatId, userName) : null;
          
          // Ejecutar razonamiento inteligente
          const reasoning = await IntelligentReasoningEngine.reason({
            userMessage: userQuery || '',
            conversationHistory: memory?.messages || [],
            currentTopic: memory?.context.currentProduct?.name,
            currentProduct: memory?.context.currentProduct,
            businessInfo: {
              name: 'Tecnovariedades D&S',
              products: ['laptops', 'cursos', 'megapacks', 'motos'],
              services: ['venta', 'soporte']
            }
          });
          
          console.log('[IntelligentEngine] 🧠 Razonamiento:', reasoning.reasoning);
          console.log('[IntelligentEngine] 🎯 Confianza razonamiento:', (reasoning.confidence * 100).toFixed(0) + '%');
          
          // 🎯 NUEVO: Si detecta pregunta ambigua o indirecta, INTERPRETAR la intención
          if (reasoning.isOffTopic || reasoning.intent === 'general_query') {
            console.log('[IntelligentEngine] 💡 Interpretando intención implícita del usuario');
            const interpretedResponse = IntelligentReasoningEngine.interpretImplicitIntent(
              userQuery || '',
              { name: 'Tecnovariedades D&S' }
            );
            finalText = interpretedResponse;
            finalConfidence = 0.85; // Alta confianza en interpretación
          } else {
            // 🎯 NUEVO: Mejorar respuesta con lenguaje natural
            finalText = NaturalLanguageEnhancer.enhance(text, {
              includeGreeting: true,
              addEmphasis: true,
              conversationalTone: true,
              productContext: memory?.context.currentProduct ? {
                name: memory.context.currentProduct.name,
                category: memory.context.currentProduct.category,
                price: memory.context.currentProduct.price
              } : undefined
            });
            
            // Validar que la respuesta esté completa
            const validation = NaturalLanguageEnhancer.validateResponse(finalText);
            if (!validation.isValid) {
              console.log('[IntelligentEngine] ⚠️ Respuesta no válida:', validation.reason);
              // Usar respuesta original si la mejorada no es válida
              finalText = text;
            } else {
              console.log('[IntelligentEngine] ✨ Respuesta mejorada con lenguaje natural');
            }
            
            // Ajustar confianza basándose en el razonamiento
            finalConfidence = (baseConfidence + reasoning.confidence) / 2;
          }
        } catch (reasoningError) {
          console.error('[IntelligentEngine] ⚠️ Error en razonamiento/mejora:', reasoningError);
          // Usar respuesta original si hay error
          finalText = text;
          finalConfidence = baseConfidence;
        }

        // 🧠 GUARDAR RESPUESTA EXITOSA EN BASE DE CONOCIMIENTO
        if (finalConfidence > 0.7 && userQuery) {
          await LocalKnowledgeBase.saveSuccessfulResponse({
            userQuery,
            botResponse: finalText,
            productId,
            confidence: finalConfidence
          }).catch(err => console.error('[IntelligentEngine] Error guardando conocimiento:', err));
        }

        return { text: finalText, confidence: finalConfidence };
      } catch (error: any) {
        // Si es rate limit (429), rotar a la siguiente key
        if (error?.status === 429 && attempt < this.apiKeys.length - 1) {
          console.log(`[IntelligentEngine] ⚠️ Rate limit en API key #${this.currentKeyIndex + 1}, rotando a la siguiente...`);
          this.rotateApiKey();
          continue; // Intentar con la siguiente key
        }
        
        // Si es el último intento o no es rate limit
        console.error('[IntelligentEngine] ❌ Error con Groq:', error.message || error);
        
        // Si no es el último intento, continuar
        if (attempt < this.apiKeys.length - 1) {
          console.log('[IntelligentEngine] 🔄 Intentando con siguiente API key...');
          this.rotateApiKey();
          continue;
        }
      }
    }

    // �  PRIORIDAD 2: Intentar con Ollama (fallback, gratis e ilimitado)
    if (process.env.OLLAMA_ENABLED === 'true') {
      try {
        console.log('[IntelligentEngine] 🤖 Groq agotado, intentando con Ollama (gemma:2b)...');
        
        const ollamaResponse = await OllamaService.generateResponse({
          systemPrompt,
          messages
        });

        if (ollamaResponse && ollamaResponse.text) {
          console.log('[IntelligentEngine] ✅ Respuesta generada con Ollama exitosamente');
          
          // Guardar respuesta exitosa en base de conocimiento
          if (ollamaResponse.confidence > 0.7 && userQuery) {
            await LocalKnowledgeBase.saveSuccessfulResponse({
              userQuery,
              botResponse: ollamaResponse.text,
              productId,
              confidence: ollamaResponse.confidence
            }).catch(err => console.error('[IntelligentEngine] Error guardando:', err));
          }

          return ollamaResponse;
        } else {
          console.log('[IntelligentEngine] ⚠️ Ollama tampoco retornó respuesta válida');
        }
      } catch (error: any) {
        console.log('[IntelligentEngine] ⚠️ Error con Ollama:', error.message || 'Error desconocido');
      }
    }

    // 🧠 PRIORIDAD 3: Base de conocimiento local (último recurso)
    console.log('[IntelligentEngine] 🧠 Todas las APIs fallaron, buscando en base de conocimiento local...');
    
    if (userQuery) {
      const localResponse = await LocalKnowledgeBase.findSimilarResponse({
        userQuery,
        productId
      });

      if (localResponse) {
        console.log(`[IntelligentEngine] ✅ Respuesta encontrada en base de conocimiento (${(localResponse.confidence * 100).toFixed(0)}% confianza)`);
        return {
          text: localResponse.response,
          confidence: localResponse.confidence
        };
      } else {
        console.log('[IntelligentEngine] ⚠️ No se encontró respuesta similar en base de conocimiento');
      }
    }

    // 🔍 PRIORIDAD 4: Detectar solicitud de pago (ANTES de buscar productos)
    const memory = chatId ? this.getOrCreateMemory(chatId, userName) : null;
    const isPaymentRequest = userQuery?.toLowerCase().includes('link') && 
                             (userQuery?.toLowerCase().includes('pago') || 
                              userQuery?.toLowerCase().includes('pagar') ||
                              userQuery?.toLowerCase().includes('comprar'));
    
    if (isPaymentRequest && memory?.context.currentProduct) {
      console.log('[IntelligentEngine] 💳 Solicitud de pago detectada con producto en contexto');
      console.log('[IntelligentEngine] Producto:', memory.context.currentProduct.name);
      console.log('[IntelligentEngine] Método preferido:', memory.context.preferredPaymentMethod || 'ninguno');
      
      // Generar respuesta con link de pago
      const product = memory.context.currentProduct;
      let response = `Perfecto! Aqui esta tu enlace de pago para ${product.name}:\n\n`;
      response += `Precio: $${product.price.toLocaleString('es-CO')} COP\n\n`;
      
      // Si tiene método preferido, mencionar ese
      if (memory.context.preferredPaymentMethod) {
        response += `Metodo: ${memory.context.preferredPaymentMethod.toUpperCase()}\n\n`;
      }
      
      response += `[PAYMENT_LINK:${product.id}:${memory.context.preferredPaymentMethod || 'mercadopago'}]\n\n`;
      response += `Una vez pagues, recibiras acceso inmediato!`;
      
      return {
        text: response,
        confidence: 0.9,
        context: {
          currentProduct: product,
          paymentIntent: true,
          preferredPaymentMethod: memory.context.preferredPaymentMethod
        }
      };
    }
    
    // 🔍 PRIORIDAD 5: Búsqueda directa de productos (sin IA)
    console.log('[IntelligentEngine] 🔍 Buscando productos directamente en la base de datos...');
    
    if (!userId) {
      console.log('[IntelligentEngine] ⚠️ No hay userId disponible para búsqueda local');
      return {
        text: '¡Hola! 😊 Disculpa, estoy experimentando problemas técnicos temporales. Por favor, intenta de nuevo en unos minutos o contáctanos directamente al +57 300 556 0186.',
        confidence: 0.3
      };
    }
    
    const foundProducts = await this.searchRelevantProducts(userQuery || '', userId);
    
    if (foundProducts.length > 0) {
      console.log(`[IntelligentEngine] ✅ Encontrados ${foundProducts.length} productos, generando respuesta local...`);
      
      // CRITICO: Usar el producto en contexto si existe (para consistencia con imagen)
      const memory = chatId ? this.getOrCreateMemory(chatId, userName) : null;
      const product = memory?.context.currentProduct || foundProducts[0];
      
      console.log('[IntelligentEngine] Producto para respuesta:', product.name);
      console.log('[IntelligentEngine] Producto en contexto:', memory?.context.currentProduct?.name || 'ninguno');
      
      let response = `¡Claro! 😊 Tengo información sobre *${product.name}*\n\n`;
      
      if (product.description) {
        response += `📝 *Descripción:*\n${product.description}\n\n`;
      }
      
      response += `💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP\n`;
      response += `📦 *Categoría:* ${product.category}\n\n`;
      
      // NO mencionar otros productos - enfocarse solo en el que pidio
      
      response += `¿Te interesa este producto? Puedo darte más información o los métodos de pago 😊`;
      
      return {
        text: response,
        confidence: 0.7,
        context: {
          currentProduct: {
            id: product.id,
            name: product.name,
            price: product.price
          }
        }
      };
    }

    // 🗣️ INTENTAR CON EJEMPLOS CONVERSACIONALES
    console.log('[IntelligentEngine] 🗣️ Intentando con ejemplos conversacionales...');

    try {
      const conversationalResponse = userQuery ? await this.getConversationalFallback(userQuery, chatId, userName) : null;
      if (conversationalResponse) {
        console.log('[IntelligentEngine] ✅ Respuesta generada desde ejemplos conversacionales');
        return conversationalResponse;
      }
    } catch (error) {
      console.log('[IntelligentEngine] ⚠️ Error con ejemplos conversacionales:', error);
    }

    // ❌ ÚLTIMO RECURSO: Respuesta genérica cuando todo falla
    console.log('[IntelligentEngine] ❌ Todas las opciones agotadas (Ollama, Groq, Base de conocimiento, Búsqueda local, Conversacional)');

    return {
      text: '¡Hola! 😊 Disculpa, estoy experimentando problemas técnicos temporales. Por favor, intenta de nuevo en unos minutos o contáctanos directamente al +57 300 556 0186.',
      confidence: 0.3
    };
  }

  /**
   * Busca productos relevantes con búsqueda fuzzy tolerante a errores
   */
  private async searchRelevantProducts(query: string, userId: string): Promise<any[]> {
    try {
      console.log('[IntelligentEngine] 🔍 Buscando productos con búsqueda fuzzy:', query);

      // Importar búsqueda fuzzy
      const { FuzzyProductSearch } = await import('./fuzzy-product-search');

      // Obtener todos los productos disponibles  
      const allProducts = await prisma.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE'
        },
        select: {
          id: true,
          name: true,
          price: true,
          category: true,
          description: true,
          images: true,
          smartTags: true,
          stock: true
        },
        take: 200
      });

      console.log(`[IntelligentEngine] 📦 Productos en BD: ${allProducts.length}`);

      // Usar búsqueda fuzzy (tolerante a errores)
      const fuzzyResults = FuzzyProductSearch.search(query, allProducts, {
        minSimilarity: 60,  // 60% de similitud mínima
        maxResults: 5,
        includePartial: true
      });

      if (fuzzyResults.length > 0) {
        console.log(`[IntelligentEngine] ✅ Encontrados ${fuzzyResults.length} productos con fuzzy search`);
        return fuzzyResults.map(r => ({
          ...r.product,
          images: r.product.images ? JSON.parse(r.product.images as any) : []
        }));
      }

      // Si no hay resultados con fuzzy search, sugerir productos populares
      console.log('[IntelligentEngine] ⚠️ Sin resultados fuzzy, sugiriendo productos populares');
      const suggestions = FuzzyProductSearch.generateSuggestions(query, allProducts, 3);
      
      if (suggestions.length > 0) {
        console.log(`[IntelligentEngine] 💡 Sugiriendo ${suggestions.length} productos relacionados`);
        return suggestions.map(p => ({
          ...p,
          images: p.images ? JSON.parse(p.images as any) : []
        }));
      }

      // Último fallback: productos más recientes
      console.log('[IntelligentEngine] 📋 Mostrando productos recientes como fallback');
      return allProducts.slice(0, 3).map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images as any) : []
      }));

    } catch (error) {
      console.error('[IntelligentEngine] ❌ Error en búsqueda fuzzy:', error);
      return [];
    }
  }

  /**
   * Extrae palabras clave del mensaje de forma inteligente
   * MEJORADO: Usa el traductor de intenciones para razonamiento profundo
   */
  private async extractKeywordsWithIntent(text: string): Promise<string[]> {
    // 🧠 USAR TRADUCTOR DE INTENCIONES PRIMERO
    const { IntentTranslator } = await import('./intent-translator');
    const translation = IntentTranslator.translate(text);
    
    console.log('[IntelligentEngine] 🧠 Razonamiento:', translation.reasoning);
    console.log('[IntelligentEngine] 🎯 Confianza:', (translation.confidence * 100).toFixed(0) + '%');
    
    // Si la traducción tiene alta confianza, usar esos términos
    if (translation.confidence > 0.6 && translation.translatedTerms.length > 0) {
      console.log('[IntelligentEngine] ✅ Usando términos traducidos:', translation.translatedTerms);
      return translation.translatedTerms;
    }
    
    // Fallback: extracción básica
    return this.extractKeywords(text);
  }
  
  /**
   * Extrae palabras clave básicas (fallback)
   */
  private extractKeywords(text: string): string[] {
    
    // Fallback: extracción básica de palabras clave
    const stopWords = [
      'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'y', 'o', 
      'para', 'con', 'por', 'que', 'me', 'te', 'se', 'su', 'sus', 'al',
      'hola', 'buenos', 'días', 'tardes', 'noches', 'quiero', 'necesito',
      'busco', 'interesa', 'información', 'sobre', 'más', 'favor', 'tienes',
      'tiene', 'hay', 'muy', 'buenas', 'buena', 'estoy', 'interesado', 'interesada'
    ];
    
    // Limpiar el texto
    const cleanText = text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[¿?¡!.,;:]/g, '') // Quitar puntuación
      .trim();
    
    // Detectar frases compuestas importantes PRIMERO
    const phrases: string[] = [];
    
    // Buscar "megapack" o "mega pack" + número
    const megapackMatch = cleanText.match(/mega\s*pack\s*(\d+)/);
    if (megapackMatch) {
      phrases.push('mega', 'pack', megapackMatch[1]);
    } else if (cleanText.includes('megapack') || cleanText.includes('mega pack')) {
      phrases.push('mega', 'pack');
    }
    
    // Buscar "curso de [tema]"
    const cursoMatch = cleanText.match(/curso\s+(?:de\s+)?(\w+)/);
    if (cursoMatch) {
      phrases.push('curso', cursoMatch[1]);
    } else if (cleanText.includes('curso')) {
      phrases.push('curso');
    }
    
    // Detectar temas específicos importantes
    const temas = ['ingles', 'inglés', 'diseño', 'diseno', 'programacion', 'programación', 
                   'marketing', 'excel', 'office', 'fotografia', 'fotografía', 'video',
                   'piano', 'musica', 'música', 'hacking', 'arquitectura', 'gastronomia',
                   'gastronomía', 'wordpress', 'android', 'reparacion', 'reparación'];
    
    temas.forEach(tema => {
      if (cleanText.includes(tema)) {
        phrases.push(tema);
      }
    });
    
    // Extraer palabras individuales
    const words = cleanText
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Combinar frases detectadas con palabras individuales (priorizar frases)
    const allKeywords = [...new Set([...phrases, ...words])];
    
    return allKeywords.slice(0, 10);
  }
    
  

  /**
   * Actualiza el contexto basado en la respuesta de la IA Y el mensaje del usuario
   */
  private async updateContextFromResponse(
    memory: ConversationMemory,
    aiResponse: any,
    products: any[]
  ) {
    const text = aiResponse.text.toLowerCase();
    const lastUserMessage = memory.messages[memory.messages.length - 1]?.content.toLowerCase() || '';

    console.log('[IntelligentEngine] 🔄 Actualizando contexto...');
    console.log('   Producto actual ANTES:', memory.context.currentProduct?.name || 'ninguno');
    console.log('   Productos encontrados:', products.length);

    // Detectar intención de pago (tanto en respuesta como en mensaje del usuario)
    if (
      text.includes('link') ||
      text.includes('pagar') ||
      text.includes('comprar') ||
      text.includes('payment_link') ||
      lastUserMessage.includes('pagar') ||
      lastUserMessage.includes('comprar') ||
      lastUserMessage.includes('método') ||
      lastUserMessage.includes('metodo')
    ) {
      memory.context.paymentIntent = true;
      console.log('[IntelligentEngine] 💳 Intención de pago detectada');
    }

    // Detectar método de pago mencionado (PRIORIDAD AL MENSAJE DEL USUARIO)
    const paymentMethodDetected = this.detectPaymentMethod(lastUserMessage) || this.detectPaymentMethod(text);
    
    if (paymentMethodDetected) {
      memory.context.preferredPaymentMethod = paymentMethodDetected;
      console.log(`[IntelligentEngine] 💳 Método de pago detectado: ${paymentMethodDetected}`);
    }

    // CRÍTICO: Solo actualizar el producto si hay productos nuevos Y no hay producto actual
    // O si el usuario está preguntando EXPLÍCITAMENTE por un producto DIFERENTE
    if (products.length > 0) {
      const currentProductId = memory.context.currentProduct?.id;
      const newProductId = products[0]?.id;

      // Detectar si el usuario está en proceso de pago o preguntando por métodos
      const isInPaymentProcess = lastUserMessage.includes('pagar') || 
                                 lastUserMessage.includes('método') ||
                                 lastUserMessage.includes('metodo') ||
                                 lastUserMessage.includes('comprar') ||
                                 lastUserMessage.includes('precio') ||
                                 lastUserMessage.includes('link') ||
                                 lastUserMessage.includes('forma de pago') ||
                                 lastUserMessage.includes('mercadopago') ||
                                 lastUserMessage.includes('paypal') ||
                                 lastUserMessage.includes('nequi') ||
                                 lastUserMessage.includes('daviplata') ||
                                 memory.context.paymentIntent;

      if (!currentProductId) {
        // No hay producto actual, establecer el primero
        memory.context.currentProduct = products[0];
        memory.context.interestedProducts = products.slice(0, 3);
        memory.context.imageSent = undefined; // 🎯 RESETEAR flag de imagen
        console.log('[IntelligentEngine] ✅ Producto establecido:', products[0].name);
      } else if (isInPaymentProcess) {
        // CRÍTICO: Si está en proceso de pago, NUNCA cambiar el producto
        console.log('[IntelligentEngine] 🔒 Usuario en proceso de pago - BLOQUEANDO cambio de producto');
        console.log('   Producto actual (BLOQUEADO):', memory.context.currentProduct.name);
        console.log('   Producto detectado (IGNORADO):', products[0]?.name || 'ninguno');
        // NO hacer nada, mantener el producto actual
      } else if (currentProductId !== newProductId) {
        // Hay un producto diferente Y el usuario NO está en proceso de pago
        // Verificar si el usuario realmente quiere cambiar de producto
        const userWantsToChange = lastUserMessage.includes('otro') ||
                                  lastUserMessage.includes('diferente') ||
                                  lastUserMessage.includes('también') ||
                                  lastUserMessage.includes('además') ||
                                  lastUserMessage.includes('ahora') ||
                                  lastUserMessage.includes('mejor') ||
                                  (lastUserMessage.includes('tienes') && !isInPaymentProcess) ||
                                  (lastUserMessage.includes('hay') && !isInPaymentProcess);

        if (userWantsToChange) {
          console.log('[IntelligentEngine] 🔄 Usuario cambió de producto');
          console.log('   De:', memory.context.currentProduct.name);
          console.log('   A:', products[0].name);
          memory.context.currentProduct = products[0];
          memory.context.interestedProducts = products.slice(0, 3);
          memory.context.paymentIntent = false; // Resetear intención de pago
          memory.context.imageSent = undefined; // 🎯 RESETEAR flag de imagen para el nuevo producto
        } else {
          // Mantener el producto actual si el usuario solo está preguntando algo general
          console.log('[IntelligentEngine] ✅ Manteniendo producto actual (pregunta general):', memory.context.currentProduct.name);
        }
      } else {
        // Mantener el producto actual
        console.log('[IntelligentEngine] ✅ Manteniendo producto actual:', memory.context.currentProduct.name);
      }
    }

    console.log('   Producto actual DESPUÉS:', memory.context.currentProduct?.name || 'ninguno');

    // Actualizar timestamp (pero NO resetear la memoria)
    memory.lastUpdate = Date.now();
  }

  /**
   * Detecta el método de pago en un texto
   */
  private detectPaymentMethod(text: string): string | null {
    const lowerText = text.toLowerCase().trim();
    
    // Detección exacta de métodos de pago
    if (lowerText.includes('mercadopago') || lowerText.includes('mercado pago') || lowerText === 'mercado pago') {
      return 'mercadopago';
    }
    if (lowerText.includes('paypal') || lowerText === 'paypal') {
      return 'paypal';
    }
    if (lowerText.includes('nequi') || lowerText === 'nequi') {
      return 'nequi';
    }
    if (lowerText.includes('daviplata') || lowerText === 'daviplata') {
      return 'daviplata';
    }
    
    return null;
  }

  /**
   * Genera acciones basadas en el contexto
   */
  private async generateActions(memory: ConversationMemory, aiResponse: any) {
    const actions: any[] = [];

    // Detectar si necesita mostrar TODOS los métodos de pago
    const showAllPaymentMethodsMatch = aiResponse.text.match(/\[SHOW_ALL_PAYMENT_METHODS\]/);
    const lastUserMessage = memory.messages[memory.messages.length - 1]?.content.toLowerCase() || '';
    
    // Detectar mensajes de despedida/agradecimiento (NO enviar métodos de pago)
    const isFarewellMessage = 
      lastUserMessage.includes('gracias') ||
      lastUserMessage.includes('thank') ||
      lastUserMessage.includes('ok') ||
      lastUserMessage.includes('vale') ||
      lastUserMessage.includes('perfecto') ||
      lastUserMessage.includes('entendido') ||
      lastUserMessage.includes('adiós') ||
      lastUserMessage.includes('adios') ||
      lastUserMessage.includes('chao') ||
      lastUserMessage.includes('bye') ||
      (lastUserMessage.length < 10 && (lastUserMessage === 'si' || lastUserMessage === 'sí'));
    
    // Detectar preguntas sobre el proceso (NO enviar métodos de pago)
    const isProcessQuestion = 
      lastUserMessage.includes('cómo recibo') ||
      lastUserMessage.includes('como recibo') ||
      lastUserMessage.includes('después de pagar') ||
      lastUserMessage.includes('despues de pagar') ||
      lastUserMessage.includes('qué pasa después') ||
      lastUserMessage.includes('que pasa despues') ||
      lastUserMessage.includes('cómo funciona') ||
      lastUserMessage.includes('como funciona') ||
      lastUserMessage.includes('cuánto tarda') ||
      lastUserMessage.includes('cuanto tarda');
    
    // Detectar solicitud EXPLÍCITA de métodos de pago O links de pago
    const isPaymentMethodRequest = 
      !isFarewellMessage && 
      !isProcessQuestion && (
        showAllPaymentMethodsMatch ||
        lastUserMessage.includes('método') ||
        lastUserMessage.includes('metodo') ||
        lastUserMessage.includes('forma de pago') ||
        lastUserMessage.includes('formas de pago') ||
        lastUserMessage.includes('cómo pago') ||
        lastUserMessage.includes('como pago') ||
        lastUserMessage.includes('puedo pagar') ||
        lastUserMessage.includes('aceptan') ||
        lastUserMessage.includes('quiero pagar') ||
        (lastUserMessage === 'pago' || lastUserMessage === 'pagar') ||
        // NUEVO: Detectar solicitud explícita de link
        lastUserMessage.includes('enviar') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('envía') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('envíame') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('manda') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('dame') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('pasa') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('el link') ||
        lastUserMessage.includes('los links')
      );
    
    console.log('[IntelligentEngine] 🔍 Análisis de solicitud:', {
      esSolicitudMetodos: isPaymentMethodRequest,
      mensajeUsuario: lastUserMessage.substring(0, 50),
      tieneProducto: !!memory.context.currentProduct,
      productoActual: memory.context.currentProduct?.name || 'ninguno'
    });

    // 🎯 DETECTAR SI EL CLIENTE ESTÁ SELECCIONANDO UN MÉTODO ESPECÍFICO
    const selectedMethod = this.detectPaymentMethod(lastUserMessage);
    const isSelectingMethod = selectedMethod && memory.context.paymentIntent && memory.context.currentProduct;
    
    console.log('[IntelligentEngine] 🔍 Detección de selección:', {
      metodoDetectado: selectedMethod,
      estaSeleccionando: isSelectingMethod,
      tieneIntencionPago: memory.context.paymentIntent,
      tieneProducto: !!memory.context.currentProduct
    });

    // Si el cliente está SELECCIONANDO un método específico, generar link inmediatamente
    if (isSelectingMethod) {
      const product = memory.context.currentProduct;
      
      console.log('[IntelligentEngine] 💳 Cliente seleccionó método:', selectedMethod);
      console.log('[IntelligentEngine] 📦 Producto:', product.name);

      // Importar el generador de links
      const { PaymentLinkGenerator } = await import('./payment-link-generator');
      
      // Generar los links de pago
      const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);
      
      if (paymentLinks) {
        // Generar respuesta específica para el método seleccionado
        const methodResponse = PaymentLinkGenerator.generateMethodResponse(selectedMethod, paymentLinks);
        
        console.log('[IntelligentEngine] ✅ Link generado para método:', selectedMethod);
        
        actions.push({
          type: 'send_specific_payment_method',
          method: selectedMethod,
          product: product,
          paymentLinks: paymentLinks,
          formattedText: methodResponse
        });
      } else {
        console.error('[IntelligentEngine] ❌ Error generando link para:', selectedMethod);
        actions.push({
          type: 'send_text',
          text: '⚠️ Disculpa, hubo un problema generando el link de pago. Por favor intenta de nuevo.'
        });
      }
    }
    // Mostrar TODOS los métodos de pago disponibles (cuando pregunta por métodos)
    else if (isPaymentMethodRequest && memory.context.currentProduct) {
      const product = memory.context.currentProduct;

      console.log('[IntelligentEngine] 💳 Generando TODOS los métodos de pago para:', {
        productoID: product.id,
        productoNombre: product.name,
        productoPrecio: product.price
      });

      // CRÍTICO: Verificar que el producto es el correcto
      if (!product.id || !product.name || !product.price) {
        console.error('[IntelligentEngine] ❌ ERROR: Producto en contexto incompleto:', product);
        actions.push({
          type: 'send_text',
          text: '⚠️ Disculpa, hubo un problema identificando el producto. ¿Podrías decirme nuevamente qué producto te interesa?'
        });
        return actions;
      }

      // Importar el generador de links dinámicamente
      const { PaymentLinkGenerator } = await import('./payment-link-generator');
      
      // Generar los links de pago ESPECÍFICOS para este producto
      const paymentLinks = await PaymentLinkGenerator.generatePaymentLinks(product.id);
      
      if (paymentLinks) {
        // VERIFICACIÓN CRÍTICA: Asegurar que los links son del producto correcto
        if (paymentLinks.product.id !== product.id) {
          console.error('[IntelligentEngine] ❌ ERROR CRÍTICO: Los links generados son de un producto diferente!');
          console.error('   Producto esperado:', product.name, '(ID:', product.id, ')');
          console.error('   Producto recibido:', paymentLinks.product.name, '(ID:', paymentLinks.product.id, ')');
          
          actions.push({
            type: 'send_text',
            text: '⚠️ Disculpa, hubo un error generando los métodos de pago. Por favor intenta de nuevo.'
          });
          return actions;
        }

        console.log('[IntelligentEngine] ✅ Links generados correctamente para:', paymentLinks.product.name);

        // Usar las instrucciones completas que incluyen TODOS los métodos
        const allMethodsText = PaymentLinkGenerator.formatForWhatsApp(paymentLinks);
        
        actions.push({
          type: 'send_all_payment_methods',
          product: product,
          paymentLinks: paymentLinks,
          formattedText: allMethodsText
        });
      } else {
        console.error('[IntelligentEngine] ❌ No se pudieron generar los links de pago para:', product.name);
        actions.push({
          type: 'send_text',
          text: '⚠️ Disculpa, hubo un problema generando los métodos de pago. Por favor intenta de nuevo o contacta a soporte.'
        });
      }
    }

    // 📸 DETECTAR SOLICITUD EXPLÍCITA DE FOTOS
    const isExplicitPhotoRequest = 
      lastUserMessage.includes('foto') ||
      lastUserMessage.includes('imagen') ||
      lastUserMessage.includes('ver') && (lastUserMessage.includes('producto') || lastUserMessage.includes('como') || lastUserMessage.includes('cómo')) ||
      lastUserMessage.includes('muestra') ||
      lastUserMessage.includes('envía') && lastUserMessage.includes('foto') ||
      lastUserMessage.includes('envia') && lastUserMessage.includes('foto') ||
      lastUserMessage.includes('manda') && lastUserMessage.includes('foto') ||
      lastUserMessage.includes('pasa') && lastUserMessage.includes('foto');

    // 🎯 CRÍTICO: Detectar si la IA está mostrando MÚLTIPLES productos
    const isShowingMultipleProducts = aiResponse.text.includes('*') && 
                                      (aiResponse.text.match(/\*/g) || []).length > 4 && // Más de 2 productos con negritas
                                      (aiResponse.text.includes('modelos') || 
                                       aiResponse.text.includes('opciones') ||
                                       aiResponse.text.includes('portátiles') ||
                                       aiResponse.text.includes('productos'));

    // ENVÍO AUTOMÁTICO DE IMAGEN DEL PRODUCTO CORRECTO
    const currentProductId = memory.context.currentProduct?.id;
    const imageAlreadySent = memory.context.imageSent === currentProductId;
    
    console.log('[IntelligentEngine] 📸 Verificando envío de imagen:', {
      productoActual: memory.context.currentProduct?.name || 'ninguno',
      productoID: currentProductId,
      imagenYaEnviada: imageAlreadySent,
      tieneImagenes: !!memory.context.currentProduct?.images,
      solicitudExplicita: isExplicitPhotoRequest,
      mostrandoMultiples: isShowingMultipleProducts
    });
    
    // 🎯 REGLA CRÍTICA: NO enviar foto si está mostrando MÚLTIPLES productos
    // Solo enviar foto si:
    // 1. Hay UN SOLO producto en contexto
    // 2. NO está mostrando múltiples productos en el texto
    // 3. No se ha enviado antes O el usuario la solicita explícitamente
    // 4. El usuario NO está SOLO preguntando por link de pago
    
    const isOnlyAskingForPaymentLink = (
      (lastUserMessage.includes('link') || lastUserMessage.includes('enlace')) &&
      (lastUserMessage.includes('pago') || lastUserMessage.includes('pagar') || lastUserMessage.includes('comprar')) &&
      lastUserMessage.split(' ').length <= 5 // Mensaje corto tipo "dame el link de pago"
    );
    
    const shouldSendImage = memory.context.currentProduct && 
                           !isShowingMultipleProducts && // 🎯 NO enviar si muestra múltiples
                           (!imageAlreadySent || isExplicitPhotoRequest) && 
                           !isOnlyAskingForPaymentLink;
    
    if (shouldSendImage) {
      const product = memory.context.currentProduct;
      
      // Verificar que el producto tenga imágenes
      if (product.images && product.images.length > 0) {
        console.log('[IntelligentEngine] 📤 Enviando imagen del producto:', product.name);
        console.log('[IntelligentEngine] 🖼️ Imágenes:', product.images);
        console.log('[IntelligentEngine] 🆔 ID del producto:', product.id);
        
        actions.push({
          type: 'send_images',
          images: product.images,
          product: product
        });
        memory.context.imageSent = currentProductId; // Marcar con el ID del producto
      } else {
        console.log('[IntelligentEngine] ⚠️ Producto sin imágenes disponibles');
      }
    } else if (isShowingMultipleProducts) {
      console.log('[IntelligentEngine] 🚫 NO enviando foto - mostrando múltiples productos');
    } else if (imageAlreadySent) {
      console.log('[IntelligentEngine] ⏭️ Imagen ya enviada para este producto');
    } else if (isOnlyAskingForPaymentLink) {
      console.log('[IntelligentEngine] ⏭️ Usuario solo pide link de pago, no enviar imagen');
    } else if (!memory.context.currentProduct) {
      console.log('[IntelligentEngine] ⏭️ No hay producto en contexto');
    }

    return actions;
  }

  /**
   * Obtiene o crea memoria de conversación
   */
  private getOrCreateMemory(chatId: string, userName?: string): ConversationMemory {
    let memory = this.memories.get(chatId);

    // Solo crear nueva memoria si NO existe o si ha pasado más de 24 horas
    if (!memory) {
      console.log('[IntelligentEngine] 🆕 Creando nueva memoria para:', chatId);
      memory = {
        chatId,
        userName,
        messages: [],
        context: {},
        lastUpdate: Date.now()
      };
      this.memories.set(chatId, memory);
    } else if (Date.now() - memory.lastUpdate > this.MEMORY_DURATION) {
      console.log('[IntelligentEngine] ⏰ Memoria expirada (>24h), reseteando:', chatId);
      memory = {
        chatId,
        userName,
        messages: [],
        context: {},
        lastUpdate: Date.now()
      };
      this.memories.set(chatId, memory);
    } else {
      console.log('[IntelligentEngine] ♻️ Reutilizando memoria existente:', {
        chatId,
        mensajes: memory.messages.length,
        producto: memory.context.currentProduct?.name || 'ninguno',
        intencionPago: memory.context.paymentIntent || false,
        metodoPago: memory.context.preferredPaymentMethod || 'ninguno'
      });
    }

    if (userName && !memory.userName) {
      memory.userName = userName;
    }

    return memory;
  }

  /**
   * Agrega mensaje a la memoria
   */
  private addToMemory(
    memory: ConversationMemory,
    role: 'user' | 'assistant' | 'system',
    content: string
  ) {
    memory.messages.push({
      role,
      content,
      timestamp: Date.now()
    });

    // Mantener solo últimos 20 mensajes
    if (memory.messages.length > 20) {
      memory.messages = memory.messages.slice(-20);
    }
  }

  /**
   * Obtiene el contexto actual de una conversación
   */
  getContext(chatId: string) {
    const memory = this.memories.get(chatId);
    return memory?.context || {};
  }

  /**
   * Limpia la memoria de una conversación
   */
  clearMemory(chatId: string) {
    this.memories.delete(chatId);
  }

  /**
   * Genera respuesta usando ejemplos conversacionales
   */
  private async getConversationalFallback(
    userQuery: string,
    chatId?: string,
    userName?: string
  ): Promise<{ text: string; confidence: number } | null> {
    try {
      // Importar ejemplos conversacionales
      const { CONVERSATIONAL_EXAMPLES } = await import('./conversational-training-examples');

      const queryLower = userQuery.toLowerCase().trim();

      // Buscar el ejemplo más relevante
      let bestMatch: any = null;
      let bestScore = 0;

      for (const example of CONVERSATIONAL_EXAMPLES) {
        for (const exchange of example.conversacion) {
          if (exchange.rol === 'cliente') {
            const clienteMsg = exchange.mensaje.toLowerCase();

            // Calcular similitud
            let score = 0;

            // Coincidencia exacta
            if (clienteMsg === queryLower) {
              score = 100;
            }
            // Contiene palabras clave similares
            else {
              const queryWords = queryLower.split(/\s+/);
              const clienteWords = clienteMsg.split(/\s+/);

              const commonWords = queryWords.filter(word =>
                clienteWords.some(clienteWord =>
                  clienteWord.includes(word) || word.includes(clienteWord)
                )
              );

              score = (commonWords.length / Math.max(queryWords.length, clienteWords.length)) * 80;
            }

            if (score > bestScore && score > 40) {
              bestScore = score;
              bestMatch = {
                example,
                exchange,
                responseIndex: example.conversacion.indexOf(exchange) + 1
              };
            }
          }
        }
      }

      // Si encontramos un match, usar la respuesta del bot
      if (bestMatch && bestMatch.responseIndex < bestMatch.example.conversacion.length) {
        const botResponse = bestMatch.example.conversacion[bestMatch.responseIndex];

        if (botResponse.rol === 'bot') {
          console.log(`[ConversationalFallback] Usando ejemplo: ${bestMatch.example.titulo} (score: ${bestScore.toFixed(0)}%)`);

          return {
            text: botResponse.mensaje,
            confidence: 0.6 // Confianza moderada para ejemplos
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[ConversationalFallback] Error:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de la conversación
   */
  getStats(chatId: string) {
    const memory = this.memories.get(chatId);
    if (!memory) return null;

    return {
      messageCount: memory.messages.length,
      hasProduct: !!memory.context.currentProduct,
      paymentIntent: !!memory.context.paymentIntent,
      preferredMethod: memory.context.preferredPaymentMethod,
      duration: Date.now() - (memory.messages[0]?.timestamp || Date.now())
    };
  }
}

/**
 * Instancia singleton del motor
 */
let engineInstance: IntelligentConversationEngine | null = null;

export function getIntelligentEngine(): IntelligentConversationEngine {
  if (!engineInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY no está configurada');
    }
    engineInstance = new IntelligentConversationEngine(apiKey);
  }
  return engineInstance;
}
