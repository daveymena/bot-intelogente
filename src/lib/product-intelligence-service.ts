/**
 * 🧠 SERVICIO DE INTELIGENCIA DE PRODUCTOS
 * Maneja respuestas específicas e inteligentes sobre productos
 * ✨ CON TOLERANCIA A ERRORES DE ESCRITURA (Fuzzy Matching)
 * 🏷️ CON SISTEMA DE CATEGORÍAS Y SUBCATEGORÍAS
 */

import { db } from './db'
import { FuzzyMatchService } from './fuzzy-match-service'
import { CategorySearchService } from './category-search-service'
import { findCategoryByKeywords } from './product-categories'

export interface ProductIntent {
    type: 'info' | 'price' | 'link' | 'buy' | 'availability' | 'general' | 'photo'
    confidence: number
    keywords: string[]
}

export interface ProductResponse {
    text: string
    product: any
    intent: ProductIntent
    hasLinks: boolean
    links?: {
        info?: string
        buy?: string
    }
    images?: string[]
    isGeneralQuery?: boolean  // Nueva: indica si es búsqueda general
    matchingProducts?: any[]  // Nueva: productos que coinciden
    needsQualification?: boolean  // Nueva: necesita hacer preguntas
}

export class ProductIntelligenceService {
    /**
     * Extraer palabras clave del mensaje
     */
    private static extractKeywords(query: string): string[] {
        const queryLower = query.toLowerCase()

        // Palabras a ignorar (stop words) - AMPLIADO
        const stopWords = [
            'info', 'información', 'informacion', 'dame', 'el', 'la', 'los', 'las',
            'un', 'una', 'del', 'de', 'cuánto', 'cuanto', 'cuesta', 'precio',
            'quiero', 'deseo', 'necesito', 'busco', 'hay', 'tienes', 'tienen', 'tiene',
            'disponible', 'link', 'enlace', 'comprar', 'sobre', 'acerca', 'ese',
            'esa', 'esto', 'esta', 'para', 'por', 'con', 'sin', 'más', 'mas',
            'sus', 'papeles', 'día', 'dia', 'documentos', 'garantía', 'garantia',
            'color', 'colores', 'envío', 'envio', 'entrega', 'pago', 'pagos',
            'métodos', 'metodos', 'forma', 'formas', 'como', 'cómo', 'que', 'qué',
            'ver', 'veo', 'vea', 'veas', 'ves', 'fotos', 'foto', 'imagen', 'imagenes',
            'detalles', 'detalle', 'características', 'caracteristicas', 'especificaciones',
            'saber', 'conocer', 'mostrar', 'muestra', 'muestrame', 'muéstrame',
            'enviar', 'envia', 'envía', 'manda', 'mandar', 'pasa', 'pasar',
            'puedes', 'puede', 'podría', 'podria', 'podrías', 'podrias',
            'gustaría', 'gustaria', 'quisiera', 'me', 'te', 'le', 'nos', 'les',
            'si', 'sí', 'no', 'tal', 'vez', 'quizá', 'quizás', 'quiza', 'quizas'
        ]

        // Dividir en palabras y filtrar
        const words = queryLower
            .split(/\s+/)
            .map(word => word.replace(/[?¿!¡.,;:]/g, '')) // Quitar puntuación de cada palabra
            .filter(word => word.length > 2) // Palabras de más de 2 caracteres
            .filter(word => !stopWords.includes(word))

        return words
    }

