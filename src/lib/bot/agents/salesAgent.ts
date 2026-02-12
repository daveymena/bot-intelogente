// src/lib/bot/agents/salesAgent.ts
import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient, Product } from '@prisma/client';
import Groq from 'groq-sdk';
import { NumericSelectionDetector } from '../../numeric-selection-detector';
import { SharedMemoryService } from './shared-memory';

const prisma = new PrismaClient();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});
const sharedMemory = SharedMemoryService.getInstance();

interface IntentData {
  intent: string;
  confidence: number;
  entities?: {
    product?: string;
    category?: string;
    price?: string;
  };
}

/**
 * Agente de Ventas Profesional (Flujo Maestro)
 */
export async function handleSalesIntent(
  userId: string,
  customerPhone: string,
  message: string,
  intentData: IntentData,
  conversationId: string
): Promise<{ text: string; media?: string[] }> {
  try {
    // 1. Obtener conversación y producto actual
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { product: true }
    }) as any;

    if (!conversation) return { text: "Error de sistema." };

    const stage = conversation.currentStage;
    const currentProduct = conversation.product;

    // 🔢 DETECCIÓN DE SELECCIÓN NUMÉRICA (PRIORIDAD MÁXIMA)
    console.log(`[SalesAgent] Verificando selección numérica para: "${message}"`)
    
    // Obtener historial reciente para el detector
    const detectorMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    const detectorHistory = detectorMessages.reverse().map(m => ({
      role: m.direction === 'INCOMING' ? 'user' : 'assistant',
      content: m.content
    }))

    const numericSelection = await NumericSelectionDetector.detectSelection(
      message,
      detectorHistory,
      userId,
      customerPhone
    )

    if (numericSelection.isSelection && numericSelection.selectedProduct) {
      console.log(`[SalesAgent] ✅ Selección numérica detectada: ${numericSelection.selectedProduct.name}`)
      
      // Actualizar conversación con el producto seleccionado
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { 
          productId: numericSelection.selectedProduct.id,
          currentStage: 'viendo_producto',
          productName: numericSelection.selectedProduct.name
        } as any
      })

      // Preparar imágenes
      let media: string[] = []
      if (numericSelection.selectedProduct.images) {
        try {
          const parsed = JSON.parse(numericSelection.selectedProduct.images as string)
          media = Array.isArray(parsed) ? parsed : [numericSelection.selectedProduct.images as string]
        } catch (e) {
          media = [numericSelection.selectedProduct.images as string]
        }
      }

      // Retornar card del producto
      return {
        text: `📦 *${numericSelection.selectedProduct.name}*\n\n💰 Precio: ${numericSelection.selectedProduct.price.toLocaleString()} ${numericSelection.selectedProduct.currency}\n📦 Stock: ${numericSelection.selectedProduct.stock && numericSelection.selectedProduct.stock > 0 ? 'Disponible' : 'Bajo pedido'}\n🚚 Entrega: Envío a domicilio\n⏱ Tiempo: 2-4 días hábiles\n\n📋 ${numericSelection.selectedProduct.description || 'Producto de alta calidad'}\n\n¿Deseas saber algo específico? Puedes preguntarme:\n• Características\n• Garantía\n• Métodos de pago\n• Tiempo de entrega\n• Cómo comprar`,
        media
      }
    }

    // --- LÓGICA POR ETAPAS ---
    console.log(`[SalesAgent] Etapa: ${stage}, Producto actual: ${currentProduct?.name || 'Ninguno'}`);

    // PRIORIDAD: Intentar detectar un producto en el mensaje actual
    const rawMatch = intentData.entities?.product || extractProductNameManually(message);
    const productNameMatch = rawMatch ? rawMatch.toLowerCase().trim() : null;
    
    console.log(`[SalesAgent] Buscando producto por: "${productNameMatch}"`);

    let foundProduct: Product | null = null;

    if (productNameMatch) {
      // 1. INTENTO 1: Coincidencia de Nombre (Exacta o Empieza por) - Máxima prioridad
      foundProduct = await prisma.product.findFirst({
        where: {
          userId,
          status: 'AVAILABLE',
          OR: [
            { name: { equals: productNameMatch } },
            { name: { startsWith: productNameMatch } }
          ]
        },
        orderBy: { searchPriority: 'desc' }
      });

      // 2. INTENTO 2: Búsqueda por Relevancia (Scoring)
      if (!foundProduct) {
        // Limpiar puntuación y obtener keywords
        const cleanTerm = productNameMatch.replace(/[.,\/#!$%^&*;:{}=\-_`~()¿?]/g,"");
        const stopWords = ['de', 'el', 'la', 'los', 'las', 'un', 'una', 'con', 'para', 'del', 'que', 'tiene', 'precio', 'donde', 'como', 'quiero', 'busca', 'busco', 'tienes'];
        const keywords = cleanTerm.split(/\s+/)
          .filter(w => w.length > 2 && !stopWords.includes(w));

        if (keywords.length > 0) {
          console.log(`[SalesAgent] Reintentando con scoring de keywords: ${keywords.join(', ')}`);
          
          // Traemos candidatos que coincidan con AL MENOS UNA keyword
          // Quitamos el take: 20 para evaluar TODO el catálogo
          const candidates = await prisma.product.findMany({
            where: {
              userId,
              status: 'AVAILABLE',
              OR: keywords.map(kw => ({
                OR: [
                  { name: { contains: kw } },
                  { tags: { contains: kw } },
                  { description: { contains: kw } }
                ]
              }))
            }
          });

          console.log(`[SalesAgent] Candidatos encontrados en DB: ${candidates.length}`);

          if (candidates.length > 0) {
            // Calculamos score para cada candidato
            const scoredCandidates = candidates.map(p => {
              let score = 0;
              let matchedKeywords = 0;
              const nameLower = p.name.toLowerCase();
              const tagsLower = p.tags?.toLowerCase() || '';
              const descLower = p.description?.toLowerCase() || '';

              keywords.forEach(kw => {
                let matched = false;
                // Coincidencia en Nombre (Peso 40)
                if (nameLower.includes(kw)) { 
                  score += 40; 
                  matched = true; 
                  // Bonus por palabra completa en el nombre
                  if (nameLower.split(/\s+/).includes(kw)) score += 20;
                }
                // Coincidencia en Tags (Peso 10)
                if (tagsLower.includes(kw)) { score += 10; matched = true; }
                // Coincidencia en Descripción (Peso 1)
                if (descLower.includes(kw)) { score += 1; matched = true; }
                
                if (matched) matchedKeywords++;
              });

              // REGLA DE ORO: Multiplicamos el score por el CUBO de las palabras encontradas
              // Esto hace que coincidir 2 palabras sea MUCHO mejor que 1 sola muchas veces
              const finalScore = score * Math.pow(matchedKeywords, 3);

              return { product: p, score: finalScore, matchedKeywords };
            });

            // Ordenamos por score descendente
            scoredCandidates.sort((a, b) => b.score - a.score);
            
            console.log(`[SalesAgent] Top 5 candidatos para "${keywords.join(' ')}":`);
            scoredCandidates.slice(0, 5).forEach(c => {
              console.log(`- ${c.product.name}: Score ${c.score} (Match KWs: ${c.matchedKeywords})`);
            });
            
            // Solo aceptamos si tiene un score mínimo razonable y el mejor candidato destaca
            if (scoredCandidates[0].score >= 40) {
              foundProduct = scoredCandidates[0].product;
            }
          }
        }
      }

      // 3. ACTUALIZACIÓN DE CONTEXTO
      if (foundProduct && (!currentProduct || foundProduct.id !== currentProduct.id)) {
        console.log(`[SalesAgent] ¡Producto seleccionado!: ${foundProduct.name}`);
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { 
            productId: foundProduct.id,
            currentStage: 'viendo_producto',
            productName: foundProduct.name
          } as any
        });
      }
    }

    // SI el mensaje actual parece una pregunta de producto pero NO encontramos nada Y ya teníamos uno, 
    // debemos ser cuidadosos de no responder sobre el anterior si la pregunta no tiene sentido.
    const isAskingNewProduct = !!productNameMatch && !foundProduct;
    const activeProduct = foundProduct || (isAskingNewProduct ? null : currentProduct);
    const isAskingGeneral = intentData.intent === 'consulta_precio' || intentData.intent === 'consulta_disponibilidad';

    // 🎯 MANEJO DE SALUDOS (PRIORIDAD ALTA - en cualquier etapa)
    if (intentData.intent === 'saludo' && !foundProduct) {
      console.log(`[SalesAgent] Detectado saludo en etapa: ${stage}`)
      
      // Si ya hay un producto en contexto, saludar y recordar el producto
      if (currentProduct) {
        return { 
          text: `👋 ¡Hola de nuevo!\n\nEstábamos viendo el *${currentProduct.name}*.\n\n¿Deseas continuar con este producto o buscas algo diferente?` 
        }
      }
      
      // Saludo inicial sin producto
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { currentStage: 'buscando_producto' } as any
      })
      
      return { 
        text: `👋 ¡Hola! Bienvenido a *Tecnovariedades D&S*\n\n¿En qué puedo ayudarte hoy?\n\n1️⃣ Ver catálogo de productos\n2️⃣ Consultar precio\n3️⃣ Información de envío\n4️⃣ Hablar con un asesor\n\n💡 También puedes escribirme directamente el nombre del producto que buscas.` 
      }
    }

    // ETAPA 1: SALUDO / INICIO
    if (stage === 'saludo') {
      if ((foundProduct || isAskingGeneral) && activeProduct) {
        // Continuamos
      } else if (isAskingNewProduct) {
        return { text: `Lo siento, no logré encontrar ese producto en mi catálogo. 🧐\n\n¿Podrías decirme el nombre exacto?` };
      } else {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { currentStage: 'buscando_producto' } as any
        });
        return { text: `👋 Hola, bienvenido.\n¿En qué puedo ayudarte hoy?\n\n1️⃣ Ver productos\n2️⃣ Consultar precio\n3️⃣ Soporte\n4️⃣ Hablar con asesor\n\n👉 Puedes escribirme el nombre del producto que buscas directamente.` };
      }
    }

    // ETAPA 2 & 3: MOSTRAR CARD (Solo si es un descubrimiento nuevo o pregunta básica de precio/stock)
    const isNewFind = foundProduct && (!currentProduct || foundProduct.id !== currentProduct.id);
    const isBasicQuery = isAskingGeneral && foundProduct;

    if ((isNewFind || isBasicQuery) && stage !== 'interes_compra' && stage !== 'pago') {
      let media: string[] = [];
      if (activeProduct?.images) {
        try {
          const parsed = JSON.parse(activeProduct.images as string);
          media = Array.isArray(parsed) ? parsed : [activeProduct.images as string];
        } catch (e) {
          media = [activeProduct.images as string];
        }
      }

      return {
        text: `📦 *${activeProduct!.name}*\n\n💰 Precio: $${activeProduct!.price.toLocaleString()} ${activeProduct!.currency}\n📦 Stock: ${activeProduct!.stock && activeProduct!.stock > 0 ? 'Disponible' : 'Bajo pedido'}\n🚚 Entrega: Envío a domicilio\n⏱ Tiempo: 2-4 días hábiles\n\n📋 ${activeProduct!.description || 'Producto de alta calidad'}\n\n¿Deseas saber algo específico? Puedes preguntarme:\n• Características\n• Garantía\n• Métodos de pago\n• Tiempo de entrega\n• Cómo comprar`,
        media
      };
    }

    // ETAPA 5: RESPUESTAS CONTEXTUALES (PROMPT MAESTRO)
    if (activeProduct && (stage === 'viendo_producto' || stage === 'preguntando_detalle' || isAskingGeneral)) {
      // Si detectamos intención de compra
      if (['compra', 'informacion_pago'].includes(intentData.intent) || 
          /(comprar|lo quiero|como pago|me interesa|pagar|quiero pagar)/i.test(message.toLowerCase())) {
        
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { currentStage: 'interes_compra' } as any
        });

        return { text: `Perfecto 👍\n\n¿Deseas que te envíe las opciones de pago disponibles para el *${activeProduct.name}*?` };
      }

      const response = await callMasterAI(message, activeProduct);
      
      await prisma.message.create({
        data: {
          conversationId,
          content: response,
          type: 'TEXT',
          direction: 'OUTGOING',
          aiGenerated: true
        }
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { currentStage: 'preguntando_detalle' } as any
      });

      return { text: response };
    }

    // Si no encontramos producto y el usuario pregunta algo general
    if (isAskingGeneral && !activeProduct) {
       return { text: `¿De qué producto te gustaría recibir información? Puedes escribirme el nombre directamente.` };
    }

    // ETAPA: BUSCANDO_PRODUCTO - Usuario está explorando sin producto específico
    if (stage === 'buscando_producto' && !foundProduct && !isAskingNewProduct) {
      console.log(`[SalesAgent] Usuario en buscando_producto sin producto específico`)
      
      // Buscar productos populares o destacados para mostrar
      const featuredProducts = await prisma.product.findMany({
        where: { 
          userId,
          status: 'AVAILABLE'
        },
        orderBy: { searchPriority: 'desc' },
        take: 5
      })

      if (featuredProducts.length > 0) {
        let productList = '🛍️ *Productos Destacados:*\n\n'
        featuredProducts.forEach((p, i) => {
          productList += `${i + 1}️⃣ *${p.name}*\n   💰 ${p.price.toLocaleString()} ${p.currency}\n\n`
        })
        productList += '📝 Escribe el número del producto que te interesa o el nombre de lo que buscas.'

        // Guardar lista en memoria compartida
        sharedMemory.setProductList(customerPhone, featuredProducts)

        return { text: productList }
      }

      return { text: `¿Qué producto estás buscando? Puedo ayudarte con laptops, cursos digitales, megapacks y más. 😊` }
    }

    // Si no encontramos producto y no estamos en ninguna de las etapas anteriores

    // ETAPA 6 & 7: INTERÉS DE COMPRA Y MÉTODOS DE PAGO
    if (stage === 'interes_compra') {
      // Detectar si el cliente confirma interés
      if (/(si|sí|yep|dale|enviame|envíame|claro|ok|bueno|perfecto|quiero)/i.test(message.toLowerCase())) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { currentStage: 'pago' } as any
        });

        return { text: `💳 *Opciones de pago disponibles:*\n\n1️⃣ Transferencia bancaria (Bancolombia/Nequi/Daviplata)\n2️⃣ Tarjeta de Crédito/Débito\n3️⃣ Contra entrega (solo algunas ciudades)\n\n¿Con cuál método prefieres pagar?` };
      }

      // Si no confirma, usar IA para responder dudas
      const interestMessages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      
      const interestHistory = interestMessages.reverse().map(m => ({
        role: m.direction === 'INCOMING' ? 'user' : 'assistant',
        content: m.content
      }))

      const aiResponse = await callMasterAI(message, activeProduct || currentProduct, interestHistory, stage)
      
      await prisma.message.create({
        data: {
          conversationId,
          content: aiResponse,
          type: 'TEXT',
          direction: 'OUTGOING',
          aiGenerated: true
        }
      })

      return { text: aiResponse }
    }

    // ETAPA 8: PAGO - Manejar selección de método de pago
    if (stage === 'pago') {
      // Detectar método de pago seleccionado
      const paymentMethod = message.toLowerCase()
      
      if (/(1|transferencia|bancolombia|nequi|daviplata)/i.test(paymentMethod)) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { currentStage: 'confirmacion' } as any
        })

        return { text: `✅ Perfecto, pago por transferencia.\n\n📦 *Información de Entrega*\n\nPara coordinar el envío, necesito:\n📍 Ciudad\n🏘️ Barrio o dirección\n📱 Teléfono de contacto\n\nPor favor compárteme estos datos.` }
      }
      
      if (/(2|tarjeta|crédito|débito|credito|debito)/i.test(paymentMethod)) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { currentStage: 'confirmacion' } as any
        })

        return { text: `✅ Perfecto, pago con tarjeta.\n\nTe enviaré un link de pago seguro.\n\n📦 *Información de Entrega*\n\nPara coordinar el envío, necesito:\n📍 Ciudad\n🏘️ Barrio o dirección\n📱 Teléfono de contacto\n\nPor favor compárteme estos datos.` }
      }

      if (/(3|contra entrega|contraentrega|efectivo)/i.test(paymentMethod)) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { currentStage: 'confirmacion' } as any
        })

        return { text: `✅ Perfecto, pago contra entrega.\n\n⚠️ Este método aplica solo para algunas ciudades.\n\n📦 *Información de Entrega*\n\nPara verificar disponibilidad, necesito:\n📍 Ciudad\n🏘️ Barrio o dirección\n📱 Teléfono de contacto\n\nPor favor compárteme estos datos.` }
      }

      // Si no selecciona método claro, usar IA
      const paymentMessages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      
      const paymentHistory = paymentMessages.reverse().map(m => ({
        role: m.direction === 'INCOMING' ? 'user' : 'assistant',
        content: m.content
      }))

      const paymentAiResponse = await callMasterAI(message, activeProduct || currentProduct, paymentHistory, stage)
      
      await prisma.message.create({
        data: {
          conversationId,
          content: paymentAiResponse,
          type: 'TEXT',
          direction: 'OUTGOING',
          aiGenerated: true
        }
      })

      return { text: paymentAiResponse }
    }

    // ETAPA 9: CONFIRMACIÓN - Recopilar datos de entrega
    if (stage === 'confirmacion') {
      // Verificar si el mensaje contiene información de entrega
      const hasCity = /\b(bogotá|bogota|medellín|medellin|cali|barranquilla|cartagena|bucaramanga|pereira|manizales|ibagué|ibague|santa marta|cúcuta|cucuta|villavicencio|pasto|montería|monteria|valledupar|neiva|armenia|popayán|popayan|sincelejo|tunja|florencia|riohacha|yopal|quibdó|quibdo)\b/i.test(message)
      
      if (hasCity || message.length > 20) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { currentStage: 'cerrado' } as any
        })

        return { text: `📝 *Resumen de tu pedido:*\n\n📦 Producto: *${activeProduct?.name || currentProduct?.name}*\n💰 Precio: ${(activeProduct?.price || currentProduct?.price)?.toLocaleString()} ${activeProduct?.currency || currentProduct?.currency || 'COP'}\n📍 Entrega: ${message}\n\n✅ *¡Pedido confirmado!*\n\nEn las próximas horas recibirás:\n• Confirmación de pago\n• Número de guía de envío\n• Tiempo estimado de entrega\n\n¿Hay algo más en lo que pueda ayudarte? 😊` }
      }

      // Si no tiene datos claros, pedir más información
      return { text: `Para procesar tu pedido necesito los datos completos:\n\n📍 Ciudad\n🏘️ Barrio o dirección completa\n📱 Teléfono de contacto\n\nPor favor compárteme esta información.` }
    }

    // ETAPA 10: CIERRE
    if (stage === 'cerrado') {
      return { text: `✅ *Pedido registrado.*\n\nEn breve recibirás confirmación y guía de envío por este medio.\n\nGracias por tu compra con Tecnovariedades D&S 🤝` };
    }

    // 🤖 CATCH-ALL INTELIGENTE: Usar IA para responder cualquier otra pregunta
    console.log(`[SalesAgent] Usando IA para respuesta general en etapa: ${stage}`)
    
    // Obtener historial para contexto
    const generalMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    const generalHistory = generalMessages.reverse().map(m => ({
      role: m.direction === 'INCOMING' ? 'user' : 'assistant',
      content: m.content
    }))

    // Llamar a la IA con contexto completo
    const generalAiResponse = await callMasterAI(
      message, 
      activeProduct || currentProduct, 
      generalHistory,
      stage
    )

    // Guardar respuesta en DB
    await prisma.message.create({
      data: {
        conversationId,
        content: generalAiResponse,
        type: 'TEXT',
        direction: 'OUTGOING',
        aiGenerated: true,
        confidence: intentData.confidence
      }
    })

    return { text: generalAiResponse };

  } catch (error) {
    console.error('Error en Sales Agent:', error);
    return { text: 'Disculpa, tuve un problema al procesar tu solicitud. ¿Podrías intentarlo de nuevo?' };
  }
}

