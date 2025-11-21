"use strict";
/**
 * 🎯 SISTEMA UNIVERSAL DE FLUJOS DE VENTA
 *
 * Sistema modular que se adapta automáticamente según el tipo de negocio
 * configurado por el usuario en el dashboard.
 *
 * Tipos de negocio soportados:
 * - ECOMMERCE: Tienda online con productos físicos
 * - DROPSHIPPING: Productos con envío (contraentrega)
 * - PHYSICAL_STORE: Tienda física con pickup
 * - SERVICES: Servicios profesionales (vendedor, consultor)
 * - APPOINTMENTS: Servicios con citas (clínica, peluquería)
 * - DIGITAL_PRODUCTS: Cursos, megapacks, ebooks
 * - HYBRID: Combinación de varios tipos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalSalesFlow = void 0;
const db_1 = require("./db");
class UniversalSalesFlow {
    /**
     * Obtener configuración del flujo para un usuario
     */
    static async getFlowConfig(userId) {
        // Verificar cache
        if (this.flowConfigs.has(userId)) {
            return this.flowConfigs.get(userId);
        }
        // Buscar en BD
        let config = await db_1.db.salesFlowConfig.findUnique({
            where: { userId }
        });
        // Si no existe, crear configuración por defecto
        if (!config) {
            config = await db_1.db.salesFlowConfig.create({
                data: {
                    userId,
                    businessType: 'ECOMMERCE',
                    dropshippingEnabled: false,
                    hasPhysicalStore: false,
                    requiresAppointment: false
                }
            });
        }
        // Guardar en cache
        this.flowConfigs.set(userId, config);
        return config;
    }
    /**
     * Limpiar cache de configuración (llamar cuando se actualiza en dashboard)
     */
    static clearConfigCache(userId) {
        this.flowConfigs.delete(userId);
    }
    /**
     * Detectar si el mensaje inicia un flujo de ventas
     * SOLO para consultas específicas desde redes sociales o intención clara de compra
     */
    static async detectSalesInquiry(message, userId) {
        const config = await this.getFlowConfig(userId);
        const normalized = message.toLowerCase();
        // Patrones MUY ESPECÍFICOS para activar el flujo
        const patterns = [
            // SOLO desde redes sociales (muy específico)
            /vi.*en\s+(facebook|instagram|fb|ig)/i,
            /vi.*publicaci[oó]n/i,
            /vi.*anuncio/i,
            /vi.*post/i,
            // SOLO servicios con citas (muy específico)
            /necesito\s+(una\s+)?cita/i,
            /agendar\s+(una\s+)?cita/i,
            /reservar\s+(una\s+)?cita/i,
            /quiero\s+(una\s+)?cita/i,
            // SOLO si menciona "comprar" explícitamente
            /quiero\s+comprar/i,
            /voy\s+a\s+comprar/i,
            /me\s+gustar[ií]a\s+comprar/i
        ];
        // NO activar para búsquedas normales de productos
        // Esas deben ir al sistema híbrido inteligente
        return patterns.some(pattern => pattern.test(normalized));
    }
    /**
     * Iniciar flujo de ventas
     */
    static async startFlow(from, message, userId) {
        const config = await this.getFlowConfig(userId);
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (!user) {
            return { response: '', inFlow: false };
        }
        // Detectar producto/servicio mencionado
        const productName = this.extractProductName(message);
        let product = null;
        if (productName) {
            product = await db_1.db.product.findFirst({
                where: {
                    userId,
                    status: 'AVAILABLE',
                    OR: [
                        { name: { contains: productName, mode: 'insensitive' } },
                        { description: { contains: productName, mode: 'insensitive' } }
                    ]
                }
            });
        }
        // Inicializar estado
        this.flowStates.set(from, {
            step: 'initial',
            productId: product?.id || undefined,
            productName: product?.name || productName || 'nuestro servicio'
        });
        // Generar respuesta según tipo de negocio
        const response = await this.generateInitialResponse(config, user, product, message);
        return {
            response,
            inFlow: true
        };
    }
    /**
     * Continuar flujo de ventas
     */
    static async continueFlow(from, message, userId) {
        const state = this.flowStates.get(from);
        if (!state) {
            return { response: '', completed: false };
        }
        const config = await this.getFlowConfig(userId);
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (!user) {
            return { response: '', completed: false };
        }
        // Procesar según el paso actual y tipo de negocio
        return await this.processStep(from, message, state, config, user, userId);
    }
    /**
     * Verificar si está en flujo activo
     */
    static isInFlow(from) {
        return this.flowStates.has(from);
    }
    /**
     * Limpiar flujo
     */
    static clearFlow(from) {
        this.flowStates.delete(from);
    }
    // ============ MÉTODOS PRIVADOS ============
    /**
     * Generar respuesta inicial según tipo de negocio
     */
    static async generateInitialResponse(config, user, product, message) {
        const businessName = user.businessName || 'nuestra empresa';
        const agentName = config.welcomeMessage?.match(/Soy\s+(\w+)/i)?.[1] || 'el asistente';
        let response = `¡Hola 👋! Sí, claro que sí 😎. Soy ${agentName} de ${businessName}.\n\n`;
        // DROPSHIPPING
        if (config.businessType === 'DROPSHIPPING' || config.dropshippingEnabled) {
            if (product) {
                response += `El *${product.name}* está disponible, ¿verdad?\n\n`;
            }
            response += `¿Deseas que te cuente los detalles o prefieres saber directamente el precio y forma de entrega?`;
        }
        // TIENDA FÍSICA
        else if (config.businessType === 'PHYSICAL_STORE' || config.hasPhysicalStore) {
            if (product) {
                response += `El *${product.name}* está disponible en nuestra tienda.\n\n`;
            }
            response += `¿Te gustaría pasar a verlo en persona o prefieres que te envíe fotos y detalles?`;
        }
        // SERVICIOS CON CITAS
        else if (config.businessType === 'APPOINTMENTS' || config.requiresAppointment) {
            response += `Perfecto, te puedo ayudar a agendar una cita.\n\n`;
            response += `¿Qué día y hora te vendría mejor? Atendemos ${config.storeHours || 'de lunes a sábado'}.`;
        }
        // SERVICIOS PROFESIONALES
        else if (config.businessType === 'SERVICES' || config.consultationEnabled) {
            response += `Excelente, puedo ayudarte con eso.\n\n`;
            response += `¿Prefieres que te explique cómo funciona el servicio o ir directo a los detalles de precio y disponibilidad?`;
        }
        // PRODUCTOS DIGITALES
        else if (config.businessType === 'DIGITAL_PRODUCTS') {
            if (product) {
                response += `El *${product.name}* está disponible para entrega inmediata.\n\n`;
            }
            response += `¿Te gustaría conocer el contenido completo o prefieres saber el precio y forma de pago?`;
        }
        // ECOMMERCE / HYBRID (por defecto)
        else {
            if (product) {
                response += `El *${product.name}* está disponible.\n\n`;
            }
            response += `¿Qué te gustaría saber? Puedo contarte sobre características, precio, o formas de entrega.`;
        }
        return response;
    }
    /**
     * Procesar paso del flujo
     */
    static async processStep(from, message, state, config, user, userId) {
        const normalized = message.toLowerCase();
        // Obtener producto si existe
        let product = null;
        if (state.productId) {
            product = await db_1.db.product.findUnique({
                where: { id: state.productId }
            });
        }
        // PASO: Cliente pide detalles
        if (state.step === 'initial' && this.wantsDetails(normalized)) {
            state.step = 'details';
            this.flowStates.set(from, state);
            let response = `Perfecto 👌\n\n`;
            if (product && product.description) {
                response += product.description;
                response += `\n\n¿Te gustaría ver fotos o conocer el precio?`;
            }
            else {
                response += `Te puedo dar toda la información que necesites. ¿Qué te gustaría saber específicamente?`;
            }
            return { response, completed: false };
        }
        // PASO: Cliente pregunta por precio
        if ((state.step === 'initial' || state.step === 'details') && this.asksPrice(normalized)) {
            state.step = 'price';
            this.flowStates.set(from, state);
            let response = '';
            if (product) {
                const price = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: product.currency || 'COP',
                    minimumFractionDigits: 0
                }).format(product.price);
                response = `El precio es *${price}*\n\n`;
                // Opciones según tipo de negocio
                if (config.businessType === 'DROPSHIPPING' || config.dropshippingEnabled) {
                    response += `Lo mejor 👉 lo puedes pagar al recibirlo (contraentrega).\n`;
                    response += `Demora ${config.deliveryDays || '4-5 días hábiles'} 🛵📦\n\n`;
                    response += `¿Te gustaría que lo enviemos a tu domicilio o prefieres recogerlo?`;
                }
                else if (config.businessType === 'DIGITAL_PRODUCTS') {
                    response += `Entrega inmediata por WhatsApp o email 📧\n\n`;
                    response += `¿Cómo prefieres recibirlo?`;
                }
                else if (config.hasPhysicalStore) {
                    response += `Puedes pasar por nuestra tienda en ${user.businessAddress || 'nuestra ubicación'}\n\n`;
                    response += `¿Prefieres recogerlo o que te lo enviemos?`;
                }
                else {
                    response += `¿Te gustaría proceder con la compra?`;
                }
            }
            else {
                response = `Para darte un precio exacto, necesito saber un poco más sobre lo que necesitas. ¿Puedes darme más detalles?`;
            }
            return { response, completed: false };
        }
        // PASO: Captura de datos
        if (state.step === 'price' || state.step === 'capture_data') {
            // Detectar método de entrega
            if (this.wantsShipping(normalized)) {
                state.deliveryMethod = 'shipping';
                state.step = 'capture_data';
                this.flowStates.set(from, state);
                let response = `Perfecto 🙌 Necesito estos datos:\n\n`;
                if (config.requireName)
                    response += `📍 *Nombre completo*\n`;
                if (config.requirePhone)
                    response += `📞 *Teléfono de contacto*\n`;
                if (config.requireAddress)
                    response += `🏠 *Dirección completa*\n`;
                if (config.requireCity)
                    response += `🏙️ *Ciudad*\n`;
                if (config.showColors && product)
                    response += `🎨 *Color preferido*\n`;
                return { response, completed: false };
            }
            // Capturar datos del cliente
            const data = this.extractCustomerData(message, state.customerData || {}, config);
            state.customerData = data;
            this.flowStates.set(from, state);
            // Verificar si tenemos todos los datos requeridos
            const hasAllData = this.validateRequiredData(data, config);
            if (hasAllData && product) {
                // Crear orden/registro
                await this.createOrder(userId, from, product, data, config);
                const price = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: product.currency || 'COP',
                    minimumFractionDigits: 0
                }).format(product.price);
                let response = `Listo ✅ Pedido confirmado:\n\n`;
                response += `📦 *${product.name}*\n`;
                if (data?.name)
                    response += `👤 ${data.name}\n`;
                if (data?.phone)
                    response += `📞 ${data.phone}\n`;
                if (data?.address && data?.city)
                    response += `📍 ${data.address}, ${data.city}\n`;
                response += `💰 ${price}\n\n`;
                if (config.businessType === 'DROPSHIPPING') {
                    response += `Te llegará en ${config.deliveryDays || '4-5 días hábiles'} 🚚\n`;
                    response += `Te enviaremos la guía de envío cuando salga del almacén.\n\n`;
                }
                response += `Gracias por tu compra 💙\n\n`;
                response += `¿Necesitas algo más?`;
                this.flowStates.delete(from); // Limpiar estado
                return { response, completed: true };
            }
            // Pedir datos faltantes
            const missing = this.getMissingData(data, config);
            if (missing.length > 0) {
                const response = `Me falta${missing.length > 1 ? 'n' : ''}: *${missing.join(', ')}*\n\nPor favor compárteme ${missing.length > 1 ? 'esos datos' : 'ese dato'} 😊`;
                return { response, completed: false };
            }
        }
        return { response: '', completed: false };
    }
    // ============ MÉTODOS AUXILIARES ============
    static extractProductName(message) {
        // Extraer nombre de producto mencionado
        const patterns = [
            /bolso\s+antirobo/i,
            /laptop/i,
            /portátil/i,
            /celular/i,
            /curso/i,
            /megapack/i
        ];
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match)
                return match[0];
        }
        return null;
    }
    static wantsDetails(message) {
        return /detalles|cu[eé]ntame|informaci[oó]n|m[aá]s|caracter[ií]sticas|especificaciones/i.test(message);
    }
    static asksPrice(message) {
        return /precio|cu[aá]nto|costo|valor|pagar|cuanto/i.test(message);
    }
    static wantsShipping(message) {
        return /env[ií]o|domicilio|casa|direcci[oó]n|entregar|enviar/i.test(message);
    }
    static extractCustomerData(message, currentData, config) {
        const data = { ...currentData };
        // Extraer nombre
        if (!data.name && config.requireName) {
            const nameMatch = message.match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/i);
            if (nameMatch)
                data.name = nameMatch[1].trim();
        }
        // Extraer teléfono
        if (!data.phone && config.requirePhone) {
            const phoneMatch = message.match(/\b(\d{10}|\d{3}[-\s]?\d{3}[-\s]?\d{4})\b/);
            if (phoneMatch)
                data.phone = phoneMatch[1].replace(/[-\s]/g, '');
        }
        // Extraer email
        if (!data.email && config.requireEmail) {
            const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
            if (emailMatch)
                data.email = emailMatch[0];
        }
        // Extraer dirección
        if (!data.address && config.requireAddress) {
            const addressMatch = message.match(/(calle|carrera|cr|cra|diagonal|transversal|avenida|av)[\s\d#\-a-z]+/i);
            if (addressMatch)
                data.address = addressMatch[0].trim();
        }
        // Extraer ciudad
        if (!data.city && config.requireCity) {
            const cities = ['bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'cúcuta', 'bucaramanga', 'pereira', 'manizales', 'ibagué'];
            for (const city of cities) {
                if (message.toLowerCase().includes(city)) {
                    data.city = city.charAt(0).toUpperCase() + city.slice(1);
                    break;
                }
            }
        }
        // Extraer color
        if (!data.color && config.showColors) {
            const colorMatch = message.match(/\b(negro|gris|azul|rojo|blanco|verde|amarillo|rosa)\b/i);
            if (colorMatch)
                data.color = colorMatch[1].toLowerCase();
        }
        return data;
    }
    static validateRequiredData(data, config) {
        if (config.requireName && !data.name)
            return false;
        if (config.requirePhone && !data.phone)
            return false;
        if (config.requireEmail && !data.email)
            return false;
        if (config.requireAddress && !data.address)
            return false;
        if (config.requireCity && !data.city)
            return false;
        return true;
    }
    static getMissingData(data, config) {
        const missing = [];
        if (config.requireName && !data.name)
            missing.push('nombre completo');
        if (config.requirePhone && !data.phone)
            missing.push('teléfono');
        if (config.requireEmail && !data.email)
            missing.push('email');
        if (config.requireAddress && !data.address)
            missing.push('dirección');
        if (config.requireCity && !data.city)
            missing.push('ciudad');
        return missing;
    }
    static async createOrder(userId, customerPhone, product, customerData, config) {
        try {
            const orderData = {
                userId,
                customerName: customerData.name || 'Cliente',
                customerPhone,
                customerEmail: customerData.email || `${customerPhone}@whatsapp.temp`,
                customerAddress: customerData.address,
                customerCity: customerData.city,
                notes: customerData.notes,
                items: JSON.stringify([{
                        productId: product.id,
                        productName: product.name,
                        quantity: 1,
                        price: product.price,
                        color: customerData.color,
                        size: customerData.size
                    }]),
                total: product.price,
                paymentMethod: config.paymentOnDelivery ? 'CONTRAENTREGA' : 'PENDIENTE',
                status: 'pending'
            };
            await db_1.db.order.create({ data: orderData });
            console.log(`[UniversalSalesFlow] ✅ Orden creada para ${customerData.name}`);
        }
        catch (error) {
            console.error('[UniversalSalesFlow] ❌ Error creando orden:', error);
        }
    }
}
exports.UniversalSalesFlow = UniversalSalesFlow;
UniversalSalesFlow.flowStates = new Map();
UniversalSalesFlow.flowConfigs = new Map(); // Cache de configuraciones