    /**
     * Buscar producto específico en la base de datos
     */
    static async findProduct(query: string, userId: string): Promise<any | null> {
        try {
            console.log(`🔍 [Product Intelligence] Buscando producto: "${query}"`)

            // Normalizar query con el nuevo normalizador
            const { TextNormalizer } = await import('./text-normalizer')
            const normalized = TextNormalizer.normalize(query)
            const queryLower = normalized.toLowerCase()

            console.log(`🔤 [Product Intelligence] Query normalizada: "${normalized}"`)

            // 🔍 CORRECCIÓN DE ERRORES DE ESCRITURA (Fuzzy matching)
            const dictionary = FuzzyMatchService.getCommonProductTerms()
            const correctionResult = FuzzyMatchService.correctTypos(queryLower, dictionary, 0.7)
            
            if (correctionResult.corrections.length > 0) {
                console.log(`✏️ [Product Intelligence] Correcciones aplicadas:`)
                correctionResult.corrections.forEach(c => {
                    console.log(`   "${c.original}" → "${c.corrected}" (${(c.similarity * 100).toFixed(0)}% similar)`)
                })
            }

            // Usar query corregida para búsqueda
            const correctedQuery = correctionResult.corrected
            console.log(`🔍 [Product Intelligence] Query corregida: "${correctedQuery}"`)

            // Detectar intención de producto
            const intent = TextNormalizer.detectProductIntent(correctedQuery)
            if (intent.isProductQuery) {
                console.log(`🎯 [Product Intelligence] Tipo de producto detectado: ${intent.productType || 'general'}`)
                console.log(`🔑 [Product Intelligence] Keywords detectadas: ${intent.keywords.join(', ')}`)
            }

            // 🎯 DETECTAR INTENCIÓN DE MEGAPACKS
            const megapackIntent = FuzzyMatchService.detectMegapackIntent(correctedQuery)
            
            if (megapackIntent.isMegapackQuery) {
                console.log(`🎯 [Product Intelligence] Intención de megapack detectada:`)
                console.log(`   - Quiere todos: ${megapackIntent.wantsAll}`)
                console.log(`   - Número específico: ${megapackIntent.specificNumber || 'ninguno'}`)
                
                // Si quiere "todos los megapacks" o "pack completo"
                if (megapackIntent.wantsAll) {
                    console.log(`📦 [Product Intelligence] Usuario busca TODOS los megapacks`)
                    
                    // Buscar el producto que contenga "40" y "megapack"
                    const allMegapacks = await db.product.findMany({
                        where: {
                            userId,
                            status: 'AVAILABLE',
                            OR: [
                                { name: { contains: 'megapack', mode: 'insensitive' } },
                                { name: { contains: 'mega pack', mode: 'insensitive' } },
                                { description: { contains: 'megapack', mode: 'insensitive' } }
                            ]
                        }
                    })
                    
                    // Buscar el que tenga "40" en el nombre o descripción
                    const pack40 = allMegapacks.find(p => 
                        p.name.includes('40') || 
                        p.description?.includes('40') ||
                        p.name.toLowerCase().includes('completo') ||
                        p.description?.toLowerCase().includes('completo')
                    )
                    
                    if (pack40) {
                        console.log(`✅ [Product Intelligence] Pack completo encontrado: ${pack40.name}`)
                        return pack40
                    }
                    
                    // Si no encuentra el pack de 40, devolver el primero
                    if (allMegapacks.length > 0) {
                        console.log(`⚠️ [Product Intelligence] No se encontró pack de 40, devolviendo primer megapack`)
                        return allMegapacks[0]
                    }
                }
                
                // Si busca un número específico
                if (megapackIntent.specificNumber) {
                    console.log(`🔢 [Product Intelligence] Buscando Megapack ${megapackIntent.specificNumber}`)
                    
                    const specificPack = await db.product.findFirst({
                        where: {
                            userId,
                            status: 'AVAILABLE',
                            OR: [
                                { name: { contains: `megapack ${megapackIntent.specificNumber}`, mode: 'insensitive' } },
                                { name: { contains: `mega pack ${megapackIntent.specificNumber}`, mode: 'insensitive' } },
                                { name: { contains: `pack ${megapackIntent.specificNumber}`, mode: 'insensitive' } }
                            ]
                        }
                    })
                    
                    if (specificPack) {
                        console.log(`✅ [Product Intelligence] Megapack específico encontrado: ${specificPack.name}`)
                        return specificPack
                    }
                }
            }

            // Extraer palabras clave del mensaje corregido
            const keywords = this.extractKeywords(correctedQuery)
            console.log(`[Product Intelligence] 🔍 Keywords (interno): ${keywords.join(', ')}`)

            // ⚠️ IMPORTANTE: Si no hay palabras clave significativas, NO buscar
            // Esto evita búsquedas incorrectas con mensajes genéricos como "ver más información"
            if (keywords.length === 0 && !megapackIntent.isMegapackQuery) {
                console.log(`❌ [Product Intelligence] No hay palabras clave significativas - usar contexto de memoria`)
                return null
            }

            // 🚨 DETECTAR SI BUSCA ESPECÍFICAMENTE NUEVO O USADO
            const buscaUsado = queryLower.includes('usado') || 
                               queryLower.includes('usada') || 
                               queryLower.includes('segunda mano') ||
                               queryLower.includes('reacondicionado')
            
            const buscaNuevo = queryLower.includes('nuevo') || 
                               queryLower.includes('nueva') ||
                               queryLower.includes('0 km') ||
                               queryLower.includes('sin usar')

            console.log(`🔍 [Product Intelligence] Filtro - Usado: ${buscaUsado}, Nuevo: ${buscaNuevo}`)

            // Obtener todos los productos disponibles
            const allProducts = await db.product.findMany({
                where: {
                    userId,
                    status: 'AVAILABLE'
                }
            })

            if (allProducts.length === 0) {
                console.log(`❌ [Product Intelligence] No hay productos disponibles`)
                return null
            }

            // 🎯 DETECTAR TIPO DE PRODUCTO (Físico vs Digital)
            const { ProductTypeDetector } = await import('./product-type-detector')
            const typeIntent = ProductTypeDetector.detectProductType(correctedQuery)
            
            // 🚨 FILTRAR POR CONDICIÓN SI SE ESPECIFICÓ
            let filteredProducts = allProducts

            if (buscaUsado) {
                filteredProducts = allProducts.filter(p => {
                    const nameLower = p.name.toLowerCase()
                    const descLower = (p.description || '').toLowerCase()
                    const esUsado = nameLower.includes('usado') || 
                                    nameLower.includes('usada') ||
                                    descLower.includes('usado') ||
                                    descLower.includes('usada')
                    return esUsado
                })
                console.log(`🔍 [Product Intelligence] Filtrados ${filteredProducts.length} productos USADOS`)
            } else if (buscaNuevo) {
                filteredProducts = allProducts.filter(p => {
                    const nameLower = p.name.toLowerCase()
                    const descLower = (p.description || '').toLowerCase()
                    const esUsado = nameLower.includes('usado') || 
                                    nameLower.includes('usada') ||
                                    descLower.includes('usado') ||
                                    descLower.includes('usada')
                    return !esUsado // Solo productos que NO son usados
                })
                console.log(`🔍 [Product Intelligence] Filtrados ${filteredProducts.length} productos NUEVOS`)
            }

            // 🎯 FILTRAR POR TIPO DE PRODUCTO (Físico vs Digital)
            if (typeIntent.confidence >= 0.6) {
                filteredProducts = ProductTypeDetector.filterByType(filteredProducts, typeIntent)
            }

            if (filteredProducts.length === 0) {
                console.log(`❌ [Product Intelligence] No hay productos ${buscaUsado ? 'USADOS' : 'NUEVOS'} disponibles`)
                return null
            }

            // Buscar coincidencias específicas primero (incluyendo palabras del mensaje original)
            // 🎯 ORDEN IMPORTANTE: De más específico a más genérico
            const specificMatches = [
                // 🎹 INSTRUMENTOS MUSICALES (MUY ESPECÍFICOS - PRIMERO)
                { keywords: ['piano'], name: 'piano', searchIn: 'name', priority: 100 },
                { keywords: ['guitarra'], name: 'guitarra', searchIn: 'name', priority: 100 },
                { keywords: ['bateria', 'batería'], name: 'bateria', searchIn: 'name', priority: 100 },
                
                // 🌍 IDIOMAS (MÁXIMA PRIORIDAD - ANTES DE "CURSO" GENÉRICO)
                { keywords: ['idiomas', 'idioma', 'lenguajes', 'lenguaje'], name: 'idiomas', searchIn: 'both', priority: 99 },
                { keywords: ['ingles', 'inglés', 'english'], name: 'inglés', searchIn: 'both', priority: 99 },
                { keywords: ['frances', 'francés', 'french'], name: 'francés', searchIn: 'both', priority: 99 },
                { keywords: ['aleman', 'alemán', 'german'], name: 'alemán', searchIn: 'both', priority: 99 },
                { keywords: ['italiano', 'italian'], name: 'italiano', searchIn: 'both', priority: 99 },
                { keywords: ['portugues', 'português', 'portuguese'], name: 'portugués', searchIn: 'both', priority: 99 },
                { keywords: ['chino', 'chinese', 'mandarin'], name: 'chino', searchIn: 'both', priority: 99 },
                { keywords: ['japones', 'japonés', 'japanese'], name: 'japonés', searchIn: 'both', priority: 99 },
                
                // 📚 CURSOS Y MEGAPACKS (ALTA PRIORIDAD - DESPUÉS DE IDIOMAS)
                { keywords: ['curso', 'cursos', 'capacitacion', 'capacitación', 'aprender'], name: 'curso', searchIn: 'name', priority: 98 },
                { keywords: ['mega pack', 'megapack', 'pack completo'], name: 'mega pack', searchIn: 'name', priority: 98 },
                { keywords: ['diseño grafico', 'diseño gráfico', 'photoshop', 'illustrator', 'indesign'], name: 'diseño', searchIn: 'name', priority: 97 },
                
                // 📱 REPARACIÓN DE CELULARES Y TABLETS
                { keywords: ['reparacion', 'reparación', 'celular', 'celulares', 'telefono', 'teléfono', 'movil', 'móvil', 'tablet', 'tablets'], name: 'reparación', searchIn: 'both', priority: 95 },
                
                // 💻 PRODUCTOS FÍSICOS ESPECÍFICOS
                { keywords: ['macbook', 'mac', 'apple'], name: 'macbook', searchIn: 'name', priority: 95 },
                { keywords: ['moto', 'pulsar', 'bajaj'], name: 'bajaj', searchIn: 'name', priority: 95 },
                { keywords: ['asus', 'vivobook'], name: 'asus', searchIn: 'name', priority: 95 },
                { keywords: ['hp'], name: 'hp', searchIn: 'name', priority: 95 },
                { keywords: ['lenovo'], name: 'lenovo', searchIn: 'name', priority: 95 },
                
                // 🎧 ACCESORIOS (BAJA PRIORIDAD - DESPUÉS DE CURSOS)
                { keywords: ['auricular', 'auriculares', 'tws', 'bluetooth'], name: 'auricular', searchIn: 'name', priority: 70 },
                
                // 💻 GENÉRICOS (ÚLTIMA PRIORIDAD)
                { keywords: ['laptop', 'laptops', 'portatil', 'computador', 'computadora'], name: 'laptop', searchIn: 'name', priority: 50 }
            ]

            // Buscar por coincidencias específicas (buscar en el mensaje original, no solo en keywords)
            // 🎯 ORDENAR POR PRIORIDAD (más específico primero)
            const sortedMatches = specificMatches.sort((a, b) => (b.priority || 0) - (a.priority || 0))
            
            for (const match of sortedMatches) {
                const hasKeywordInQuery = match.keywords.some(kw => queryLower.includes(kw))
                if (hasKeywordInQuery) {
                    console.log(`🎯 [Product Intelligence] Buscando coincidencia específica: ${match.name} (prioridad: ${match.priority})`)
                    
                    // Buscar producto que contenga el nombre en su nombre o descripción
                    // 🚨 USAR filteredProducts en lugar de allProducts
                    const found = filteredProducts.find(p => {
                        const nameLower = p.name.toLowerCase()
                        const descLower = (p.description || '').toLowerCase()
                        
                        // Para "laptop", buscar cualquier laptop
                        if (match.name === 'laptop') {
                            return nameLower.includes('laptop') || 
                                   nameLower.includes('asus') || 
                                   nameLower.includes('hp') || 
                                   nameLower.includes('lenovo') ||
                                   nameLower.includes('macbook') ||
                                   descLower.includes('laptop')
                        }
                        
                        // 🎯 CRÍTICO: Para productos de ALTA PRIORIDAD (>= 95), buscar SOLO en nombre
                        // NO en descripción (para evitar confusión)
                        // Esto incluye: instrumentos musicales, cursos, megapacks, diseño
                        if (match.priority >= 95) {
                            const matchInName = nameLower.includes(match.name)
                            // Si busca curso/megapack, SOLO productos DIGITALES
                            if (match.name.includes('curso') || match.name.includes('mega pack')) {
                                return matchInName && p.category === 'DIGITAL'
                            }
                            return matchInName
                        }
                        
                        // Para idiomas, buscar en nombre Y descripción
                        if (match.searchIn === 'both') {
                            return nameLower.includes(match.name) || descLower.includes(match.name)
                        }
                        
                        // Buscar en nombre (ya está en minúsculas)
                        return nameLower.includes(match.name)
                    })
                    
                    if (found) {
                        console.log(`✅ [ESPECÍFICO] Producto encontrado: ${found.name} (prioridad: ${match.priority})`)
                        
                        // 🌍 CASO ESPECIAL: Si busca "idiomas" en general, retornar el más completo
                        if (match.name === 'idiomas') {
                            const allIdiomasProducts = filteredProducts.filter(p => {
                                const nameLower = p.name.toLowerCase()
                                const descLower = (p.description || '').toLowerCase()
                                return nameLower.includes('idiomas') || 
                                       nameLower.includes('idioma') ||
                                       nameLower.includes('inglés') ||
                                       nameLower.includes('ingles') ||
                                       descLower.includes('idiomas')
                            })
                            
                            if (allIdiomasProducts.length > 1) {
                                console.log(`🌍 [MÚLTIPLES IDIOMAS] Encontrados ${allIdiomasProducts.length} productos de idiomas`)
                                
                                // Buscar el que tenga "Cursos Idiomas" (más completo) o el que tenga más idiomas en descripción
                                const masCompleto = allIdiomasProducts.find(p => 
                                    p.name.toLowerCase().includes('cursos idiomas') ||
                                    p.name.toLowerCase().includes('mega pack 08')
                                )
                                
                                if (masCompleto) {
                                    console.log(`✅ [IDIOMAS] Retornando producto más completo: ${masCompleto.name}`)
                                    return masCompleto
                                }
                                
                                // Si no encuentra el más completo, retornar el primero
                                console.log(`✅ [IDIOMAS] Retornando primer producto: ${allIdiomasProducts[0].name}`)
                                return allIdiomasProducts[0]
                            }
                        }
                        
                        // 🚨 CRÍTICO: Si es ALTA PRIORIDAD (>= 95), RETORNAR INMEDIATAMENTE
                        // NO seguir buscando - el usuario pidió algo ESPECÍFICO
                        if (match.priority >= 95) {
                            console.log(`🎯 [ESPECÍFICO] Retornando producto de alta prioridad - NO buscar más`)
                            return found
                        }
                        return found
                    } else {
                        console.log(`⚠️ [Product Intelligence] No se encontró producto para: ${match.name}`)
                    }
                }
            }

            // Buscar por cualquier palabra clave en nombre, descripción o tags
            // 🚨 USAR filteredProducts en lugar de allProducts
            // ✨ CON FUZZY MATCHING para tolerar errores de escritura
            const scoredProducts = filteredProducts.map(p => {
                let score = 0
                const nameLower = p.name.toLowerCase()
                const descLower = (p.description || '').toLowerCase()
                const tagsLower = (p.tags || '').toLowerCase()

                keywords.forEach(keyword => {
                    const keywordLower = keyword.toLowerCase()
                    
                    // Coincidencia exacta en nombre vale mucho más
                    if (nameLower.includes(keywordLower)) {
                        score += 15
                    } else {
                        // 🔍 FUZZY MATCHING: Buscar palabras similares
                        const nameWords = nameLower.split(/\s+/)
                        for (const nameWord of nameWords) {
                            const similarity = FuzzyMatchService.calculateSimilarity(keywordLower, nameWord)
                            if (similarity >= 0.7) {
                                // Palabra similar encontrada
                                score += Math.floor(15 * similarity)
                                console.log(`🔍 [Fuzzy] "${keywordLower}" ≈ "${nameWord}" (${(similarity * 100).toFixed(0)}%)`)
                            }
                        }
                    }
                    
                    // Búsqueda en descripción (exacta y fuzzy)
                    if (descLower.includes(keywordLower)) {
                        score += 3
                    } else if (FuzzyMatchService.fuzzySearch(keywordLower, descLower, 0.7)) {
                        score += 2
                    }
                    
                    // Búsqueda en tags
                    if (tagsLower.includes(keywordLower)) score += 2
                    
                    // Bonus: coincidencia al inicio del nombre
                    if (nameLower.startsWith(keywordLower)) score += 5
                    
                    // Bonus: palabra completa en el nombre
                    const nameWords = nameLower.split(/\s+/)
                    if (nameWords.some(word => word === keywordLower)) score += 10
                })

                return { product: p, score }
            })

            // Ordenar por score y tomar el mejor
            // Score mínimo reducido a 5 para ser más flexible
            const bestMatches = scoredProducts
                .filter(sp => sp.score >= 5)
                .sort((a, b) => b.score - a.score)

            if (bestMatches.length > 0) {
                const bestMatch = bestMatches[0]
                console.log(`✅ [Product Intelligence] Producto encontrado: ${bestMatch.product.name} (score: ${bestMatch.score})`)
                
                // Si hay múltiples productos con score similar, ordenar por precio
                const similarMatches = bestMatches.filter(sp => sp.score >= bestMatch.score * 0.8)
                if (similarMatches.length > 1) {
                    console.log(`📊 [Product Intelligence] ${similarMatches.length} productos similares - ordenando por precio`)
                    similarMatches.sort((a, b) => a.product.price - b.product.price)
                    return similarMatches[0].product // Retornar el más económico
                }
                
                return bestMatch.product
            }

            console.log(`❌ [Product Intelligence] No se encontraron productos con suficiente coincidencia (score mínimo: 5)`)
            return null

        } catch (error) {
            console.error('❌ [Product Intelligence] Error buscando producto:', error)
            return null
        }
    }

