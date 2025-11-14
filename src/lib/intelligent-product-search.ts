/**
 * 🧠 SISTEMA DE BÚSQUEDA INTELIGENTE DE PRODUCTOS
 * 
 * Características:
 * - Búsqueda por similitud semántica
 * - Entiende nombres parciales y variaciones
 * - Usa contexto de conversación
 * - Razonamiento con IA para matching
 */

import { PrismaClient } from '@prisma/client';
import { GroqAPIRotator } from './groq-api-rotator';

const prisma = new PrismaClient();

interface SearchContext {
    previousProducts?: string[];
    conversationHistory?: string[];
    userMessage: string;
}

interface ProductMatch {
    product?: any;
    products?: any[]; // Para consultas generales con múltiples opciones
    confidence: number;
    reason: string;
    shouldSendPhoto: boolean;
    isGeneralQuery?: boolean; // Indica si es consulta general
}

/**
 * 🔍 Búsqueda inteligente de productos con IA
 */
export async function intelligentProductSearch(
    context: SearchContext
): Promise<ProductMatch | null> {

    console.log('🔍 Búsqueda inteligente iniciada:', context.userMessage);

    // 0. PRIORIDAD MÁXIMA: Detectar saludos (NO buscar productos si es saludo)
    const messageLower = context.userMessage.toLowerCase().trim();
    const greetings = [
        'hola', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes',
        'buenas noches', 'hey', 'saludos', 'que tal', 'qué tal',
        'buen dia', 'buen día', 'buena tarde', 'buena noche',
        'hola muy buenas', 'hola buenas', 'hola buenos dias'
    ];
    
    // Si es un saludo simple (sin pregunta adicional), NO buscar productos
    const isGreeting = greetings.some(g => messageLower.includes(g)) && messageLower.length < 30;
    if (isGreeting) {
        console.log('👋 Saludo detectado, NO buscar productos');
        return null; // Retornar null para que use el sistema híbrido
    }

    // 🧠 USAR IA SIEMPRE para razonamiento completo
    // La IA entiende contexto, corrige ortografía, y razona sobre la intención
    console.log('🧠 Usando IA para análisis inteligente del mensaje...');
    
    const allProducts = await prisma.product.findMany({
        where: { status: 'AVAILABLE' },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            subcategory: true,
            store: true,
            images: true,
            tags: true
        },
        take: 160 // MÁXIMO: Todos los productos disponibles para que la IA pueda encontrar cualquier producto
    });

    if (allProducts.length === 0) {
        console.log('❌ No hay productos en la BD');
        return null;
    }

    // Usar IA para encontrar el producto correcto
    const productMatch = await findProductWithAI(
        context.userMessage,
        allProducts,
        context.previousProducts || []
    );

    if (!productMatch) {
        console.log('❌ No se encontró producto matching');
        return null;
    }

    // Manejar consultas generales vs específicas
    if (productMatch.isGeneralQuery && productMatch.products) {
        console.log(`✅ Consulta general: ${productMatch.products.length} productos encontrados`);
        console.log('📊 Confianza:', productMatch.confidence + '%');
        console.log('💡 Razón:', productMatch.reason);
    } else if (productMatch.product) {
        console.log('✅ Producto encontrado:', productMatch.product.name);
        console.log('📊 Confianza:', productMatch.confidence + '%');
        console.log('💡 Razón:', productMatch.reason);
    }

    return productMatch;
}

/**
 * 💰 Extraer presupuesto del mensaje del cliente
 */