/**
 * Extraer nombre de producto de forma manual si la IA falla
 */
function extractProductNameManually(message: string): string | null {
  const msg = message.toLowerCase();
  
  // Limpiar verbos y palabras de acción
  const cleanMsg = msg
    .replace(/[.,\/#!$%^&*;:{}=\-_`~()¿?]/g," ")
    .replace(/\s+/g, ' ')
    .replace(/(hola|buenos días|buenas tardes|buenas noches|saludos|hey|oye)/g, '')
    .replace(/(cuanto vale|precio de|valor de|en cuanto esta|que precio tiene|cuanto cuesta)/g, '')
    .replace(/(tienes|disponible|quisiera|donde|como|busco|necesito|quiero|me interesa|mostrame|ver)/g, '')
    .trim();

  // Si después de limpiar queda algo significativo (más de 2 letras y no es solo ruido)
  const words = cleanMsg.split(' ').filter(w => w.length > 2);
  
  if (words.length > 0) {
    return words.join(' ');
  }
  
  return null;
}

/**
 * PROMPT MAESTRO para la IA
 * Ahora maneja TODAS las conversaciones con contexto completo
 */
async function callMasterAI(message: string, product: Product | null, conversationHistory?: any[], stage?: string): Promise<string> {
  const productJson = product ? JSON.stringify({
    name: product.name,
    price: product.price,
    currency: product.currency,
    description: product.description,
    stock: product.stock,
    category: product.category
  }, null, 2) : "No hay producto seleccionado";
  
  // Construir historial de conversación para contexto
  let historyContext = '';
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6); // Últimos 6 mensajes
    historyContext = '\n\nHISTORIAL RECIENTE:\n' + recentHistory.map(m => 
      `${m.role === 'user' ? 'Cliente' : 'Bot'}: ${m.content}`
    ).join('\n');
  }

  const systemPrompt = `Eres David, un asesor comercial experto y amigable de Tecnovariedades D&S en Colombia.

PERSONALIDAD:
- Profesional pero cercano y amigable
- Usa emojis moderadamente (1-2 por mensaje)
- Respuestas concisas (máximo 3-4 líneas)
- Siempre positivo y orientado a ayudar

REGLAS DE ORO:
1. Tu ÚNICA fuente de verdad es la FICHA TÉCNICA del producto abajo
2. Si te preguntan algo que NO está en la ficha, di: "Déjame verificar ese dato con mi equipo y te confirmo enseguida"
3. NUNCA inventes precios, características, especificaciones o links
4. Si no hay producto seleccionado, ayuda al cliente a encontrar lo que busca
5. Mantén el contexto de la conversación usando el historial

ETAPA ACTUAL: ${stage || 'conversación general'}

PRODUCTO ACTUAL:
${productJson}
${historyContext}

INSTRUCCIONES ESPECÍFICAS POR ETAPA:
- buscando_producto: Ayuda a encontrar productos, pregunta qué busca
- viendo_producto: Responde dudas sobre el producto actual
- preguntando_detalle: Da detalles técnicos solo si están en la ficha
- interes_compra: Confirma interés y guía hacia el pago
- pago: Explica métodos de pago disponibles
- confirmacion: Confirma datos de entrega
- cerrado: Agradece y ofrece soporte post-venta

MÉTODOS DE PAGO DISPONIBLES:
- Transferencia bancaria (Bancolombia, Nequi, Daviplata)
- Tarjeta de crédito/débito
- Contra entrega (solo algunas ciudades)

ENVÍOS:
- Cobertura: Todo Colombia
- Tiempo: 2-4 días hábiles
- Costo: Varía según ciudad (confirmar con cliente)

Responde de manera natural y conversacional, manteniendo el contexto de la conversación.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 200,
      temperature: 0.7 // Más natural y conversacional
    });

    return completion.choices[0]?.message?.content || 'Permíteme verificar ese dato.';
  } catch (error) {
    console.error('Error en Master AI:', error);
    return 'Disculpa, tuve un problema técnico. ¿Podrías repetir tu pregunta?';
  }
}
