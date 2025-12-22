import { PaymentService } from './paymentService.js';

export class SalesAgent {
    constructor(ai, memory) {
        this.ai = ai;
        this.memory = memory;
        this.conversations = {};
        this.paymentService = new PaymentService();
    }

    async processMessage(message, userPhone, context) {
        try {
            console.log(`📨 Procesando: "${message}"`);
            
            if (!this.conversations[userPhone]) {
                this.conversations[userPhone] = {
                    lastProduct: null,
                    lastOptions: [],
                    stage: 'greeting',
                    history: []
                };
            }
            
            const userCtx = this.conversations[userPhone];
            userCtx.history.push({ role: 'user', content: message });
            
            // PASO 0: Detectar intención primero
            const intent = this.detectIntent(message);
            console.log(`🎯 Intención detectada: ${intent}`);
            
            // Si pide más info y ya tiene producto, dar detalles
            if (intent === 'more_info' && userCtx.lastProduct) {
                userCtx.stage = 'value_proposition';
                const response = this.generateValueResponse(userCtx.lastProduct);
                userCtx.history.push({ role: 'assistant', content: response });
                return {
                    text: response,
                    intent: 'more_info',
                    salesStage: 'value_proposition',
                    sendPhotos: false,
                    photos: null
                };
            }
            
            // Si confirma y tiene producto, dar datos de pago
            if (intent === 'confirmation' && userCtx.lastProduct) {
                userCtx.stage = 'closing';
                const response = await this.generatePaymentResponse(userCtx.lastProduct);
                userCtx.history.push({ role: 'assistant', content: response });
                return {
                    text: response,
                    intent: 'confirmation',
                    salesStage: 'closing',
                    sendPhotos: false,
                    photos: null
                };
            }
            
            // PASO 1: Verificar si selecciona por número de las opciones mostradas
            const selectedByNumber = this.detectNumberSelection(message, userCtx.lastOptions);
            if (selectedByNumber) {
                console.log(`✅ Seleccionado por número: ${selectedByNumber.name}`);
                userCtx.lastProduct = selectedByNumber;
                userCtx.lastOptions = [];
                userCtx.stage = 'presentation';
                const response = this.generateProductResponse(selectedByNumber);
                userCtx.history.push({ role: 'assistant', content: response });
                return {
                    text: response,
                    intent: 'product_selection',
                    salesStage: 'presentation',
                    sendPhotos: !!selectedByNumber.image,
                    photos: selectedByNumber.image ? [selectedByNumber.image] : null
                };
            }
            
            // PASO 2: Buscar producto ESPECÍFICO primero (piano, guitarra, trading, etc.)
            const product = this.ai.buscarProducto(message);
            if (product) {
                console.log(`✅ Producto específico encontrado: ${product.name}`);
                userCtx.lastProduct = product;
                userCtx.lastOptions = [];
                userCtx.stage = 'presentation';
                const response = this.generateProductResponse(product);
                userCtx.history.push({ role: 'assistant', content: response });
                return {
                    text: response,
                    intent: 'product_inquiry',
                    salesStage: 'presentation',
                    sendPhotos: !!product.image,
                    photos: product.image ? [product.image] : null
                };
            }
            
            // PASO 3: Detectar si es búsqueda genérica de categoría (solo si no encontró producto específico)
            // Palabras que indican búsqueda genérica (no producto específico)
            const isGenericSearch = /\b(busco|necesito|quiero|me interesa|tienen|hay|tienes)\b.*\b(portátil|portatil|laptop|impresora|tablet|monitor|computador|cursos?|mouse|teclado|audífono)\b/i.test(message);
            
            if (isGenericSearch && (intent === 'general_inquiry' || intent === 'greeting')) {
                const { productos, categoria } = this.ai.buscarProductosPorCategoria(message);
                if (productos.length > 1) {
                    console.log(`📂 Búsqueda genérica: ${productos.length} opciones de ${categoria}`);
                    const productosOrdenados = productos.sort((a, b) => a.price - b.price);
                    userCtx.lastOptions = productosOrdenados.slice(0, 4);
                    userCtx.stage = 'discovery';
                    const response = this.generateCategoryResponse(productos, categoria, message);
                    userCtx.history.push({ role: 'assistant', content: response });
                    return {
                        text: response,
                        intent: 'category_inquiry',
                        salesStage: 'discovery',
                        sendPhotos: false,
                        photos: null
                    };
                } else if (productos.length === 1) {
                    userCtx.lastProduct = productos[0];
                    userCtx.lastOptions = [];
                    userCtx.stage = 'presentation';
                    const response = this.generateProductResponse(productos[0]);
                    userCtx.history.push({ role: 'assistant', content: response });
                    return {
                        text: response,
                        intent: 'product_inquiry',
                        salesStage: 'presentation',
                        sendPhotos: !!productos[0].image,
                        photos: productos[0].image ? [productos[0].image] : null
                    };
                }
            }
            
            // PASO 4: Buscar por categoría como fallback
            if (intent === 'general_inquiry') {
                const { productos, categoria } = this.ai.buscarProductosPorCategoria(message);
                if (productos.length > 1) {
                    console.log(`📂 Mostrando ${productos.length} opciones de ${categoria}`);
                    const productosOrdenados = productos.sort((a, b) => a.price - b.price);
                    userCtx.lastOptions = productosOrdenados.slice(0, 4);
                    userCtx.stage = 'discovery';
                    const response = this.generateCategoryResponse(productos, categoria, message);
                    userCtx.history.push({ role: 'assistant', content: response });
                    return {
                        text: response,
                        intent: 'category_inquiry',
                        salesStage: 'discovery',
                        sendPhotos: false,
                        photos: null
                    };
                } else if (productos.length === 1) {
                    userCtx.lastProduct = productos[0];
                    userCtx.lastOptions = [];
                    userCtx.stage = 'presentation';
                    const response = this.generateProductResponse(productos[0]);
                    userCtx.history.push({ role: 'assistant', content: response });
                    return {
                        text: response,
                        intent: 'product_inquiry',
                        salesStage: 'presentation',
                        sendPhotos: !!productos[0].image,
                        photos: productos[0].image ? [productos[0].image] : null
                    };
                }
            }
            
            console.log(`🎯 Procesando intención: ${intent} | Etapa: ${userCtx.stage}`);
            
            let response;
            
            if (intent === 'rejection' && userCtx.lastProduct) {
                response = this.generateFollowUpResponse(userCtx.lastProduct);
            }
            else if (intent === 'payment_inquiry' && userCtx.lastProduct) {
                response = await this.generatePaymentResponse(userCtx.lastProduct);
            }
            else if (intent === 'greeting' && !userCtx.lastProduct) {
                response = this.getGreetingResponse();
            }
            else if (intent === 'contact_request') {
                response = this.getContactResponse();
            }
            else if (intent === 'farewell') {
                response = this.getFarewellResponse(userCtx.lastProduct);
                this.conversations[userPhone] = { lastProduct: null, lastOptions: [], stage: 'greeting', history: [] };
            }
            else {
                const aiContext = {
                    ...context,
                    intent,
                    lastProduct: userCtx.lastProduct,
                    conversationHistory: userCtx.history.slice(-6)
                };
                response = await this.ai.generateResponse(message, aiContext);
            }
            
            userCtx.history.push({ role: 'assistant', content: response });
            
            return {
                text: response,
                intent,
                salesStage: userCtx.stage,
                sendPhotos: false,
                photos: null
            };
        } catch (error) {
            console.error('❌ Error:', error.message);
            return {
                text: '🤖 Disculpa, tuve un problema. ¿Podrías repetir? 🙏',
                intent: 'unknown',
                salesStage: 'awareness',
                sendPhotos: false,
                photos: null
            };
        }
    }

