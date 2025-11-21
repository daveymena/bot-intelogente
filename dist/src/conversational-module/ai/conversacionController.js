"use strict";
/**
 * Controlador principal de conversación
 * Orquesta la detección de intención, búsqueda de productos y flujos
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.procesarMensaje = procesarMensaje;
exports.obtenerEstadisticas = obtenerEstadisticas;
exports.reiniciarEstadisticas = reiniciarEstadisticas;
const db_1 = require("@/lib/db");
const detectarIntencion_1 = require("../utils/detectarIntencion");
const obtenerContexto_1 = require("../utils/obtenerContexto");
const localResponseHandler_1 = require("../utils/localResponseHandler");
const flujoFisico_1 = require("../flows/flujoFisico");
const flujoDigital_1 = require("../flows/flujoDigital");
const flujoDropshipping_1 = require("../flows/flujoDropshipping");
const flujoServicio_1 = require("../flows/flujoServicio");
const flujoGeneral_1 = require("../flows/flujoGeneral");
const promptBuilder_1 = require("../ai/promptBuilder");
const groqClient_1 = require("./groqClient");
const photoService_1 = require("../services/photoService");
const audioService_1 = require("../services/audioService");
const deepReasoningService_1 = require("../services/deepReasoningService");
/**
 * Procesa un mensaje del usuario y genera respuesta
 */
async function procesarMensaje(userId, mensaje, opciones) {
    try {
        console.log(`[Conversación] Usuario: ${userId}, Mensaje: ${mensaje}`);
        // 🎤 PROCESAR AUDIO SI ES NECESARIO
        let mensajeTexto = mensaje;
        if (opciones?.esAudio && opciones?.audioBuffer) {
            console.log('[Conversación] Procesando audio...');
            try {
                mensajeTexto = await (0, audioService_1.procesarAudio)(opciones.audioBuffer);
                console.log('[Conversación] Audio transcrito:', mensajeTexto);
            }
            catch (error) {
                console.error('[Conversación] Error transcribiendo audio:', error);
                mensajeTexto = '[Audio recibido]';
            }
        }
        // Guardar mensaje del usuario
        await (0, obtenerContexto_1.agregarMensajeAlHistorial)(userId, 'user', mensajeTexto);
        // Obtener contexto
        const contexto = await (0, obtenerContexto_1.obtenerContexto)(userId);
        // Detectar intención
        const { intencion, entidades } = (0, detectarIntencion_1.detectarIntencion)(mensajeTexto);
        console.log(`[Conversación] Intención detectada: ${intencion}`);
        // 📸 DETECTAR SOLICITUD DE FOTOS
        const solicitaFotos = (0, photoService_1.detectarSolicitudFotos)(mensajeTexto);
        // 🚀 INTENTAR RESPUESTA LOCAL PRIMERO (ahorro de tokens)
        const localResponse = (0, localResponseHandler_1.tryLocalResponse)(mensajeTexto, intencion);
        if (localResponse.canHandle && localResponse.response) {
            console.log(`[Conversación] ✅ Respuesta local (sin IA) - Tokens ahorrados`);
            localResponseHandler_1.LocalResponseStats.incrementLocal();
            // Guardar respuesta del bot
            await (0, obtenerContexto_1.agregarMensajeAlHistorial)(userId, 'assistant', localResponse.response);
            return {
                texto: localResponse.response,
            };
        }
        // Si no se puede manejar localmente, usar IA
        console.log(`[Conversación] 🤖 Requiere IA para respuesta compleja`);
        localResponseHandler_1.LocalResponseStats.incrementAI();
        let respuesta;
        // Manejar según intención
        switch (intencion) {
            case 'saludo':
            case 'despedida':
            case 'general':
                respuesta = await (0, flujoGeneral_1.procesarFlujoGeneral)(mensaje, intencion, contexto);
                break;
            case 'busqueda_producto':
            case 'consulta_precio':
            case 'consulta_disponibilidad':
                const resultadoProducto = await buscarYResponderProducto(mensajeTexto, contexto, solicitaFotos);
                return resultadoProducto;
            case 'solicitud_pago':
                respuesta = await generarInformacionPago(mensajeTexto, contexto);
                break;
            case 'solicitud_envio':
                respuesta = await procesarSolicitudEnvio(mensajeTexto, contexto);
                break;
            case 'servicio_tecnico':
                respuesta = await buscarServicio(mensajeTexto, contexto);
                break;
            case 'queja_reclamo':
                respuesta = await procesarQuejaReclamo(mensajeTexto, contexto);
                break;
            default:
                respuesta = await (0, flujoGeneral_1.procesarFlujoGeneral)(mensajeTexto, 'general', contexto);
        }
        // Guardar respuesta del bot
        await (0, obtenerContexto_1.agregarMensajeAlHistorial)(userId, 'assistant', respuesta);
        console.log(`[Conversación] Respuesta generada: ${respuesta.substring(0, 100)}...`);
        return {
            texto: respuesta,
        };
    }
    catch (error) {
        console.error('[Conversación] Error:', error);
        return {
            texto: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo? 🙏',
        };
    }
}
/**
 * Busca productos y genera respuesta
 */
