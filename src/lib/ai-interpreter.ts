/**
 * 🧠 AI Interpreter - Intérprete Inteligente de Mensajes
 * 
 * Este servicio analiza PRIMERO el mensaje del cliente usando IA
 * y le dice al bot exactamente qué hacer. Así la IA entiende:
 * - La intención REAL del cliente (aunque escriba mal)
 * - El producto que busca (aunque use sinónimos o typos)
 * - El contexto de la conversación
 * - Qué acción debe tomar el bot
 * 
 * FLUJO:
 * 1. Cliente envía mensaje
 * 2. AI Interpreter analiza y extrae: intención, producto, acción
 * 3. Bot ejecuta la acción con datos precisos
 */

import Groq from 'groq-sdk'

// Cliente Groq
let groqClient: Groq | null = null
function getGroqClient(): Groq | null {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

// Tipos de intención que el bot puede manejar
export type IntentType = 
  | 'greeting'           // Saludo inicial
  | 'product_search'     // Busca un producto específico
  | 'category_browse'    // Quiere ver productos de una categoría
  | 'more_options'       // Quiere ver más opciones/referencias
  | 'product_info'       // Pregunta sobre un producto (ya en contexto)
  | 'price_inquiry'      // Pregunta por precio
  | 'payment_inquiry'    // Pregunta por métodos de pago
  | 'buy_intent'         // Quiere comprar
  | 'send_receipt'       // Va a enviar comprobante
  | 'receipt_sent'       // Ya envió comprobante
  | 'rejection'          // No le interesa / muy caro
  | 'contact_request'    // Pide contacto/ubicación
  | 'farewell'           // Se despide
  | 'general_question'   // Pregunta general
  | 'unknown'            // No se pudo determinar

// Resultado del análisis
export interface InterpretedMessage {
  intent: IntentType
  confidence: number // 0-1
  
  // Producto identificado (si aplica)
  productMatch?: {
    productId: string
    productName: string
    matchReason: string // "nombre exacto", "typo corregido", "sinónimo", etc.
  }
  
  // Categoría identificada (si aplica)
  categoryMatch?: {
    category: string
    keywords: string[]
  }
  
  // Datos extraídos del mensaje
  extractedData?: {
    budget?: { min?: number; max?: number }
    preferences?: string[]
    question?: string
  }
  
  // Acción sugerida para el bot
  suggestedAction: string
  
  // Respuesta sugerida (opcional, para casos simples)
  suggestedResponse?: string
}

/**
 * 🧠 Interpreta el mensaje del cliente usando IA
 */
export async function interpretMessage(
  message: string,
  products: Array<{ id: string; name: string; price: number; description?: string | null; category?: string }>,
  conversationContext?: {
    lastProduct?: { id: string; name: string; price: number } | null
    stage?: string
    history?: Array<{ role: string; content: string }>
  }
): Promise<InterpretedMessage> {
  
  const client = getGroqClient()
  
  // Si no hay Groq, usar análisis local básico
  if (!client) {
    console.log('⚠️ Groq no disponible, usando análisis local')
    return analyzeLocally(message, products, conversationContext)
  }
  
  try {
    console.log(`🧠 AI Interpreter analizando: "${message}"`)
    
    // Crear lista de productos para el contexto
    const productList = products.slice(0, 50).map((p, i) => 
      `${i + 1}. [ID:${p.id}] ${p.name} - ${p.price.toLocaleString('es-CO')} COP`
    ).join('\n')
    
    // Contexto de conversación
    const contextInfo = conversationContext?.lastProduct 
      ? `\nPRODUCTO EN CONTEXTO: ${conversationContext.lastProduct.name} (${conversationContext.lastProduct.price.toLocaleString('es-CO')} COP)`
      : ''
    
    const historyInfo = conversationContext?.history?.slice(-4).map(h => 
      `${h.role === 'user' ? 'Cliente' : 'Bot'}: ${h.content.substring(0, 100)}`
    ).join('\n') || ''

    const systemPrompt = `Eres un analizador de intenciones para un bot de ventas colombiano.

TU TAREA: Analizar el mensaje del cliente y extraer:
1. INTENCIÓN: Qué quiere hacer el cliente
2. PRODUCTO: Si menciona algún producto (aunque escriba mal)
3. ACCIÓN: Qué debe hacer el bot

CATÁLOGO DE PRODUCTOS (${products.length} disponibles):
${productList}
${contextInfo}

HISTORIAL RECIENTE:
${historyInfo || 'Sin historial'}

INTENCIONES POSIBLES:
- greeting: Saludo ("hola", "buenos días", "qué tal")
- product_search: Busca producto específico ("tienes laptops", "quiero el mega pack golden")
- category_browse: Quiere ver categoría ("muéstrame portátiles", "qué cursos tienes")
- more_options: Quiere más opciones ("tienes más", "otras referencias", "qué más hay")
- product_info: Pregunta sobre producto en contexto ("qué incluye", "cómo funciona")
- price_inquiry: Pregunta precio ("cuánto cuesta", "precio")
- payment_inquiry: Pregunta pago ("cómo pago", "métodos de pago", "aceptan nequi")
- buy_intent: Quiere comprar ("lo quiero", "sí", "dale", "me interesa comprarlo")
- send_receipt: Va a enviar comprobante ("te envío el recibo", "ya te mando")
- receipt_sent: Ya envió comprobante ("ya pagué", "aquí está el comprobante")
- rejection: No interesa ("no gracias", "muy caro", "lo pienso")
- contact_request: Pide contacto ("número", "dirección", "ubicación")
- farewell: Se despide ("gracias", "chao", "hasta luego")
- general_question: Otra pregunta
- unknown: No se puede determinar

CORRECCIÓN DE TYPOS - Entiende estas variaciones:
- "goldem/golder/goldenn" = "golden"
- "pino/pianos" = "piano"
- "exel/exsel/ecxel" = "excel"
- "ingles/englis" = "inglés"
- "tradign/traiding" = "trading"
- "megapak/mega pak" = "megapack"
- "portatil/laptop/notebook" = portátil
- "quieto/kiero" = "quiero"
- "conprarlo" = "comprarlo"

DETECCIÓN DE INTENCIONES IMPLÍCITAS:
- "quiero ganar dinero" → busca Trading o Marketing
- "algo para mi negocio" → busca Marketing, Excel
- "aprender música" → busca Piano
- "trabajar desde casa" → busca Diseño, Marketing

RESPONDE EN JSON EXACTO:
{
  "intent": "tipo_de_intencion",
  "confidence": 0.95,
  "productMatch": {
    "productId": "id_del_producto",
    "productName": "nombre exacto del catálogo",
    "matchReason": "razón del match"
  },
  "categoryMatch": {
    "category": "nombre_categoria",
    "keywords": ["palabra1", "palabra2"]
  },
  "extractedData": {
    "budget": { "min": 0, "max": 0 },
    "preferences": ["preferencia1"],
    "question": "pregunta extraída"
  },
  "suggestedAction": "descripción de qué debe hacer el bot",
  "suggestedResponse": "respuesta sugerida si es caso simple"
}

REGLAS:
1. Si el cliente menciona un producto, SIEMPRE incluye productMatch con el ID exacto del catálogo
2. Si hay producto en contexto y pregunta sobre él, usa product_info
3. Si dice "sí", "dale", "ok" después de ver producto, es buy_intent
4. Corrige typos automáticamente para encontrar productos
5. confidence debe reflejar qué tan seguro estás (0.5-1.0)`

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analiza este mensaje del cliente: "${message}"` }
      ],
      temperature: 0.1, // Muy bajo para respuestas consistentes
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content?.trim() || '{}'
    
    try {
      const parsed = JSON.parse(responseText)
      console.log(`✅ AI Interpreter resultado:`, {
        intent: parsed.intent,
        product: parsed.productMatch?.productName,
        action: parsed.suggestedAction?.substring(0, 50)
      })
      
      return {
        intent: parsed.intent || 'unknown',
        confidence: parsed.confidence || 0.5,
        productMatch: parsed.productMatch,
        categoryMatch: parsed.categoryMatch,
        extractedData: parsed.extractedData,
        suggestedAction: parsed.suggestedAction || 'Responder de forma general',
        suggestedResponse: parsed.suggestedResponse
      }
    } catch (parseError) {
      console.log('⚠️ Error parseando respuesta IA, usando análisis local')
      return analyzeLocally(message, products, conversationContext)
    }
    
  } catch (error: any) {
    console.log(`⚠️ Error AI Interpreter: ${error.message}`)
    return analyzeLocally(message, products, conversationContext)
  }
}

/**
 * Análisis local como fallback (sin IA)
 */
function analyzeLocally(
  message: string,
  products: Array<{ id: string; name: string; price: number; description?: string | null }>,
  context?: { lastProduct?: { id: string; name: string; price: number } | null }
): InterpretedMessage {
  
  const msg = message.toLowerCase().trim()
  
  // Detectar intención básica
  let intent: IntentType = 'unknown'
  
  if (/^(hola|buenos|buenas|hey|hi|qué tal|que tal)(\s|$|!)/i.test(msg)) {
    intent = 'greeting'
  } else if (/^(gracias|bye|adiós|adios|chao|hasta luego)(\s|$|!)/i.test(msg)) {
    intent = 'farewell'
  } else if (/(contacto|número|teléfono|dirección|ubicación|donde están)/i.test(msg)) {
    intent = 'contact_request'
  } else if (/(cómo pago|como pago|métodos de pago|nequi|daviplata|mercadopago|paypal)/i.test(msg)) {
    intent = 'payment_inquiry'
  } else if (/^(si|sí|ok|dale|listo|lo quiero|me interesa|quiero comprarlo)(\s|$|!|,)/i.test(msg)) {
    intent = context?.lastProduct ? 'buy_intent' : 'general_question'
  } else if (/(más referencias|otras opciones|qué más tienes|otros modelos)/i.test(msg)) {
    intent = 'more_options'
  } else if (/(ya pagué|comprobante|recibo|transferí)/i.test(msg)) {
    intent = 'receipt_sent'
  } else if (/(te envío|te mando|cuando tenga)/i.test(msg)) {
    intent = 'send_receipt'
  } else if (/(no gracias|muy caro|lo pienso|no puedo)/i.test(msg)) {
    intent = 'rejection'
  } else if (/(qué incluye|cómo funciona|para qué sirve|más info)/i.test(msg) && context?.lastProduct) {
    intent = 'product_info'
  } else {
    // Buscar producto
    const productMatch = findProductMatch(msg, products)
    if (productMatch) {
      intent = 'product_search'
      return {
        intent,
        confidence: 0.7,
        productMatch: {
          productId: productMatch.id,
          productName: productMatch.name,
          matchReason: 'coincidencia local'
        },
        suggestedAction: `Mostrar producto: ${productMatch.name}`
      }
    }
    
    intent = 'general_question'
  }
  
  return {
    intent,
    confidence: 0.6,
    suggestedAction: `Manejar intención: ${intent}`
  }
}

/**
 * Búsqueda local de producto (fallback)
 */
function findProductMatch(
  query: string,
  products: Array<{ id: string; name: string; price: number }>
): { id: string; name: string; price: number } | null {
  
  const queryLower = query.toLowerCase()
  
  // Correcciones de typos comunes
  const typoMap: Record<string, string> = {
    'goldem': 'golden', 'golder': 'golden',
    'pino': 'piano', 'exel': 'excel',
    'ingles': 'inglés', 'tradign': 'trading',
    'megapak': 'megapack', 'portatil': 'portátil'
  }
  
  let correctedQuery = queryLower
  for (const [typo, correct] of Object.entries(typoMap)) {
    correctedQuery = correctedQuery.replace(new RegExp(typo, 'g'), correct)
  }
  
  // Buscar coincidencia
  for (const product of products) {
    const nameLower = product.name.toLowerCase()
    
    // Coincidencia directa
    if (correctedQuery.includes(nameLower) || nameLower.includes(correctedQuery)) {
      return product
    }
    
    // Buscar palabras clave
    const keywords = correctedQuery.split(/\s+/).filter(w => w.length > 3)
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return product
      }
    }
  }
  
  return null
}

export default { interpretMessage }
