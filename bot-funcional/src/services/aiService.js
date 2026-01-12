import axios from 'axios';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export class AIService {
    constructor() {
        this.ollamaUrl = process.env.OLLAMA_BASE_URL;
        this.ollamaModel = process.env.OLLAMA_MODEL;
        this.groqKeys = [
            process.env.GROQ_API_KEY,
            process.env.GROQ_API_KEY_2,
            process.env.GROQ_API_KEY_3,
            process.env.GROQ_API_KEY_6
        ].filter(Boolean);
        this.currentGroqKeyIndex = 0;
        this.hybridEnabled = process.env.HYBRID_SYSTEM_ENABLED === 'true';
        this.failureCount = { ollama: 0, groq: 0 };
        
        // Cargar catálogo de productos
        try {
            const productsPath = join(__dirname, '../data/products.json');
            const productsData = readFileSync(productsPath, 'utf-8');
            this.products = JSON.parse(productsData);
            console.log(`✅ Catálogo cargado: ${this.products.length} productos`);
        } catch (error) {
            console.warn('⚠️ No se pudo cargar el catálogo de productos:', error.message);
            this.products = [];
        }
    }

    async generateResponse(prompt, context = {}) {
        // Usar Ollama siempre (Easypanel)
        try {
            console.log('🤖 Consultando Ollama en Easypanel...');
            const response = await this.callOllama(prompt, context);
            return response;
        } catch (error) {
            console.error('❌ Error en Ollama:', error.message);
            throw new Error('Servicio de Ollama no disponible temporalmente');
        }
    }

    async callOllama(prompt, context) {
        const fullPrompt = this.buildFullPrompt(prompt, context);
        
        const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
            model: this.ollamaModel,
            prompt: fullPrompt,
            stream: false,
            options: {
                temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || 0.7),
                num_predict: parseInt(process.env.OLLAMA_MAX_TOKENS || 400),
                top_p: 0.9,
                top_k: 40
            }
        }, {
            timeout: parseInt(process.env.OLLAMA_TIMEOUT || 60000)
        });

        return this.cleanResponse(response.data.response);
    }

    async callGroq(prompt, context) {
        const apiKey = this.groqKeys[this.currentGroqKeyIndex];
        this.currentGroqKeyIndex = (this.currentGroqKeyIndex + 1) % this.groqKeys.length;

        const messages = [
            {
                role: 'system',
                content: this.getSystemPrompt()
            },
            {
                role: 'user',
                content: this.buildFullPrompt(prompt, context)
            }
        ];

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
            messages: messages,
            temperature: parseFloat(process.env.AI_TEMPERATURE || 0.7),
            max_tokens: parseInt(process.env.GROQ_MAX_TOKENS || 800),
            top_p: 0.9
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: parseInt(process.env.GROQ_TIMEOUT || 30000)
        });

        return this.cleanResponse(response.data.choices[0].message.content);
    }

    getSystemPrompt() {
        return `Eres David Martínez, asistente de ventas experto de Tecnovariedades D&S en Cali, Colombia.

PERSONALIDAD:
- Eres amable, carismático y profesional
- Puedes conversar sobre CUALQUIER tema para conectar con el cliente
- Siempre encuentras la forma de volver naturalmente al negocio
- Eres un experto en ventas consultivas

REGLAS DE CONVERSACIÓN:
1. Si el cliente pregunta algo fuera del negocio (clima, deportes, noticias, etc.), responde brevemente y amablemente, luego pregunta sutilmente si hay algo en lo que puedas ayudarle con tecnología o cursos
2. Si hay un producto en contexto, siempre intenta volver a él de forma natural
3. NUNCA inventes productos, precios o características
4. Responde brevemente (máximo 4-5 líneas)
5. Usa emojis de forma natural pero no excesiva
6. Siempre termina con una pregunta que invite a continuar la conversación hacia una venta

TÉCNICAS DE VENTA:
- Escucha activa: muestra que entiendes al cliente
- Conexión emocional: relaciona sus intereses con tus productos
- Cierre suave: "¿Te gustaría que te cuente más sobre...?"

PRODUCTOS: Laptops, Impresoras, Tablets, Cursos Digitales (40 Mega Packs)
MÉTODOS DE PAGO: Nequi/Daviplata: 313 617 4267
CONTACTO: +57 313 617 4267`;
    }

    getCatalogoResumen() {
        if (!this.products || this.products.length === 0) {
            return '📦 CATÁLOGO: Consulta productos disponibles';
        }

        // Agrupar productos por categoría
        const categorias = {};
        this.products.forEach(p => {
            const cat = this.getCategoriaProducto(p);
            if (!categorias[cat]) categorias[cat] = [];
            categorias[cat].push(p);
        });

        let resumen = '📦 CATÁLOGO DE PRODUCTOS:\n\n';
        
        for (const [categoria, productos] of Object.entries(categorias)) {
            resumen += `${categoria}:\n`;
            // Mostrar solo los primeros 3 productos de cada categoría para no saturar
            productos.slice(0, 3).forEach(p => {
                const precio = this.formatPrice(p.price);
                resumen += `- ${p.name}: ${precio}\n`;
            });
            if (productos.length > 3) {
                resumen += `  ... y ${productos.length - 3} más\n`;
            }
            resumen += '\n';
        }

        return resumen;
    }

    getCategoriaProducto(producto) {
        const name = producto.name.toLowerCase();
        
        if (name.includes('portátil') || name.includes('portatil') || name.includes('laptop') || name.includes('macbook')) {
            return '💻 PORTÁTILES';
        }
        if (name.includes('monitor')) {
            return '🖥️ MONITORES';
        }
        if (name.includes('mouse')) {
            return '🖱️ MOUSE';
        }
        if (name.includes('teclado')) {
            return '⌨️ TECLADOS';
        }
        if (name.includes('diadema') || name.includes('audífono')) {
            return '🎧 AUDIO';
        }
        if (name.includes('impresora') || name.includes('escáner')) {
            return '🖨️ IMPRESORAS';
        }
        if (name.includes('parlante') || name.includes('torre de sonido')) {
            return '🔊 PARLANTES';
        }
        if (name.includes('todo en uno') || name.includes('aio')) {
            return '🖥️ TODO EN UNO';
        }
        if (producto.category === 'DIGITAL' || name.includes('curso') || name.includes('mega pack')) {
            return '📚 PRODUCTOS DIGITALES';
        }
        
        return '🔧 ACCESORIOS';
    }

    formatPrice(price) {
        return `$${price.toLocaleString('es-CO')} COP`;
    }

    buscarProducto(query) {
        if (!this.products || this.products.length === 0) {
            console.log('⚠️ No hay productos cargados');
            return null;
        }
        
        const queryLower = query.toLowerCase();
        console.log(`🔍 Buscando producto en: "${queryLower}"`);
        
        // PASO 0: Búsquedas específicas prioritarias (antes de filtrar stopwords)
        // Piano
        if (queryLower.includes('piano')) {
            const piano = this.products.find(p => p.name.toLowerCase().includes('piano'));
            if (piano) {
                console.log(`✅ Encontrado piano: ${piano.name}`);
                return piano;
            }
        }
        // Guitarra
        if (queryLower.includes('guitarra')) {
            const guitarra = this.products.find(p => p.name.toLowerCase().includes('guitarra'));
            if (guitarra) {
                console.log(`✅ Encontrado guitarra: ${guitarra.name}`);
                return guitarra;
            }
        }
        // Trading/Forex
        if (queryLower.includes('trading') || queryLower.includes('forex')) {
            const trading = this.products.find(p => p.name.toLowerCase().includes('trading') || p.name.toLowerCase().includes('forex'));
            if (trading) {
                console.log(`✅ Encontrado trading: ${trading.name}`);
                return trading;
            }
        }
        // Hacking/Seguridad
        if (queryLower.includes('hacking') || queryLower.includes('seguridad') || queryLower.includes('ciberseguridad')) {
            const hacking = this.products.find(p => p.name.toLowerCase().includes('hacking') || p.name.toLowerCase().includes('seguridad'));
            if (hacking) {
                console.log(`✅ Encontrado hacking: ${hacking.name}`);
                return hacking;
            }
        }
        
        // Palabras genéricas a ignorar
        const stopWords = ['hola', 'buenos', 'buenas', 'dias', 'tardes', 'noches', 'quiero', 'necesito', 'tienes', 'tienen', 'hay', 'disponible', 'interesa', 'precio', 'costo', 'cuanto', 'cuánto', 'que', 'qué', 'cual', 'cuál', 'como', 'cómo', 'para', 'por', 'con', 'sin', 'una', 'uno', 'los', 'las', 'del', 'the', 'sobre', 'info', 'información', 'curso', 'cursos', 'mega', 'pack', 'me', 'un', 'estudiar', 'trabajar', 'usar', 'de'];
        
        // Extraer palabras clave específicas (no genéricas)
        const keywords = queryLower
            .replace(/[¿?!.,]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
        
        console.log(`🔑 Palabras clave específicas: ${keywords.join(', ')}`);
        
        // PASO 1: Buscar coincidencia EXACTA en nombre del producto
        for (const keyword of keywords) {
            const producto = this.products.find(p => 
                p.name.toLowerCase().includes(keyword)
            );
            if (producto) {
                console.log(`✅ Encontrado por nombre: ${producto.name} (keyword: ${keyword})`);
                return producto;
            }
        }
        
        // PASO 2: Buscar en tags específicos
        for (const keyword of keywords) {
            const producto = this.products.find(p => 
                p.tags?.some(tag => tag.toLowerCase() === keyword || tag.toLowerCase().includes(keyword))
            );
            if (producto) {
                console.log(`✅ Encontrado por tag: ${producto.name} (keyword: ${keyword})`);
                return producto;
            }
        }
        
        console.log(`❌ No se encontró producto`);
        return null;
    }

    // Nueva función: buscar múltiples productos por categoría
    buscarProductosPorCategoria(query) {
        if (!this.products || this.products.length === 0) {
            return { productos: [], categoria: null };
        }
        
        const queryLower = query.toLowerCase();
        
        // Detectar categoría buscada
        let categoria = null;
        let productos = [];
        
        // PRODUCTOS FÍSICOS
        if (queryLower.includes('portátil') || queryLower.includes('portatil') || queryLower.includes('laptop') || queryLower.includes('notebook')) {
            categoria = 'portátiles';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('portátil') || name.includes('portatil') || name.includes('laptop') || name.includes('notebook') || name.includes('macbook');
            });
        } else if (queryLower.includes('impresora') || queryLower.includes('imprimir')) {
            categoria = 'impresoras';
            productos = this.products.filter(p => p.name.toLowerCase().includes('impresora'));
        } else if (queryLower.includes('tablet') || queryLower.includes('ipad')) {
            categoria = 'tablets';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('tablet') || name.includes('ipad');
            });
        } else if (queryLower.includes('monitor') || queryLower.includes('pantalla')) {
            categoria = 'monitores';
            productos = this.products.filter(p => p.name.toLowerCase().includes('monitor'));
        } else if (queryLower.includes('computador') || queryLower.includes('pc') || queryLower.includes('desktop')) {
            categoria = 'computadores';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('todo en uno') || name.includes('aio') || name.includes('desktop');
            });
        } else if (queryLower.includes('mouse') || queryLower.includes('ratón') || queryLower.includes('raton')) {
            categoria = 'mouse';
            productos = this.products.filter(p => p.name.toLowerCase().includes('mouse'));
        } else if (queryLower.includes('teclado')) {
            categoria = 'teclados';
            productos = this.products.filter(p => p.name.toLowerCase().includes('teclado'));
        } else if (queryLower.includes('audífono') || queryLower.includes('audifono') || queryLower.includes('diadema') || queryLower.includes('auricular')) {
            categoria = 'audífonos';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('diadema') || name.includes('audífono') || name.includes('audifono');
            });
        }
        // PRODUCTOS DIGITALES / CURSOS
        else if (queryLower.includes('curso') || queryLower.includes('cursos') || queryLower.includes('aprender') || queryLower.includes('mega pack')) {
            categoria = 'cursos digitales';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('mega pack') || name.includes('curso') || p.category === 'DIGITAL';
            });
        } else if (queryLower.includes('diseño') || queryLower.includes('photoshop') || queryLower.includes('illustrator')) {
            categoria = 'cursos de diseño';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('diseño') || name.includes('photoshop') || name.includes('illustrator') || name.includes('gráfico');
            });
        } else if (queryLower.includes('programación') || queryLower.includes('programacion') || queryLower.includes('desarrollo') || queryLower.includes('código')) {
            categoria = 'cursos de programación';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('programación') || name.includes('programacion') || name.includes('desarrollo') || name.includes('python') || name.includes('javascript');
            });
        } else if (queryLower.includes('excel') || queryLower.includes('office') || queryLower.includes('word')) {
            categoria = 'cursos de Office';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('excel') || name.includes('office') || name.includes('word');
            });
        } else if (queryLower.includes('inglés') || queryLower.includes('ingles') || queryLower.includes('idioma')) {
            categoria = 'cursos de inglés';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('inglés') || name.includes('ingles') || name.includes('idioma');
            });
        } else if (queryLower.includes('marketing') || queryLower.includes('ventas') || queryLower.includes('negocio')) {
            categoria = 'cursos de marketing';
            productos = this.products.filter(p => {
                const name = p.name.toLowerCase();
                return name.includes('marketing') || name.includes('ventas') || name.includes('negocio');
            });
        }
        
        console.log(`📂 Categoría detectada: ${categoria}, Productos encontrados: ${productos.length}`);
        return { productos, categoria };
    }

    buildFullPrompt(userMessage, context) {
        let prompt = '';
        
        // Agregar contexto del producto si existe
        if (context.lastProduct) {
            prompt += `CONTEXTO: El cliente está interesado en "${context.lastProduct.name}" ($${context.lastProduct.price.toLocaleString('es-CO')} COP)\n\n`;
        }
        
        // Agregar historial si existe
        if (context.conversationHistory && context.conversationHistory.length > 0) {
            prompt += 'HISTORIAL:\n';
            context.conversationHistory.forEach(msg => {
                const role = msg.role === 'user' ? 'Cliente' : 'David';
                prompt += `${role}: ${msg.content}\n`;
            });
            prompt += '\n';
        }
        
        prompt += `Cliente: ${userMessage}\n\nDavid (responde brevemente, con contexto):`;
        return prompt;
    }

    translateIntent(intent) {
        const translations = {
            'greeting': 'Saludo inicial',
            'product_inquiry': 'Consulta sobre productos',
            'objection': 'Objeción o duda',
            'purchase_intent': 'Intención de compra',
            'payment_inquiry': 'Consulta sobre pago',
            'farewell': 'Despedida',
            'general_inquiry': 'Consulta general'
        };
        return translations[intent] || intent;
    }

    translateStage(stage) {
        const translations = {
            'greeting': 'Saludo',
            'discovery': 'Descubrimiento de necesidades',
            'presentation': 'Presentación de solución',
            'objection': 'Manejo de objeciones',
            'closing': 'Cierre de venta'
        };
        return translations[stage] || stage;
    }

    cleanResponse(response) {
        // Limpiar la respuesta de la IA
        let cleaned = response.trim();
        
        // Remover prefijos comunes que la IA puede agregar
        cleaned = cleaned.replace(/^(David:|David Martínez:|Respuesta:|Asistente:)\s*/i, '');
        
        // Asegurar que no sea demasiado larga
        const lines = cleaned.split('\n').filter(line => line.trim());
        if (lines.length > 6) {
            cleaned = lines.slice(0, 6).join('\n');
        }
        
        return cleaned;
    }

    getStatus() {
        return {
            ollamaEnabled: process.env.USE_OLLAMA === 'true',
            groqEnabled: this.hybridEnabled,
            ollamaFailures: this.failureCount.ollama,
            groqFailures: this.failureCount.groq,
            availableGroqKeys: this.groqKeys.length,
            productsLoaded: this.products.length
        };
    }
}