    detectNumberSelection(message, options) {
        if (!options || options.length === 0) return null;
        
        const msg = message.toLowerCase().trim();
        
        // Detectar "el 1", "la 1", "opción 1", "numero 1", "1", "primero", etc.
        const patterns = [
            /^(el|la|opci[oó]n|n[uú]mero|numero)?\s*(\d+)$/i,
            /^(\d+)$/,
            /me interesa (el|la)?\s*(\d+)/i,
            /quiero (el|la)?\s*(\d+)/i,
            /(el|la)\s*(\d+)/i,
            /^(primero|primer|primera)$/i,
            /^(segundo|segunda)$/i,
            /^(tercero|tercera)$/i,
            /^(cuarto|cuarta)$/i
        ];
        
        for (const pattern of patterns) {
            const match = msg.match(pattern);
            if (match) {
                let num;
                // Manejar palabras ordinales
                if (/primero|primer|primera/i.test(msg)) num = 1;
                else if (/segundo|segunda/i.test(msg)) num = 2;
                else if (/tercero|tercera/i.test(msg)) num = 3;
                else if (/cuarto|cuarta/i.test(msg)) num = 4;
                else {
                    // Extraer número del match
                    const numStr = match[2] || match[1] || match[0];
                    num = parseInt(numStr);
                }
                
                if (num >= 1 && num <= options.length) {
                    return options[num - 1];
                }
            }
        }
        
        return null;
    }