    /**
     * Detectar la intención del cliente
     */
    static detectIntent(message: string): ProductIntent {
        const messageLower = message.toLowerCase()

        // Intención: LINK/ENLACE
        if (/(link|enlace|url|página|pagina|dame el|envía|envia|manda|pasa).*(link|enlace|url|página|pagina)/i.test(messageLower) ||
            /^(link|enlace|url)$/i.test(messageLower)) {
            return {
                type: 'link',
                confidence: 0.95,
                keywords: ['link', 'enlace', 'url']
            }
        }

        // Intención: COMPRAR
        if (/(quiero|deseo|me gustaría|quisiera).*(comprar|adquirir|pedir|ordenar)/i.test(messageLower) ||
            /(comprar|compra|pedido|orden)/i.test(messageLower)) {
            return {
                type: 'buy',
                confidence: 0.95,
                keywords: ['comprar', 'pedido']
            }
        }

        // Intención: PRECIO (cuando pregunta "cuánto cuesta X?")
        // Si menciona un producto específico, debe buscar info del producto
        if (/(cuánto|cuanto).*(cuesta|vale|precio|costo)/i.test(messageLower)) {
            return {
                type: 'info', // Cambiado a info para que muestre detalles del producto
                confidence: 0.9,
                keywords: ['precio', 'cuesta']
            }
        }

        // Intención: BÚSQUEDA DE PRODUCTOS (cuando pregunta "tienes X?")
        // Esto debe ser product_list, no availability
        if (/(tienes|tienen|hay|venden).+\?/i.test(messageLower)) {
            return {
                type: 'general', // Cambiado a general para que busque productos
                confidence: 0.85,
                keywords: ['tienes', 'buscar']
            }
        }

        // Intención: DISPONIBILIDAD (solo para preguntas específicas de stock)
        if (/(disponible|stock|queda|quedan)/i.test(messageLower)) {
            return {
                type: 'general', // Cambiado a general para que busque productos
                confidence: 0.85,
                keywords: ['disponible', 'stock']
            }
        }

        // Intención: INFORMACIÓN
        if (/(info|información|informacion|detalles|características|caracteristicas|especificaciones|sobre|acerca)/i.test(messageLower)) {
            return {
                type: 'info',
                confidence: 0.9,
                keywords: ['info', 'detalles']
            }
        }

        // Por defecto: GENERAL
        return {
            type: 'general',
            confidence: 0.7,
            keywords: []
        }
    }

