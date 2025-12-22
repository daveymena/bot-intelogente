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
    let productMatch = await findProductWithAI(
        context.userMessage,
        allProducts,
        context.previousProducts || []
    );

    // 🛡️ RED DE SEGURIDAD GLOBAL: Si la IA falla, buscar por palabras clave
    if (!productMatch) {
        console.log('⚠️ IA no encontró resultados o falló. Activando Red de Seguridad Global...');
        
        // Normalizar mensaje para la red de seguridad (usando la misma lógica que para la IA)
        const normalizedMessage = normalizeUserMessage(context.userMessage).toLowerCase();
        
        // Buscar portátiles si se menciona (usando mensaje normalizado)
        if (normalizedMessage.includes('portátil') || normalizedMessage.includes('laptop')) {
            const laptops = allProducts.filter(p => {
                const name = p.name.toLowerCase();
                const category = (p.category || '').toLowerCase();
                const subcategory = (p.subcategory || '').toLowerCase();
                
                // Palabras clave positivas
                const isLaptop = name.includes('portátil') || name.includes('portatil') || name.includes('laptop') ||
                               category.includes('portátil') || category.includes('laptop') ||
                               subcategory.includes('portátil') || subcategory.includes('laptop');
                
                // Palabras clave negativas (CRÍTICO: Excluir cosas que son "portátiles" pero no computadores)
                const isNotAccessory = !name.includes('base') && !name.includes('soporte') && !name.includes('funda') &&
                                     !name.includes('cargador') && !name.includes('batería') && !name.includes('teclado') &&
                                     !name.includes('mouse') && !name.includes('audifono') && !name.includes('diadema') &&
                                     !name.includes('parlante') && !name.includes('bafle') && !name.includes('sonido') &&
                                     !name.includes('aire') && !name.includes('ventilador') && !name.includes('mesa') &&
                                     !name.includes('envase') && !name.includes('disco') && !name.includes('memoria');

                return isLaptop && isNotAccessory;
            });

            if (laptops.length > 0) {
                console.log(`✅ Red de Seguridad encontró ${laptops.length} portátiles reales`);
                productMatch = {
                    products: laptops.slice(0, 5),
                    confidence: 80,
                    reason: 'Red de Seguridad (Búsqueda por palabras clave)',
                    shouldSendPhoto: true,
                    isGeneralQuery: true
                };
            }
        }
    }

    if (!productMatch) {
        console.log('❌ No se encontró producto matching ni con IA ni con Red de Seguridad');
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
 * 🎹 Extraer tema del curso de una consulta específica (con tolerancia a errores)
 */
function extractCourseTheme(message: string): string {
    const messageLower = message.toLowerCase();

    // Patrones para extraer el tema del curso (más flexibles)
    const coursePatterns = [
        /curso\s+de\s+([a-zA-Záéíóúñ\s]+)/i,
        /curso\s+([a-zA-Záéíóúñ\s]+)/i,
        /curzo\s+de\s+([a-zA-Záéíóúñ\s]+)/i,
        /curzo\s+([a-zA-Záéíóúñ\s]+)/i,
        /([a-zA-Záéíóúñ]+)\s+curso/i,
        /([a-zA-Záéíóúñ]+)\s+curzo/i
    ];

    for (const pattern of coursePatterns) {
        const match = messageLower.match(pattern);
        if (match) {
            let theme = match[1].trim().toLowerCase();

            // Limpiar palabras comunes
            theme = theme.replace(/\b(de|del|los|las|un|una|el|la|y|o|e)\b/g, '').trim();

            // Corregir errores comunes de ortografía (más completo)
            const corrections: Record<string, string> = {
                'piyano': 'piano',
                'pyano': 'piano',
                'curzo': 'curso',
                'exel': 'excel',
                'photoshop': 'photoshop',
                'ilustrator': 'illustrator',
                'premiere': 'premiere',
                'after': 'after effects',
                'efects': 'effects',
                'efectos': 'effects',
                'idiosma': 'idioma',
                'idiosmas': 'idiomas',
                'ingles': 'inglés',
                'frances': 'francés',
                'aleman': 'alemán',
                'italiano': 'italiano',
                'portugues': 'portugués',
                'chino': 'chino',
                'japones': 'japonés',
                'coreano': 'coreano',
                'ruso': 'ruso'
            };

            for (const [wrong, correct] of Object.entries(corrections)) {
                theme = theme.replace(new RegExp(`\\b${wrong}\\b`, 'g'), correct);
            }

            console.log('🎯 Tema de curso extraído:', theme);
            return theme;
        }
    }

    // Si no se encontró con patrones, buscar palabras clave directamente
    const keywords = ['piano', 'excel', 'photoshop', 'illustrator', 'premiere', 'idioma', 'idiomas', 
                     'inglés', 'francés', 'alemán', 'italiano', 'portugués'];
    
    for (const keyword of keywords) {
        if (messageLower.includes(keyword)) {
            console.log('🎯 Tema de curso detectado por keyword:', keyword);
            return keyword;
        }
    }

    return '';
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
 * 🔧 Normaliza el mensaje del usuario corrigiendo errores comunes
 */
function normalizeUserMessage(message: string): string {
    let normalized = message.toLowerCase();

    // Diccionario de correcciones ortográficas comunes
    const corrections: Record<string, string> = {
        // Errores de escritura comunes
        'curzo': 'curso',
        'curzos': 'cursos',
        'piyano': 'piano',
        'pyano': 'piano',
        'portatil': 'portátil',
        'portatiles': 'portátiles',
        'compu': 'computador',
        'compus': 'computadores',
        'motico': 'moto',
        'moticos': 'motos',
        
        // Variaciones de megapack
        'mega pack': 'megapack',
        'mega packs': 'megapacks',
        'mega-pack': 'megapack',
        'mega-packs': 'megapacks',
        'megapak': 'megapack',
        'megapaks': 'megapacks',
        
        // Errores en idiomas
        'idiosma': 'idioma',
        'idiosmas': 'idiomas',
        'lenguaje': 'idioma',
        'lenguajes': 'idiomas',
        'ingles': 'inglés',
        'frances': 'francés',
        'aleman': 'alemán',
        
        // Sinónimos comunes
        'laptop': 'portátil',
        'laptops': 'portátiles',
        'pc': 'computador',
        'pcs': 'computadores',
        'notebook': 'portátil',
        'notebooks': 'portátiles',
        'portstil': 'portátil',
        'portatiles': 'portátiles',
        'portatil': 'portátil',
        'potatil': 'portátil',
        'prtatil': 'portátil',
        
        // Errores en categorías
        'diseño': 'diseño',
        'diseno': 'diseño',
        'grafico': 'gráfico',
        'graficos': 'gráficos',
        
        // Otros errores comunes
        'exel': 'excel',
        'photoshop': 'photoshop',
        'ilustrator': 'illustrator',
        'premiere': 'premiere',
        'after': 'after effects',
        'efects': 'effects',
        'efectos': 'effects'
    };

    // Aplicar correcciones palabra por palabra
    const words = normalized.split(/\s+/);
    const correctedWords = words.map(word => {
        // Buscar corrección exacta
        if (corrections[word]) {
            return corrections[word];
        }
        
        // Buscar corrección parcial (si la palabra contiene el error)
        for (const [wrong, correct] of Object.entries(corrections)) {
            if (word.includes(wrong)) {
                return word.replace(wrong, correct);
            }
        }
        
        return word;
    });

    normalized = correctedWords.join(' ');

    console.log('🔧 Mensaje normalizado:', message, '→', normalized);
    return normalized;
}

/**
 * 🤖 Usa IA para encontrar el producto correcto
 */
async function findProductWithAI(
    userMessage: string,
    products: any[],
    previousProducts: string[]
): Promise<ProductMatch | null> {

    // 🔧 Normalizar mensaje antes de procesar
    const normalizedMessage = normalizeUserMessage(userMessage);

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
- Escribe con errores ortográficos ("curzo de piyano" → curso de piano, "mega pack" → megapack)
- Usa sinónimos ("portátil" = "laptop" = "computador")
- Menciona solo parte del nombre ("curso piano" → "Curso Completo de Piano Online")
- Usa lenguaje informal ("algo para trabajar" → laptops para oficina)
- Escribe con espacios extras ("mega packs" → megapacks)
- Usa variaciones ("idioma" → megapack de idiomas, "idiosma" → idiomas)

PRODUCTOS DISPONIBLES:
${productList}
${contextInfo}${budgetContext}

MENSAJE ORIGINAL DEL CLIENTE:
"${userMessage}"

MENSAJE NORMALIZADO (con correcciones automáticas):
"${normalizedMessage}"

CONFUSIONES COMUNES A EVITAR (CRÍTICO):
- Si el cliente busca "portátil" o "laptop", se refiere a COMPUTADORES, NO a "parlantes portátiles", "aires portátiles" o "mesas para portátil".
- Si busca "parlante", NO mostrar computadores.
- Si busca "base", NO mostrar el computador, solo la base.
- Si busca "curso", NO mostrar megapacks a menos que lo pida explícitamente.

REGLAS DE RAZONAMIENTO:
1. Analiza la CATEGORÍA del producto. Si busca "portátil", la categoría debe ser "Computación" o "Laptops".
2. Si hay ambigüedad, prioriza el producto principal (ej: Laptop) sobre el accesorio (ej: Base).
3. Si busca algo específico (ej: "curso de inglés"), NO muestres "Megapack de Cursos" a menos que no haya otra opción.

⚠️ USA EL MENSAJE NORMALIZADO para buscar productos, pero mantén el contexto del mensaje original.

ANÁLISIS INTELIGENTE REQUERIDO:
1. 🧠 RAZONA sobre qué busca realmente el cliente
2. 🔍 Encuentra productos que coincidan con la INTENCIÓN, no solo palabras exactas
3. ✅ Corrige errores ortográficos mentalmente
4. 🎯 Entiende sinónimos y variaciones
5. 💡 Si menciona características (gaming, trabajo, estudio), encuentra el MEJOR producto

REGLAS DE RAZONAMIENTO:
- 🧠 USA RAZONAMIENTO SEMÁNTICO: "curso piano" = "Curso Completo de Piano Online"
- 🔤 CORRIGE ORTOGRAFÍA AUTOMÁTICAMENTE: 
  * "curzo" = "curso", "piyano" = "piano", "portatil" = "portátil"
  * "mega pack" = "megapack", "mega packs" = "megapacks"
  * "idiosma" = "idioma", "idiomas" = "idiomas"
  * "compu" = "computador", "pc" = "computador"
  * "moto" = "motocicleta", "motico" = "moto"
- 🔄 ENTIENDE SINÓNIMOS Y VARIACIONES:
  * "laptop" = "portátil" = "computador portátil" = "pc portátil"
  * "megapack" = "mega pack" = "mega packs" = "paquete completo"
  * "idioma" = "idiomas" = "lenguaje" = "lenguas"
  * "curso" = "curzo" = "capacitación" = "entrenamiento"
- 💡 INFIERE INTENCIÓN: "algo para trabajar" → laptops para oficina
- 🎯 BUSCA POR CONCEPTO, NO SOLO PALABRAS: 
  * "curso de música" → encuentra cursos de piano
  * "idioma" → encuentra megapack de idiomas
  * "aprender inglés" → encuentra cursos/megapacks de idiomas
- ⚠️ PREGUNTAS DE RECOMENDACIÓN: "¿cuál me recomiendas?" → isGeneralQuery=FALSE, recomienda EL MEJOR
- ⚠️ Si pregunta "para juegos", "para gaming", "para diseño", "para trabajo" → isGeneralQuery=FALSE, analiza y recomienda EL MEJOR
- ⚠️ CRÍTICO: Si menciona PRESUPUESTO, SOLO recomienda productos dentro de ese rango
- 🔥 TOLERANCIA MÁXIMA: Acepta cualquier variación razonable del nombre del producto

🔥 PRIORIDAD PARA CURSOS ESPECÍFICOS (CRÍTICO - REGLA ABSOLUTA):
- Si dice "curso de [tema]" (ej: "curso de piano", "curso de excel") → isGeneralQuery=FALSE
- DEBES buscar el producto que contenga AMBAS palabras: "curso" Y el tema específico ("piano", "excel", etc.)
- "curso de piano" → SOLO devuelve productos con "curso" Y "piano" en el nombre
- "curso de excel" → SOLO devuelve productos con "curso" Y "excel" en el nombre
- ❌ NUNCA devuelvas megapacks cuando preguntan por un curso específico
- ❌ NUNCA devuelvas "Mega Pack 40: Cursos Completos" cuando preguntan "curso de piano"
- ✅ SOLO devuelve el curso individual que coincida exactamente con el tema
- Si NO existe curso individual del tema, di found=false

EJEMPLO CORRECTO:
Cliente: "curso de piano"
Respuesta: {"found": true, "isGeneralQuery": false, "productIndex": [índice de "Curso Completo de Piano Online"], ...}

EJEMPLO INCORRECTO (NUNCA HAGAS ESTO):
Cliente: "curso de piano"  
Respuesta: {"found": true, "isGeneralQuery": true, "productIndexes": [40, 36, 8], ...} ❌ MAL

- CONSULTA GENERAL: "impresora", "laptop", "moto" → isGeneralQuery=true, devuelve múltiples opciones
- CONSULTA ESPECÍFICA: "impresora canon", "laptop ryzen 5" → isGeneralQuery=false, devuelve 1 producto
- CURSO ESPECÍFICO: "curso de piano", "curso excel" → isGeneralQuery=false, devuelve SOLO el curso individual
- MEGAPACKS: "megapack piano", "super megapack" → isGeneralQuery=false, devuelve el megapack

- Si menciona marca (Asus, HP, Lenovo) prioriza esa marca
- Si menciona tienda (MegaComputer, Propio) filtra por esa tienda
- Si dice "ese", "el que mencionaste", usa el contexto previo
- Nombres parciales son válidos (ej: "720u" puede ser "Ryzen 3 7320U")

EJEMPLOS DE RAZONAMIENTO CON TOLERANCIA A ERRORES:
1. "curso piano" → Razona: busca curso específico de piano → Encuentra: "Curso Completo de Piano Online" (IGNORA megapacks)
2. "curzo de piyano" → Corrige: "curso de piano" → Encuentra: "Curso Completo de Piano Online" (IGNORA megapacks)
3. "megapack piano" → Busca específicamente megapacks de piano
4. "mega pack" → Corrige: "megapack" → Encuentra: megapacks disponibles
5. "mega packs" → Corrige: "megapacks" → Encuentra: megapacks disponibles
6. "idioma" → Razona: busca aprender idiomas → Encuentra: "Megapack de Idiomas"
7. "idiosma" → Corrige: "idioma" → Encuentra: "Megapack de Idiomas"
8. "algo para trabajar" → Razona: necesita laptop para oficina → Encuentra: laptops apropiadas
9. "portatil gamer" → Corrige: "portátil" + razona: gaming → Encuentra: laptops gaming
10. "moto 150" → Razona: busca motos de 150cc → Encuentra: motos disponibles
11. "compu para diseño" → Corrige: "computador" + razona: diseño gráfico → Encuentra: laptops potentes
12. "cursos de ingles" → Razona: busca aprender inglés → Encuentra: megapacks o cursos de idiomas

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
        // 🤖 USAR IA PARA ANÁLISIS INTELIGENTE
        console.log('🤖 Llamando a IA para análisis inteligente...');
        
        let response = '';
        
        // 1️⃣ INTENTAR CON OLLAMA PRIMERO (IA principal)
        const disableOllama = process.env.DISABLE_OLLAMA === 'true';
        
        if (!disableOllama && process.env.OLLAMA_BASE_URL) {
            try {
                console.log('🌐 Intentando con Ollama (prioridad)...');
                
                const ollamaUrl = process.env.OLLAMA_BASE_URL;
                const ollamaModel = process.env.OLLAMA_MODEL || 'mistral:latest';
                
                // Timeout de 15 segundos para Ollama
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);
                
                const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: ollamaModel,
                        prompt: prompt,
                        stream: false,
                        options: {
                            temperature: 0.3,
                            num_predict: 500
                        }
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (ollamaResponse.ok) {
                    const data = await ollamaResponse.json();
                    response = data.response;
                    console.log('✅ Respuesta de Ollama recibida');
                    console.log('🤖 Respuesta IA (Ollama):', response.substring(0, 200));
                } else {
                    throw new Error('Ollama error');
                }
            } catch (ollamaError: any) {
                console.log('⚠️ Ollama no disponible:', ollamaError.message);
                
                // 2️⃣ FALLBACK A GROQ (si Ollama falla)
                try {
                    console.log('🤖 Usando Groq como fallback...');
                    
                    const { GroqAPIRotator } = await import('./groq-api-rotator');
                    
                    response = await GroqAPIRotator.makeRequest(
                        [{ role: 'user', content: prompt }],
                        {
                            temperature: 0.3,
                            maxTokens: 500
                        }
                    );
                    
                    console.log('✅ Respuesta de Groq (fallback) recibida');
                    console.log('🤖 Respuesta IA (Groq):', response.substring(0, 200));
                } catch (groqError: any) {
                    console.log('⚠️ Groq también falló:', groqError.message);
                    console.log('🔄 Usando fallback local (último recurso)');
                    
                    // FALLBACK: Búsqueda local simple por palabras clave
                    const messageLower = userMessage.toLowerCase();
                
                    // Buscar por palabras clave en nombre y descripción
                    const matchingProducts = products.filter(p => {
                        const nameLower = p.name.toLowerCase();
                        const descLower = (p.description || '').toLowerCase();
                        const searchText = `${nameLower} ${descLower}`;
                        
                        // Extraer palabras clave del mensaje
                        const keywords = messageLower.split(' ').filter(w => w.length > 3);
                        
                        // Verificar si alguna palabra clave coincide
                        return keywords.some(keyword => searchText.includes(keyword));
                    });
                    
                    if (matchingProducts.length === 0) {
                        console.log('❌ No se encontraron productos con fallback local');
                        return null;
                    }
                    
                    console.log(`✅ Fallback local encontró ${matchingProducts.length} productos`);
                    
                    // Si es consulta general, devolver múltiples
                    if (matchingProducts.length > 1) {
                        return {
                            products: matchingProducts.slice(0, 5),
                            confidence: 60,
                            reason: 'Búsqueda local por palabras clave',
                            shouldSendPhoto: false,
                            isGeneralQuery: true
                        };
                    }
                    
                    // Si es específico, devolver uno
                    return {
                        product: matchingProducts[0],
                        confidence: 70,
                        reason: 'Búsqueda local por palabras clave',
                        shouldSendPhoto: true,
                        isGeneralQuery: false
                    };
                }
            }
        } else {
            // Si Ollama está deshabilitado, usar Groq directamente
            try {
                console.log('⚠️ Ollama deshabilitado, usando Groq...');
                
                const { GroqAPIRotator } = await import('./groq-api-rotator');
                
                response = await GroqAPIRotator.makeRequest(
                    [{ role: 'user', content: prompt }],
                    {
                        temperature: 0.3,
                        maxTokens: 500
                    }
                );
                
                console.log('✅ Respuesta de Groq recibida');
                console.log('🤖 Respuesta IA (Groq):', response.substring(0, 200));
            } catch (groqError: any) {
                console.log('⚠️ Groq falló:', groqError.message);
                console.log('🔄 Usando fallback local');
                
                const messageLower = userMessage.toLowerCase();
                const matchingProducts = products.filter(p => {
                    const nameLower = p.name.toLowerCase();
                    const descLower = (p.description || '').toLowerCase();
                    const searchText = `${nameLower} ${descLower}`;
                    const keywords = messageLower.split(' ').filter(w => w.length > 3);
                    return keywords.some(keyword => searchText.includes(keyword));
                });
                
                if (matchingProducts.length === 0) {
                    return null;
                }
                
                if (matchingProducts.length > 1) {
                    return {
                        products: matchingProducts.slice(0, 5),
                        confidence: 60,
                        reason: 'Búsqueda local por palabras clave',
                        shouldSendPhoto: false,
                        isGeneralQuery: true
                    };
                }
                
                return {
                    product: matchingProducts[0],
                    confidence: 70,
                    reason: 'Búsqueda local por palabras clave',
                    shouldSendPhoto: true,
                    isGeneralQuery: false
                };
            }
        }

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
            let selectedProducts = analysis.productIndexes
                .map((idx: number) => products[idx - 1])
                .filter(Boolean);

            // 🎯 FILTRADO ESPECIAL PARA CURSOS: Si busca "curso de [tema]", priorizar cursos individuales
            const userMessageLower = userMessage.toLowerCase();
            const isSpecificCourseQuery = userMessageLower.includes('curso de') ||
                                         userMessageLower.includes('curso ') && !userMessageLower.includes('cursos');

            if (isSpecificCourseQuery) {
                console.log('🎯 Consulta específica de curso detectada, filtrando resultados...');

                // Extraer el tema del curso
                const courseTheme = extractCourseTheme(userMessageLower);

                // Filtrar productos que sean cursos individuales (no megapacks)
                const individualCourses = selectedProducts.filter(product => {
                    const productName = product.name.toLowerCase();
                    const isIndividualCourse = productName.includes('curso') &&
                                             !productName.includes('megapack') &&
                                             !productName.includes('mega pack') &&
                                             !productName.includes('super') &&
                                             !productName.includes('completo') &&
                                             productName.includes(courseTheme);

                    return isIndividualCourse;
                });

                // Si encontramos cursos individuales, usar solo esos
                if (individualCourses.length > 0) {
                    console.log(`✅ Encontrados ${individualCourses.length} cursos individuales para "${courseTheme}"`);
                    selectedProducts = individualCourses.slice(0, 1); // Solo 1 curso específico
                } else {
                    // Si no hay cursos individuales, buscar el más específico
                    const specificCourses = selectedProducts.filter(product => {
                        const productName = product.name.toLowerCase();
                        return productName.includes(courseTheme) &&
                               !productName.includes('super') &&
                               !productName.includes('completo');
                    });

                    if (specificCourses.length > 0) {
                        selectedProducts = specificCourses.slice(0, 1);
                    } else {
                        // Último recurso: tomar el primer producto que coincida
                        selectedProducts = selectedProducts.slice(0, 1);
                    }
                }
            } else {
                // 🎯 FILTRADO DE ACCESORIOS PARA PORTÁTILES
                // Si busca "portátil" o "laptop", eliminar accesorios de la lista
                if ((userMessageLower.includes('portátil') || userMessageLower.includes('portatil') || userMessageLower.includes('laptop')) &&
                    !userMessageLower.includes('base') && !userMessageLower.includes('soporte') && !userMessageLower.includes('funda')) {
                    
                    console.log('🎯 Filtrando accesorios de la lista de portátiles...');
                    const laptopsReales = selectedProducts.filter(p => {
                        const name = p.name.toLowerCase();
                        const category = (p.category || '').toLowerCase();
                        
                        // Lista completa de accesorios a excluir
                        const isAccessory = name.includes('base') || 
                                          name.includes('soporte') || 
                                          name.includes('funda') ||
                                          name.includes('cargador') ||
                                          name.includes('batería') ||
                                          name.includes('audifono') ||
                                          name.includes('audífono') ||
                                          name.includes('diadema') ||
                                          name.includes('airpod') ||
                                          name.includes('air pod') ||
                                          name.includes('earbud') ||
                                          name.includes('headphone') ||
                                          name.includes('mouse') ||
                                          name.includes('teclado') ||
                                          name.includes('parlante') ||
                                          name.includes('bafle') ||
                                          name.includes('altavoz') ||
                                          name.includes('bocina') ||
                                          name.includes('cable') ||
                                          name.includes('adaptador') ||
                                          name.includes('hub') ||
                                          name.includes('dock') ||
                                          category.includes('audio') ||
                                          category.includes('accesorio');
                        
                        return !isAccessory;
                    });

                    if (laptopsReales.length > 0) {
                        console.log(`✅ Filtrado completado: ${selectedProducts.length} -> ${laptopsReales.length} productos`);
                        selectedProducts = laptopsReales;
                    } else {
                        console.log('⚠️ El filtrado eliminó todos los productos. Buscando portátiles en toda la base de datos...');
                        // Fallback: Buscar en TODOS los productos disponibles
                        const allLaptops = products.filter(p => {
                            const name = p.name.toLowerCase();
                            const isLaptop = name.includes('portátil') || name.includes('portatil') || name.includes('laptop');
                            const isNotAccessory = !name.includes('base') && !name.includes('soporte') && !name.includes('funda');
                            return isLaptop && isNotAccessory;
                        });

                        if (allLaptops.length > 0) {
                            console.log(`✅ Fallback encontró ${allLaptops.length} portátiles reales`);
                            selectedProducts = allLaptops;
                        }
                    }
                }

                // 🔴 VALIDACIÓN CRÍTICA: Si busca "portátil", SOLO mostrar portátiles reales
                if ((userMessageLower.includes('portátil') || userMessageLower.includes('portatil') || userMessageLower.includes('laptop')) &&
                    !userMessageLower.includes('base') && !userMessageLower.includes('soporte') && !userMessageLower.includes('funda')) {
                    
                    console.log('🔴 Validación crítica: Filtrando para mostrar SOLO portátiles reales...');
                    const soloPortatiles = selectedProducts.filter(p => {
                        const name = p.name.toLowerCase();
                        const category = (p.category || '').toLowerCase();
                        
                        // DEBE contener "portátil", "portatil" o "laptop" en el nombre o categoría
                        const esPortatil = name.includes('portátil') || name.includes('portatil') || name.includes('laptop') ||
                                         category.includes('portátil') || category.includes('laptop') || category.includes('computador');
                        
                        return esPortatil;
                    });

                    if (soloPortatiles.length > 0) {
                        console.log(`✅ Filtrado crítico completado: ${selectedProducts.length} -> ${soloPortatiles.length} portátiles reales`);
                        selectedProducts = soloPortatiles;
                    } else {
                        console.log('⚠️ No se encontraron portátiles reales después del filtro crítico');
                        return null; // Si no hay portátiles reales, retornar null
                    }
                }

                // 🧠 ESTRATEGIA DE VENTAS: Iniciar con lo más económico
                // Aplicar solo a productos físicos con variaciones (laptops, impresoras, etc.)
                const isPhysicalTech = userMessageLower.includes('portátil') || userMessageLower.includes('portatil') || 
                                     userMessageLower.includes('laptop') || userMessageLower.includes('impresora') ||
                                     userMessageLower.includes('mouse') || userMessageLower.includes('teclado') ||
                                     userMessageLower.includes('parlante') || userMessageLower.includes('sonido');

                if (isPhysicalTech && selectedProducts.length >= 2) {
                    console.log('🧠 Aplicando estrategia de precios (Mostrar económicos primero)...');
                    
                    // Ordenar por precio ascendente
                    selectedProducts.sort((a, b) => a.price - b.price);
                    
                    // Tomar los 2 más económicos para iniciar
                    const cheap1 = selectedProducts[0];
                    const cheap2 = selectedProducts[1];
                    
                    selectedProducts = [cheap1, cheap2];
                    
                    // Eliminar duplicados por si acaso
                    selectedProducts = [...new Set(selectedProducts)];
                    
                    console.log(`✅ Selección estratégica (Económicos): ${selectedProducts.map(p => `${p.name} ($${p.price})`).join(', ')}`);
                } else {
                    selectedProducts = selectedProducts.slice(0, 3); // Máximo 3 opciones estándar
                }
            }

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
            let productIndex = analysis.productIndex - 1; // Convertir a 0-based
            let product = products[productIndex];

            // ⚠️ VALIDACIÓN: Verificar que el índice esté en rango
            if (productIndex < 0 || productIndex >= products.length) {
                console.log(`❌ Índice fuera de rango: ${analysis.productIndex} (máximo: ${products.length})`);
                return null;
            }

            const userMessageLower = userMessage.toLowerCase();
            const productNameLower = product.name.toLowerCase();

            // 🎹 VALIDACIÓN ESPECIAL PARA CURSOS: Si busca curso específico, verificar que no sea megapack
            const isSpecificCourseQuery = userMessageLower.includes('curso de') ||
                                         (userMessageLower.includes('curso ') && !userMessageLower.includes('cursos'));

            if (isSpecificCourseQuery) {
                const courseTheme = extractCourseTheme(userMessageLower);
                console.log(`🎯 Consulta específica de curso: "${courseTheme}"`);

                // Verificar si el producto seleccionado es un curso individual
                const isIndividualCourse = productNameLower.includes('curso') &&
                                         !productNameLower.includes('megapack') &&
                                         !productNameLower.includes('mega pack') &&
                                         !productNameLower.includes('super') &&
                                         !productNameLower.includes('completo') &&
                                         productNameLower.includes(courseTheme);

                if (!isIndividualCourse) {
                    console.log(`⚠️ Producto seleccionado no es curso individual: "${product.name}"`);
                    console.log(`🔄 Buscando curso individual de "${courseTheme}"...`);

                    // Buscar curso individual que coincida
                    const individualCourse = products.find(p => {
                        const name = p.name.toLowerCase();
                        return name.includes('curso') &&
                               !name.includes('megapack') &&
                               !name.includes('mega pack') &&
                               !name.includes('super') &&
                               !name.includes('completo') &&
                               name.includes(courseTheme);
                    });

                    if (individualCourse) {
                        console.log(`✅ Curso individual encontrado: ${individualCourse.name}`);
                        product = individualCourse;
                        productIndex = products.indexOf(individualCourse);
                    } else {
                        console.log(`⚠️ No se encontró curso individual, usando el producto original`);
                    }
                }
            }

            // 🔴 VALIDACIÓN CRÍTICA: Verificar que el producto coincida con la búsqueda
            const productDescLower = (product.description || '').toLowerCase();

            // Si busca "curso" o "megapack", el producto DEBE contener esas palabras
            if ((userMessageLower.includes('curso') || userMessageLower.includes('megapack') || userMessageLower.includes('mega pack')) &&
                !productNameLower.includes('curso') && !productNameLower.includes('megapack') && !productNameLower.includes('mega pack')) {
                console.log(`❌ Producto no coincide con búsqueda: "${product.name}" no es un curso/megapack`);
                console.log(`🔄 Buscando cursos/megapacks en la lista...`);

                // Buscar curso o megapack que coincida
                const cursoOMegapack = products.find(p => {
                    const name = p.name.toLowerCase();
                    const desc = (p.description || '').toLowerCase();
                    const matchesCurso = name.includes('curso') || name.includes('megapack') || name.includes('mega pack');
                    const matchesTema = userMessageLower.includes('idioma') ? (name.includes('idioma') || desc.includes('idioma')) : true;
                    return matchesCurso && matchesTema;
                });

                if (cursoOMegapack) {
                    console.log(`✅ Curso/Megapack encontrado: ${cursoOMegapack.name}`);
                    return {
                        product: cursoOMegapack,
                        confidence: 90,
                        reason: 'Curso/Megapack encontrado por validación',
                        shouldSendPhoto: true,
                        isGeneralQuery: false
                    };
                }

                console.log(`❌ No se encontró curso/megapack que coincida`);
                return null;
            }

            // Si busca "portátil" o "laptop", el producto DEBE ser un portátil real, no un accesorio
            if ((userMessageLower.includes('portátil') || userMessageLower.includes('portatil') || userMessageLower.includes('laptop')) &&
                !userMessageLower.includes('base') && !userMessageLower.includes('soporte') && !userMessageLower.includes('funda')) {
                
                const isAccessory = productNameLower.includes('base') || 
                                  productNameLower.includes('soporte') || 
                                  productNameLower.includes('funda') ||
                                  productNameLower.includes('cargador');
                
                if (isAccessory) {
                    console.log(`❌ Producto es un accesorio, no un portátil: "${product.name}"`);
                    console.log(`🔄 Buscando portátil real en la lista...`);

                    // Buscar un portátil real (que no sea accesorio)
                    const portatilReal = products.find(p => {
                        const name = p.name.toLowerCase();
                        const isLaptop = name.includes('portátil') || name.includes('portatil') || name.includes('laptop');
                        const isNotAccessory = !name.includes('base') && !name.includes('soporte') && !name.includes('funda');
                        return isLaptop && isNotAccessory;
                    });

                    if (portatilReal) {
                        console.log(`✅ Portátil real encontrado: ${portatilReal.name}`);
                        return {
                            product: portatilReal,
                            confidence: 95,
                            reason: 'Portátil real encontrado (filtrando accesorios)',
                            shouldSendPhoto: true,
                            isGeneralQuery: false
                        };
                    }
                }
            }

            // Si busca "portátil" o "laptop", el producto DEBE contener esas palabras
            if ((userMessageLower.includes('portátil') || userMessageLower.includes('portatil') || userMessageLower.includes('laptop')) &&
                !productNameLower.includes('portátil') && !productNameLower.includes('portatil') && !productNameLower.includes('laptop')) {
                console.log(`❌ Producto no coincide con búsqueda: "${product.name}" no es un portátil`);
                console.log(`🔄 Buscando portátiles en la lista...`);

                // Buscar el primer portátil en la lista (EXCLUYENDO ACCESORIOS)
                const portatil = products.find(p => {
                    const name = p.name.toLowerCase();
                    const isLaptop = name.includes('portátil') || name.includes('portatil') || name.includes('laptop');
                    const isNotAccessory = !name.includes('base') && !name.includes('soporte') && !name.includes('funda') &&
                                          !name.includes('cargador') && !name.includes('batería') && !name.includes('teclado') &&
                                          !name.includes('mouse') && !name.includes('audifono') && !name.includes('diadema') &&
                                          !name.includes('parlante') && !name.includes('bafle') && !name.includes('sonido') &&
                                          !name.includes('aire') && !name.includes('ventilador') && !name.includes('mesa') &&
                                          !name.includes('envase') && !name.includes('disco') && !name.includes('memoria');
                    return isLaptop && isNotAccessory;
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

            // 🔴 VALIDACIÓN ADICIONAL: Si busca "idioma", verificar que el producto tenga relación
            if (userMessageLower.includes('idioma') && 
                !productNameLower.includes('idioma') && 
                !productDescLower.includes('idioma') &&
                !productNameLower.includes('inglés') &&
                !productNameLower.includes('francés') &&
                !productNameLower.includes('alemán')) {
                console.log(`❌ Producto no coincide con búsqueda de idiomas: "${product.name}"`);
                console.log(`🔄 Buscando productos de idiomas...`);

                // Buscar producto relacionado con idiomas
                const productoIdiomas = products.find(p => {
                    const name = p.name.toLowerCase();
                    const desc = (p.description || '').toLowerCase();
                    return name.includes('idioma') || desc.includes('idioma') || 
                           name.includes('inglés') || name.includes('francés') || name.includes('alemán');
                });

                if (productoIdiomas) {
                    console.log(`✅ Producto de idiomas encontrado: ${productoIdiomas.name}`);
                    return {
                        product: productoIdiomas,
                        confidence: 90,
                        reason: 'Producto de idiomas encontrado por validación',
                        shouldSendPhoto: true,
                        isGeneralQuery: false
                    };
                }

                console.log(`❌ No se encontró producto de idiomas`);
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

    // Si la IA no encontró nada con suficiente confianza, retornar null
    console.log('⚠️ No se encontró producto con suficiente confianza');
    return null;
}