    detectIntent(message) {
        const msg = message.toLowerCase().trim();
        
        // MÁS INFORMACIÓN - Detectar PRIMERO (antes de confirmation)
        if (/(más info|mas info|más información|mas informacion|cuéntame más|cuentame mas|qué incluye|que incluye|qué trae|que trae|para qué sirve|para que sirve|qué aprendo|que aprendo|beneficios|ventajas|detalles|explícame|explicame|dime más|dime mas|más detalles|mas detalles|quiero saber más|quiero saber mas|características|caracteristicas|especificaciones|specs)/i.test(msg)) {
            return 'more_info';
        }
        
        // CONFIRMACIÓN DE COMPRA - Frases específicas
        const confirmationPatterns = [
            // Respuestas cortas y directas
            /^(si|sí|ok|dale|va|listo|claro|por supuesto|perfecto|bueno|está bien|esta bien|de una|hagámoslo|hagamoslo)(\s*$|!|\.|\,)/i,
            // "Si me gustaría" y variaciones
            /^(si|sí)\s*(me\s*)?(gustaría|gustaria|interesa|encanta|parece bien)$/i,
            // "Me interesa" SOLO (sin más palabras)
            /^me interesa$/i,
            // "Lo quiero/compro" específico
            /^(lo quiero|lo compro|quiero comprarlo|me lo llevo|si lo quiero|sí lo quiero|lo necesito|lo tomo)$/i,
            // "Mándame/Envíame/Dame los datos"
            /(manda|mándame|mandame|envía|envíame|enviame|dame|pásame|pasame|dime)\s*(los\s*)?(datos|info|información|informacion|link|enlace)/i,
            // "Quiero los datos/comprarlo" (específico para pago)
            /quiero\s*(los\s*)?(datos|comprarlo|pagarlo|adquirirlo)/i,
            // Preguntas de compra
            /(como|cómo)\s*(lo\s*)?(compro|pago|adquiero|obtengo|consigo)/i,
            // Afirmaciones entusiastas
            /(claro que si|claro que sí|por supuesto|obvio|seguro|definitivamente|sin duda|de acuerdo|acepto)/i,
            // "Sí, lo quiero" y variaciones
            /(si|sí),?\s*(lo quiero|lo compro|dale|va|me interesa)$/i,
            // Variaciones con "si" al inicio
            /^si,?\s*(quiero|me interesa|lo quiero|lo compro|dale)/i
        ];
        
        for (const pattern of confirmationPatterns) {
            if (pattern.test(msg)) {
                return 'confirmation';
            }
        }
        
        // RECHAZO/DUDA
        if (/(no gracias|no por ahora|después|despues|lo pienso|muy caro|no tengo|no puedo|tal vez|quizás|quizas|no estoy seguro|no me interesa|no necesito|está caro|esta caro|es mucho|no alcanza)/i.test(msg)) {
            return 'rejection';
        }
        
        // PAGO
        if (/(pago|pagar|tarjeta|efectivo|transferencia|nequi|daviplata|bancolombia|mercadopago|paypal|como pago|cómo pago|métodos de pago|metodos de pago|formas de pago)/i.test(msg)) {
            return 'payment_inquiry';
        }
        
        // SALUDO PURO
        if (/^(hola|buenos|buenas|hey|hi|hello|saludos|qué tal|que tal|buenas noches|buenos días|buenos dias|buenas tardes)(\s|$|!|\?|\.)*$/i.test(msg)) {
            return 'greeting';
        }
        
        // CONTACTO
        if (/(contacto|número|numero|teléfono|telefono|whatsapp|llamar|ubicación|ubicacion|dirección|direccion|donde están|donde estan)/i.test(msg)) {
            return 'contact_request';
        }
        
        // DESPEDIDA
        if (/^(gracias|bye|adiós|adios|chao|hasta luego|nos vemos|muchas gracias|te agradezco|genial gracias)(\s|$|!|\?|\.)*$/i.test(msg)) {
            return 'farewell';
        }
        
        return 'general_inquiry';
    }