    /**
     * Extraer enlaces del producto (SOLO para productos digitales)
     */
    static extractLinks(product: any): { info?: string, buy?: string, mercadopago?: string, paypal?: string, contacto?: string } {
        const links: { info?: string, buy?: string, mercadopago?: string, paypal?: string, contacto?: string } = {}

        try {
            // Intentar parsear tags como JSON
            const tags = product.tags ? JSON.parse(product.tags) : []

            for (const tag of tags) {
                if (typeof tag === 'string') {
                    // Extraer tags con prefijos de métodos de pago
                    if (tag.startsWith('hotmart:')) {
                        links.buy = tag.replace('hotmart:', '')
                    } else if (tag.startsWith('mercadopago:')) {
                        links.mercadopago = tag.replace('mercadopago:', '')
                    } else if (tag.startsWith('paypal:')) {
                        links.paypal = tag.replace('paypal:', '')
                    } else if (tag.startsWith('contacto:')) {
                        links.contacto = tag.replace('contacto:', '')
                    } else if (tag.startsWith('http')) {
                        // URLs sin prefijo
                        if (tag.includes('pay.hotmart') || tag.includes('checkout') || tag.includes('buy')) {
                            links.buy = tag
                        } else if (tag.includes('landein') || tag.includes('page') || tag.includes('info')) {
                            links.info = tag
                        } else if (!links.info) {
                            links.info = tag
                        }
                    }
                }
            }
        } catch (e) {
            // Si no es JSON, buscar URLs en el string
            const urlRegex = /(https?:\/\/[^\s,]+)/g
            const matches = product.tags?.match(urlRegex) || []

            for (const url of matches) {
                if (url.includes('pay.hotmart') || url.includes('checkout')) {
                    links.buy = url
                } else if (!links.info) {
                    links.info = url
                }
            }
        }

        // ⚠️ SOLO GENERAR ENLACES PARA PRODUCTOS DIGITALES
        // Productos físicos NO tienen links de pago automáticos
        if (product.category === 'DIGITAL') {
            // Si no tiene MercadoPago configurado, no generar
            // Solo usar los links que están en los tags
            if (!links.buy && !links.mercadopago && !links.paypal) {
                // No generar links dinámicos, dejar vacío
                // El bot ofrecerá contacto directo
            }
        } else {
            // Productos físicos: NUNCA generar links de pago
            // Limpiar cualquier link que se haya extraído por error
            links.buy = undefined
            links.mercadopago = undefined
            links.paypal = undefined
            
            // Agregar contacto directo
            links.contacto = '+57 304 274 8687'
        }

        return links
    }