async function buscarYResponderProducto(mensaje, contexto, solicitaFotos = false) {
    try {
        // Buscar productos
        let productos = await buscarProductos(mensaje);
        // 🧠 SI NO ENCUENTRA NADA, USAR RAZONAMIENTO PROFUNDO
        if (productos.length === 0) {
            console.log('[Conversación] 🧠 No se encontraron productos, activando razonamiento profundo...');
            try {
                const razonamiento = await (0, deepReasoningService_1.analizarConRazonamientoProfundo)(mensaje, contexto.historialMensajes?.slice(-3).map((m) => m.contenido).join('\n'));
                console.log('[Conversación] 💡 Interpretación:', razonamiento.interpretacion);
                console.log('[Conversación] 🔍 Búsqueda sugerida:', razonamiento.busquedaSugerida);
                // Buscar con la interpretación mejorada
                productos = await buscarProductos(razonamiento.busquedaSugerida);
                if (productos.length > 0) {
                    // Encontró productos con razonamiento profundo
                    console.log('[Conversación] ✅ Razonamiento profundo exitoso - Encontrados:', productos.length);
                    // Actualizar contexto con la interpretación
                    await (0, obtenerContexto_1.actualizarContexto)(contexto.userId, {
                        metadata: {
                            ...contexto.metadata,
                            ultimaInterpretacion: razonamiento.interpretacion,
                            ultimaBusqueda: razonamiento.busquedaSugerida,
                        },
                    });
                    // Continuar con el flujo normal
                }
                else {
                    // Ni con razonamiento profundo encontró
                    console.log('[Conversación] ❌ Razonamiento profundo no encontró productos');
                    return {
                        texto: `${(0, deepReasoningService_1.generarRespuestaAmigable)(razonamiento)}

Lamentablemente no tengo productos que coincidan exactamente.

¿Podrías darme más detalles sobre lo que buscas? 🤔`
                    };
                }
            }
            catch (error) {
                console.error('[Conversación] Error en razonamiento profundo:', error);
                // Continuar con respuesta estándar
            }
        }
        if (productos.length === 0) {
            return {
                texto: `No encontré productos que coincidan con "${mensaje}" 😕

¿Podrías darme más detalles sobre lo que buscas? 💡`
            };
        }
        if (productos.length === 1) {
            const producto = productos[0];
            console.log('[Conversación] 🎯 PRODUCTO SELECCIONADO:');
            console.log('[Conversación]    ID:', producto.id);
            console.log('[Conversación]    Nombre:', producto.nombre);
            console.log('[Conversación]    Precio:', producto.precio);
            console.log('[Conversación]    Categoría:', producto.categoria);
            // Actualizar contexto
            await (0, obtenerContexto_1.actualizarContexto)(contexto.userId, {
                ultimoProductoId: typeof producto.id === 'string' ? producto.id : producto.id.toString(),
                ultimoProductoNombre: producto.nombre,
                ultimaCategoria: producto.categoria,
            });
            // 💾 GUARDAR EN CONTEXTO DE CONVERSACIÓN PARA PAGOS
            try {
                const { ConversationContextService } = await Promise.resolve().then(() => __importStar(require('@/lib/conversation-context-service')));
                // Buscar el userId del dueño del bot desde la conversación
                const conversation = await db_1.db.conversation.findFirst({
                    where: { customerPhone: contexto.userId },
                    select: { userId: true }
                });
                if (conversation) {
                    // La clave es: userId_del_bot:numero_del_cliente
                    const conversationKey = `${conversation.userId}:${contexto.userId}`;
                    const productId = typeof producto.id === 'string' ? producto.id : producto.id.toString();
                    ConversationContextService.setProductContext(conversationKey, productId, producto.nombre);
                    console.log(`[Conversación] ✅ Producto guardado en contexto para pagos: ${producto.nombre} (${conversationKey})`);
                    console.log(`[Conversación] 🆔 ID del producto: ${productId}`);
                }
            }
            catch (error) {
                console.error('[Conversación] Error guardando contexto:', error);
            }
            // 🚀 INTENTAR RESPUESTA LOCAL CON PRODUCTO
            const localResponse = (0, localResponseHandler_1.tryLocalResponse)(mensaje, 'busqueda_producto', producto);
            if (localResponse.canHandle && localResponse.response) {
                console.log(`[Conversación] ✅ Respuesta de producto local (sin IA)`);
                localResponseHandler_1.LocalResponseStats.incrementLocal();
                // 📸 ENVIAR FOTOS AUTOMÁTICAMENTE si el producto tiene imágenes
                const fotosProducto = (0, photoService_1.obtenerFotosProducto)(producto);
                if (fotosProducto.length > 0) {
                    console.log(`[Conversación] 📸 Enviando ${fotosProducto.length} fotos automáticamente`);
                    return {
                        texto: localResponse.response,
                        fotos: fotosProducto
                    };
                }
                return { texto: localResponse.response };
            }
            // Si no se puede manejar localmente, usar IA
            console.log(`[Conversación] 🤖 Producto requiere IA`);
            localResponseHandler_1.LocalResponseStats.incrementAI();
            // Dirigir al flujo según tipo y enviar fotos si disponibles
            const respuestaTexto = await dirigirAFlujo(mensaje, producto, contexto);
            // 📸 ENVIAR FOTOS AUTOMÁTICAMENTE si el producto tiene imágenes
            const fotosProducto = (0, photoService_1.obtenerFotosProducto)(producto);
            if (fotosProducto.length > 0) {
                console.log(`[Conversación] 📸 Enviando ${fotosProducto.length} fotos automáticamente`);
                return {
                    texto: respuestaTexto,
                    fotos: fotosProducto
                };
            }
            return { texto: respuestaTexto };
        }
        // Múltiples productos encontrados
        const respuestaMultiples = await generarRespuestaMultiplesProductos(productos, contexto);
        return { texto: respuestaMultiples };
    }
    catch (error) {
        console.error('[BuscarProducto] Error:', error);
        return { texto: 'Tuve un problema al buscar productos. ¿Podrías intentar de nuevo? 🙏' };
    }
}
/**
 * Busca productos en la base de datos con búsqueda inteligente
 */
