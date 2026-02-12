import fs from 'fs';
import path from 'path';

export interface FAQ {
    id: number;
    pregunta: string;
    keywords: string[];
    respuesta: string;
}

export interface ProductKnowledge {
    producto: string;
    productId: string;
    categoria: string;
    precio: number;
    linkPago?: string;
    faqs: FAQ[];
    informacionAdicional?: any;
}

export class ProductFAQService {
    private static knowledgeBase: ProductKnowledge[] = [];
    private static isInitialized = false;

    /**
     * Inicializa el servicio cargando todos los archivos JSON de knowledge-base
     */
    static initialize() {
        if (this.isInitialized) return;

        try {
            const kbPath = path.join(process.cwd(), 'knowledge-base');
            if (!fs.existsSync(kbPath)) {
                console.log('[FAQ Service] ⚠️ Carpeta knowledge-base no existe');
                return;
            }

            const files = fs.readdirSync(kbPath).filter(file => file.endsWith('.json'));
            
            for (const file of files) {
                const content = fs.readFileSync(path.join(kbPath, file), 'utf-8');
                const knowledge = JSON.parse(content) as ProductKnowledge;
                this.knowledgeBase.push(knowledge);
                console.log(`[FAQ Service] ✅ Cargado conocimiento para: ${knowledge.producto}`);
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('[FAQ Service] ❌ Error inicializando:', error);
        }
    }

    /**
     * Busca una respuesta en la base de conocimiento para una pregunta dada
     */
    static findAnswer(question: string, productName?: string): { 
        found: boolean; 
        answer?: string; 
        confidence: number;
        product?: ProductKnowledge;
    } {
        if (!this.isInitialized) this.initialize();

        const questionLower = question.toLowerCase();
        
        // 1. Filtrar productos si se especifica nombre
        let candidateProducts = this.knowledgeBase;
        
        if (productName) {
            candidateProducts = this.knowledgeBase.filter(p => 
                p.producto.toLowerCase().includes(productName.toLowerCase()) ||
                productName.toLowerCase().includes(p.producto.toLowerCase())
            );
        }

        // 2. Buscar mejor coincidencia
        let bestMatch = {
            found: false,
            answer: undefined as string | undefined,
            confidence: 0,
            product: undefined as ProductKnowledge | undefined
        };

        for (const product of candidateProducts) {
            // Verificar si la pregunta es sobre este producto (si no se filtró por nombre)
            if (!productName && !questionLower.includes(product.producto.toLowerCase())) {
                continue;
            }

            console.log(`[FAQ Service] 🔍 Buscando en producto: ${product.producto}`);
            
            const questionNormalized = this.normalize(questionLower);

            for (const faq of product.faqs) {
                // Calcular coincidencia por keywords
                const keywordMatches = faq.keywords.filter(k => {
                    const keywordNormalized = this.normalize(k.toLowerCase());
                    // Coincidencia exacta de frase o palabra clave
                    return questionNormalized.includes(keywordNormalized);
                });
                
                const matchCount = keywordMatches.length;
                let confidence = 0;

                if (matchCount > 0) {
                     confidence = matchCount / faq.keywords.length;
                     // Boost si hay múltiples coincidencias
                     if (matchCount >= 2) confidence += 0.2;
                     
                     // Boost por coincidencia exacta de keyword fuerte
                     if (matchCount === 1 && keywordMatches[0].length > 4) confidence += 0.3;
                }

                // Si encontramos una coincidencia aceptable (Bajamos umbral a 0.2 para ser más permisivos)
                if (confidence >= 0.2 && confidence > bestMatch.confidence) {
                    bestMatch = {
                        found: true,
                        answer: this.enrichAnswer(faq.respuesta, product),
                        confidence,
                        product
                    };
                }
            }
        }

        return bestMatch;
    }

    /**
     * Encuentra información de un producto por su nombre
     */
    static findProductByName(name: string): ProductKnowledge | undefined {
        if (!this.isInitialized) this.initialize();
        return this.knowledgeBase.find(p => 
            p.producto.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(p.producto.toLowerCase())
        );
    }

    static getProductInfo(name: string): ProductKnowledge | undefined {
        return this.findProductByName(name);
    }

    /**
     * Enriquece la respuesta con información dinámica (links, precios)
     */
    private static enrichAnswer(answer: string, product: ProductKnowledge): string {
        let enriched = answer;
        
        if (product.linkPago) {
            enriched = enriched.replace('{linkPago}', product.linkPago);
        }
        
        if (product.precio) {
            enriched = enriched.replace('{precio}', `$${product.precio.toLocaleString('es-CO')}`);
        }

        return enriched;
    }

    /**
     * Verifica si una pregunta es candidata para FAQ
     */
    static isFAQQuestion(text: string): boolean {
        const faqKeywords = [
            'precio', 'costo', 'valor', 'cuanto vale', 'cuanto cuesta',
            'duracion', 'tiempo', 'largo',
            'certificado', 'diploma', 'titulo',
            'garantia', 'devolucion',
            'pago', 'pagar', 'comprar',
            'que incluye', 'contenido', 'temario',
            'sirve', 'funciona', 'para que'
        ];

        return faqKeywords.some(k => text.toLowerCase().includes(k));
    }

    /**
     * Normalizar texto para comparación
     */
    static normalize(text: string): string {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }
}