    /**
     * Extraer imágenes del producto
     */
    static extractImages(product: any): string[] {
        try {
            return product.images ? JSON.parse(product.images) : []
        } catch (e) {
            return []
        }
    }

    /**
     * Generar respuesta según la intención
     */
    static async generateResponse(
        product: any,
        intent: ProductIntent,
        context?: any
    ): Promise<ProductResponse> {
        const links = this.extractLinks(product)
        const images = this.extractImages(product)
        const hasLinks = !!(links.info || links.buy)

        // Emoji según categoría
        const emoji = this.getProductEmoji(product)

        let text = ''

        switch (intent.type) {
            case 'info':
                text = this.generateInfoResponse(product, emoji, links, images)
                break

            case 'price':
                text = this.generatePriceResponse(product, emoji, links)
                break

            case 'link':
                text = this.generateLinkResponse(product, emoji, links)
                break

            case 'buy':
                text = this.generateBuyResponse(product, emoji, links)
                break

            case 'availability':
                text = this.generateAvailabilityResponse(product, emoji)
                break

            default:
                text = this.generateGeneralResponse(product, emoji, links, images)
        }

        return {
            text,
            product,
            intent,
            hasLinks,
            links,
            images
        }
    }

    /**
     * Generar respuesta de INFORMACIÓN
     */
    private static generateInfoResponse(product: any, emoji: string, links: any, images: string[]): string {
        let response = `${emoji} **${product.name}**\n\n`

        if (product.description) {
            // Extraer características si están en formato de lista
            const lines = product.description.split(/[,\n]/).filter((l: string) => l.trim())
            if (lines.length > 1) {
                lines.slice(0, 5).forEach((line: string) => {
                    response += `✅ ${line.trim()}\n`
                })
            } else {
                response += `${product.description}\n\n`
            }
        }

        response += `\n💰 Precio: $${product.price.toLocaleString('es-CO')} COP\n`

        if (product.stock) {
            response += `📦 ${product.stock} unidades disponibles\n`
        }

        if (images.length > 0) {
            response += `📸 ${images.length} foto${images.length > 1 ? 's' : ''} disponible${images.length > 1 ? 's' : ''}\n`
        }

        response += `\n¿Te interesa?`

        return response
    }

    /**
     * Generar respuesta de PRECIO
     */
    private static generatePriceResponse(product: any, emoji: string, links: any): string {
        let response = `El ${product.name} cuesta $${product.price.toLocaleString('es-CO')} COP ${emoji}\n\n`

        if (product.stock) {
            response += `Tenemos ${product.stock} unidades disponibles.\n`
        }

        if (links.buy) {
            response += `¿Deseas el enlace de compra?`
        } else {
            response += `¿Deseas más información o hacer el pedido?`
        }

        return response
    }

