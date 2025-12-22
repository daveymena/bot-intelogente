/**
 * 🧠 BÚSQUEDA SEMÁNTICA DE PRODUCTOS CON OLLAMA
 * 
 * Sistema inteligente que entiende el contexto completo del cliente
 * No solo busca keywords, sino que RAZONA sobre lo que el cliente quiere
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SemanticSearchResult {
  product?: any;
  products?: any[];
  confidence: number;
  reason: string;
  isGeneralQuery: boolean;
}

/**
 * 🧠 Búsqueda semántica con Ollama
 * Entiende contexto, corrige ortografía, infiere intención
 */
export async function semanticProductSearch(
  userMessage: string,
  conversationContext?: string
): Promise<SemanticSearchResult | null> {
  
  console.log('🧠 [Búsqueda Semántica] Iniciando...');
  console.log('📝 Mensaje:', userMessage);
  
  // 🎯 ESTRATEGIA HÍBRIDA: Filtrar primero por keywords, luego Ollama
  
  // 1. Extraer keywords del mensaje
  const keywords = extractKeywords(userMessage);
  console.log('🔑 Keywords extraídas:', keywords);
  
  if (keywords.length === 0) {
    console.log('⚠️ No se encontraron keywords, buscando todos los productos');
    // Si no hay keywords, buscar todos
    const allProducts = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        customCategory: true,
        mainCategory: true,
        tags: true,
        images: true
      },
      take: 20 // Reducido de 100 a 20
    });
    
    if (allProducts.length === 0) {
      console.log('❌ No hay productos disponibles');
      return null;
    }
    
    return await analyzeWithOllama(userMessage, allProducts, conversationContext);
  }
  
  // 2. Buscar productos que contengan las keywords
  const filteredProducts = await prisma.product.findMany({
    where: {
      status: 'AVAILABLE',
      OR: keywords.flatMap(keyword => [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } }
      ])
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      customCategory: true,
      mainCategory: true,
      tags: true,
      images: true
    },
    take: 15 // Máximo 15 productos relevantes
  });
  
  console.log(`📊 Productos filtrados por keywords: ${filteredProducts.length}`);
  
  if (filteredProducts.length === 0) {
    console.log('❌ No se encontraron productos con esas keywords');
    return null;
  }
  
  // 3. Si solo hay 1 producto, devolverlo directamente
  if (filteredProducts.length === 1) {
    console.log('🎯 Solo 1 producto encontrado, devolviéndolo directamente');
    return {
      product: filteredProducts[0],
      confidence: 95,
      reason: 'Único producto que coincide con las keywords',
      isGeneralQuery: false
    };
  }
  
  // 4. Si hay varios, usar Ollama para elegir el mejor
  console.log('🤖 Varios productos encontrados, usando Ollama para elegir el mejor');
  const result = await analyzeWithOllama(userMessage, filteredProducts, conversationContext);
  
  // 5. Validar que el resultado de Ollama sea relevante
  if (result && result.product) {
    const productoNombre = result.product.name.toLowerCase();
    const tieneKeywords = keywords.some(k => productoNombre.includes(k.toLowerCase()));
    
    if (!tieneKeywords) {
      console.log('⚠️ Ollama devolvió producto sin keywords, usando fallback');
      return fallbackKeywordSearch(userMessage, filteredProducts);
    }
  }
  
  return result;
}

/**
 * Extrae keywords significativas del mensaje
 */
function extractKeywords(message: string): string[] {
  const messageLower = message.toLowerCase();
  
  // Palabras a ignorar
  const stopWords = [
    'me', 'interesa', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'del', 'para', 'con', 'por', 'que', 'como', 'donde', 'cuando',
    'quiero', 'necesito', 'busco', 'tengo', 'hay', 'dame', 'puedes', 'dar'
  ];
  
  // Extraer palabras
  const words = messageLower
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !stopWords.includes(word));
  
  // Correcciones ortográficas comunes
  const corrections: Record<string, string> = {
    'curzo': 'curso',
    'piyano': 'piano',
    'portatil': 'portátil',
    'compu': 'computador',
    'lapto': 'laptop'
  };
  
  return words.map(word => corrections[word] || word);
}

