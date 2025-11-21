"use strict";
// 🎯 SISTEMA DE ENTRENAMIENTO CONVERSACIONAL
// Base de datos de patrones de conversación para el bot
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqResponses = exports.buyingSignals = exports.closingTechniques = exports.recoveryMessages = exports.productScenarios = exports.objectionHandling = exports.generalInquiryPatterns = exports.greetingPatterns = void 0;
exports.findBestResponse = findBestResponse;
exports.detectBuyingSignal = detectBuyingSignal;
exports.detectObjection = detectObjection;
// ============================================
// PATRONES DE SALUDO
// ============================================
exports.greetingPatterns = [
    {
        trigger: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'ola'],
        responses: [
            '¡Hola! 👋 Bienvenido a MegaComputer. Soy tu asistente virtual y estoy aquí para ayudarte a encontrar exactamente lo que necesitas. ¿Qué tipo de producto te interesa hoy? 💻📱',
            '¡Buenas! 😊 Es un placer atenderte. Tenemos computadoras, laptops, tablets, celulares y más. ¿En qué puedo ayudarte específicamente?',
            '¡Hola! ☀️ ¿Buscas algo en particular o quieres que te muestre nuestras mejores ofertas del momento?'
        ],
        context: 'greeting',
        nextActions: ['ask_product_type', 'show_categories', 'ask_budget']
    }
];
// ============================================
// PATRONES DE CONSULTA GENERAL
// ============================================
exports.generalInquiryPatterns = [
    {
        trigger: ['que tienen', 'que venden', 'productos', 'catalogo', 'que hay'],
        responses: [
            `Tenemos una amplia variedad:
💻 Computadoras de escritorio (desde $450)
🖥️ Laptops nuevas y usadas (desde $280)
📱 Celulares y tablets
🎮 Accesorios gaming
⌨️ Periféricos y componentes

¿Cuál te interesa más?`
        ],
        context: 'general_inquiry',
        nextActions: ['specify_category']
    },
    {
        trigger: ['precio', 'precios', 'cuanto cuesta', 'cuanto vale', 'costo'],
        responses: [
            `Con gusto te muestro precios. Para darte la mejor opción, dime:
- ¿Qué tipo de equipo buscas?
- ¿Para qué lo vas a usar?
- ¿Tienes un presupuesto en mente?`
        ],
        context: 'price_inquiry',
        nextActions: ['ask_product_type', 'ask_use_case', 'ask_budget']
    },
    {
        trigger: ['como pago', 'formas de pago', 'metodos de pago', 'como puedo pagar', 'pagar', 'payment', 'mercadopago', 'paypal', 'nequi', 'daviplata'],
        responses: [
            `💳 FORMAS DE PAGO DISPONIBLES:

🌐 PAGO ONLINE (Más rápido):
1️⃣ **MercadoPago** - Tarjetas, PSE, Efectivo en puntos
2️⃣ **PayPal** - Tarjetas internacionales
3️⃣ **WhatsApp** - Coordinar pago directo

📱 MÉTODOS LOCALES:
- Nequi: 313 617 4267
- Daviplata: 313 617 4267
- Transferencia bancaria

🔗 **CÓMO PAGAR ONLINE:**
1. Visita nuestra tienda: https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/tienda
2. Selecciona el producto que te interesa
3. Click en "Ver más"
4. Elige tu método de pago (MercadoPago o PayPal)
5. Completa el pago de forma segura

✅ Todos los pagos son seguros
✅ Confirmación inmediata
✅ Envío después de confirmar pago

¿Qué producto te interesa para enviarte el link directo?`
        ],
        context: 'payment_inquiry',
        nextActions: ['send_store_link', 'ask_product_interest']
    },
    {
        trigger: ['link de pago', 'enlace de pago', 'link para pagar', 'donde pago', 'tienda online', 'catalogo online'],
        responses: [
            `🛍️ **NUESTRA TIENDA ONLINE:**

Aquí puedes ver todos nuestros productos y pagar de forma segura:
👉 https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/tienda

💳 **MÉTODOS DE PAGO DISPONIBLES:**
- MercadoPago (tarjetas, PSE, efectivo)
- PayPal (tarjetas internacionales)
- WhatsApp (coordinar pago directo)

📱 **TAMBIÉN ACEPTAMOS:**
- Nequi: 313 617 4267
- Daviplata: 313 617 4267

¿Hay algún producto específico que te interese? Te puedo enviar el link directo.`
        ],
        context: 'store_link_request',
        nextActions: ['send_product_link', 'ask_product_interest']
    },
    {
        trigger: ['laptop', 'laptops', 'portatil', 'notebook'],
        responses: [
            `¡Sí! Tenemos excelentes laptops:
✅ Nuevas desde $450
✅ Usadas en perfecto estado desde $280
✅ Gaming desde $800
✅ Ultrabooks desde $600

¿Para qué uso la necesitas? (trabajo, estudio, gaming, diseño)`
        ],
        context: 'laptop_inquiry',
        nextActions: ['ask_use_case']
    },
    {
        trigger: ['megapack', 'mega pack', 'cursos', 'curso', 'capacitacion', 'aprender'],
        responses: [
            `¡Sí! Tenemos MEGAPACKS de cursos digitales 📚

💰 PRECIOS:
- Megapack individual: $20.000 COP
- Pack COMPLETO (40 megapacks): $60.000 COP

🎯 CATEGORÍAS DISPONIBLES:
✅ Diseño Gráfico
✅ Microsoft Office y Excel
✅ Hacking Ético
✅ Marketing Digital
✅ Inglés
✅ Crecimiento Personal
✅ Y muchos más...

💡 OFERTA ESPECIAL:
Si compras el pack completo (40 megapacks), te ahorras $740.000 COP

¿Te interesa un megapack específico o el pack completo?`
        ],
        context: 'megapack_inquiry',
        nextActions: ['show_megapack_categories', 'offer_complete_pack']
    }
];
// ============================================
// MANEJO DE OBJECIONES
// ============================================
exports.objectionHandling = {
    price_too_high: {
        triggers: ['muy caro', 'caro', 'costoso', 'mucho dinero', 'no tengo'],
        responses: [
            `Entiendo tu preocupación por el precio. Déjame mostrarte el valor:

💰 OPCIÓN 1: Tengo modelos similares más económicos
💳 OPCIÓN 2: Planes de pago sin intereses
🔄 OPCIÓN 3: Equipos usados con 40% descuento

¿Cuál es tu presupuesto máximo?`
        ],
        followUp: ['show_cheaper_options', 'offer_payment_plan', 'show_used_options']
    },
    trust_issues: {
        triggers: ['confiable', 'seguro', 'estafa', 'real', 'verdad'],
        responses: [
            `¡Totalmente! Te doy garantías reales:

✅ Empresa establecida con años en el mercado
✅ Garantía escrita en cada producto
✅ Soporte técnico post-venta
✅ Cientos de clientes satisfechos
✅ Puedes venir a ver el producto antes de comprar

¿Qué más necesitas saber para sentirte seguro?`
        ],
        followUp: ['provide_location', 'show_reviews', 'explain_warranty']
    },
    product_defect: {
        triggers: ['no funciona', 'falla', 'defecto', 'problema', 'garantia'],
        responses: [
            `Estás 100% protegido:

🛡️ SI HAY DEFECTO:
- Cambio inmediato (primeros 7 días)
- Reparación sin costo (durante garantía)
- Soporte técnico gratuito

🔧 INCLUYE:
- Revisión completa antes de entrega
- Prueba en el momento de compra
- Asistencia por WhatsApp

¿Eso te da más tranquilidad?`
        ],
        followUp: ['explain_warranty_details', 'offer_extended_warranty']
    },
    comparison: {
        triggers: ['otro lado', 'mas barato', 'competencia', 'amazon', 'mercadolibre'],
        responses: [
            `Entiendo que compares precios, es inteligente. Déjame mostrarte por qué vale la pena:

✅ NUESTRO VALOR:
- Garantía real y respaldada
- Soporte técnico incluido
- Configuración y setup gratis
- Asesoría personalizada
- Entrega inmediata

💡 PREGUNTA: ¿Ese otro lugar incluye todo esto?

Además, si me muestras la oferta, puedo ver si igualo o mejoro el precio.`
        ],
        followUp: ['highlight_unique_value', 'offer_price_match']
    },
    thinking_about_it: {
        triggers: ['pensarlo', 'despues', 'luego', 'mas tarde', 'vuelvo'],
        responses: [
            `¡Perfecto! Es una decisión importante. Para ayudarte a decidir:

🎁 TE OFREZCO:
- Apartado con solo $50 (sin compromiso)
- Precio garantizado por 48 horas
- Te envío más fotos/videos del producto

❓ PREGUNTA: ¿Qué es lo que más te hace dudar?
- ¿El precio?
- ¿Las especificaciones?
- ¿La garantía?

Así puedo darte más información específica.`
        ],
        followUp: ['offer_reservation', 'identify_concern', 'create_urgency']
    }
};
// ============================================
// ESCENARIOS POR PRODUCTO
// ============================================
exports.productScenarios = [
    {
        productId: 'laptop-hp-15',
        scenarios: [
            {
                question: 'para estudiar',
                answer: `¡Perfecto! Para universidad te recomiendo la LAPTOP HP 15-DY2000:

📚 IDEAL PARA ESTUDIANTES:
- Intel Core i3 11va Gen (rápida y eficiente)
- 8GB RAM (múltiples pestañas y programas)
- 256GB SSD (enciende en 10 segundos)
- Batería 6+ horas (todo el día sin cargar)
- Windows 11 original

💰 PRECIO: $450
🎁 INCLUYE: Office, antivirus, mochila

✅ Perfecta para: Word, Excel, PowerPoint, Zoom, navegación, videos

¿Qué carrera estudias? Así confirmo que es la ideal.`,
                followUp: ['ask_major', 'ask_programs_needed', 'offer_student_discount']
            },
            {
                question: 'tiene garantia',
                answer: `¡Sí! Esta laptop incluye:

🛡️ GARANTÍA COMPLETA:
- 1 año de garantía de fábrica
- Cambio inmediato si hay defecto (primeros 7 días)
- Soporte técnico gratuito
- Revisión completa antes de entrega

📋 CUBRE:
- Pantalla, teclado, touchpad
- Batería y cargador
- Puertos y conectores
- Sistema operativo

❌ NO CUBRE:
- Golpes o caídas
- Daños por líquidos
- Mal uso

¿Te la aparto? Tengo solo 2 unidades.`,
                followUp: ['create_urgency', 'offer_reservation']
            },
            {
                question: 'muy cara',
                answer: `Entiendo. Déjame mostrarte por qué vale cada dólar:

💎 VALOR REAL:
- Laptop nueva similar: $600-700 en otros lados
- Nuestro precio: $450 (ahorro de $150-250)
- Incluye Office ($150 de valor)
- Incluye setup y configuración ($30 de valor)

💰 OPCIONES PARA TI:
1️⃣ Pago en 2 partes: $225 hoy + $225 en 15 días
2️⃣ Laptop usada similar: $280 (ahorro $170)
3️⃣ Modelo más básico: $380

¿Cuál se ajusta mejor a tu presupuesto?`,
                followUp: ['offer_payment_plan', 'show_used_alternative', 'show_cheaper_model']
            }
        ]
    },
    {
        productId: 'pc-gaming-ultramegapack',
        scenarios: [
            {
                question: 'para jugar',
                answer: `¡Llegaste al lugar correcto! 🎮

Para gaming tengo la BESTIA:
🔥 PC GAMING ULTRAMEGAPACK - $1,200

⚡ ESPECIFICACIONES:
- Intel Core i7 10ma Gen
- 16GB RAM DDR4 3200MHz
- SSD 512GB NVMe + HDD 1TB
- GPU NVIDIA GTX 1660 Super 6GB
- Fuente 650W certificada
- Gabinete RGB con ventiladores

🎮 JUEGOS QUE CORRE:
- Fortnite: 144+ FPS (Ultra)
- Warzone: 100+ FPS (Alto)
- GTA V: 120+ FPS (Ultra)
- Valorant: 200+ FPS
- Cyberpunk: 60+ FPS (Medio-Alto)
- FIFA, Minecraft, LOL: Sin problemas

¿Qué juegos quieres jugar?`,
                followUp: ['ask_specific_games', 'ask_streaming_interest', 'offer_monitor_bundle']
            },
            {
                question: 'se puede mejorar',
                answer: `¡SÍ! Es 100% upgradeable 🔧

PUEDES MEJORAR:
✅ RAM: Hasta 64GB (tiene 2 slots libres)
✅ Almacenamiento: Agregar más SSD/HDD
✅ GPU: Hasta RTX 4070 (fuente lo soporta)
✅ CPU: Hasta i9 10ma Gen
✅ Refrigeración: Líquida si quieres

💡 VENTAJA: No necesitas cambiar placa madre ni fuente

Compras ahora y mejoras cuando quieras. ¿Te la aparto?`,
                followUp: ['explain_upgrade_path', 'offer_reservation']
            },
            {
                question: 'o me compro ps5',
                answer: `Buena pregunta. Déjame mostrarte la diferencia:

🎮 PS5: $500
- Solo juegos de consola
- Gráficos fijos
- No upgradeable
- Solo para gaming

💻 PC GAMING: $1,200
- Juegos de PC (más baratos en Steam)
- Gráficos ajustables
- Upgradeable
- Gaming + trabajo + estudio + streaming

💰 COSTO A LARGO PLAZO:
- Juegos PS5: $60-70 cada uno
- Juegos PC: $5-30 en ofertas Steam
- En 10 juegos ya recuperaste la diferencia

🎯 ADEMÁS PUEDES:
- Trabajar, estudiar
- Editar videos
- Programar
- Hacer streaming
- Minería (si quieres)

¿Ves el valor? Es inversión, no gasto.`,
                followUp: ['highlight_versatility', 'show_game_prices', 'offer_bundle']
            }
        ]
    },
    {
        productId: 'laptop-dell-usada',
        scenarios: [
            {
                question: 'algo barato',
                answer: `¡Tengo justo lo que necesitas! 💰

LAPTOP DELL LATITUDE - $280
✅ Intel Core i5 7ma Gen
✅ 8GB RAM
✅ 256GB SSD
✅ Pantalla 14" HD
✅ Windows 10 Pro original

💎 CONDICIÓN:
- Usada pero en EXCELENTE estado
- Revisada completamente
- Batería nueva (4+ horas)
- Garantía 3 meses

✅ PERFECTA PARA:
- Trabajo de oficina
- Estudios
- Navegación
- Videos y películas
- Zoom y videollamadas

🎁 INCLUYE:
- Cargador original
- Mochila
- Mouse inalámbrico
- Office instalado

¿Para qué la necesitas?`,
                followUp: ['ask_use_case', 'highlight_value']
            },
            {
                question: 'es usada no se',
                answer: `Entiendo tu duda. Déjame explicarte:

🔍 NUESTRA REVISIÓN INCLUYE:
✅ Limpieza profunda interna
✅ Cambio de pasta térmica
✅ Batería nueva o en buen estado
✅ Prueba de 48 horas continuas
✅ Formateo e instalación limpia
✅ Actualización de drivers

💎 CONDICIÓN REAL:
- Estéticamente: 8.5/10
- Funcionalmente: 10/10
- Puede tener rayones leves
- Cero problemas de rendimiento

🛡️ GARANTÍA:
- 3 meses completos
- Cambio si hay falla
- Soporte técnico

💰 COMPARACIÓN:
- Nueva similar: $450
- Esta usada: $280
- Ahorro: $170

📸 ¿Quieres que te envíe fotos reales del equipo?`,
                followUp: ['send_photos', 'explain_refurbishment_process', 'offer_warranty_details']
            }
        ]
    },
    {
        productId: 'megapack-completo',
        scenarios: [
            {
                question: 'cuanto cuesta',
                answer: `📚 PRECIOS DE MEGAPACKS:

💰 OPCIÓN 1: Megapack Individual
- Precio: $20.000 COP cada uno
- Elige el que necesites

💰 OPCIÓN 2: Pack COMPLETO (¡RECOMENDADO!)
- Precio: $60.000 COP
- Incluye los 40 megapacks
- Ahorro: $740.000 COP

🎁 CATEGORÍAS INCLUIDAS:
✅ Diseño Gráfico
✅ Microsoft Office
✅ Excel Avanzado
✅ Hacking Ético
✅ Marketing Digital
✅ Inglés
✅ Crecimiento Personal
✅ Arquitectura
✅ Memoria Poderosa
✅ MultiProfesiones
✅ Y 30 más...

¿Prefieres uno individual o el pack completo?`,
                followUp: ['offer_complete_pack', 'show_payment_methods']
            },
            {
                question: 'que incluye',
                answer: `📦 EL PACK COMPLETO INCLUYE 40 MEGAPACKS:

🎨 DISEÑO Y CREATIVIDAD:
- Diseño Gráfico
- Arquitectura
- Resina

💼 NEGOCIOS Y OFICINA:
- Microsoft Office
- Excel Avanzado
- Marketing Digital

🔐 TECNOLOGÍA:
- Hacking Ético
- Cursos Premium +900GB

🌍 IDIOMAS:
- Inglés Completo

🧠 DESARROLLO PERSONAL:
- Memoria Poderosa
- Crecimiento Personal

⚡ Y 30 MEGAPACKS MÁS

💰 TODO POR SOLO $60.000 COP
(Valor individual: $800.000 COP)

¿Te lo aparto?`,
                followUp: ['create_urgency', 'offer_payment_plan']
            },
            {
                question: 'muy caro',
                answer: `Entiendo. Déjame mostrarte el valor REAL:

💎 ANÁLISIS DE PRECIO:
- 40 megapacks × $20.000 = $800.000 COP
- Precio pack completo = $60.000 COP
- TU AHORRO = $740.000 COP (92% descuento!)

📊 COMPARACIÓN:
- Un solo curso en Udemy: $50.000-$200.000 COP
- Aquí: 40 megapacks por $60.000 COP
- Precio por megapack: Solo $1.500 COP

🎯 OPCIONES PARA TI:
1️⃣ Pack completo: $60.000 COP (mejor valor)
2️⃣ Megapack individual: $20.000 COP
3️⃣ Pago en 2 partes: $30.000 hoy + $30.000 después

¿Cuál prefieres?`,
                followUp: ['highlight_value', 'offer_payment_plan']
            },
            {
                question: 'como pago',
                answer: `💳 FORMAS DE PAGO DISPONIBLES:

📱 MEGAPACK INDIVIDUAL ($20.000):
- Nequi/Daviplata: 313 617 4267
- Tarjeta: https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf

💰 PACK COMPLETO ($60.000):
- PayPal: https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG
- Mercado Pago: https://mpago.li/32cJgK3

✅ PROCESO:
1. Haces el pago
2. Me envías el comprobante
3. Te envío los megapacks inmediatamente

¿Con cuál método prefieres pagar?`,
                followUp: ['confirm_payment_method', 'send_payment_link']
            }
        ]
    }
];
// ============================================
// RECUPERACIÓN DE CONVERSACIÓN
// ============================================
exports.recoveryMessages = {
    after_5_minutes: (product) => `¿Sigues por ahí? 😊 Quedamos en que te interesaba ${product}. ¿Tienes alguna duda adicional?`,
    after_30_minutes: (product) => `Hola de nuevo 👋 Vi que te interesaba ${product}. Aún está disponible y puedo apartarlo para ti. ¿Te lo reservo?`,
    after_2_hours: (product) => `¡Última oportunidad! 🎯 El ${product} que te gustó tiene mucha demanda. ¿Lo apartamos antes de que se agote?`,
    next_day: (product) => `Buenos días 🌅 Ayer hablamos sobre ${product}. Tengo una buena noticia: sigue disponible y hoy tenemos envío gratis. ¿Te interesa?`
};
// ============================================
// TÉCNICAS DE CIERRE
// ============================================
exports.closingTechniques = {
    direct: '¿Te la aparto entonces? Solo necesito tu nombre y $50 de anticipo.',
    alternative: '¿Prefieres pagarla completa hoy o en 2 pagos?',
    scarcity: 'Solo tengo 2 unidades y hay otra persona interesada. ¿La apartamos ya?',
    urgency: 'Esta oferta es solo por hoy. ¿Cerramos?',
    benefit: 'Si la apartas ahora, te incluyo el mouse gaming gratis. ¿Dale?',
    assumed: 'Perfecto, te la preparo. ¿Pasas a recogerla o te la envío?'
};
// ============================================
// SEÑALES DE COMPRA
// ============================================
exports.buyingSignals = [
    'cuando puedo recoger',
    'aceptan tarjeta',
    'tienen en stock',
    'incluye factura',
    'donde estan',
    'horario',
    'como pago',
    'envio',
    'delivery'
];
// ============================================
// RESPUESTAS A PREGUNTAS FRECUENTES
// ============================================
exports.faqResponses = {
    warranty: `🛡️ GARANTÍA:
- Equipos nuevos: 1 año completo
- Equipos usados: 3 meses
- Cubre defectos de fábrica
- Cambio inmediato primeros 7 días
- Soporte técnico incluido`,
    payment_methods: `💳 FORMAS DE PAGO DISPONIBLES:

🌐 PAGO ONLINE (Recomendado):
1️⃣ MercadoPago - Tarjetas, PSE, Efectivo
2️⃣ PayPal - Tarjetas internacionales
3️⃣ WhatsApp - Coordinar pago directo

📱 MÉTODOS LOCALES:
- Nequi: 313 617 4267
- Daviplata: 313 617 4267
- Transferencia bancaria

🔗 CÓMO PAGAR:
1. Ve al producto en nuestra tienda online
2. Click en "Ver más"
3. Elige tu método de pago preferido
4. Completa el pago de forma segura

🛍️ TIENDA ONLINE:
https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host/tienda

✅ Todos los pagos son seguros y verificados
✅ Recibes confirmación inmediata
✅ Envío después de confirmar pago`,
    delivery: `🚚 ENTREGA:
- Retiro en tienda: Gratis
- Envío local: $5-10
- Envío nacional: $15-25
- Entrega mismo día disponible
- Empaque seguro incluido`,
    location: `📍 UBICACIÓN:
- Dirección: [TU DIRECCIÓN]
- Horario: Lun-Sab 9am-7pm
- WhatsApp: [TU NÚMERO]
- Google Maps: [LINK]`,
    return_policy: `🔄 POLÍTICA DE DEVOLUCIÓN:
- 7 días para cambio
- Producto debe estar sin uso
- Con empaque original
- Reembolso completo si hay defecto
- Sin preguntas si es defecto de fábrica`
};
// ============================================
// FUNCIÓN HELPER PARA MATCHING
// ============================================
function findBestResponse(userMessage, patterns) {
    const normalizedMessage = userMessage.toLowerCase().trim();
    for (const pattern of patterns) {
        for (const trigger of pattern.trigger) {
            if (normalizedMessage.includes(trigger.toLowerCase())) {
                // Retorna una respuesta aleatoria del array
                const responses = pattern.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }
    return null;
}
function detectBuyingSignal(message) {
    const normalized = message.toLowerCase();
    return exports.buyingSignals.some(signal => normalized.includes(signal));
}
function detectObjection(message) {
    const normalized = message.toLowerCase();
    for (const [key, objection] of Object.entries(exports.objectionHandling)) {
        if (objection.triggers.some(trigger => normalized.includes(trigger))) {
            return key;
        }
    }
    return null;
}