    /**
     * Generar respuesta de LINK
     */
    private static generateLinkResponse(product: any, emoji: string, links: any): string {
        // Productos físicos: SIEMPRE contacto directo
        if (product.category === 'PHYSICAL') {
            return `Para adquirir ${product.name} ${emoji}, contáctanos directamente:\n\n📞 WhatsApp: +57 304 274 8687\n📧 deinermen25@gmail.com\n📍 Centro Comercial El Diamante 2, San Nicolás, Cali\n\nMétodos de pago:\n✅ Efectivo\n✅ Transferencia\n✅ Nequi/Daviplata\n✅ Tarjeta`
        }

        // Productos digitales: Verificar si tiene links
        if (!links.buy && !links.mercadopago && !links.paypal) {
            return `Para adquirir ${product.name} ${emoji}, contáctanos:\n\n📱 WhatsApp: +57 304 274 8687\n📧 deinermen25@gmail.com`
        }

        let response = `¡Perfecto! ${emoji}\n\n`

        if (links.buy) {
            response += `Aquí está el enlace de compra:\n👉 ${links.buy}\n\n`
        }

        if (links.mercadopago && !links.buy) {
            response += `Mercado Pago:\n👉 ${links.mercadopago}\n\n`
        }

        if (links.info) {
            response += `También puedes ver más info aquí:\n📄 ${links.info}\n\n`
        }

        response += `Acceso inmediato después del pago ✅`

        return response
    }

    /**
     * Generar respuesta de COMPRA
     */
    private static generateBuyResponse(product: any, emoji: string, links: any): string {
        let response = `¡Excelente decisión! 🎉\n\n`
        response += `${product.name}: ${product.price.toLocaleString('es-CO')} COP\n\n`

        // Productos físicos: SIEMPRE contacto directo
        if (product.category === 'PHYSICAL') {
            response += `Para hacer tu pedido:\n📱 WhatsApp: +57 304 274 8687\n📧 deinermen25@gmail.com\n📍 Centro Comercial El Diamante 2, San Nicolás, Cali\n\nMétodos de pago:\n✅ Efectivo\n✅ Transferencia\n✅ Nequi/Daviplata\n✅ Tarjeta`
            return response
        }

        // Productos digitales: Verificar links
        if (links.buy) {
            response += `Compra aquí:\n👉 ${links.buy}\n\n`
            response += `Acceso inmediato después del pago ✅`
        } else if (links.mercadopago) {
            response += `Compra aquí:\n👉 ${links.mercadopago}\n\n`
            response += `Acceso inmediato después del pago ✅`
        } else {
            response += `Para hacer tu pedido:\n📱 WhatsApp: +57 304 274 8687\n📧 deinermen25@gmail.com\n\n`
            response += `¿Necesitas ayuda con algo más?`
        }

        return response
    }

    /**
     * Generar respuesta de DISPONIBILIDAD
     */
    private static generateAvailabilityResponse(product: any, emoji: string): string {
        let response = `${emoji} ${product.name}\n\n`

        if (product.stock && product.stock > 0) {
            response += `✅ Disponible: ${product.stock} unidad${product.stock > 1 ? 'es' : ''}\n\n`
            response += `¿Te gustaría hacer el pedido?`
        } else if (product.category === 'DIGITAL') {
            response += `✅ Disponible (producto digital)\n\n`
            response += `Acceso inmediato después de la compra`
        } else {
            response += `⚠️ Consultar disponibilidad\n\n`
            response += `Contáctanos para verificar stock:\n📱 +57 304 274 8687`
        }

        return response
    }

    /**
     * Generar respuesta GENERAL
     */
    private static generateGeneralResponse(product: any, emoji: string, links: any, images: string[]): string {
        let response = `${emoji} **${product.name}**\n\n`
        response += `💰 $${product.price.toLocaleString('es-CO')} COP\n`

        if (product.stock) {
            response += `📦 ${product.stock} disponibles\n`
        }

        if (images.length > 0) {
            response += `📸 ${images.length} fotos\n`
        }

        response += `\n¿Qué te gustaría saber?`

        return response
    }

    /**
     * Obtener emoji según el producto
     */
    private static getProductEmoji(product: any): string {
        const name = product.name.toLowerCase()

        if (name.includes('piano') || name.includes('música')) return '🎹'
        if (name.includes('laptop') || name.includes('computador')) return '💻'
        if (name.includes('macbook') || name.includes('apple')) return '🍎'
        if (name.includes('moto') || name.includes('pulsar')) return '🏍️'
        if (name.includes('curso') || name.includes('mega pack')) return '📚'
        if (name.includes('memoria') || name.includes('ram')) return '💾'
        if (name.includes('ssd') || name.includes('disco')) return '💿'
        if (name.includes('morral') || name.includes('mochila')) return '🎒'

        return '✨'
    }

    /**
     * Extraer información estructurada del producto para la IA
     */
    static extractProductInfo(product: any): any {
        return {
            name: product.name,
            price: product.price,
            priceFormatted: `$${product.price.toLocaleString('es-CO')} COP`,
            category: product.category,
            description: product.description || '',
            stock: product.stock,
            images: this.extractImages(product),
            links: this.extractLinks(product),
            emoji: this.getProductEmoji(product),
            isDigital: product.category === 'DIGITAL',
            isPhysical: product.category === 'PHYSICAL'
        }
    }