/**
 * 🤖 Analiza el mensaje con Ollama para entender la intención real
 */
async function analyzeWithOllama(
  userMessage: string,
  products: any[],
  context?: string
): Promise<SemanticSearchResult | null> {
  
  const useOllama = process.env.USE_OLLAMA === 'true';
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  
  if (!useOllama || !ollamaUrl) {
    console.log('⚠️ Ollama no configurado, usando fallback');
    return fallbackKeywordSearch(userMessage, products);
  }

  // Crear lista compacta de productos
  const productList = products.map((p, idx) => 
    `${idx + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} - ${p.category}`
  ).join('\n');

  const contextInfo = context ? `\n\nCONTEXTO PREVIO:\n${context}` : '';

  // Prompt optimizado para Ollama con corrección ortográfica
  const prompt = `Eres un asistente de ventas inteligente. Tu trabajo es ENTENDER lo que el cliente realmente quiere.

PRODUCTOS DISPONIBLES:
${productList}
${contextInfo}

MENSAJE DEL CLIENTE:
"${userMessage}"

TU TAREA:
1. ANALIZA el mensaje completo, no solo keywords
2. CORRIGE errores ortográficos automáticamente
3. ENTIENDE la intención real del cliente
4. INFIERE necesidades implícitas
5. ENCUENTRA el producto que mejor satisface su necesidad

CORRECCIONES ORTOGRÁFICAS AUTOMÁTICAS:
- "curzo" → "curso"
- "piyano" → "piano"
- "portatil" → "portátil"
- "mega pack" → "megapack"
- "compu" → "computador"
- "algo para trabajar" → laptop/computador para oficina

EJEMPLOS DE RAZONAMIENTO CORRECTO:
1. "curso de piano" → Cliente quiere aprender piano → Producto: Curso de Piano (ID específico)
2. "curzo de piyano" → Corrige a "curso de piano" → Producto: Curso de Piano (ID específico)
3. "algo para trabajar" → Cliente necesita herramienta de trabajo → Producto: Laptop (ID específico)
4. "portátil gamer" → Cliente quiere jugar → Producto: Laptop gaming (ID específico)
5. "aprender inglés" → Cliente quiere idiomas → Producto: Curso/Megapack de idiomas
6. "mega pack" → Cliente quiere paquete completo → Producto: Megapack (ID específico)

REGLAS CRÍTICAS:
- Si dice "curso de [tema]" → Buscar SOLO curso individual de ese tema (NO megapack)
- Si dice "curzo de [tema]" → Corregir a "curso" y buscar curso individual
- Si dice "megapack" o "mega pack" → Buscar SOLO megapacks
- Si dice "portátil", "laptop", "algo para trabajar" → Buscar SOLO computadores (NO accesorios)
- Si menciona presupuesto → Respetar el rango de precio
- SIEMPRE corrige ortografía antes de buscar

RESPONDE EN JSON:
{
  "found": true/false,
  "isGeneral": true/false,
  "productIds": [1],
  "reasoning": "Explicación corta de tu razonamiento"
}

- found: ¿Encontraste productos relevantes?
- isGeneral: SIEMPRE false (el cliente pregunta por UN producto específico)
- productIds: Array con UN SOLO ID del producto más relevante (1-based, del listado arriba)
- reasoning: Tu razonamiento en 1-2 líneas

REGLAS CRÍTICAS DE RESPUESTA:
- SIEMPRE devuelve UN SOLO producto (el más relevante)
- isGeneral SIEMPRE debe ser false
- productIds SIEMPRE debe tener UN SOLO elemento
- Si el cliente dice "curso de piano" → Devuelve SOLO el curso de piano más relevante
- Si el cliente dice "portátil" → Devuelve SOLO el portátil más relevante
- NO devuelvas listas de opciones, el cliente quiere información de UN producto

IMPORTANTE: Responde SOLO el JSON, sin texto adicional.`;

  try {
    console.log('🤖 Enviando a Ollama...');
    
    const model = process.env.OLLAMA_MODEL || 'gemma2:2b';
    const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '30000'); // 30 segundos para mejor análisis

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de Ollama alcanzado, usando fallback...');
      controller.abort();
    }, timeout);

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de ventas que entiende contexto y razona sobre intenciones. Respondes SOLO en JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: 0.2, // Más preciso para búsqueda
          num_predict: 300
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.message?.content || '';
    
    console.log('✅ Respuesta de Ollama:', content.substring(0, 200));

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.log('❌ No se pudo extraer JSON');
      return fallbackKeywordSearch(userMessage, products);
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    if (!analysis.found || !analysis.productIds || analysis.productIds.length === 0) {
      console.log('❌ Ollama no encontró productos');
      return fallbackKeywordSearch(userMessage, products);
    }

    // Convertir IDs (1-based) a productos
    const selectedProducts = analysis.productIds
      .map((id: number) => products[id - 1])
      .filter((p: any) => p !== undefined);

    if (selectedProducts.length === 0) {
      console.log('❌ IDs inválidos');
      return fallbackKeywordSearch(userMessage, products);
    }

    console.log(`✅ Ollama encontró ${selectedProducts.length} productos`);
    console.log('💡 Razonamiento:', analysis.reasoning);

    // 🎯 SIEMPRE devolver UN SOLO producto (el más relevante)
    // Ignorar el flag isGeneral de Ollama, siempre tratamos como específico
    console.log('🎯 Devolviendo UN SOLO producto (el más relevante)');
    
    return {
      product: selectedProducts[0],
      confidence: 90,
      reason: analysis.reasoning || 'Análisis semántico con Ollama',
      isGeneralQuery: false // SIEMPRE false para devolver un solo producto
    };

  } catch (error: any) {
    console.error('❌ Error en Ollama:', error.message);
    console.log('🔄 Activando fallback por keywords...');
    return fallbackKeywordSearch(userMessage, products);
  }
}