function extractBudgetFromMessage(message: string): string | null {
    const messageLower = message.toLowerCase();
    
    // Detectar "hasta X", "máximo X", "no más de X"
    const hastaMatch = messageLower.match(/(?:hasta|m[aá]ximo|no m[aá]s de)\s+(\d+(?:\.\d+)?)\s*(millones?|mill[oó]n|mil)?/i);
    if (hastaMatch) {
        let amount = parseFloat(hastaMatch[1]);
        if (hastaMatch[2]?.includes('mill')) {
            amount *= 1000000;
        } else if (hastaMatch[2]?.includes('mil')) {
            amount *= 1000;
        }
        return `Máximo ${amount.toLocaleString('es-CO')} COP`;
    }
    
    // Detectar "desde X", "mínimo X"
    const desdeMatch = messageLower.match(/(?:desde|m[ií]nimo)\s+(\d+(?:\.\d+)?)\s*(millones?|mill[oó]n|mil)?/i);
    if (desdeMatch) {
        let amount = parseFloat(desdeMatch[1]);
        if (desdeMatch[2]?.includes('mill')) {
            amount *= 1000000;
        } else if (desdeMatch[2]?.includes('mil')) {
            amount *= 1000;
        }
        return `Mínimo ${amount.toLocaleString('es-CO')} COP`;
    }
    
    // Detectar "entre X y Y"
    const entreMatch = messageLower.match(/entre\s+(\d+(?:\.\d+)?)\s*y\s*(\d+(?:\.\d+)?)\s*(millones?|mill[oó]n|mil)?/i);
    if (entreMatch) {
        let min = parseFloat(entreMatch[1]);
        let max = parseFloat(entreMatch[2]);
        if (entreMatch[3]?.includes('mill')) {
            min *= 1000000;
            max *= 1000000;
        } else if (entreMatch[3]?.includes('mil')) {
            min *= 1000;
            max *= 1000;
        }
        return `Entre ${min.toLocaleString('es-CO')} y ${max.toLocaleString('es-CO')} COP`;
    }
    
    return null;
}

/**
 * 🤖 Usa IA para encontrar el producto correcto
 */