    /**
     * Generar respuesta estática como fallback (si falla la IA)
     */
    static generateStaticResponse(product: any, intent: any): string {
        const emoji = this.getProductEmoji(product)
        const links = this.extractLinks(product)

        switch (intent.type) {
            case 'info':
                return `${emoji} ${product.name}\n\n💰 $${product.price.toLocaleString('es-CO')} COP\n\n${product.description || 'Excelente producto disponible'}\n\n¿Te interesa?`

            case 'price':
                return `${emoji} ${product.name} cuesta $${product.price.toLocaleString('es-CO')} COP\n\n¿Deseas más información?`

            case 'link':
                if (links.buy) {
                    return `¡Perfecto! ${emoji}\n\nEnlace de compra:\n${links.buy}\n\n¿Alguna duda?`
                }
                return `Para adquirir ${product.name}, contáctanos:\n📱 +57 304 274 8687`

            case 'buy':
                return `¡Excelente! ${emoji}\n\n${product.name}: $${product.price.toLocaleString('es-CO')} COP\n\n¿Confirmamos tu pedido?`

            default:
                return `${emoji} ${product.name} - $${product.price.toLocaleString('es-CO')} COP\n\n¿Qué te gustaría saber?`
        }
    }
/**
     * 🎯 DETECTAR SI ES UNA BÚSQUEDA GENERAL (sin especificaciones)
     * Ejemplo: "portátiles", "laptops", "motos", "cursos"
     */
    static isGeneralProductQuery(query: string, keywords: string[]): boolean {
        const queryLower = query.toLowerCase()
        
        // Términos generales de categorías
        const generalTerms = [
            'portatil', 'portátil', 'portatiles', 'portátiles',
            'laptop', 'laptops', 'computador', 'computadora',
            'moto', 'motos', 'motocicleta',
            'curso', 'cursos', 'capacitacion', 'capacitación',
            'megapack', 'mega pack', 'paquete',
            'producto', 'productos', 'articulo', 'artículo'
        ]
        
        // Términos específicos que indican que NO es general
        const specificTerms = [
            // Marcas de laptops
            'asus', 'hp', 'lenovo', 'dell', 'acer', 'macbook',
            // Marcas de motos
            'bajaj', 'pulsar', 'yamaha', 'honda',
            // Especificaciones técnicas
            'i3', 'i5', 'i7', 'ryzen', 'core',
            '8gb', '16gb', '256gb', '512gb', '1tb',
            // Condición
            'usado', 'usada', 'nueva', 'nuevo',
            // 🎯 INSTRUMENTOS Y TEMAS ESPECÍFICOS (CRÍTICO)
            'piano', 'guitarra', 'bateria', 'batería', 'violin', 'violín',
            'ingles', 'inglés', 'frances', 'francés', 'aleman', 'alemán',
            'idiomas', 'idioma', 'lenguajes', 'lenguaje', // 🌍 IDIOMAS (CRÍTICO)
            'diseño', 'photoshop', 'illustrator', 'marketing',
            'programacion', 'programación', 'python', 'javascript',
            'sublimado', 'muebles', 'construccion', 'construcción', 'drywall', // 🏗️ OFICIOS
            'gastronomia', 'gastronomía', 'cocina', 'bartender', // 🍳 GASTRONOMÍA
            'ingenieria', 'ingeniería', 'arquitectura', 'planos', // 🏛️ INGENIERÍA
            'pedagogia', 'pedagogía', 'educacion', 'educación', // 📚 EDUCACIÓN
            'reparacion', 'reparación', 'celular', 'celulares', 'telefono', 'teléfono', 'movil', 'móvil', 'tablet', 'tablets', // 📱 REPARACIÓN
            // Números de megapacks
            'megapack 1', 'megapack 2', 'megapack 3', 'megapack 4', 'megapack 5',
            'megapack 6', 'megapack 7', 'megapack 8', 'megapack 9', 'megapack 10',
            'pack 1', 'pack 2', 'pack 3', 'pack 4', 'pack 5'
        ]
        
        // 🎯 DETECTAR FRASES ESPECÍFICAS (PRIORIDAD MÁXIMA)
        // Si dice "curso de X", "megapack de X", "laptop X", etc. → ES ESPECÍFICO
        const specificPhrases = [
            /curso\s+de\s+\w+/i,           // "curso de piano", "curso de inglés"
            /megapack(s)?\s+de\s+\w+/i,    // "megapack de diseño", "megapacks de idiomas"
            /mega\s+pack(s)?\s+de\s+\w+/i, // "mega pack de idiomas", "mega packs de idiomas"
            /pack(s)?\s+de\s+\w+/i,        // "pack de idiomas", "packs de idiomas"
            /megapack\s+\d+/i,             // "megapack 17"
            /pack\s+\d+/i,                 // "pack 21"
            /laptop\s+\w+/i,               // "laptop asus"
            /moto\s+\w+/i,                 // "moto pulsar"
            /interesado\s+en/i,            // "interesado en el curso"
            /quiero\s+(el|la|un|una)\s+\w+/i  // "quiero el curso de piano"
        ]
        
        const hasSpecificPhrase = specificPhrases.some(pattern => pattern.test(queryLower))
        if (hasSpecificPhrase) {
            console.log(`[Product Intelligence] 🎯 Frase ESPECÍFICA detectada - NO es búsqueda general`)
            return false
        }
        
        // Si tiene términos específicos, NO es general
        const hasSpecificTerms = specificTerms.some(term => queryLower.includes(term))
        if (hasSpecificTerms) {
            console.log(`[Product Intelligence] 🎯 Término ESPECÍFICO detectado - NO es búsqueda general`)
            return false
        }
        
        // Si tiene términos generales y pocas palabras clave, ES general
        const hasGeneralTerms = generalTerms.some(term => queryLower.includes(term))
        const fewKeywords = keywords.length <= 2
        
        const isGeneral = hasGeneralTerms && fewKeywords
        console.log(`[Product Intelligence] ${isGeneral ? '📋' : '🎯'} Búsqueda ${isGeneral ? 'GENERAL' : 'ESPECÍFICA'}`)
        
        return isGeneral
    }