    generateProductResponse(product) {
        const price = product.price.toLocaleString('es-CO');
        const isPhysical = this.isPhysicalProduct(product);
        
        let response = `🎯 *${product.name}*\n\n`;
        response += `💰 *Precio:* ${price} COP\n\n`;
        
        if (product.description) {
            response += `📝 *Descripción:*\n${product.description}\n\n`;
        }
        
        if (isPhysical) {
            // Producto físico (laptops, impresoras, tablets, etc.)
            response += `✅ Producto nuevo con garantía\n`;
            response += `🚚 Envío a toda Colombia\n`;
            response += `📍 Retiro en Cali disponible\n\n`;
        } else {
            // Producto digital (cursos, mega packs, etc.)
            response += `✅ Acceso de por vida\n`;
            response += `📦 Entrega inmediata por Google Drive\n\n`;
        }
        
        response += `¿Te interesa? 😊`;
        return response;
    }

    isPhysicalProduct(product) {
        const name = product.name.toLowerCase();
        const physicalKeywords = [
            'portátil', 'portatil', 'laptop', 'notebook',
            'computador', 'pc', 'desktop',
            'impresora', 'multifuncional', 'scanner',
            'tablet', 'ipad',
            'monitor', 'pantalla',
            'teclado', 'mouse', 'ratón',
            'disco', 'ssd', 'memoria ram',
            'cargador', 'batería', 'bateria',
            'audífonos', 'audifonos', 'auriculares',
            'cámara', 'camara', 'webcam',
            'router', 'modem',
            'asus', 'hp', 'dell', 'lenovo', 'acer', 'apple', 'samsung', 'huawei', 'epson', 'canon', 'brother'
        ];
        
        return physicalKeywords.some(keyword => name.includes(keyword));
    }

    generateCategoryResponse(productos, categoria, originalQuery) {
        // Detectar el uso que quiere darle el cliente
        const queryLower = originalQuery.toLowerCase();
        let uso = '';
        if (queryLower.includes('estudiar') || queryLower.includes('universidad') || queryLower.includes('colegio')) {
            uso = 'para estudiar';
        } else if (queryLower.includes('trabajar') || queryLower.includes('trabajo') || queryLower.includes('oficina')) {
            uso = 'para trabajar';
        } else if (queryLower.includes('jugar') || queryLower.includes('gaming') || queryLower.includes('juegos')) {
            uso = 'para gaming';
        } else if (queryLower.includes('diseño') || queryLower.includes('edición') || queryLower.includes('edicion')) {
            uso = 'para diseño';
        }
        
        let response = `¡Claro! 😊 Tenemos varias opciones de *${categoria}*${uso ? ' ' + uso : ''}:\n\n`;
        
        // Ordenar por precio (menor a mayor)
        const productosOrdenados = productos.sort((a, b) => a.price - b.price);
        
        // Mostrar máximo 4 opciones
        const maxProductos = Math.min(productosOrdenados.length, 4);
        
        for (let i = 0; i < maxProductos; i++) {
            const p = productosOrdenados[i];
            const price = p.price.toLocaleString('es-CO');
            const num = i + 1;
            
            // Extraer características clave del nombre/descripción
            let specs = this.extractSpecs(p);
            
            response += `*${num}.* ${p.name}\n`;
            if (specs) {
                response += `   📋 ${specs}\n`;
            }
            response += `   💰 *${price} COP*\n\n`;
        }
        
        if (productos.length > maxProductos) {
            response += `_...y ${productos.length - maxProductos} opciones más_\n\n`;
        }
        
        response += `💡 *¿Cuál te interesa?* Dime el número o el nombre y te doy más detalles 😊`;
        
        return response;
    }