/**
 * 🔍 Fallback: Búsqueda por keywords si Ollama falla
 */
function fallbackKeywordSearch(
  userMessage: string,
  products: any[]
): SemanticSearchResult | null {
  
  console.log('🔄 Usando búsqueda por keywords (fallback)');
  
  const messageLower = userMessage.toLowerCase();
  
  // Extraer keywords significativas
  const keywords = messageLower
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['para', 'con', 'que', 'como', 'donde', 'cuando'].includes(word));

  if (keywords.length === 0) {
    return null;
  }

  console.log('🔑 Keywords:', keywords);

  // Buscar productos que contengan las keywords
  const matchingProducts = products.filter(p => {
    const searchText = `${p.name} ${p.description || ''} ${p.category} ${p.customCategory || ''} ${p.mainCategory || ''}`.toLowerCase();
    
    // Contar cuántas keywords coinciden
    const matches = keywords.filter(keyword => searchText.includes(keyword)).length;
    
    // Requiere al menos 1 keyword
    return matches > 0;
  });

  if (matchingProducts.length === 0) {
    console.log('❌ No se encontraron productos con keywords');
    return null;
  }

  // Ordenar por relevancia (más keywords = más relevante)
  matchingProducts.sort((a, b) => {
    const searchTextA = `${a.name} ${a.description || ''}`.toLowerCase();
    const searchTextB = `${b.name} ${b.description || ''}`.toLowerCase();
    
    const matchesA = keywords.filter(k => searchTextA.includes(k)).length;
    const matchesB = keywords.filter(k => searchTextB.includes(k)).length;
    
    return matchesB - matchesA;
  });

  console.log(`✅ Fallback encontró ${matchingProducts.length} productos`);

  // 🎯 SIEMPRE devolver UN SOLO producto (el más relevante)
  console.log('🎯 Fallback: Devolviendo UN SOLO producto (el más relevante)');
  
  return {
    product: matchingProducts[0],
    confidence: 70,
    reason: 'Búsqueda por keywords (fallback)',
    isGeneralQuery: false // SIEMPRE false para devolver un solo producto
  };
}

/**
 * 🎯 Búsqueda rápida por ID (cuando ya sabemos qué producto)
 */
export async function getProductById(productId: number) {
  return await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true
    }
  });
}