async function findProductWithAI(
    userMessage: string,
    products: any[],
    previousProducts: string[]
): Promise<ProductMatch | null> {

    // Crear lista de productos para la IA
    const productList = products.map((p, idx) => {
        const subcatInfo = p.subcategory ? ` [${p.subcategory}]` : '';
        const storeInfo = p.store ? ` (${p.store})` : '';
        return `${idx + 1}. ${p.name}${subcatInfo}${storeInfo} - ${p.category} - $${p.price}`;
    }).join('\n');

    const contextInfo = previousProducts.length > 0
        ? `\n\nProductos mencionados anteriormente: ${previousProducts.join(', ')}`
        : '';

    // Extraer presupuesto del mensaje
    const budgetInfo = extractBudgetFromMessage(userMessage);
    const budgetContext = budgetInfo 
        ? `\n\n⚠️ PRESUPUESTO DEL CLIENTE: ${budgetInfo}\nSOLO recomienda productos dentro de este rango.`
        : '';

    const prompt = `Eres un asistente de ventas inteligente con razonamiento avanzado.

TU MISIÓN: Entender la intención del cliente y encontrar el producto correcto, incluso si:
- Escribe con errores ortográficos ("curzo de piyano" → curso de piano)
- Usa sinónimos ("portátil" = "laptop" = "computador")
- Menciona solo parte del nombre ("curso piano" → "Curso Completo de Piano Online")
- Usa lenguaje informal ("algo para trabajar" → laptops para oficina)

PRODUCTOS DISPONIBLES:
${productList}
${contextInfo}${budgetContext}

MENSAJE DEL CLIENTE:
"${userMessage}"

ANÁLISIS INTELIGENTE REQUERIDO:
1. 🧠 RAZONA sobre qué busca realmente el cliente
2. 🔍 Encuentra productos que coincidan con la INTENCIÓN, no solo palabras exactas
3. ✅ Corrige errores ortográficos mentalmente
4. 🎯 Entiende sinónimos y variaciones
5. 💡 Si menciona características (gaming, trabajo, estudio), encuentra el MEJOR producto

REGLAS DE RAZONAMIENTO:
- 🧠 USA RAZONAMIENTO SEMÁNTICO: "curso piano" = "Curso Completo de Piano Online"
- 🔤 CORRIGE ORTOGRAFÍA: "curzo" = "curso", "piyano" = "piano", "portatil" = "portátil"
- 🔄 ENTIENDE SINÓNIMOS: "laptop" = "portátil" = "computador portátil"
- 💡 INFIERE INTENCIÓN: "algo para trabajar" → laptops para oficina
- 🎯 BUSCA POR CONCEPTO, NO SOLO PALABRAS: "curso de música" → encuentra cursos de piano
- ⚠️ PREGUNTAS DE RECOMENDACIÓN: "¿cuál me recomiendas?" → isGeneralQuery=FALSE, recomienda EL MEJOR
- ⚠️ Si pregunta "para juegos", "para gaming", "para diseño", "para trabajo" → isGeneralQuery=FALSE, analiza y recomienda EL MEJOR
- ⚠️ CRÍTICO: Si menciona PRESUPUESTO, SOLO recomienda productos dentro de ese rango
- CONSULTA GENERAL: "impresora", "laptop", "moto" → isGeneralQuery=true, devuelve múltiples opciones
- CONSULTA ESPECÍFICA: "impresora canon", "laptop ryzen 5" → isGeneralQuery=false, devuelve 1 producto
- Si menciona marca (Asus, HP, Lenovo) prioriza esa marca
- Si menciona tienda (MegaComputer, Propio) filtra por esa tienda
- Si dice "ese", "el que mencionaste", usa el contexto previo
- Nombres parciales son válidos (ej: "720u" puede ser "Ryzen 3 7320U")

EJEMPLOS DE RAZONAMIENTO:
1. "curso piano" → Razona: busca cursos relacionados con piano → Encuentra: "Curso Completo de Piano Online"
2. "curzo de piyano" → Corrige: "curso de piano" → Encuentra: "Curso Completo de Piano Online"
3. "algo para trabajar" → Razona: necesita laptop para oficina → Encuentra: laptops apropiadas
4. "portatil gamer" → Corrige: "portátil" + razona: gaming → Encuentra: laptops gaming
5. "moto 150" → Razona: busca motos de 150cc → Encuentra: motos disponibles

CRITERIOS PARA GAMING:
- Prioriza procesadores Ryzen 5 o superiores (Ryzen 7, Ryzen 9)
- Busca RAM de 16GB o más
- Gráficos dedicados si están disponibles
- Pantallas de 15.6" o más

⚠️ RESTRICCIÓN DE PRESUPUESTO (MUY IMPORTANTE):
- Si el cliente menciona "hasta X", "máximo X", "no más de X" → SOLO recomienda productos con precio <= X
- Si el cliente menciona "desde X", "mínimo X" → SOLO recomienda productos con precio >= X
- Si el cliente menciona "entre X y Y" → SOLO recomienda productos con precio entre X y Y
- NUNCA recomiendes productos fuera del presupuesto mencionado
- Si NO hay productos en el presupuesto, di: "No tengo productos en ese rango, pero tengo estas alternativas cercanas"

Responde SOLO con JSON:

Para CONSULTA ESPECÍFICA o RECOMENDACIÓN:
{
  "found": true,
  "isGeneralQuery": false,
  "productIndex": número (1-based),
  "confidence": 0-100,
  "reason": "razón CORTA (máximo 50 caracteres) de por qué este producto",
  "shouldSendPhoto": true
}

Para CONSULTA GENERAL:
{
  "found": true,
  "isGeneralQuery": true,
  "productIndexes": [1, 3, 5, 7, 9],
  "confidence": 0-100,
  "reason": "Cliente pregunta por categoría general",
  "shouldSendPhoto": false
}`;

    try {
        // Usar Groq para análisis de productos (rápido y confiable)
        const { GroqAPIRotator } = await import('./groq-api-rotator');
        
        console.log('🤖 Llamando a Groq...');
        
        const response = await GroqAPIRotator.makeRequest(
            [{ role: 'user', content: prompt }],
            {
                temperature: 0.3,
                maxTokens: 500
            }
        );

        console.log('🤖 Respuesta IA (Groq):', response.substring(0, 200));

        // Extraer JSON de la respuesta
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('❌ No se pudo extraer JSON de la respuesta');
            return null;
        }

        const analysis = JSON.parse(jsonMatch[0]);

        if (!analysis.found) {
            return null;
        }

        // 🔍 CONSULTA GENERAL: Devolver múltiples opciones
        if (analysis.isGeneralQuery && analysis.productIndexes) {
            const selectedProducts = analysis.productIndexes
                .map((idx: number) => products[idx - 1])
                .filter(Boolean)
                .slice(0, 5); // Máximo 5 opciones

            if (selectedProducts.length === 0) {
                return null;
            }

            return {
                products: selectedProducts,
                confidence: analysis.confidence,
                reason: analysis.reason,
                shouldSendPhoto: false, // No enviar fotos aún, solo opciones
                isGeneralQuery: true
            };
        }

        // 🎯 CONSULTA ESPECÍFICA: Devolver un producto
        if (analysis.productIndex) {
            const productIndex = analysis.productIndex - 1; // Convertir a 0-based
            
            // ⚠️ VALIDACIÓN: Verificar que el índice esté en rango
            if (productIndex < 0 || productIndex >= products.length) {
                console.log(`❌ Índice fuera de rango: ${analysis.productIndex} (máximo: ${products.length})`);
                return null;
            }
            
            const product = products[productIndex];
            
            // ⚠️ VALIDACIÓN: Verificar que el producto coincida con la búsqueda
            const userMessageLower = userMessage.toLowerCase();
            const productNameLower = product.name.toLowerCase();
            
            // Si busca "portátil" o "laptop", el producto DEBE contener esas palabras
            if ((userMessageLower.includes('portátil') || userMessageLower.includes('portatil') || userMessageLower.includes('laptop')) &&
                !productNameLower.includes('portátil') && !productNameLower.includes('portatil') && !productNameLower.includes('laptop')) {
                console.log(`❌ Producto no coincide con búsqueda: "${product.name}" no es un portátil`);
                console.log(`🔄 Buscando portátiles en la lista...`);
                
                // Buscar el primer portátil en la lista
                const portatil = products.find(p => {
                    const name = p.name.toLowerCase();
                    return name.includes('portátil') || name.includes('portatil') || name.includes('laptop');
                });
                
                if (portatil) {
                    console.log(`✅ Portátil encontrado: ${portatil.name}`);
                    return {
                        product: portatil,
                        confidence: 85,
                        reason: 'Portátil encontrado por validación',
                        shouldSendPhoto: true,
                        isGeneralQuery: false
                    };
                }
                
                return null;
            }

            return {
                product,
                confidence: analysis.confidence,
                reason: analysis.reason,
                shouldSendPhoto: analysis.shouldSendPhoto,
                isGeneralQuery: false
            };
        }

        return null;

    } catch (error: any) {
        console.error('❌ Error en búsqueda con IA (Groq):', error.message || error);
        return null;
    }
}

