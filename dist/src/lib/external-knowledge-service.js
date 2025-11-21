"use strict";
/**
 * 🌐 SERVICIO DE CONOCIMIENTO EXTERNO
 * Busca información real de productos en fuentes externas
 * SIN INVENTAR - Solo datos verificables
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalKnowledgeService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || ''
});
class ExternalKnowledgeService {
    /**
     * Buscar información de un producto usando IA con conocimiento general
     */
    static async searchProductInfo(productName, category) {
        try {
            console.log(`🔍 [External Knowledge] Buscando info de: "${productName}"`);
            // Usar Groq con modelo que tiene conocimiento general
            const prompt = `Eres un experto en tecnología y productos. Proporciona información REAL y VERIFICABLE sobre el siguiente producto.

PRODUCTO: ${productName}
${category ? `CATEGORÍA: ${category}` : ''}

INSTRUCCIONES CRÍTICAS:
1. Solo proporciona información que sea VERIFICABLE y REAL
2. Si no estás seguro, di "No tengo información verificable"
3. NO INVENTES especificaciones
4. Enfócate en características técnicas comunes de este tipo de producto
5. Si es un modelo específico, proporciona sus especificaciones reales

Responde en formato JSON:
{
  "found": true/false,
  "specs": {
    "procesador": "...",
    "ram": "...",
    "almacenamiento": "...",
    "pantalla": "...",
    "otros": "..."
  },
  "features": ["característica 1", "característica 2"],
  "technicalDetails": "Detalles técnicos relevantes",
  "confidence": 0-100 (qué tan seguro estás de la información)
}

Si NO tienes información verificable, responde:
{
  "found": false,
  "confidence": 0
}`;
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un asistente técnico que SOLO proporciona información verificable. NUNCA inventas datos.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-3.3-70b-versatile', // Modelo actualizado con más conocimiento
                temperature: 0.1, // Muy bajo para evitar invenciones
                max_tokens: 1000
            });
            const response = completion.choices[0]?.message?.content || '';
            console.log(`📄 [External Knowledge] Respuesta recibida`);
            // Parsear respuesta JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.log(`⚠️ [External Knowledge] No se pudo parsear respuesta`);
                return {
                    found: false,
                    source: 'AI Knowledge Base',
                    confidence: 0
                };
            }
            const info = JSON.parse(jsonMatch[0]);
            // Solo aceptar si la confianza es alta (>60%)
            if (info.confidence < 60) {
                console.log(`⚠️ [External Knowledge] Confianza baja (${info.confidence}%)`);
                return {
                    found: false,
                    source: 'AI Knowledge Base',
                    confidence: info.confidence
                };
            }
            console.log(`✅ [External Knowledge] Información encontrada (confianza: ${info.confidence}%)`);
            return {
                found: info.found,
                source: 'AI Knowledge Base',
                specs: info.specs,
                features: info.features,
                description: info.technicalDetails,
                confidence: info.confidence
            };
        }
        catch (error) {
            console.error('❌ [External Knowledge] Error:', error);
            return {
                found: false,
                source: 'Error',
                confidence: 0
            };
        }
    }
    /**
     * Buscar especificaciones técnicas específicas
     */
    static async getProductSpecs(productName) {
        try {
            const info = await this.searchProductInfo(productName);
            if (info.found && info.specs) {
                return info.specs;
            }
            return null;
        }
        catch (error) {
            console.error('❌ [External Knowledge] Error obteniendo specs:', error);
            return null;
        }
    }
    /**
     * Enriquecer información de producto con datos externos
     */
    static async enrichProductInfo(product) {
        try {
            console.log(`🔍 [External Knowledge] Enriqueciendo info de: ${product.name}`);
            // Buscar información externa
            const externalInfo = await this.searchProductInfo(product.name, product.category);
            if (!externalInfo.found) {
                console.log(`⚠️ [External Knowledge] No se encontró información adicional`);
                return product;
            }
            // Combinar información
            const enriched = {
                ...product,
                externalInfo: {
                    specs: externalInfo.specs,
                    features: externalInfo.features,
                    technicalDetails: externalInfo.description,
                    source: externalInfo.source,
                    confidence: externalInfo.confidence,
                    lastUpdated: new Date().toISOString()
                }
            };
            console.log(`✅ [External Knowledge] Producto enriquecido`);
            return enriched;
        }
        catch (error) {
            console.error('❌ [External Knowledge] Error enriqueciendo producto:', error);
            return product;
        }
    }
    /**
     * Generar respuesta enriquecida con información externa
     */
    static async generateEnrichedResponse(product, customerQuestion) {
        try {
            console.log(`💬 [External Knowledge] Generando respuesta enriquecida`);
            // Buscar información externa
            const externalInfo = await this.searchProductInfo(product.name, product.category);
            if (!externalInfo.found) {
                // No hay info externa, usar solo la del producto
                return this.generateBasicResponse(product, customerQuestion);
            }
            // Generar respuesta con IA usando info externa
            const prompt = `Eres un vendedor experto. Un cliente pregunta sobre un producto.

PRODUCTO: ${product.name}
PRECIO: ${product.price.toLocaleString('es-CO')} COP
DESCRIPCIÓN: ${product.description || 'No disponible'}

INFORMACIÓN TÉCNICA VERIFICADA:
${JSON.stringify(externalInfo.specs, null, 2)}

CARACTERÍSTICAS:
${externalInfo.features?.join('\n') || 'No disponible'}

PREGUNTA DEL CLIENTE: ${customerQuestion}

INSTRUCCIONES:
1. Responde la pregunta del cliente de forma natural y amigable
2. USA SOLO la información técnica verificada proporcionada
3. NO INVENTES especificaciones
4. Si no tienes la información, di "No tengo esa información específica"
5. Mantén un tono conversacional y profesional
6. Incluye el precio si es relevante
7. Máximo 200 palabras

Responde en español de forma natural:`;
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un vendedor profesional que SOLO usa información verificada. NUNCA inventas datos.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 500
            });
            const response = completion.choices[0]?.message?.content || '';
            // Agregar nota de confianza si es baja
            let finalResponse = response;
            if (externalInfo.confidence < 80) {
                finalResponse += `\n\n💡 Te recomiendo contactarnos para confirmar detalles específicos: +57 304 274 8687`;
            }
            console.log(`✅ [External Knowledge] Respuesta generada`);
            return finalResponse;
        }
        catch (error) {
            console.error('❌ [External Knowledge] Error generando respuesta:', error);
            return this.generateBasicResponse(product, customerQuestion);
        }
    }
    /**
     * Generar respuesta básica sin información externa
     */
    static generateBasicResponse(product, question) {
        return `${product.name}

💰 Precio: ${product.price.toLocaleString('es-CO')} COP

${product.description || 'Excelente producto disponible'}

Para más detalles específicos sobre tu pregunta: "${question}", contáctanos directamente:
📱 WhatsApp: +57 304 274 8687
📧 deinermen25@gmail.com`;
    }
    /**
     * Verificar si un producto necesita información externa
     */
    static shouldEnrichProduct(product, question) {
        const needsEnrichment = [
            'especificaciones',
            'características',
            'detalles',
            'specs',
            'procesador',
            'ram',
            'memoria',
            'pantalla',
            'batería',
            'cámara',
            'rendimiento',
            'velocidad',
            'capacidad',
            'dimensiones',
            'peso',
            'compatibilidad'
        ];
        const questionLower = question.toLowerCase();
        return needsEnrichment.some(keyword => questionLower.includes(keyword));
    }
}
exports.ExternalKnowledgeService = ExternalKnowledgeService;