async function buscarProductos(query) {
    try {
        const queryLower = query.toLowerCase();
        // Extraer palabras clave importantes
        const palabrasClave = queryLower
            .replace(/[¿?¡!.,;]/g, ' ')
            .split(' ')
            .filter(p => p.length > 2 && !['para', 'con', 'por', 'los', 'las', 'del', 'una', 'uno', 'que', 'más', 'información', 'puedes', 'dar', 'dame'].includes(p));
        console.log('[BuscarProductos] Palabras clave:', palabrasClave);
        // Buscar por nombre y descripción solamente
        const productos = await db_1.db.product.findMany({
            where: {
                AND: [
                    {
                        OR: palabrasClave.map(palabra => ({
                            OR: [
                                { name: { contains: palabra, mode: 'insensitive' } },
                                { description: { contains: palabra, mode: 'insensitive' } },
                            ]
                        }))
                    },
                    { status: 'AVAILABLE' }
                ]
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
        });
        // Eliminar duplicados
        const productosUnicos = productos.filter((p, index, self) => index === self.findIndex(t => t.id === p.id));
        // Ordenar por relevancia (cuántas palabras clave coinciden)
        const productosConScore = productosUnicos.map(p => {
            const nombreLower = p.name.toLowerCase();
            const descripcionLower = (p.description || '').toLowerCase();
            let score = 0;
            palabrasClave.forEach(palabra => {
                if (nombreLower.includes(palabra))
                    score += 3; // Nombre vale más
                if (descripcionLower.includes(palabra))
                    score += 1;
            });
            return { producto: p, score };
        });
        // Ordenar por score descendente
        productosConScore.sort((a, b) => b.score - a.score);
        console.log('[BuscarProductos] Encontrados:', productosConScore.length);
        if (productosConScore.length > 0) {
            console.log('[BuscarProductos] Mejor match:', productosConScore[0].producto.name, 'Score:', productosConScore[0].score);
        }
        // LÓGICA MEJORADA: Priorizar match específico sobre sugerencias
        const mejorScore = productosConScore[0]?.score || 0;
        const segundoScore = productosConScore[1]?.score || 0;
        // Ser más estricto: si el mejor score es bueno (>= 4) y mejor que el segundo, usar solo ese
        const esMatchEspecifico = mejorScore >= 4 && (mejorScore > segundoScore);
        let productosRelevantes;
        if (esMatchEspecifico || productosConScore.length === 1) {
            // Match específico o único: devolver SOLO el mejor producto
            console.log('[BuscarProductos] ✅ Match específico detectado - Devolviendo solo 1 producto');
            productosRelevantes = [productosConScore[0]];
        }
        else if (mejorScore >= 2) {
            // Múltiples opciones relevantes: devolver máximo 2 para no confundir
            console.log('[BuscarProductos] 📋 Múltiples matches - Devolviendo máximo 2 productos');
            productosRelevantes = productosConScore.slice(0, 2);
        }
        else {
            // Match muy débil: devolver máximo 3
            console.log('[BuscarProductos] 🔍 Match débil - Devolviendo máximo 3 productos');
            productosRelevantes = productosConScore.slice(0, 3);
        }
        return productosRelevantes.map(({ producto: p }) => ({
            id: p.id, // ✅ Mantener el ID original (string)
            nombre: p.name,
            descripcion: p.description || undefined,
            precio: p.price,
            categoria: p.category,
            tipoVenta: p.subcategory || undefined,
            imagenes: p.images ? JSON.parse(p.images) : [],
            stock: p.stock || undefined,
            metodosPago: [], // Se puede agregar después si es necesario
        }));
    }
    catch (error) {
        console.error('[BuscarProductos] Error:', error);
        return [];
    }
}
/**
 * Dirige al flujo correcto según tipo de producto
 */
async function dirigirAFlujo(mensaje, producto, contexto) {
    const tipoVenta = (producto.tipoVenta || producto.categoria || '').toLowerCase();
    console.log(`[DirigirFlujo] 📦 PRODUCTO RECIBIDO:`);
    console.log(`[DirigirFlujo]    ID: ${producto.id}`);
    console.log(`[DirigirFlujo]    Nombre: ${producto.nombre}`);
    console.log(`[DirigirFlujo]    Precio: ${producto.precio}`);
    console.log(`[DirigirFlujo]    Tipo: ${tipoVenta}`);
    // PRODUCTOS DIGITALES: cursos, megapacks, software
    if (tipoVenta.includes('digital') ||
        tipoVenta.includes('curso') ||
        tipoVenta.includes('megapack') ||
        tipoVenta.includes('software')) {
        console.log('[DirigirFlujo] ✅ Usando flujo DIGITAL');
        return await (0, flujoDigital_1.procesarFlujoDigital)(mensaje, producto, contexto);
    }
    // DROPSHIPPING
    if (tipoVenta.includes('dropshipping') || tipoVenta.includes('envio')) {
        console.log('[DirigirFlujo] ✅ Usando flujo DROPSHIPPING');
        return await (0, flujoDropshipping_1.procesarFlujoDropshipping)(mensaje, producto, contexto);
    }
    // SERVICIOS
    if (tipoVenta.includes('servicio') || tipoVenta.includes('service')) {
        console.log('[DirigirFlujo] ✅ Usando flujo SERVICIO');
        return await (0, flujoServicio_1.procesarFlujoServicio)(mensaje, producto, contexto);
    }
    // Por defecto, flujo FÍSICO
    console.log('[DirigirFlujo] ✅ Usando flujo FÍSICO');
    return await (0, flujoFisico_1.procesarFlujoFisico)(mensaje, producto, contexto);
}
/**
 * Genera respuesta para múltiples productos
 */
async function generarRespuestaMultiplesProductos(productos, contexto) {
    try {
        const messages = [
            {
                role: 'system',
                content: (0, promptBuilder_1.construirPromptMultiplesProductos)(productos),
            },
            {
                role: 'user',
                content: '¿Cuáles son las opciones disponibles?',
            },
        ];
        const respuesta = await (0, groqClient_1.sendWithFallback)(messages, {
            temperature: 0.7,
            maxTokens: 600,
        });
        return respuesta.content;
    }
    catch (error) {
        console.error('[MultiplesProductos] Error:', error);
        // Fallback manual
        let respuesta = '¡Encontré varias opciones! 🎯\n\n';
        productos.forEach((p, i) => {
            respuesta += `${i + 1}. *${p.nombre}*\n`;
            respuesta += `   💰 $${p.precio.toLocaleString('es-CO')} COP\n\n`;
        });
        respuesta += '¿Cuál te interesa más? 😊';
        return respuesta;
    }
}
/**
 * Genera información de pago - SIN IA, SOLO LINKS REALES
 */
async function generarInformacionPago(mensaje, contexto) {
    try {
        console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[InformacionPago] 💳 SOLICITUD DE PAGO DETECTADA');
        console.log('[InformacionPago] 🔍 Buscando producto en contexto...');
        console.log('[InformacionPago] ultimoProductoId:', contexto.ultimoProductoId);
        console.log('[InformacionPago] ultimoProductoNombre:', contexto.ultimoProductoNombre);
        if (!contexto.ultimoProductoId) {
            console.log('[InformacionPago] ❌ No hay producto en contexto');
            return `¿Qué producto quieres comprar? 🤔`;
        }
        const producto = await db_1.db.product.findUnique({
            where: { id: contexto.ultimoProductoId },
        });
        if (!producto) {
            console.log('[InformacionPago] ❌ Producto no encontrado en BD');
            return `¿Qué producto quieres comprar? 🤔`;
        }
        console.log('[InformacionPago] ✅ Producto encontrado:', producto.name);
        console.log('[InformacionPago] 💰 Precio:', producto.price);
        console.log('[InformacionPago] 🔄 Generando links REALES de pago...');
        console.log('[InformacionPago] ⚠️  NO USAR IA - SOLO LINKS REALES');
        // GENERAR LINKS REALES DIRECTAMENTE - SIN IA
        const { BotPaymentLinkGenerator } = await Promise.resolve().then(() => __importStar(require('@/lib/bot-payment-link-generator')));
        const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(producto.id, producto.userId, 1);
        if (paymentResult.success && paymentResult.message) {
            console.log('[InformacionPago] ✅ Links REALES generados exitosamente');
            console.log('[InformacionPago] 📤 Enviando links reales (no inventados)');
            console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return paymentResult.message;
        }
        // Fallback simple SIN inventar nada
        console.log('[InformacionPago] ⚠️ Fallback - no se generaron links');
        console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return `Un momento, estoy generando tu link de pago para *${producto.name}*

💰 Total: ${producto.price.toLocaleString('es-CO')} COP

⏳ Procesando...`;
    }
    catch (error) {
        console.error('[InformacionPago] ❌ Error:', error);
        console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return 'Tuve un problema generando el link. Intenta de nuevo 🙏';
    }
}
/**
 * Procesa solicitud de envío
 */
async function procesarSolicitudEnvio(mensaje, contexto) {
    if (contexto.ultimoProductoNombre) {
        return `¡Perfecto! Para el envío de *${contexto.ultimoProductoNombre}* necesito:

📍 Ciudad y dirección completa
📱 Número de contacto

El costo de envío varía según la ciudad. ¿A dónde lo necesitas? 🚚`;
    }
    return `¡Claro! Hacemos envíos a toda Colombia 🇨🇴

¿Qué producto te interesa? Así te confirmo disponibilidad y costo de envío 📦`;
}
/**
 * Busca servicios técnicos
 */
async function buscarServicio(mensaje, contexto) {
    try {
        const servicios = await db_1.db.product.findMany({
            where: {
                category: 'SERVICE',
                status: 'AVAILABLE',
            },
            take: 3,
        });
        if (servicios.length > 0) {
            const servicio = servicios[0];
            const productoInfo = {
                id: parseInt(servicio.id) || 0,
                nombre: servicio.name,
                descripcion: servicio.description || undefined,
                precio: servicio.price,
                categoria: servicio.category,
            };
            return await (0, flujoServicio_1.procesarFlujoServicio)(mensaje, productoInfo, contexto);
        }
        return `¡Claro! Ofrecemos servicio técnico 🔧

Cuéntame:
- ¿Qué equipo es?
- ¿Qué problema presenta?

Así puedo ayudarte mejor 😊`;
    }
    catch (error) {
        console.error('[BuscarServicio] Error:', error);
        return 'Ofrecemos servicio técnico. ¿Qué problema tienes? 🔧';
    }
}
/**
 * Procesa quejas o reclamos
 */
async function procesarQuejaReclamo(mensaje, contexto) {
    return `Lamento mucho que hayas tenido un inconveniente 😔

Tu satisfacción es muy importante para nosotros. 

¿Podrías contarme qué sucedió? Voy a ayudarte a resolverlo lo antes posible 🙏`;
}
/**
 * Obtiene estadísticas de uso (local vs IA)
 */
function obtenerEstadisticas() {
    return localResponseHandler_1.LocalResponseStats.getStats();
}
/**
 * Reinicia estadísticas
 */
function reiniciarEstadisticas() {
    localResponseHandler_1.LocalResponseStats.reset();
}