/**
 * 📸 Genera respuesta con foto + información
 */
export async function generateProductResponse(
    match: ProductMatch,
    includePhoto: boolean = true
): Promise<{ text: string; mediaPath?: string }> {

    const product = match.product;

    // Formatear tags como características
    let features = '';
    if (product.tags) {
        try {
            const tagsArray = typeof product.tags === 'string'
                ? JSON.parse(product.tags)
                : product.tags;

            if (Array.isArray(tagsArray) && tagsArray.length > 0) {
                features = tagsArray
                    .map((tag: string) => `• ${tag}`)
                    .join('\n');
            }
        } catch (e) {
            // Ignorar error de parsing
        }
    }

    // Texto de respuesta
    const text = `✨ *${product.name}*

${product.description || ''}

💰 *Precio:* $${product.price.toLocaleString('es-CO')} COP

${features ? `📋 *Características:*\n${features}\n` : ''}
🏷️ *Categoría:* ${product.category}${product.subcategory ? ` - ${product.subcategory}` : ''}${product.store ? `\n🏪 *Tienda:* ${product.store}` : ''}

¿Te gustaría más información o proceder con la compra? 😊`;

    // Obtener foto si está disponible
    let mediaPath: string | undefined;

    if (includePhoto && match.shouldSendPhoto) {
        if (product.images && product.images.length > 0) {
            // Usar la primera imagen
            const imageUrl = Array.isArray(product.images)
                ? product.images[0]
                : product.images;

            mediaPath = imageUrl;
            console.log('📸 Foto incluida:', mediaPath);
        } else {
            console.log('⚠️ Producto sin fotos disponibles');
        }
    }

    return { text, mediaPath };
}

/**
 * 🔄 Búsqueda con fallback a métodos tradicionales
 */
export async function hybridProductSearch(
    query: string,
    context: SearchContext
): Promise<ProductMatch | null> {

    // 1. Intentar búsqueda inteligente con IA
    const aiResult = await intelligentProductSearch(context);

    if (aiResult && aiResult.confidence >= 70) {
        console.log('✅ Búsqueda IA exitosa');
        return aiResult;
    }

    // 2. Fallback: búsqueda por texto simple
    console.log('🔄 Fallback a búsqueda tradicional');

    const products = await prisma.product.findMany({
        where: {
            status: 'AVAILABLE',
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 1
    });

    if (products.length > 0) {
        return {
            product: products[0],
            confidence: 60,
            reason: 'Búsqueda por texto',
            shouldSendPhoto: query.toLowerCase().includes('foto') ||
                query.toLowerCase().includes('imagen')
        };
    }

    return null;
}