    /**
     * 🔍 BUSCAR MÚLTIPLES PRODUCTOS DE UNA CATEGORÍA
     * ✨ ORDENADOS POR PRECIO (de menor a mayor) para mostrar opciones económicas primero
     */
    static async findProductsByCategory(
        query: string,
        userId: string,
        limit: number = 5
    ): Promise<any[]> {
        try {
            const queryLower = query.toLowerCase()
            
            // 🌍 CASO ESPECIAL: Buscar por subcategoría específica (idiomas, diseño, etc.)
            const subcategoryKeywords = [
                { keywords: ['idiomas', 'idioma', 'lenguajes'], name: 'idiomas' },
                { keywords: ['diseño', 'photoshop', 'illustrator'], name: 'diseño' },
                { keywords: ['sublimado'], name: 'sublimado' },
                { keywords: ['muebles', 'melamina'], name: 'muebles' },
                { keywords: ['construccion', 'construcción', 'drywall'], name: 'construcción' },
                { keywords: ['gastronomia', 'gastronomía', 'cocina'], name: 'gastronomía' },
                { keywords: ['ingenieria', 'ingeniería', 'arquitectura'], name: 'ingeniería' }
            ]
            
            for (const sub of subcategoryKeywords) {
                const hasKeyword = sub.keywords.some(kw => queryLower.includes(kw))
                if (hasKeyword) {
                    console.log(`🎯 [Product Intelligence] Buscando productos de subcategoría: ${sub.name}`)
                    
                    // Buscar productos que contengan la subcategoría en nombre, descripción o tags
                    const products = await db.product.findMany({
                        where: {
                            userId,
                            status: 'AVAILABLE',
                            OR: [
                                { name: { contains: sub.name, mode: 'insensitive' } },
                                { description: { contains: sub.name, mode: 'insensitive' } },
                                { tags: { contains: sub.name } },
                                // Buscar también por keywords específicas
                                ...sub.keywords.map(kw => ({ name: { contains: kw, mode: 'insensitive' } })),
                                ...sub.keywords.map(kw => ({ description: { contains: kw, mode: 'insensitive' } }))
                            ]
                        },
                        take: limit,
                        orderBy: { price: 'asc' }
                    })
                    
                    if (products.length > 0) {
                        console.log(`✅ [Product Intelligence] Encontrados ${products.length} productos de ${sub.name}`)
                        return products
                    }
                }
            }
            
            // Determinar categoría general
            let category = ''
            if (queryLower.includes('portatil') || queryLower.includes('laptop') || queryLower.includes('computador')) {
                category = 'portátil'
            } else if (queryLower.includes('moto')) {
                category = 'moto'
            } else if (queryLower.includes('curso')) {
                category = 'curso'
            } else if (queryLower.includes('megapack') || queryLower.includes('mega pack')) {
                category = 'megapack'
            }
            
            if (!category) {
                return []
            }
            
            console.log(`📦 [Product Intelligence] Buscando productos de categoría: ${category}`)
            
            // Buscar productos de esa categoría
            const products = await db.product.findMany({
                where: {
                    userId,
                    status: 'AVAILABLE',
                    OR: [
                        { name: { contains: category, mode: 'insensitive' } },
                        { description: { contains: category, mode: 'insensitive' } }
                    ]
                },
                take: limit,
                orderBy: { price: 'asc' } // ✨ ORDENAR POR PRECIO: de menor a mayor
            })
            
            console.log(`✅ [Product Intelligence] Encontrados ${products.length} productos de ${category} (ordenados por precio)`)
            return products
            
        } catch (error) {
            console.error('[Product Intelligence] Error buscando por categoría:', error)
            return []
        }
    }

    /**
     * 💬 GENERAR PREGUNTAS DE CALIFICACIÓN
     * Para entender mejor qué busca el cliente
     */
    static generateQualificationQuestions(query: string, products: any[]): string {
        const queryLower = query.toLowerCase()
        
        // Detectar categoría
        let category = ''
        let questions: string[] = []
        
        if (queryLower.includes('portatil') || queryLower.includes('laptop') || queryLower.includes('computador')) {
            category = 'portátiles'
            questions = [
                '¿Para qué lo vas a usar principalmente? (trabajo, estudio, gaming, diseño)',
                '¿Tienes algún presupuesto en mente?',
                '¿Prefieres alguna marca en particular? (Asus, HP, Lenovo, etc.)'
            ]
        } else if (queryLower.includes('moto')) {
            category = 'motos'
            questions = [
                '¿Buscas moto nueva o usada?',
                '¿Qué cilindraje prefieres?',
                '¿Para qué la vas a usar? (trabajo, paseo, ciudad)'
            ]
        } else if (queryLower.includes('curso')) {
            category = 'cursos'
            questions = [
                '¿Qué tema te interesa aprender?',
                '¿Nivel principiante o avanzado?'
            ]
        } else if (queryLower.includes('megapack') || queryLower.includes('mega pack')) {
            category = 'megapacks'
            questions = [
                '¿Buscas un megapack específico o el paquete completo con todos?',
                '¿Qué tipo de contenido te interesa más?'
            ]
        }
        
        // Construir respuesta
        let response = `¡Claro que sí! Tenemos varios ${category} disponibles. 😊\n\n`
        
        // Mostrar cantidad
        if (products.length > 0) {
            response += `Actualmente tenemos ${products.length} opciones de ${category}.\n\n`
        }
        
        // Agregar preguntas
        response += `Para recomendarte la mejor opción, cuéntame:\n\n`
        questions.forEach((q, i) => {
            response += `${i + 1}. ${q}\n`
        })
        
        response += `\nAsí puedo mostrarte exactamente lo que necesitas. 💡`
        
        return response
    }

    /**
     * 🏷️ BUSCAR POR CATEGORÍAS Y SUBCATEGORÍAS
     * Sistema estructurado para facilitar la búsqueda
     */
    static async searchByCategory(query: string, userId: string): Promise<ProductResponse> {
        try {
            // Verificar si está pidiendo ver categorías
            if (CategorySearchService.isAskingForCategories(query)) {
                const message = CategorySearchService.showAllCategories()
                return {
                    text: message,
                    product: null,
                    intent: { type: 'general', confidence: 1.0, keywords: ['categorias'] },
                    hasLinks: false,
                    isGeneralQuery: true
                }
            }

            // Buscar por categoría
            const result = await CategorySearchService.searchByCategory(query, userId)

            return {
                text: result.message,
                product: result.products[0] || null,
                intent: { type: 'general', confidence: 0.9, keywords: [result.category || ''] },
                hasLinks: false,
                isGeneralQuery: true,
                matchingProducts: result.products
            }

        } catch (error) {
            console.error('[Product Intelligence] Error en búsqueda por categoría:', error)
            return {
                text: '❌ Error buscando productos. Por favor intenta de nuevo.',
                product: null,
                intent: { type: 'general', confidence: 0, keywords: [] },
                hasLinks: false
            }
        }
    }

    /**
     * 🔍 DETECTAR SI LA CONSULTA ES SOBRE CATEGORÍAS
     */
    static isCategoryQuery(query: string): boolean {
        const { category } = findCategoryByKeywords(query)
        return category !== null || CategorySearchService.isAskingForCategories(query)
    }
}
