/**
 * Cliente Ollama Profesional
 * Sistema completo de IA conversacional con:
 * - Memoria conversacional
 * - Formato CARD
 * - AIDA integrado
 * - Manejo de objeciones
 * - Razonamiento profundo
 */

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  message: string;
  reasoning?: string;
  confidence?: number;
}

/**
 * Envía mensaje a Ollama con contexto completo
 */
export async function sendToOllama(
  messages: OllamaMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'gemma2:2b';
  const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '180000');

  console.log(`[Ollama] 🤖 Enviando a ${model} en ${ollamaUrl}`);
  console.log(`[Ollama] 📝 Mensajes: ${messages.length}`);

  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 800,
        }
      }),
      signal: AbortSignal.timeout(timeout)
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content || '';

    console.log(`[Ollama] ✅ Respuesta recibida (${content.length} chars)`);
    
    return content;

  } catch (error: any) {
    console.error('[Ollama] ❌ Error:', error.message);
    throw error;
  }
}

/**
 * Genera respuesta con formato CARD profesional
 */
export async function generateCardResponse(
  producto: any,
  contexto: string,
  preguntaUsuario: string
): Promise<string> {
  const systemPrompt = construirPromptVendedorProfesional();
  const userPrompt = construirPromptProductoCard(producto, contexto, preguntaUsuario);

  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await sendToOllama(messages, {
    temperature: 0.7,
    maxTokens: 800
  });
}

/**
 * Construye prompt de vendedor profesional
 */
function construirPromptVendedorProfesional(): string {
  return `Eres un vendedor profesional de Tecnovariedades D&S por WhatsApp.

🎯 TU MISIÓN:
- Vender productos con técnicas profesionales
- Usar formato CARD (imagen + info estructurada)
- Aplicar AIDA en cada respuesta
- Manejar objeciones con empatía
- Mantener conversación natural
- Redirigir sutilmente hacia la venta

📋 FORMATO CARD OBLIGATORIO:
Cuando presentes un producto, SIEMPRE usa este formato:

🎯 [Emoji] [Nombre del Producto]
💰 Precio: $X.XXX COP

📘 Incluye/Características:
✅ Característica 1
✅ Característica 2
✅ Característica 3

🔗 [Link de compra si existe]

🧠 AIDA:
✨ Atención: [Gancho inicial]
🔥 Interés: [Beneficio principal]
⭐ Deseo: [Prueba social o resultado]
👉 Acción: [Pregunta de cierre]

💬 [Pregunta para avanzar la venta]

🎨 ESTILO:
- Profesional pero cercano
- Emojis moderados (no excesivos)
- Respuestas estructuradas
- Preguntas inteligentes
- Manejo de objeciones

🚫 NUNCA:
- Inventar información
- Dar precios incorrectos
- Prometer lo que no existe
- Ser robótico o rígido
- Perder el contexto

✅ SIEMPRE:
- Usar datos reales de la BD
- Mantener memoria conversacional
- Aplicar AIDA
- Hacer preguntas de cierre
- Redirigir a la venta sutilmente`;
}

/**
 * Construye prompt para producto específico
 */
function construirPromptProductoCard(
  producto: any,
  contexto: string,
  preguntaUsuario: string
): string {
  const esDigital = producto.categoria === 'DIGITAL';
  
  return `CONTEXTO DE LA CONVERSACIÓN:
${contexto}

PREGUNTA DEL CLIENTE:
"${preguntaUsuario}"

PRODUCTO A PRESENTAR:
Nombre: ${producto.nombre}
Precio: ${producto.precio.toLocaleString('es-CO')} COP
Categoría: ${producto.categoria}
Tipo: ${esDigital ? 'Digital (acceso inmediato)' : 'Físico'}
${producto.descripcion ? `Descripción: ${producto.descripcion}` : ''}
${producto.stock && !esDigital ? `Stock: ${producto.stock} unidades` : ''}
${producto.imagenes?.length > 0 ? `Tiene fotos: Sí` : ''}

INSTRUCCIONES:
1. Presenta el producto usando el FORMATO CARD completo
2. Aplica AIDA (Atención, Interés, Deseo, Acción)
3. Haz una pregunta de cierre para avanzar la venta
4. Si es digital, menciona "acceso inmediato"
5. Si es físico, menciona disponibilidad
6. Sé profesional pero cercano
7. USA EMOJIS moderadamente
8. Mantén el contexto de la conversación

GENERA LA RESPUESTA AHORA:`;
}

/**
 * Maneja conversación general (no enfocada en producto)
 */
export async function handleGeneralConversation(
  mensajeUsuario: string,
  contexto: string
): Promise<string> {
  const systemPrompt = `Eres un vendedor profesional de Tecnovariedades D&S.

Tu objetivo es mantener una conversación natural pero SIEMPRE buscar oportunidades para:
1. Identificar necesidades del cliente
2. Redirigir sutilmente hacia productos
3. Hacer preguntas que revelen intención de compra

PRODUCTOS QUE VENDES:
- 💻 Laptops y computadores (HP, Asus, Lenovo, MacBook)
- 🏍️ Motos (Bajaj Pulsar)
- 🎓 Cursos digitales (Piano, Diseño, Marketing, etc.)
- 📦 Megapacks (40 packs de cursos)
- 🖱️ Accesorios tecnológicos

ESTRATEGIA:
- Si hablan de trabajo/estudio → Recomendar laptops o cursos
- Si hablan de transporte → Recomendar motos
- Si hablan de aprender algo → Recomendar cursos/megapacks
- Si hablan de tecnología → Recomendar accesorios

ESTILO:
- Natural y conversacional
- No ser agresivo
- Hacer preguntas inteligentes
- Redirigir sutilmente
- Mantener contexto

NUNCA:
- Ser robótico
- Ignorar lo que dicen
- Cambiar de tema bruscamente
- Perder el hilo de la conversación`;

  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `CONTEXTO: ${contexto}\n\nCLIENTE: ${mensajeUsuario}\n\nRESPONDE de forma natural y busca oportunidad de venta:` }
  ];

  return await sendToOllama(messages, {
    temperature: 0.8,
    maxTokens: 600
  });
}
