/**
 * 🧠 SERVICIO DE INTELIGENCIA DE PRODUCTOS
 * Maneja respuestas específicas e inteligentes sobre productos
 */

import { db } from './db'

export interface ProductIntent {
    type: 'info' | 'price' | 'link' | 'buy' | 'availability' | 'general'
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

            // Extraer palabras clave del mensaje
            const keywords = this.extractKeywords(query)
            console.log(`🔑 [Product Intelligence] Palabras clave: ${keywords.join(', ')}`)

            // ⚠️ IMPORTANTE: Si no hay palabras clave significativas, NO buscar
            // Esto evita búsquedas incorrectas con mensajes genéricos como "ver más información"
            if (keywords.length === 0) {
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

            if (filteredProducts.length === 0) {
                console.log(`❌ [Product Intelligence] No hay productos ${buscaUsado ? 'USADOS' : 'NUEVOS'} disponibles`)
                return null
            }

            // Buscar coincidencias específicas primero (incluyendo palabras del mensaje original)
            const queryLower = query.toLowerCase()
            const specificMatches = [
                { keywords: ['piano'], name: 'piano', searchIn: 'name' },
                { keywords: ['macbook', 'mac', 'apple'], name: 'macbook', searchIn: 'name' },
                { keywords: ['moto', 'pulsar', 'bajaj'], name: 'bajaj', searchIn: 'name' },
                { keywords: ['asus', 'vivobook'], name: 'asus', searchIn: 'name' },
                { keywords: ['laptop', 'laptops', 'portatil', 'computador', 'computadora'], name: 'laptop', searchIn: 'name' },
                { keywords: ['hp'], name: 'hp', searchIn: 'name' },
                { keywords: ['lenovo'], name: 'lenovo', searchIn: 'name' },
                { keywords: ['mega', 'pack', 'megapack'], name: 'mega pack', searchIn: 'name' }
            ]

            // Buscar por coincidencias específicas (buscar en el mensaje original, no solo en keywords)
            for (const match of specificMatches) {
                const hasKeywordInQuery = match.keywords.some(kw => queryLower.includes(kw))
                if (hasKeywordInQuery) {
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
                        
                        // Buscar en nombre (ya está en minúsculas)
                        return nameLower.includes(match.name)
                    })
                    
                    if (found) {
                        console.log(`✅ [Product Intelligence] Producto específico encontrado: ${found.name}`)
                        return found
                    }
                }
            }

            // Buscar por cualquier palabra clave en nombre, descripción o tags
            // 🚨 USAR filteredProducts en lugar de allProducts
            const scoredProducts = filteredProducts.map(p => {
                let score = 0
                const nameLower = p.name.toLowerCase()
                const descLower = (p.description || '').toLowerCase()
                const tagsLower = (p.tags || '').toLowerCase()

                keywords.forEach(keyword => {
                    const keywordLower = keyword.toLowerCase() // Asegurar minúsculas
                    
                    // Coincidencia exacta en nombre vale mucho más
                    if (nameLower.includes(keywordLower)) score += 15
                    if (descLower.includes(keywordLower)) score += 3
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
            const bestMatch = scoredProducts
                .filter(sp => sp.score >= 5)
                .sort((a, b) => b.score - a.score)[0]

            if (bestMatch) {
                console.log(`✅ [Product Intelligence] Producto encontrado: ${bestMatch.product.name} (score: ${bestMatch.score})`)
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

        // Intención: PRECIO
        if (/(cuánto|cuanto|precio|cuesta|valor|vale|costo)/i.test(messageLower)) {
            return {
                type: 'price',
                confidence: 0.9,
                keywords: ['precio', 'cuesta']
            }
        }

        // Intención: DISPONIBILIDAD
        if (/(disponible|stock|hay|tienen|tienes|queda|quedan)/i.test(messageLower)) {
            return {
                type: 'availability',
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
}
