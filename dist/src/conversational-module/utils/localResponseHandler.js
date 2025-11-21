"use strict";
/**
 * Manejador de respuestas locales (sin IA)
 * Ahorra tokens respondiendo casos simples sin llamar a la API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalResponseStats = void 0;
exports.tryLocalResponse = tryLocalResponse;
/**
 * Intenta generar una respuesta local sin usar IA
 */
function tryLocalResponse(mensaje, intencion, producto) {
    const textoLower = mensaje.toLowerCase().trim();
    // 1. SALUDOS SIMPLES (sin IA)
    if (intencion === 'saludo') {
        return {
            canHandle: true,
            response: generarSaludoLocal(),
        };
    }
    // 2. DESPEDIDAS (sin IA)
    if (intencion === 'despedida') {
        return {
            canHandle: true,
            response: generarDespedidaLocal(),
        };
    }
    // 3. CONSULTA DE PRECIO SIMPLE (sin IA)
    if (intencion === 'consulta_precio' && producto) {
        if (esPreguntaPrecioSimple(textoLower)) {
            return {
                canHandle: true,
                response: generarRespuestaPrecioLocal(producto),
            };
        }
    }
    // 4. CONSULTA DE DISPONIBILIDAD SIMPLE (sin IA)
    if (intencion === 'consulta_disponibilidad' && producto) {
        if (esPreguntaDisponibilidadSimple(textoLower)) {
            return {
                canHandle: true,
                response: generarRespuestaDisponibilidadLocal(producto),
            };
        }
    }
    // 5. CONFIRMACIONES SIMPLES (sin IA)
    if (esConfirmacionSimple(textoLower)) {
        return {
            canHandle: true,
            response: '¡Perfecto! 😊 ¿En qué más puedo ayudarte?',
        };
    }
    // 6. AGRADECIMIENTOS (sin IA)
    if (esAgradecimiento(textoLower)) {
        return {
            canHandle: true,
            response: '¡Con gusto! 😊 Estoy aquí para ayudarte. ¿Necesitas algo más?',
        };
    }
    // 7. MENSAJES MUY CORTOS (sin IA)
    if (textoLower.length < 3) {
        return {
            canHandle: true,
            response: '¿En qué puedo ayudarte? 😊',
        };
    }
    // Si no puede manejar localmente, requiere IA
    return {
        canHandle: false,
        requiresAI: true,
    };
}
/**
 * Genera saludo local aleatorio
 */
function generarSaludoLocal() {
    const saludos = [
        `¡Hola! 👋 Bienvenido a *Tecnovariedades D&S*

¿Qué te gustaría ver?
💻 Computadores
🏍️ Motos  
💎 Cursos digitales
🔧 Servicios`,
        `¡Hola! 😊 ¿Cómo estás?

Puedo ayudarte con:
- Información de productos
- Precios y disponibilidad
- Métodos de pago

¿Qué necesitas?`,
        `¡Bienvenido! 🎉

¿Te interesa algún producto en particular? 🔍`,
    ];
    return saludos[Math.floor(Math.random() * saludos.length)];
}
/**
 * Genera despedida local aleatoria
 */
function generarDespedidaLocal() {
    const despedidas = [
        '¡Gracias por escribir! 😊\n\nSi necesitas algo más, aquí estaré.\n¡Que tengas un excelente día! 🌟',
        '¡Hasta pronto! 👋\n\nRecuerda que estoy disponible cuando me necesites.\n¡Feliz día! ☀️',
        '¡Nos vemos! 😊\n\nCualquier duda, no dudes en escribir.\n¡Cuídate! 💙',
    ];
    return despedidas[Math.floor(Math.random() * despedidas.length)];
}
/**
 * Genera respuesta de precio local
 */
function generarRespuestaPrecioLocal(producto) {
    const precio = `$${producto.precio.toLocaleString('es-CO')} COP`;
    if (producto.categoria === 'digital' || producto.tipoVenta?.includes('digital')) {
        return `*${producto.nombre}*\n💰 ${precio}\n✅ Acceso inmediato\n\n¿Te genero el link de pago? 🔗`;
    }
    if (producto.tipoVenta?.includes('dropshipping')) {
        return `*${producto.nombre}*\n💰 ${precio}\n🚚 Envío incluido\n\n¿A qué ciudad lo necesitas? 📍`;
    }
    const disponibilidad = producto.stock && producto.stock > 0
        ? '✅ Disponible'
        : '⚠️ Consultar disponibilidad';
    return `*${producto.nombre}*\n💰 ${precio}\n${disponibilidad}\n\n¿Te gustaría más información? 😊`;
}
/**
 * Genera respuesta de disponibilidad local
 */
function generarRespuestaDisponibilidadLocal(producto) {
    const disponible = producto.stock && producto.stock > 0;
    const precio = `$${producto.precio.toLocaleString('es-CO')} COP`;
    if (disponible) {
        return `¡Sí! *${producto.nombre}* está disponible 😊\n\n💰 ${precio}\n📦 ${producto.stock} unidades\n\n¿Te interesa?`;
    }
    return `*${producto.nombre}*\n⚠️ Déjame verificar disponibilidad\n💰 ${precio}\n\n¿Te gustaría que te avise cuando llegue? 📲`;
}
/**
 * Detecta si es una pregunta de precio simple
 */
function esPreguntaPrecioSimple(texto) {
    const patronesSimples = [
        /^cuánto cuesta$/,
        /^cuánto vale$/,
        /^cuánto es$/,
        /^precio$/,
        /^valor$/,
        /^cuánto$/,
        /^precio\??$/,
    ];
    return patronesSimples.some(patron => patron.test(texto));
}
/**
 * Detecta si es una pregunta de disponibilidad simple
 */
function esPreguntaDisponibilidadSimple(texto) {
    const patronesSimples = [
        /^tienen$/,
        /^hay$/,
        /^disponible$/,
        /^stock$/,
        /^tienen\??$/,
        /^hay\??$/,
        /^está disponible$/,
    ];
    return patronesSimples.some(patron => patron.test(texto));
}
/**
 * Detecta confirmaciones simples
 */
function esConfirmacionSimple(texto) {
    return /^(sí|si|ok|vale|dale|perfecto|bien|bueno|claro)$/i.test(texto);
}
/**
 * Detecta agradecimientos
 */
function esAgradecimiento(texto) {
    return /^(gracias|muchas gracias|thanks|thx|grax)$/i.test(texto);
}
/**
 * Estadísticas de ahorro
 */
class LocalResponseStats {
    static incrementLocal() {
        this.localResponses++;
    }
    static incrementAI() {
        this.aiResponses++;
    }
    static getStats() {
        const total = this.localResponses + this.aiResponses;
        const localPercentage = total > 0 ? (this.localResponses / total * 100).toFixed(1) : '0';
        return {
            local: this.localResponses,
            ai: this.aiResponses,
            total,
            localPercentage: `${localPercentage}%`,
            estimatedTokensSaved: this.localResponses * 500, // Estimado: 500 tokens por respuesta
        };
    }
    static reset() {
        this.localResponses = 0;
        this.aiResponses = 0;
    }
}
exports.LocalResponseStats = LocalResponseStats;
LocalResponseStats.localResponses = 0;
LocalResponseStats.aiResponses = 0;