    extractSpecs(product) {
        const name = product.name.toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const specs = [];
        
        // RAM
        const ramMatch = (name + ' ' + desc).match(/(\d+)\s*gb\s*(ram|ddr)/i);
        if (ramMatch) specs.push(`${ramMatch[1]}GB RAM`);
        
        // Almacenamiento
        const storageMatch = (name + ' ' + desc).match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|nvme|almacenamiento)/i);
        if (storageMatch) specs.push(`${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3].toUpperCase()}`);
        
        // Procesador
        if (name.includes('ryzen')) {
            const ryzenMatch = name.match(/ryzen\s*(\d+)/i);
            if (ryzenMatch) specs.push(`Ryzen ${ryzenMatch[1]}`);
        } else if (name.includes('intel') || name.includes('core i')) {
            const intelMatch = name.match(/core\s*i(\d+)/i) || name.match(/i(\d+)/i);
            if (intelMatch) specs.push(`Core i${intelMatch[1]}`);
        } else if (name.includes('m1') || name.includes('m2') || name.includes('m3')) {
            const appleMatch = name.match(/m(\d+)/i);
            if (appleMatch) specs.push(`Apple M${appleMatch[1]}`);
        }
        
        return specs.length > 0 ? specs.join(' | ') : null;
    }

    async generatePaymentResponse(product) {
        const price = product.price.toLocaleString('es-CO');
        const isPhysical = this.isPhysicalProduct(product);
        
        // Obtener o crear links de pago
        let paymentLinks = product.paymentLinks || {};
        if (!paymentLinks.mercadoPago && !paymentLinks.paypal) {
            console.log('💳 Generando links de pago...');
            try {
                paymentLinks = await this.paymentService.getOrCreatePaymentLinks(product);
            } catch (error) {
                console.warn('⚠️ No se pudieron generar links:', error.message);
            }
        }
        
        let response = `¡Excelente elección! 🎉\n\n`;
        response += `📦 *${product.name}*\n`;
        response += `💰 *Total:* ${price} COP\n\n`;
        response += `💳 *MÉTODOS DE PAGO:*\n\n`;
        
        // Links de pago online
        if (paymentLinks.mercadoPago) {
            response += `🔵 *MercadoPago:*\n${paymentLinks.mercadoPago}\n\n`;
        }
        if (paymentLinks.paypal) {
            response += `🟡 *PayPal:*\n${paymentLinks.paypal}\n\n`;
        }
        
        // Métodos tradicionales
        response += `📱 *Transferencia directa:*\n`;
        response += `▸ *Nequi:* 313 617 4267\n`;
        response += `▸ *Daviplata:* 313 617 4267\n`;
        response += `▸ *Bancolombia:* Solicitar datos\n\n`;
        
        // Mensaje de entrega según tipo de producto
        if (isPhysical) {
            response += `📝 Envía el comprobante y coordinamos la entrega 🚚\n`;
            response += `📍 Envío a toda Colombia o retiro en Cali`;
        } else {
            response += `📝 Envía el comprobante y te entrego el acceso inmediatamente 🚀`;
        }
        
        return response;
    }

    generateFollowUpResponse(product) {
        const price = product.price.toLocaleString('es-CO');
        let response = `Entiendo 😊 Sin problema.\n\n`;
        response += `El *${product.name}* estará disponible cuando lo necesites.\n`;
        response += `💰 Precio: ${price} COP\n\n`;
        response += `¿Hay algo más en lo que pueda ayudarte? 🤝`;
        return response;
    }

    generateValueResponse(product) {
        // Detectar si es producto físico o digital
        if (this.isPhysicalProduct(product)) {
            return this.generatePhysicalValueResponse(product);
        }
        return this.generateDigitalValueResponse(product);
    }

    generatePhysicalValueResponse(product) {
        const price = product.price.toLocaleString('es-CO');
        const name = product.name.toLowerCase();
        
        let response = `🌟 *Detalles de ${product.name}*\n\n`;
        
        // Especificaciones técnicas
        response += `📋 *ESPECIFICACIONES:*\n`;
        response += this.getPhysicalSpecs(product);
        
        // Beneficios del producto
        response += `\n✨ *BENEFICIOS:*\n`;
        response += this.getPhysicalBenefits(product);
        
        // Garantía y servicio
        response += `\n🛡️ *GARANTÍA Y SERVICIO:*\n`;
        response += `▸ Producto 100% nuevo y original\n`;
        response += `▸ Garantía del fabricante\n`;
        response += `▸ Soporte técnico incluido\n`;
        
        // Entrega
        response += `\n🚚 *ENTREGA:*\n`;
        response += `▸ Envío a toda Colombia\n`;
        response += `▸ Retiro en Cali sin costo adicional\n`;
        response += `▸ Empaque seguro y protegido\n\n`;
        
        // Precio y cierre
        response += `💰 *Precio: ${price} COP*\n\n`;
        response += `🎯 *¿Te gustaría llevártelo?*\n`;
        response += `Solo dime "Sí, lo quiero" y te envío los datos de pago 💳`;
        
        return response;
    }

    getPhysicalSpecs(product) {
        const name = product.name.toLowerCase();
        const desc = (product.description || '').toLowerCase();
        let specs = '';
        
        // Portátiles
        if (name.includes('portátil') || name.includes('portatil') || name.includes('laptop')) {
            // Extraer specs del nombre/descripción
            const ramMatch = (name + ' ' + desc).match(/(\d+)\s*gb\s*(ram|ddr)/i);
            const storageMatch = (name + ' ' + desc).match(/(\d+)\s*(gb|tb)\s*(ssd|hdd)/i);
            
            if (name.includes('ryzen')) {
                const ryzenMatch = name.match(/ryzen\s*(\d+)/i);
                if (ryzenMatch) specs += `▸ Procesador: AMD Ryzen ${ryzenMatch[1]}\n`;
            } else if (name.includes('i5')) {
                specs += `▸ Procesador: Intel Core i5\n`;
            } else if (name.includes('i7')) {
                specs += `▸ Procesador: Intel Core i7\n`;
            } else if (name.includes('i3')) {
                specs += `▸ Procesador: Intel Core i3\n`;
            }
            
            if (ramMatch) specs += `▸ Memoria RAM: ${ramMatch[1]}GB\n`;
            if (storageMatch) specs += `▸ Almacenamiento: ${storageMatch[1]}${storageMatch[2].toUpperCase()} ${storageMatch[3].toUpperCase()}\n`;
            
            if (name.includes('15') || name.includes('15.6')) {
                specs += `▸ Pantalla: 15.6 pulgadas\n`;
            } else if (name.includes('14')) {
                specs += `▸ Pantalla: 14 pulgadas\n`;
            }
            
            specs += `▸ Sistema: Windows 11\n`;
        }
        // Impresoras
        else if (name.includes('impresora')) {
            if (name.includes('multifuncional')) {
                specs += `▸ Tipo: Multifuncional (Imprime, Escanea, Copia)\n`;
            } else {
                specs += `▸ Tipo: Impresora\n`;
            }
            if (name.includes('wifi') || name.includes('inalámbrica')) {
                specs += `▸ Conectividad: WiFi + USB\n`;
            }
            if (name.includes('tinta continua') || name.includes('ecotank')) {
                specs += `▸ Sistema de tinta continua (ahorro en tinta)\n`;
            }
        }
        // Genérico
        else {
            specs += `▸ ${product.description || 'Producto de alta calidad'}\n`;
        }
        
        return specs || `▸ ${product.description || 'Consultar especificaciones'}\n`;
    }

    getPhysicalBenefits(product) {
        const name = product.name.toLowerCase();
        let benefits = '';
        
        if (name.includes('portátil') || name.includes('portatil') || name.includes('laptop')) {
            if (name.includes('ryzen 7') || name.includes('i7') || name.includes('16gb')) {
                benefits = `▸ Alto rendimiento para trabajo pesado\n▸ Multitarea sin problemas\n▸ Ideal para diseño, programación, edición\n▸ Duración de batería extendida\n`;
            } else if (name.includes('ryzen 5') || name.includes('i5')) {
                benefits = `▸ Excelente relación calidad-precio\n▸ Perfecto para estudio y trabajo\n▸ Rápido y eficiente\n▸ Portátil y liviano\n`;
            } else {
                benefits = `▸ Ideal para tareas cotidianas\n▸ Navegación, Office, streaming\n▸ Económico y funcional\n▸ Fácil de transportar\n`;
            }
        } else if (name.includes('impresora')) {
            benefits = `▸ Impresiones de alta calidad\n▸ Bajo costo por página\n▸ Fácil instalación\n▸ Compatible con todos los dispositivos\n`;
        } else if (name.includes('monitor')) {
            benefits = `▸ Colores vibrantes y precisos\n▸ Reduce fatiga visual\n▸ Ideal para trabajo prolongado\n▸ Diseño moderno\n`;
        } else {
            benefits = `▸ Producto de calidad garantizada\n▸ Marca reconocida\n▸ Durabilidad comprobada\n`;
        }
        
        return benefits;
    }

    generateDigitalValueResponse(product) {
        const price = product.price.toLocaleString('es-CO');
        
        let response = `🌟 *¿Por qué ${product.name}?*\n\n`;
        
        // Valor en el mercado vs nuestro precio
        const marketValue = this.getMarketValue(product);
        if (marketValue) {
            response += `📊 *VALOR REAL:*\n`;
            response += `▸ En el mercado: ${marketValue.toLocaleString('es-CO')} COP\n`;
            response += `▸ *Nuestro precio: ${price} COP*\n`;
            response += `▸ 💰 *Ahorras: ${(marketValue - product.price).toLocaleString('es-CO')} COP*\n\n`;
        }
        
        // Beneficios según el tipo de producto
        response += `✨ *LO QUE OBTIENES:*\n`;
        response += this.getDigitalBenefits(product);
        
        // Cómo cambiará su vida
        response += `\n🚀 *CÓMO TE BENEFICIA:*\n`;
        response += this.getLifeChangeBenefits(product);
        
        // Aplicaciones prácticas
        response += `\n💼 *PUEDES APLICARLO EN:*\n`;
        response += this.getPracticalApplications(product);
        
        // Cierre con urgencia
        response += `\n⏰ *OFERTA ESPECIAL:*\n`;
        response += `Este precio es por tiempo limitado.\n`;
        response += `Acceso de por vida + actualizaciones incluidas.\n\n`;
        
        // Pregunta de cierre
        response += `🎯 *¿Te gustaría aprovechar esta oportunidad hoy?*\n`;
        response += `Solo dime "Sí, lo quiero" y te envío los datos de pago 💳`;
        
        return response;
    }

    getDigitalBenefits(product) {
        const name = product.name.toLowerCase();
        let benefits = '';
        
        if (name.includes('piano')) {
            benefits = `▸ 76 lecciones en video HD\n▸ 19 horas de contenido\n▸ 5 estilos musicales\n▸ 157 recursos descargables\n▸ Aprende a tu ritmo\n`;
        } else if (name.includes('diseño') || name.includes('photoshop')) {
            benefits = `▸ Domina Photoshop, Illustrator, InDesign\n▸ +50 cursos completos\n▸ Proyectos prácticos\n▸ Certificado de finalización\n`;
        } else if (name.includes('excel') || name.includes('office')) {
            benefits = `▸ Excel básico a avanzado\n▸ Fórmulas y funciones\n▸ Tablas dinámicas\n▸ Macros y automatización\n`;
        } else if (name.includes('programación') || name.includes('programacion')) {
            benefits = `▸ Python, JavaScript, Java, C++\n▸ +100 cursos completos\n▸ Proyectos reales\n▸ Desarrollo web y móvil\n`;
        } else if (name.includes('marketing')) {
            benefits = `▸ SEO y posicionamiento\n▸ Google Ads y Facebook Ads\n▸ Email marketing\n▸ Estrategias de ventas\n`;
        } else if (name.includes('inglés') || name.includes('ingles')) {
            benefits = `▸ Básico a avanzado\n▸ Conversación fluida\n▸ Inglés de negocios\n▸ Pronunciación perfecta\n`;
        } else if (name.includes('trading')) {
            benefits = `▸ Análisis técnico\n▸ Forex y criptomonedas\n▸ Gestión de riesgo\n▸ Estrategias probadas\n`;
        } else if (name.includes('40 mega') || name.includes('pack completo')) {
            benefits = `▸ TODOS los 40 Mega Packs\n▸ +500 cursos en total\n▸ Actualizaciones de por vida\n▸ Valor real: $800.000 COP\n`;
        } else {
            benefits = `▸ Contenido profesional completo\n▸ Acceso de por vida\n▸ Actualizaciones incluidas\n▸ Soporte incluido\n`;
        }
        
        return benefits;
    }

    getMarketValue(product) {
        const name = product.name.toLowerCase();
        
        // Valores aproximados del mercado para productos digitales
        if (name.includes('mega pack') || name.includes('pack completo')) {
            if (name.includes('40 mega')) return 800000;
            return 150000;
        }
        if (name.includes('piano')) return 350000;
        if (name.includes('diseño') || name.includes('photoshop')) return 200000;
        if (name.includes('excel') || name.includes('office')) return 180000;
        if (name.includes('programación') || name.includes('programacion')) return 500000;
        if (name.includes('marketing')) return 250000;
        if (name.includes('inglés') || name.includes('ingles')) return 300000;
        if (name.includes('hacking') || name.includes('seguridad')) return 400000;
        if (name.includes('trading') || name.includes('forex')) return 600000;
        
        return 100000; // Valor por defecto para digitales
    }

    getLifeChangeBenefits(product) {
        const name = product.name.toLowerCase();
        let benefits = '';
        
        if (name.includes('piano')) {
            benefits = `▸ Toca tus canciones favoritas\n▸ Impresiona a familia y amigos\n▸ Desarrolla una habilidad para toda la vida\n`;
        } else if (name.includes('diseño')) {
            benefits = `▸ Crea diseños profesionales\n▸ Trabaja como freelancer\n▸ Aumenta tus ingresos\n`;
        } else if (name.includes('excel') || name.includes('office')) {
            benefits = `▸ Destaca en tu trabajo\n▸ Automatiza tareas repetitivas\n▸ Mejora tu productividad 10x\n`;
        } else if (name.includes('programación') || name.includes('programacion')) {
            benefits = `▸ Trabaja en tecnología\n▸ Salarios de $3-10 millones/mes\n▸ Trabaja remoto desde casa\n`;
        } else if (name.includes('marketing')) {
            benefits = `▸ Vende más en tu negocio\n▸ Consigue clientes online\n▸ Genera ingresos pasivos\n`;
        } else if (name.includes('inglés') || name.includes('ingles')) {
            benefits = `▸ Mejores oportunidades laborales\n▸ Viaja sin barreras\n▸ Accede a contenido global\n`;
        } else if (name.includes('trading')) {
            benefits = `▸ Genera ingresos desde casa\n▸ Libertad financiera\n▸ Trabaja cuando quieras\n`;
        } else {
            benefits = `▸ Aprende nuevas habilidades\n▸ Mejora tu perfil profesional\n▸ Aumenta tus oportunidades\n`;
        }
        
        return benefits;
    }

    getPracticalApplications(product) {
        const name = product.name.toLowerCase();
        let applications = '';
        
        if (name.includes('piano')) {
            applications = `▸ Eventos familiares\n▸ Iglesia o comunidad\n▸ Composición musical\n▸ Relajación personal\n`;
        } else if (name.includes('diseño')) {
            applications = `▸ Redes sociales\n▸ Publicidad\n▸ Branding empresarial\n▸ Freelance\n`;
        } else if (name.includes('excel') || name.includes('office')) {
            applications = `▸ Reportes empresariales\n▸ Control de inventarios\n▸ Análisis de datos\n▸ Presupuestos\n`;
        } else if (name.includes('programación') || name.includes('programacion')) {
            applications = `▸ Desarrollo web\n▸ Apps móviles\n▸ Automatización\n▸ Startups\n`;
        } else if (name.includes('marketing')) {
            applications = `▸ Tu propio negocio\n▸ Agencia de marketing\n▸ E-commerce\n▸ Consultoría\n`;
        } else if (name.includes('inglés') || name.includes('ingles')) {
            applications = `▸ Trabajo internacional\n▸ Estudios en el exterior\n▸ Negocios globales\n▸ Turismo\n`;
        } else if (name.includes('trading')) {
            applications = `▸ Inversión personal\n▸ Ingresos adicionales\n▸ Independencia financiera\n▸ Retiro anticipado\n`;
        } else {
            applications = `▸ Trabajo actual\n▸ Emprendimiento\n▸ Freelance\n▸ Desarrollo personal\n`;
        }
        
        return applications;
    }

    getFarewellResponse(lastProduct) {
        let response = `¡Gracias por escribirnos! 🙏\n\n`;
        if (lastProduct) {
            response += `Recuerda que el *${lastProduct.name}* está disponible cuando lo necesites.\n\n`;
        }
        response += `📞 WhatsApp: +57 313 617 4267\n`;
        response += `¡Que tengas un excelente día! 😊`;
        return response;
    }

    getGreetingResponse() {
        return `¡Hola! 👋 Soy *David Martínez*
Tu asistente de *Tecnovariedades D&S*

🤖 *¿En qué puedo ayudarte?*

💻 Laptops y Computadores
🖨️ Impresoras
📱 Tablets
📚 Cursos Digitales

💡 Cuéntame qué buscas 😊`;
    }

    getContactResponse() {
        return `📞 *CONTACTO TECNOVARIEDADES D&S*

✅ WhatsApp: +57 313 617 4267
📍 Cali, Valle del Cauca

¿En qué más puedo ayudarte? 😊`;
    }
}
