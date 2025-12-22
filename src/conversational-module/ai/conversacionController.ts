/**
 * Controlador principal de conversación
 * Orquesta la detección de intención, búsqueda de productos y flujos
 */

import { db } from '@/lib/db';
// import { PrismaClient } from '@prisma/client'; // ❌ Eliminado para evitar saturación
// const prisma = new PrismaClient();

import { detectarIntencion, extraerEntidades } from '../utils/detectarIntencion';
import { 
  obtenerContexto, 
  actualizarContexto, 
  agregarMensajeAlHistorial 
} from '../utils/obtenerContexto';
import { tryLocalResponse, LocalResponseStats } from '../utils/localResponseHandler';
import { procesarFlujoFisico } from '../flows/flujoFisico';
import { procesarFlujoDigital } from '../flows/flujoDigital';
import { procesarFlujoDropshipping } from '../flows/flujoDropshipping';
import { procesarFlujoServicio } from '../flows/flujoServicio';
import { procesarFlujoGeneral } from '../flows/flujoGeneral';
import { construirPromptPago, construirPromptMultiplesProductos, type ProductoInfo } from '../ai/promptBuilder-simple';
import { sendWithFallback, type GroqMessage } from './groqClient';
import { OllamaOrchestratorProfessional } from '@/lib/ollama-orchestrator-professional';
import { generarLinksPago, formatearLinksPago, generarLinkMercadoPago } from '../services/paymentService';
import { obtenerFotosProducto, detectarSolicitudFotos, tienefotos } from '../services/photoService';
import { procesarAudio } from '../services/audioService';
import { 
  analizarConRazonamientoProfundo, 
  necesitaRazonamientoProfundo,
  generarRespuestaAmigable,
  type ReasoningResult 
} from '../services/deepReasoningService';
import { enrichProductsWithKnowledge } from '../services/productKnowledgeService';
import { RealDataEnforcer } from '@/lib/real-data-enforcer';
import { ProfessionalResponseFormatter } from '@/lib/professional-response-formatter';

/**
 * Procesa un mensaje del usuario y genera respuesta
 */
export async function procesarMensaje(
  customerPhone: string,
  mensaje: string,
  opciones?: {
    esAudio?: boolean;
    audioBuffer?: Buffer;
    tieneImagen?: boolean;
    botUserId?: string; // ID del bot/dueño para contexto híbrido
  }
): Promise<{
  texto: string;
  fotos?: Array<{ url: string; caption?: string }>;
  linksPago?: any;
}> {
  try {
    // Determinar el botUserId (dueño del bot)
    const botUserId = opciones?.botUserId || process.env.DEFAULT_USER_ID || 'default-user-id';

    console.log(`[Conversación] Cliente: ${customerPhone}, Bot: ${botUserId}, Mensaje: ${mensaje}`);

    // 🎤 PROCESAR AUDIO SI ES NECESARIO
    let mensajeTexto = mensaje;
    if (opciones?.esAudio && opciones?.audioBuffer) {
      console.log('[Conversación] Procesando audio...');
      try {
        mensajeTexto = await procesarAudio(opciones.audioBuffer);
        console.log('[Conversación] Audio transcrito:', mensajeTexto);
      } catch (error) {
        console.error('[Conversación] Error transcribiendo audio:', error);
        mensajeTexto = '[Audio recibido]';
      }
    }

    // Guardar mensaje del usuario usando el sistema híbrido
    await agregarMensajeAlHistorial(customerPhone, 'user', mensajeTexto, botUserId);

    // Obtener contexto usando el sistema híbrido
    const contexto = await obtenerContexto(customerPhone, botUserId);

    // Detectar intención
    let { intencion, entidades } = await detectarIntencion(mensajeTexto, { contexto });
    console.log(`[Conversación] Intención detectada: ${intencion}`);

    // 📸 DETECTAR SOLICITUD DE FOTOS
    const solicitaFotos = detectarSolicitudFotos(mensajeTexto);

    // 🔄 CORRECCIÓN DE INTENCIÓN: Si pide fotos y hay contexto, es búsqueda de producto
    if (solicitaFotos && intencion === 'general' && contexto.ultimoProductoId) {
      console.log('[Conversación] 📸 Solicitud de fotos detectada con contexto -> Forzando busqueda_producto');
      intencion = 'busqueda_producto';
    }

    // 🎯 BYPASS SUPER SALES AI: Si hay referencia al producto en contexto, usar flujo directo
    if (intencion === 'busqueda_producto' && contexto.ultimoProductoId) {
      const messageLower = mensajeTexto.toLowerCase();
      const esReferencia = [
        /\b(qué|que|cuál|cual|cómo|como)\s+(incluye|trae|tiene|viene|contiene|ofrece)/i,
        /\b(tienes?|hay|envías?|envias?|muestras?)\s+(fotos?|imágenes?|imagenes?)/i,
        /\b(más|mas)\s+(información|info|detalles|datos)/i,
        /\b(incluye|trae|tiene|viene con|características|especificaciones|detalles)/i,
        /\b(fotos?|imágenes?|imagenes?|ver|mostrar)/i,
      ].some(regex => regex.test(mensajeTexto));
      
      if (esReferencia) {
        console.log('[Conversación] 🎯 Referencia al producto en contexto detectada -> Usando flujo directo');
        
        try {
          // Obtener producto del contexto
          const producto = await db.product.findUnique({
            where: { id: contexto.ultimoProductoId }
          });
          
          if (producto) {
            console.log('[Conversación] ✅ Producto del contexto:', producto.name);
            
            // Usar flujo directo según categoría
            const flujo = producto.category === 'DIGITAL' 
              ? procesarFlujoDigital 
              : procesarFlujoFisico;
            
            const resultado = await flujo(
              customerPhone,
              mensajeTexto,
              contexto,
              { producto, botUserId }
            );
            
            // Guardar respuesta
            await agregarMensajeAlHistorial(customerPhone, 'assistant', resultado.texto, botUserId);
            
            return resultado;
          }
        } catch (error) {
          console.error('[Conversación] ❌ Error en bypass de contexto:', error);
          // Continuar con Super Sales AI si falla
        }
      }
    }

    // 🎯 NUEVO SISTEMA SIMPLE - Reemplaza agentes complejos
    try {
      console.log('[Conversación] 💎 Activando Sistema Simple Ultra-Confiable...');
      
      const { SimpleConversationHandler } = await import('@/lib/simple-conversation-handler');
      const handler = SimpleConversationHandler.getInstance();
      
      const response = await handler.handleMessage({
        chatId: customerPhone,
        userId: botUserId,
        message: mensajeTexto,
        userName: undefined
      });
      
      console.log('[Conversación] ✅ Sistema Simple respondió');
      
      // Guardar respuesta del bot
      await agregarMensajeAlHistorial(customerPhone, 'assistant', response.text, botUserId);
      
      // Procesar acciones (CARD vs Normal)
      const fotos: Array<{ url: string; caption?: string }> = [];
      
      if (response.actions && response.actions.length > 0) {
        for (const action of response.actions) {
          
          // ═══════════════════════════════════════════════════════
          // TIPO 1: send_photo_card → FORMATO CARD PROFESIONAL
          // ═══════════════════════════════════════════════════════
          if (action.type === 'send_photo_card' && action.data?.product) {
            const product = action.data.product;
            
            console.log(`[Conversación] 📸 MODO CARD para: ${product.name}`);
            
            // VERIFICAR DATOS REALES antes de enviar
            const { RealDataEnforcer } = await import('@/lib/real-data-enforcer');
            const realData = await RealDataEnforcer.getProductData(product.id);
            
            if (realData) {
              // Actualizar con datos REALES
              product.price = realData.price;
              product.name = realData.name;
              product.description = realData.description;
              product.images = realData.images;
              console.log('[Conversación] ✅ Datos REALES verificados para CARD');
              console.log('[Conversación]    Precio REAL: ' + RealDataEnforcer.formatPrice(realData.price));
            }
            
            const { CardPhotoSender } = await import('@/lib/card-photo-sender');
            
            // Caption CARD profesional
            const caption = CardPhotoSender.generateCardCaption({
              name: product.name,
              price: product.price,
              description: product.description,
              category: product.category,
              deliveryLink: product.deliveryLink
            });
            
            console.log(`[Conversación] ✅ Caption CARD generado`);
            
            // Parsear imágenes
            let images: string[] = [];
            try {
              if (typeof product.images === 'string') {
                images = JSON.parse(product.images);
              } else if (Array.isArray(product.images)) {
                images = product.images;
              }
            } catch (e) {
              console.error('[Conversación] Error parseando imágenes:', e);
            }
            
            // Filtrar imágenes válidas (http/https O rutas relativas que empiecen con /)
            images = images.filter(img => {
              if (!img || img.trim() === '') return false;
              const trimmed = img.trim();
              return trimmed.startsWith('http') || trimmed.startsWith('/');
            });
            
            if (images.length > 0) {
              const maxPhotos = Math.min(images.length, 3);
              for (let i = 0; i < maxPhotos; i++) {
                fotos.push({
                  url: images[i],
                  caption: i === 0 ? caption : undefined
                });
              }
              console.log(`[Conversación] ✅ ${maxPhotos} fotos CARD agregadas`);
            } else {
              console.log(`[Conversación] ⚠️ Producto sin imágenes válidas`);
            }
          }
          
          // ═══════════════════════════════════════════════════════
          // TIPO 2: send_photo → FOTO SIMPLE (sin CARD)
          // ═══════════════════════════════════════════════════════
          else if (action.type === 'send_photo' && action.data?.product) {
            const product = action.data.product;
            
            console.log(`[Conversación] 📸 MODO SIMPLE para: ${product.name}`);
            
            // VERIFICAR DATOS REALES antes de enviar
            const { RealDataEnforcer } = await import('@/lib/real-data-enforcer');
            const realData = await RealDataEnforcer.getProductData(product.id);
            
            if (realData) {
              product.price = realData.price;
              product.name = realData.name;
              product.images = realData.images;
              console.log('[Conversación] ✅ Datos REALES verificados para foto simple');
            }
            
            // Solo primera foto, sin caption elaborado
            let images: string[] = [];
            try {
              if (typeof product.images === 'string') {
                images = JSON.parse(product.images);
              } else if (Array.isArray(product.images)) {
                images = product.images;
              }
            } catch (e) {
              console.error('[Conversación] Error parseando imágenes:', e);
            }
            
            // Filtrar imágenes válidas (http/https O rutas relativas que empiecen con /)
            images = images.filter(img => {
              if (!img || img.trim() === '') return false;
              const trimmed = img.trim();
              return trimmed.startsWith('http') || trimmed.startsWith('/');
            });
            
            if (images.length > 0) {
              fotos.push({
                url: images[0],
                caption: `📸 ${product.name}` // Caption simple
              });
              console.log(`[Conversación] ✅ 1 foto simple agregada`);
            } else {
              console.log(`[Conversación] ⚠️ Producto sin imágenes`);
            }
          }
        }
      }
      
      // Retornar respuesta con fotos si hay
      if (fotos.length > 0) {
        console.log(`[Conversación] 📸 Enviando ${fotos.length} fotos en formato CARD`);
        return {
          texto: response.text,
          fotos
        };
      }
      
      return {
        texto: response.text
      };
    } catch (error) {
      console.error('[Conversación] ❌ Error en Sistema Simple:', error);
      // Fallback
      return {
        texto: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías intentar de nuevo?'
      };
    }

    /*
    // 🧠 SISTEMA DE AGENTES ANTERIOR (DESACTIVADO - Muy complejo)
    try {
      console.log('[Conversación] 🤖 Activando sistema de agentes especializados...');
      
      const { Orchestrator } = await import('@/agents/orchestrator');
      const orchestrator = new Orchestrator();
      
      const agentResponse = await orchestrator.processMessage({
        chatId: customerPhone,
        userId: botUserId,
        message: mensajeTexto,
        userName: undefined // Podrías pasar el nombre del usuario si lo tienes
      });
      
      console.log('[Conversación] ✅ Sistema de agentes respondió');
      console.log('[Conversación] 🎯 Confianza:', (agentResponse.confidence * 100).toFixed(0) + '%');
      console.log('[Conversación] ⚡ Acciones:', agentResponse.actions?.length || 0);
      
      // Guardar respuesta del bot
      await agregarMensajeAlHistorial(customerPhone, 'assistant', agentResponse.text, botUserId);
      
      // Procesar acciones (enviar fotos, etc.)
      const fotos: Array<{ url: string; caption?: string }> = [];
      
      if (agentResponse.actions && agentResponse.actions.length > 0) {
        for (const action of agentResponse.actions) {
          if (action.type === 'send_photo' && action.data?.product) {
            const product = action.data.product;
            const fotosProducto = obtenerFotosProducto(product);
            if (fotosProducto.length > 0) {
              console.log(`[Conversación] 📸 Agregando ${fotosProducto.length} fotos del producto`);
              fotos.push(...fotosProducto);
            }
          }
        }
      }
      
      // Retornar respuesta con fotos si hay
      if (fotos.length > 0) {
        console.log(`[Conversación] 📸 Enviando ${fotos.length} fotos`);
        return {
          texto: agentResponse.text,
          fotos
        };
      }
      
      return {
        texto: agentResponse.text
      };
    } catch (aiError) {
      console.error('[Conversación] ❌ Error en sistema de agentes:', aiError);
      console.error('[Conversación] Stack:', aiError instanceof Error ? aiError.stack : 'No stack');
      
      // Fallback a respuesta genérica
      return {
        texto: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo? 🙏'
      };
    }

    /* SUPER SALES AI COMENTADO - Ya no se usa
    try {
      console.log('[Conversación] 🚀 Activando Super Sales AI (versión corregida)...');
      
      const { SuperSalesAI } = await import('@/lib/super-sales-ai-fixed');
      const aiResult = await SuperSalesAI.processMessage(
        botUserId,
        customerPhone,
        mensajeTexto,
        contexto
      );
      
      console.log('[Conversación] ✅ Super Sales AI respondió');
      console.log('[Conversación] 📸 Debe enviar fotos:', aiResult.shouldSendPhotos);
      console.log('[Conversación] 📸 Cantidad de fotos:', aiResult.photos?.length || 0);
      
      // Guardar respuesta del bot
      await agregarMensajeAlHistorial(customerPhone, 'assistant', aiResult.response, botUserId);
      
      // Retornar con fotos si es necesario
      if (aiResult.shouldSendPhotos && aiResult.photos && aiResult.photos.length > 0) {
        console.log(`[Conversación] 📸 Enviando ${aiResult.photos.length} fotos automáticamente`);
        aiResult.photos.forEach((foto, i) => {
          console.log(`[Conversación]   Foto ${i + 1}: ${foto.url}`);
        });
        
        return {
          texto: aiResult.response,
          fotos: aiResult.photos
        };
      }
      
      console.log('[Conversación] ℹ️ Sin fotos para enviar');
      
      return {
        texto: aiResult.response
      };
    } catch (aiError) {
      console.error('[Conversación] ❌ Error en Super Sales AI:', aiError);
      console.error('[Conversación] Stack:', aiError instanceof Error ? aiError.stack : 'No stack');
      throw aiError; // Re-lanzar para que lo capture el catch principal
    }
    */

    /* SISTEMA ANTERIOR COMENTADO - Mantener como fallback
    // 🚀 INTENTAR RESPUESTA LOCAL PRIMERO (ahorro de tokens)
    const localResponse = await tryLocalResponse(mensajeTexto, intencion);
    
    if (localResponse.canHandle && localResponse.response) {
      console.log(`[Conversación] ✅ Respuesta local (sin IA) - Tokens ahorrados`);
      LocalResponseStats.incrementLocal();
      
      // Guardar respuesta del bot
      await agregarMensajeAlHistorial(customerPhone, 'assistant', localResponse.response, botUserId);
      
      return {
        texto: localResponse.response,
      };
    }

    // Si no se puede manejar localmente, usar IA
    console.log(`[Conversación] 🤖 Requiere IA para respuesta compleja`);
    LocalResponseStats.incrementAI();
    */

    /* CÓDIGO ANTIGUO COMENTADO - Ya no se usa con Super Sales AI
    let respuesta: string;

    // Manejar según intención
    switch (intencion) {
      case 'saludo':
      case 'despedida':
      case 'general':
        respuesta = await procesarFlujoGeneral(mensaje, intencion, contexto);
        break;

      case 'busqueda_producto':
      case 'consulta_precio':
      case 'consulta_disponibilidad':
        const resultadoProducto = await buscarYResponderProducto(mensajeTexto, contexto, solicitaFotos, botUserId);
        return resultadoProducto;

      case 'solicitud_pago':
        respuesta = await generarInformacionPago(mensajeTexto, contexto, botUserId);
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

      // 🛡️ NUEVAS OBJECIONES - Manejo profesional
      case 'objecion_precio':
      case 'objecion_tiempo':
      case 'objecion_confianza':
        respuesta = await manejarObjecion(mensajeTexto, intencion, contexto, botUserId);
        break;

      case 'solicitud_descuento':
        respuesta = await generarOfertaEspecial(mensajeTexto, contexto, botUserId);
        break;

      default:
        respuesta = await procesarFlujoGeneral(mensajeTexto, 'general', contexto);
    }

    // Guardar respuesta del bot
    await agregarMensajeAlHistorial(customerPhone, 'assistant', respuesta, botUserId);

    console.log(`[Conversación] Respuesta generada: ${respuesta.substring(0, 100)}...`);
    
    return {
      texto: respuesta,
    };
    */

  } catch (error) {
    console.error('[Conversación] Error:', error);
    return {
      texto: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo? 🙏',
    };
  }
}

/**
 * Busca productos y genera respuesta con BÚSQUEDA SEMÁNTICA
 */
async function buscarYResponderProducto(
  mensaje: string,
  contexto: any,
  solicitaFotos: boolean = false,
  botUserId?: string
): Promise<{
  texto: string;
  fotos?: Array<{ url: string; caption?: string }>;
  linksPago?: any;
}> {
  try {
    console.log('[BuscarProductos] 🧠 Iniciando búsqueda semántica inteligente...');
    
    // 🚀 USAR BÚSQUEDA SEMÁNTICA CON OLLAMA
    const { semanticProductSearch } = await import('@/lib/semantic-product-search');
    
    // Preparar contexto de conversación
    const conversationContext = contexto.historialMensajes
      ?.slice(-5)
      .map((m: any) => `${m.rol}: ${m.contenido}`)
      .join('\n');
    
    // Buscar con Ollama (entiende contexto, corrige ortografía, infiere intención)
    const resultadoSemantico = await semanticProductSearch(mensaje, conversationContext);
    
    if (!resultadoSemantico) {
      console.log('[BuscarProductos] ❌ No se encontraron productos');
      return {
        texto: 'No encontré productos que coincidan con tu búsqueda. ¿Podrías darme más detalles sobre lo que buscas? 🤔'
      };
    }
    
    console.log(`[BuscarProductos] ✅ Búsqueda semántica exitosa`);
    console.log(`[BuscarProductos] 💡 Razón: ${resultadoSemantico.reason}`);
    console.log(`[BuscarProductos] 📊 Confianza: ${resultadoSemantico.confidence}%`);
    
    let productos: any[] = [];
    const interpretacion = resultadoSemantico.reason;
    
    // Manejar resultados de búsqueda semántica
    if (resultadoSemantico.isGeneralQuery && resultadoSemantico.products) {
      // Consulta general: múltiples productos
      console.log(`[BuscarProductos] 📋 Consulta general: ${resultadoSemantico.products.length} productos`);
      productos = resultadoSemantico.products;
    } else if (resultadoSemantico.product) {
      // Consulta específica: un producto
      console.log(`[BuscarProductos] 🎯 Producto específico: ${resultadoSemantico.product.name}`);
      productos = [resultadoSemantico.product];
    }
    
    // Normalizar productos a ProductoInfo
    const productosNormalizados = productos.map(p => {
      let imagenes: string[] = [];
      try {
        if (typeof p.images === 'string') {
          imagenes = JSON.parse(p.images);
        } else if (Array.isArray(p.images)) {
          imagenes = p.images;
        }
      } catch (e) { 
        imagenes = []; 
      }

      return {
        id: p.id,
        nombre: p.name,
        descripcion: p.description || undefined,
        precio: p.price,
        categoria: p.category,
        tipoVenta: p.subcategory || undefined,
        imagenes: imagenes,
        stock: p.stock || undefined,
        metodosPago: []
      };
    });

    // Enriquecer con conocimiento adicional
    productos = await enrichProductsWithKnowledge(productosNormalizados);

    if (productos.length > 0) {
      // Encontró productos
      console.log('[Conversación] ✅ Productos encontrados:', productos.length);
      
      // Actualizar contexto con la interpretación si existe
      if (interpretacion) {
        await actualizarContexto(contexto.userId, {
          metadata: {
            ...contexto.metadata,
            ultimaInterpretacion: interpretacion,
            ultimaBusqueda: mensaje,
          },
        }, botUserId);
      }
    }

    // 4. MANEJAR RESULTADOS ENCONTRADOS
    if (productos.length === 1) {
      const producto = productos[0];

      // 🔍 VERIFICAR DATOS REALES DEL PRODUCTO
      console.log('[Conversación] 🔍 Verificando datos reales del producto...');
      const realProductData = await RealDataEnforcer.getProductData(producto.id);
      
      if (realProductData) {
        // Actualizar con datos REALES de la BD
        producto.precio = realProductData.price;
        producto.nombre = realProductData.name;
        producto.descripcion = realProductData.description || producto.descripcion;
        producto.imagenes = realProductData.images;
        
        console.log('[Conversación] ✅ Datos reales verificados:');
        console.log('[Conversación]    Precio REAL: ' + RealDataEnforcer.formatPrice(realProductData.price));
        console.log('[Conversación]    Imágenes: ' + realProductData.images.length);
      } else {
        console.log('[Conversación] ⚠️ No se pudieron verificar datos reales');
      }

      console.log('[Conversación] 🎯 PRODUCTO SELECCIONADO:', producto.nombre);

      // Actualizar contexto
      await actualizarContexto(contexto.userId, {
        ultimoProductoId: typeof producto.id === 'string' ? producto.id : producto.id.toString(),
        ultimoProductoNombre: producto.nombre,
        ultimaCategoria: producto.categoria,
      }, botUserId);

      // 💾 GUARDAR EN CONTEXTO DE CONVERSACIÓN PARA PAGOS (CUÁDRUPLE PERSISTENCIA)
      try {
        const productoIdString = typeof producto.id === 'string' ? producto.id : producto.id.toString();
        const realBotUserId = botUserId || process.env.DEFAULT_USER_ID || 'default-user';

        // 1. SISTEMA HÍBRIDO (RAM + BD)
        const { ConversationContextHybrid } = await import('@/lib/conversation-context-hybrid');
        await ConversationContextHybrid.saveProductContext(
          realBotUserId,
          contexto.userId,
          productoIdString,
          producto.nombre,
          {
            price: producto.precio,
            category: producto.categoria,
            type: producto.categoria === 'DIGITAL' ? 'digital' : 'physical'
          }
        );

        // 2. MEMORIA MEJORADA (Persiste durante conversación)
        const { ContextMemoryEnhanced } = await import('@/lib/context-memory-enhanced');
        await ContextMemoryEnhanced.saveProductContext(
          realBotUserId,
          contexto.userId,
          productoIdString,
          producto.nombre,
          producto.precio,
          producto.categoria
        );

        // 3. CONTEXTO LOCAL (Backup inmediato)
        await actualizarContexto(contexto.userId, {
          ultimoProductoId: productoIdString,
          ultimoProductoNombre: producto.nombre,
          ultimaCategoria: producto.categoria,
          metadata: {
            ...contexto.metadata,
            lastProductPrice: producto.precio,
            lastProductType: producto.categoria === 'DIGITAL' ? 'digital' : 'physical',
            lastProductSavedAt: new Date().toISOString()
          }
        }, realBotUserId);

        // 4. MENSAJE EN HISTORIAL (Para recuperación)
        await agregarMensajeAlHistorial(
          contexto.userId,
          'assistant',
          `[CONTEXT:PRODUCT:${productoIdString}:${producto.nombre}]`,
          realBotUserId
        );

        console.log(`[Conversación] ✅✅✅✅ CUÁDRUPLE PERSISTENCIA completada: ${producto.nombre}`);
        console.log(`[Conversación] 📦 ID: ${productoIdString}`);
        console.log(`[Conversación] 💰 Precio: ${producto.precio}`);
      } catch (error) {
        console.error('[Conversación] ❌ Error guardando contexto:', error);
      }

      // 🚀 INTENTAR RESPUESTA LOCAL CON PRODUCTO (Eliminado para evitar duplicidad)
      // La respuesta local ya se intenta en el controlador principal.
      // Aquí nos enfocamos en generar la respuesta completa del producto.

      // Si no se puede manejar localmente, usar IA
      console.log(`[Conversación] 🤖 Producto requiere IA`);
      LocalResponseStats.incrementAI();

      // Dirigir al flujo según tipo y enviar fotos si disponibles
      const respuestaTexto = await dirigirAFlujo(mensaje, producto, contexto);

      // 🎯 UPSELLING DESACTIVADO POR AHORA - Solo mostrar cuando usuario pida pago
      // El upselling automático puede ser muy agresivo
      // Se activará en el flujo de pago en su lugar
      let respuestaFinal = respuestaTexto;
      
      /* UPSELLING AUTOMÁTICO DESACTIVADO
      try {
        const { UpsellingEngine } = await import('../services/upselling-engine');
        
        if (UpsellingEngine.isEligibleForUpsell(producto)) {
          console.log('[Conversación] 💎 Generando recomendación de upsell...');
          const upsell = await UpsellingEngine.generateUpsell(producto, contexto);
          
          if (upsell) {
            console.log(`[Conversación] ✅ Upsell generado: ${upsell.type}`);
            respuestaFinal = `${respuestaTexto}\n\n━━━━━━━━━━━━━━━━━━━━\n\n${upsell.message}`;
          }
        }
      } catch (error) {
        console.error('[Conversación] Error generando upsell:', error);
      }
      */

      // 📸 INCLUIR FOTOS EN LA RESPUESTA si el producto tiene imágenes
      // (El envío se maneja en el nivel superior para evitar duplicación)
      const fotosProducto = obtenerFotosProducto(producto);
      if (fotosProducto.length > 0) {
        console.log(`[Conversación] 📸 Producto tiene ${fotosProducto.length} fotos disponibles`);
        return {
          texto: respuestaFinal,
          fotos: fotosProducto
        };
      }

      return { texto: respuestaFinal };
    }

    // ⚠️ ADVERTENCIA: Este código NO debería ejecutarse con búsqueda semántica
    // La búsqueda semántica SIEMPRE devuelve 1 producto
    console.log('⚠️ [BuscarProducto] ADVERTENCIA: Múltiples productos detectados');
    console.log(`⚠️ [BuscarProducto] Esto NO debería ocurrir con búsqueda semántica`);
    console.log(`⚠️ [BuscarProducto] Productos: ${productos.length}`);
    console.log(`⚠️ [BuscarProducto] Verificar configuración de Ollama`);
    
    // Múltiples productos encontrados - APLICAR FILTRO DE ACCESORIOS
    let productosFiltrados = productos;
    
    // Detectar si busca laptops para excluir accesorios
    const buscaLaptop = mensaje.toLowerCase().match(/(portátil|portatil|laptop|computador|ordenador|notebook)/);
    if (buscaLaptop) {
      console.log('[BuscarProducto] 💻 Filtrando accesorios para búsqueda de laptops');
      const palabrasExclusion = [
        'proyector', 'parlante', 'altavoz', 'mouse', 'teclado', 'base para',
        'soporte', 'cable', 'cargador', 'adaptador', 'webcam', 'camara',
        'audifonos', 'audífonos', 'mochila', 'maleta', 'bolso', 'funda'
      ];
      
      productosFiltrados = productos.filter(p => {
        const nombreLower = p.nombre.toLowerCase();
        const esAccesorio = palabrasExclusion.some(excl => nombreLower.includes(excl));
        if (esAccesorio) {
          console.log(`[BuscarProducto] ❌ Excluido de lista: ${p.nombre}`);
        }
        return !esAccesorio;
      });
      
      console.log(`[BuscarProducto] ✅ Filtrados: ${productosFiltrados.length} laptops de ${productos.length} productos`);
    }
    
    if (productosFiltrados.length === 0) {
      return {
        texto: 'No encontré laptops disponibles en este momento. ¿Te interesa otro tipo de producto? 🤔'
      };
    }
    
    const respuestaMultiples = await generarRespuestaMultiplesProductos(productosFiltrados, contexto);
    
    // 📸 SI PIDIÓ FOTOS y hay múltiples, enviar la del primero como muestra
    if (solicitaFotos) {
      const primerProducto = productosFiltrados[0];
      const fotos = obtenerFotosProducto(primerProducto);
      if (fotos.length > 0) {
        console.log(`[BuscarProducto] 📸 Enviando foto de muestra del primer producto: ${primerProducto.nombre}`);
        return { 
          texto: respuestaMultiples,
          fotos: fotos
        };
      }
    }

    return { texto: respuestaMultiples };

  } catch (error) {
    console.error('[BuscarProducto] Error:', error);

    // Mejorar manejo de errores de DB
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('database')) {
        console.error('[BuscarProducto] ❌ Error de conexión a base de datos');
        return { texto: 'Tengo un problema técnico temporal. ¿Podrías intentar en unos momentos? 🔧' };
      }
      if (error.message.includes('timeout')) {
        console.error('[BuscarProducto] ❌ Timeout en base de datos');
        return { texto: 'La búsqueda está tardando más de lo normal. ¿Podrías reformular tu consulta? ⏱️' };
      }
    }

    return { texto: 'Tuve un problema al buscar productos. ¿Podrías intentar de nuevo? 🙏' };
  }
}

/**
 * Busca productos en la base de datos con búsqueda inteligente mejorada
 * CORRECCIÓN CRÍTICA: Ahora usa CategoryService para detección dinámica SaaS
 */
export async function buscarProductos(query: string, userId?: string): Promise<ProductoInfo[]> {
  try {
    const queryLower = query.toLowerCase().trim();
    const realUserId = userId || process.env.DEFAULT_USER_ID || 'default';

    console.log('[BuscarProductos] 🔍 Query original:', query);
    console.log('[BuscarProductos] 🔍 Query procesado:', queryLower);

    // 1. DETECTAR CATEGORÍA PRINCIPAL DE LA BÚSQUEDA (DINÁMICO)
    const { CategoryService } = await import('../services/categoryService');
    const match = await CategoryService.detectCategory(realUserId, queryLower);
    
    const categoriaDetectada = {
      categoria: match.category,
      subcategoria: match.subcategory
    };
    
    console.log('[BuscarProductos] 📂 Categoría detectada (SaaS):', categoriaDetectada);

    // 2. Extraer palabras clave importantes (filtrando palabras comunes)
    const palabrasClave = extraerPalabrasClaveInteligentes(queryLower);
    console.log('[BuscarProductos] 🔑 Palabras clave:', palabrasClave);

    // 3. CONSTRUIR CONSULTA INTELIGENTE CON ESTRATEGIA DE FALLBACK
    let whereCondition: any = {
      status: 'AVAILABLE'
    };
    
    // Filtrar por usuario (SaaS)
    if (userId) {
      whereCondition.userId = userId;
    }

    // ESTRATEGIA 1: Si hay subcategoría específica, buscar PRIMERO por subcategoría
    if (categoriaDetectada.subcategoria) {
      whereCondition.subcategory = categoriaDetectada.subcategoria;
      console.log('[BuscarProductos] 🎯 ESTRATEGIA 1: Filtrando por subcategoría:', categoriaDetectada.subcategoria);
    }
    // ESTRATEGIA 2: Si no hay subcategoría pero sí categoría, filtrar por categoría
    else if (categoriaDetectada.categoria) {
      whereCondition.category = categoriaDetectada.categoria;
      console.log('[BuscarProductos] 🎯 ESTRATEGIA 2: Filtrando por categoría:', categoriaDetectada.categoria);
    }

    // Agregar búsqueda por palabras clave SOLO si tenemos palabras relevantes
    if (palabrasClave.length > 0) {
      whereCondition.AND = palabrasClave.map(palabra => {
        // Generar sinónimos para esta palabra específica
        const sinonimos = [palabra];
        const pNorm = palabra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (pNorm !== palabra) sinonimos.push(pNorm);

        // Manejar variantes singular/plural
        const pSingular = pNorm.endsWith('s') ? pNorm.slice(0, -1) : null;
        const pPlural = !pNorm.endsWith('s') ? pNorm + 's' : null;
        if (pSingular) sinonimos.push(pSingular);
        if (pPlural) sinonimos.push(pPlural);

        // 🔧 DETECCIÓN MEJORADA DE LAPTOPS (incluye typos comunes)
        const esLaptop = [
          'portatil', 'portatiles', 'portátil', 'portátiles',
          'laptop', 'laptops', 'computador', 'computadores',
          'pc', 'notebook', 'notebooks', 'ordenador', 'ordenadores',
          // TYPOS COMUNES:
          'portstil', 'portstiles', 'portatl', 'portatls',
          'lapto', 'laptos', 'compu', 'compus'
        ].some(term => pNorm.includes(term) || (pSingular && pSingular.includes(term)));
        
        if (esLaptop) {
          sinonimos.push('portatil', 'laptop', 'computador', 'pc', 'notebook', 'Portátil', 'Portatil');
        }
        
        if (['moto', 'motos', 'motocicleta', 'motocicletas'].includes(pNorm) || 
            (pSingular && ['moto', 'motocicleta'].includes(pSingular))) {
          sinonimos.push('moto', 'motocicleta');
        }
        if (['curso', 'cursos', 'taller', 'talleres'].includes(pNorm) || 
            (pSingular && ['curso', 'taller'].includes(pSingular))) {
          sinonimos.push('curso', 'taller', 'Curso', 'Cursos');
        }

        // Construir OR para la palabra y sus sinónimos (sin duplicados)
        const uniqueSinonimos = [...new Set(sinonimos)];
        return {
          OR: uniqueSinonimos.flatMap(term => [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } }
          ])
        };
      });
    }

    console.log('[BuscarProductos] 🏗️ Condición de búsqueda:', JSON.stringify(whereCondition, null, 2));

    // 4. EJECUTAR BÚSQUEDA
    const productos = await db.product.findMany({
      where: whereCondition,
      take: 15, // Aumentar límite para mejor selección
      orderBy: { createdAt: 'desc' },
    });


    console.log('[BuscarProductos] 📊 Productos encontrados en BD:', productos.length);

    // 5. FILTRAR Y PUNTUAR POR RELEVANCIA
    const productosPuntuados = productos.map(producto => {
      const nombreLower = producto.name.toLowerCase();
      const descripcionLower = (producto.description || '').toLowerCase();
      const categoriaLower = producto.category.toLowerCase();
      const subcategoriaLower = '';

      let score = 0;
      let razonesScore: string[] = [];

      // Puntaje por palabras clave en nombre (muy importante)
      palabrasClave.forEach(palabra => {
        if (nombreLower.includes(palabra)) {
          score += 5;
          razonesScore.push(`nombre:${palabra}`);
        }
      });

      // Puntaje por palabras clave en descripción
      palabrasClave.forEach(palabra => {
        if (descripcionLower.includes(palabra)) {
          score += 2;
          razonesScore.push(`desc:${palabra}`);
        }
      });

      // BONUS: Si coincide exactamente con categoría detectada
      if (categoriaDetectada.categoria && categoriaLower === categoriaDetectada.categoria.toLowerCase()) {
        score += 10;
        razonesScore.push(`categoria_exacta`);
      }

      // BONUS: Si coincide con subcategoría detectada
      if (categoriaDetectada.subcategoria && subcategoriaLower.includes(categoriaDetectada.subcategoria.toLowerCase())) {
        score += 8;
        razonesScore.push(`subcategoria_match`);
      }

      return {
        producto,
        score,
        razones: razonesScore,
        categoriaMatch: categoriaLower === categoriaDetectada.categoria?.toLowerCase()
      };
    });

    // 6. ORDENAR POR SCORE DESCENDENTE
    productosPuntuados.sort((a, b) => b.score - a.score);

    console.log('[BuscarProductos] 🏆 Top 5 productos por score:');
    productosPuntuados.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.producto.name} (Score: ${p.score}) - ${p.razones.join(', ')}`);
    });

    // 7. FILTRAR PRODUCTOS CON ESTRATEGIA INTELIGENTE
    let productosFiltrados;

    if (categoriaDetectada.subcategoria) {
      // 🎯 ESTRATEGIA 1: Subcategoría específica detectada
      console.log('[BuscarProductos] 🎯 SUBCATEGORÍA detectada - Aplicando filtro por subcategoría');
      productosFiltrados = productosPuntuados.filter(p =>
        p.score > 0
      );
    } else if (categoriaDetectada.categoria) {
      // 🎯 ESTRATEGIA 2: Solo categoría detectada
      console.log('[BuscarProductos] 🎯 CATEGORÍA detectada - Aplicando filtro estricto');
      productosFiltrados = productosPuntuados.filter(p =>
        p.categoriaMatch &&
        p.score > 0
      );
    } else {
      // 🎯 ESTRATEGIA 3: No se detectó categoría, usar búsqueda amplia
      console.log('[BuscarProductos] 🎯 Sin categoría detectada - Búsqueda amplia');
      productosFiltrados = productosPuntuados.filter(p => p.score > 0);
    }

    // 🧠 FILTRO CONTEXTUAL INTELIGENTE: Si busca laptops, excluir accesorios
    const buscaLaptop = palabrasClave.some(p => {
      const pNorm = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return ['portatil', 'portatiles', 'laptop', 'laptops', 'computador', 'computadores', 'ordenador', 'notebook'].includes(pNorm);
    });

    if (buscaLaptop && productosFiltrados.length > 0) {
      console.log('[BuscarProductos] 💻 Búsqueda de LAPTOPS detectada - Excluyendo accesorios');
      const palabrasExclusion = [
        'proyector', 'parlante', 'altavoz', 'mouse', 'teclado', 'base para', 
        'soporte', 'cable', 'cargador', 'adaptador', 'mochila', 'maleta',
        'bolso', 'funda', 'estuche', 'webcam', 'camara', 'audifonos', 'audífonos'
      ];
      
      productosFiltrados = productosFiltrados.filter(p => {
        const nombreLower = p.producto.name.toLowerCase();
        const tieneExclusion = palabrasExclusion.some(excl => nombreLower.includes(excl));
        if (tieneExclusion) {
          console.log(`[BuscarProductos] ❌ Excluido: ${p.producto.name}`);
        }
        return !tieneExclusion;
      });
    }

    // Si aún no hay productos, intentar búsqueda más amplia como último recurso
    if (productosFiltrados.length === 0) {
      console.log('[BuscarProductos] ⚠️ No hay productos válidos, intentando búsqueda amplia');
      productosFiltrados = productosPuntuados.filter(p => p.score >= 0);
    }

    // 8. APLICAR LÓGICA DE SELECCIÓN INTELIGENTE
    let productosSeleccionados;

    if (productosFiltrados.length === 0) {
      console.log('[BuscarProductos] ❌ No hay productos válidos encontrados');
      return [];
    }

    // Si tenemos productos válidos, devolver máximo 3
    if (productosFiltrados.length <= 3) {
      console.log(`[BuscarProductos] 📋 Devolviendo ${productosFiltrados.length} productos válidos`);
      productosSeleccionados = productosFiltrados;
    } else {
      console.log('[BuscarProductos] 📋 Devolviendo top 3 productos válidos');
      productosSeleccionados = productosFiltrados.slice(0, 3);
    }

    // 8. CONVERTIR AL FORMATO REQUERIDO
    const resultadoFinal = productosSeleccionados.map(({ producto: p }) => {
      // DEBUG: Ver qué imágenes tiene el producto
      console.log(`[BuscarProductos] 🖼️ DEBUG Producto: ${p.name}`);
      console.log(`[BuscarProductos] 📸 Images RAW:`, p.images);
      
      let imagenesParseadas = [];
      try {
        imagenesParseadas = p.images ? JSON.parse(p.images) : [];
        console.log(`[BuscarProductos] ✅ Images PARSED:`, imagenesParseadas);
      } catch (error) {
        console.log(`[BuscarProductos] ❌ Error parsing images:`, error);
      }
      
      return {
        id: p.id,
        nombre: p.name,
        descripcion: p.description || undefined,
        precio: p.price,
        categoria: p.category,
        tipoVenta: p.subcategory || undefined,
        imagenes: imagenesParseadas,
        stock: p.stock || undefined,
        metodosPago: [],
      };
    });

    console.log('[BuscarProductos] 🎯 Resultado final:', resultadoFinal.length, 'productos');
    resultadoFinal.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.nombre} (${p.categoria})`);
    });

    const enriquecidos = await enrichProductsWithKnowledge(resultadoFinal);
    return enriquecidos;

  } catch (error) {
    console.error('[BuscarProductos] ❌ Error:', error);
    return [];
  }
}
function detectarSubcategoriaComputacion(query: string): string | null {
  if (/\b(portatil|laptop|notebook|portátil)\b/.test(query)) return 'LAPTOP';
  if (/\b(escritorio|desktop|cpu|torre)\b/.test(query)) return 'DESKTOP';
  if (/\b(teclado|keyboard)\b/.test(query)) return 'KEYBOARD';
  if (/\b(mouse|raton|ratón)\b/.test(query)) return 'MOUSE';
  if (/\b(monitor|pantalla|display)\b/.test(query)) return 'MONITOR';
  if (/\b(impresora|printer)\b/.test(query)) return 'PRINTER';
  if (/\b(disco|ssd|hdd|almacenamiento|storage)\b/.test(query)) return 'STORAGE';
  if (/\b(ram|memoria)\b/.test(query)) return 'MEMORY';
  return null;
}

/**
 * Extrae palabras clave inteligentes, filtrando ruido
 */
function extraerPalabrasClaveInteligentes(query: string): string[] {
  // Lista expandida de palabras para filtrar
  const palabrasComunes = [
    'para', 'con', 'por', 'los', 'las', 'del', 'una', 'uno', 'que', 'más',
    'información', 'puedes', 'dar', 'dame', 'quiero', 'necesito', 'busco',
    'tengo', 'hay', 'como', 'cual', 'cuando', 'donde', 'porque', 'muy',
    'bueno', 'buena', 'buenos', 'buenas', 'mejor', 'mejores', 'barato', 'barata',
    'caro', 'cara', 'precio', 'cuanto', 'vale', 'costo', 'venta', 'comprar',
    'adquirir', 'obtener', 'encontrar', 'buscar', 'ver', 'mirar', 'saber',
    'tener', 'hacer', 'ser', 'esta', 'este', 'esto', 'estos', 'estas',
    'aqui', 'alla', 'aca', 'alla', 'ahora', 'hoy', 'ayer', 'mañana',
    'disponible', 'disponibles', 'tienes'
  ];

  // Función para normalizar (quitar tildes)
  const normalize = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const palabras = query
    .replace(/[¿?¡!.,;()]/g, ' ')
    .split(' ')
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length >= 3 && !palabrasComunes.includes(p));

  // Expandir con sinónimos y normalización
  const palabrasExpandidas: string[] = [];
  
  palabras.forEach(p => {
    const pNorm = normalize(p);
    palabrasExpandidas.push(p); // Original
    if (p !== pNorm) palabrasExpandidas.push(pNorm); // Sin tilde
    
    // Sinónimos COMPUTACIÓN
    if (pNorm === 'portatil' || pNorm === 'laptop' || pNorm === 'computador' || pNorm === 'pc' || pNorm === 'notebook') {
      if (!palabrasExpandidas.includes('portatil')) palabrasExpandidas.push('portatil');
      if (!palabrasExpandidas.includes('laptop')) palabrasExpandidas.push('laptop');
      if (!palabrasExpandidas.includes('computador')) palabrasExpandidas.push('computador');
    }
    
    // Sinónimos MOTOS
    if (pNorm === 'moto' || pNorm === 'motocicleta') {
      if (!palabrasExpandidas.includes('moto')) palabrasExpandidas.push('moto');
      if (!palabrasExpandidas.includes('motocicleta')) palabrasExpandidas.push('motocicleta');
    }

    // Sinónimos CURSOS
    if (pNorm === 'curso' || pNorm === 'taller' || pNorm === 'aprender' || pNorm === 'clase') {
      if (!palabrasExpandidas.includes('curso')) palabrasExpandidas.push('curso');
    }
  });

  // Remover duplicados
  return [...new Set(palabrasExpandidas)];
}

/**
 * Verifica si un producto realmente pertenece a computación
 * SER MUY ESTRICTO: solo productos que son claramente computadoras/portátiles
 */
function esProductoComputacion(producto: any): boolean {
  const nombreLower = producto.name.toLowerCase();
  const descLower = (producto.description || '').toLowerCase();
  const categoria = producto.category;

  console.log(`[esProductoComputacion] 🔍 Verificando: "${producto.name}" (Categoría: ${categoria})`);

  // ❌ EXCLUIR productos que NO son computación real
  const palabrasExclusion = [
    'base para', 'base de', 'soporte para', 'estuche para', 'funda para',
    'cable para', 'adaptador para', 'bateria para', 'batería para',
    'cargador para', 'pantalla para', 'teclado para', 'mouse para',
    'maquina de coser', 'máquina de coser', 'coser', 'costura',
    'parlante', 'altavoz', 'speaker', 'audifono', 'audífonos', 'headset',
    'bluetooth', 'inalambrico', 'inalámbrico', 'wireless',
    'telefono', 'teléfono', 'celular', 'iphone', 'samsung', 'huawei',
    'xiaomi', 'motorola', 'smartphone', 'android', 'ios'
  ];

  // Si contiene palabras de exclusión, NO es producto de computación
  const exclusionMatch = palabrasExclusion.find(palabra => nombreLower.includes(palabra));
  if (exclusionMatch) {
    console.log(`[esProductoComputacion] ❌ EXCLUÍDO por palabra: "${exclusionMatch}"`);
    return false;
  }

  // ✅ INCLUIR solo productos que son claramente computadoras/portátiles
  const palabrasComputacionEstrictas = [
    // Portátiles/Laptops
    'portatil', 'laptop', 'notebook', 'portátil',

    // Escritorio/Desktop
    'computador', 'pc', 'ordenador', 'desktop', 'escritorio', 'cpu', 'torre',

    // Componentes internos
    'procesador', 'ram', 'disco', 'ssd', 'hdd', 'motherboard', 'placa madre',
    'fuente', 'gabinete', 'case', 'cooler', 'ventilador',

    // Periféricos
    'teclado', 'mouse', 'monitor', 'impresora',

    // Conectividad
    'usb', 'hdmi', 'vga', 'ethernet',

    // Software/SO
    'windows', 'linux', 'mac', 'intel', 'amd', 'nvidia', 'radeon'
  ];

  // Debe contener al menos una palabra de computación Y no tener palabras de exclusión
  const computacionMatch = palabrasComputacionEstrictas.find(palabra =>
    nombreLower.includes(palabra) || descLower.includes(palabra)
  );

  if (!computacionMatch) {
    console.log(`[esProductoComputacion] ❌ NO contiene palabras de computación`);
    return false;
  }

  // Verificación adicional: debe ser una categoría válida de computación
  const categoriasComputacion = ['COMPUTER', 'ELECTRONICS'];
  const esCategoriaValida = categoriasComputacion.includes(categoria);

  if (!esCategoriaValida) {
    console.log(`[esProductoComputacion] ❌ Categoría inválida: ${categoria}`);
    return false;
  }

  console.log(`[esProductoComputacion] ✅ APROBADO: contiene "${computacionMatch}" y categoría válida`);
  return true;
}

/**
 * Dirige al flujo correcto según tipo de producto
 */
async function dirigirAFlujo(
  mensaje: string,
  producto: ProductoInfo,
  contexto: any
): Promise<string> {
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
    return await procesarFlujoDigital(mensaje, producto, contexto);
  }

  // DROPSHIPPING
  if (tipoVenta.includes('dropshipping') || tipoVenta.includes('envio')) {
    console.log('[DirigirFlujo] ✅ Usando flujo DROPSHIPPING');
    return await procesarFlujoDropshipping(mensaje, producto, contexto);
  }

  // SERVICIOS
  if (tipoVenta.includes('servicio') || tipoVenta.includes('service')) {
    console.log('[DirigirFlujo] ✅ Usando flujo SERVICIO');
    return await procesarFlujoServicio(mensaje, producto, contexto);
  }

  // Por defecto, flujo FÍSICO
  console.log('[DirigirFlujo] ✅ Usando flujo FÍSICO');
  return await procesarFlujoFisico(mensaje, producto, contexto);
}

/**
 * Genera respuesta para múltiples productos
 */
async function generarRespuestaMultiplesProductos(
  productos: ProductoInfo[],
  contexto: any
): Promise<string> {
  try {
    // 🤖 USAR SISTEMA DE IA CON FALLBACK
    const systemPrompt = construirPromptMultiplesProductos(productos);
    const userMessage = '¿Cuáles son las opciones disponibles?';
    
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
    
    const respuesta = await sendWithFallback(messages, {
      temperature: 0.7,
      maxTokens: 600,
    });

    return respuesta.content;
  } catch (error) {
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
async function generarInformacionPago(
  mensaje: string,
  contexto: any,
  botUserId?: string
): Promise<string> {
  try {
    console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[InformacionPago] 💳 SOLICITUD DE PAGO DETECTADA');
    console.log('[InformacionPago] 🔍 Buscando producto en contexto...');
    console.log('[InformacionPago] 📋 Cliente:', contexto.userId);
    console.log('[InformacionPago] 🤖 Bot:', botUserId || 'default');

    let productoId: string | null = null;
    let productoNombre: string | null = null;
    const realBotUserId = botUserId || process.env.DEFAULT_USER_ID || 'default-user-id';

    console.log('[InformacionPago] 🔍 INICIANDO BÚSQUEDA DE PRODUCTO EN CONTEXTO...');
    console.log('[InformacionPago] 📋 Cliente:', contexto.userId);
    console.log('[InformacionPago] 🤖 Bot:', realBotUserId);

    // ESTRATEGIA 1: Memoria mejorada (más confiable y persistente)
    try {
      const { ContextMemoryEnhanced } = await import('@/lib/context-memory-enhanced');
      
      console.log('[InformacionPago] 🔍 ESTRATEGIA 1: Memoria mejorada...');
      const productContext = await ContextMemoryEnhanced.getCurrentProduct(realBotUserId, contexto.userId);

      if (productContext) {
        productoId = productContext.productId;
        productoNombre = productContext.productName;
        console.log('[InformacionPago] ✅ ENCONTRADO en memoria mejorada:', productoNombre);
        console.log('[InformacionPago] 📦 ID:', productoId);
        console.log('[InformacionPago] 💰 Precio:', productContext.price);
        console.log('[InformacionPago] 🔄 Turnos conversación:', productContext.conversationTurns);
      } else {
        console.log('[InformacionPago] ❌ No encontrado en memoria mejorada');
      }
    } catch (error) {
      console.log('[InformacionPago] ⚠️ Error accediendo memoria mejorada:', error);
    }

    // ESTRATEGIA 2: Buscar en contexto híbrido (fallback)
    if (!productoId) {
      try {
        const { ConversationContextHybrid } = await import('@/lib/conversation-context-hybrid');
        
        console.log('[InformacionPago] 🔍 ESTRATEGIA 2: Contexto híbrido...');
        const contextData = await ConversationContextHybrid.getProductContext(realBotUserId, contexto.userId);

        if (contextData && contextData.lastProductId) {
          productoId = contextData.lastProductId;
          productoNombre = contextData.lastProductName;
          console.log('[InformacionPago] ✅ ENCONTRADO en contexto híbrido:', productoNombre);
          console.log('[InformacionPago] 📦 ID:', productoId);
        } else {
          console.log('[InformacionPago] ❌ No encontrado en contexto híbrido');
        }
      } catch (error) {
        console.log('[InformacionPago] ⚠️ Error accediendo contexto híbrido:', error);
      }
    }

    // ESTRATEGIA 3: Buscar en contexto regular (fallback)
    if (!productoId && contexto.ultimoProductoId) {
      console.log('[InformacionPago] 🔍 ESTRATEGIA 3: Contexto regular...');
      productoId = typeof contexto.ultimoProductoId === 'string' 
        ? contexto.ultimoProductoId 
        : contexto.ultimoProductoId.toString();
      productoNombre = contexto.ultimoProductoNombre;
      console.log('[InformacionPago] ✅ ENCONTRADO en contexto regular:', productoNombre);
      console.log('[InformacionPago] 📦 ID:', productoId);
    }

    // ESTRATEGIA 4: Buscar en metadata del contexto
    if (!productoId && contexto.metadata?.lastProductId) {
      console.log('[InformacionPago] 🔍 ESTRATEGIA 4: Metadata del contexto...');
      productoId = contexto.metadata.lastProductId;
      productoNombre = contexto.metadata.lastProductName || 'Producto';
      console.log('[InformacionPago] ✅ ENCONTRADO en metadata:', productoNombre);
      console.log('[InformacionPago] 📦 ID:', productoId);
    }

    // ESTRATEGIA 5: Buscar en historial de mensajes (marcadores de contexto)
    if (!productoId && contexto.historialMensajes) {
      console.log('[InformacionPago] 🔍 ESTRATEGIA 5: Historial de mensajes...');
      
      // Buscar marcadores [CONTEXT:PRODUCT:ID:NOMBRE] en los últimos 10 mensajes
      const mensajesRecientes = contexto.historialMensajes.slice(-10);
      
      for (const msg of mensajesRecientes.reverse()) {
        // Buscar marcador de contexto
        const match = msg.contenido.match(/\[CONTEXT:PRODUCT:([^:]+):([^\]]+)\]/);
        if (match) {
          productoId = match[1];
          productoNombre = match[2];
          console.log('[InformacionPago] ✅ ENCONTRADO en historial (marcador):', productoNombre);
          console.log('[InformacionPago] 📦 ID:', productoId);
          break;
        }
        
        // Buscar en metadata del mensaje
        if (msg.metadata?.productoId) {
          productoId = msg.metadata.productoId;
          productoNombre = msg.metadata.productoNombre || 'Producto';
          console.log('[InformacionPago] ✅ ENCONTRADO en historial (metadata):', productoNombre);
          console.log('[InformacionPago] 📦 ID:', productoId);
          break;
        }
      }
    }

    // ESTRATEGIA 6: Buscar en base de datos (último producto visto por el cliente)
    if (!productoId) {
      console.log('[InformacionPago] 🔍 ESTRATEGIA 6: Base de datos...');
      try {
        const conversacion = await db.conversation.findFirst({
          where: {
            customerPhone: contexto.userId,
            productId: { not: null }
          },
          orderBy: { lastMessageAt: 'desc' },
          select: {
            productId: true
          }
        });

        if (conversacion && conversacion.productId) {
          productoId = conversacion.productId;
          
          // Buscar el nombre del producto
          const producto = await db.product.findUnique({
            where: { id: conversacion.productId },
            select: { name: true }
          });
          
          productoNombre = producto?.name || 'Producto';
          console.log('[InformacionPago] ✅ ENCONTRADO en BD:', productoNombre);
          console.log('[InformacionPago] 📦 ID:', productoId);
        }
      } catch (error) {
        console.log('[InformacionPago] ⚠️ Error buscando en BD:', error);
      }
    }

    // ESTRATEGIA 7: Intentar extraer del mensaje actual
    if (!productoId) {
      console.log('[InformacionPago] 🔍 ESTRATEGIA 7: Extraer del mensaje actual...');
      const productosMencionados = await buscarProductos(mensaje, realBotUserId);
      
      if (productosMencionados.length > 0) {
        const producto = productosMencionados[0];
        productoId = typeof producto.id === 'string' ? producto.id : producto.id.toString();
        productoNombre = producto.nombre;
        console.log('[InformacionPago] ✅ ENCONTRADO en mensaje:', productoNombre);
        console.log('[InformacionPago] 📦 ID:', productoId);

        // Guardar en contexto para futuras referencias (CUÁDRUPLE PERSISTENCIA)
        try {
          const { ConversationContextHybrid } = await import('@/lib/conversation-context-hybrid');
          const { ContextMemoryEnhanced } = await import('@/lib/context-memory-enhanced');
          
          await ConversationContextHybrid.saveProductContext(
            realBotUserId,
            contexto.userId,
            productoId,
            productoNombre,
            {
              price: producto.precio,
              category: producto.categoria,
              type: producto.categoria === 'DIGITAL' ? 'digital' : 'physical'
            }
          );

          await ContextMemoryEnhanced.saveProductContext(
            realBotUserId,
            contexto.userId,
            productoId,
            productoNombre,
            producto.precio,
            producto.categoria
          );
          
          await actualizarContexto(contexto.userId, {
            ultimoProductoId: productoId,
            ultimoProductoNombre: productoNombre,
            ultimaCategoria: producto.categoria
          }, realBotUserId);

          console.log('[InformacionPago] ✅ Producto guardado en contexto');
        } catch (error) {
          console.log('[InformacionPago] ⚠️ Error guardando en contexto:', error);
        }
      }
    }

    // Si después de todas las estrategias NO hay producto
    if (!productoId) {
      console.log('[InformacionPago] ❌ No se pudo identificar el producto');
      return `No estoy seguro de qué producto quieres comprar 🤔

¿Podrías decirme el nombre del producto que te interesa?`;
    }

    // Buscar producto en BD
    const producto = await db.product.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      console.log('[InformacionPago] ❌ Producto no encontrado en BD');
      return `No encontré ese producto en mi catálogo 😕

¿Podrías decirme qué producto te interesa?`;
    }

    console.log('[InformacionPago] ✅ Producto confirmado:', producto.name);
    console.log('[InformacionPago] 💰 Precio:', producto.price);
    console.log('[InformacionPago] 🔄 Generando links REALES de pago...');
    
    // GENERAR LINKS REALES DIRECTAMENTE - SIN IA
    const { BotPaymentLinkGenerator } = await import('@/lib/bot-payment-link-generator');
    const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
      producto.id,
      producto.userId,
      1
    );

    if (paymentResult.success && paymentResult.message) {
      console.log('[InformacionPago] ✅ Links REALES generados exitosamente');
      console.log('[InformacionPago] 📤 Enviando links reales');
      console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return paymentResult.message;
    }

    // Fallback simple SIN inventar nada
    console.log('[InformacionPago] ⚠️ Fallback - no se generaron links');
    console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return `Un momento, estoy generando tu link de pago para *${producto.name}*

💰 Total: ${producto.price.toLocaleString('es-CO')} COP

⏳ Procesando...`;

  } catch (error) {
    console.error('[InformacionPago] ❌ Error:', error);
    console.log('[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return 'Tuve un problema generando el link. Intenta de nuevo 🙏';
  }
}

/**
 * Procesa solicitud de envío
 */
async function procesarSolicitudEnvio(
  mensaje: string,
  contexto: any
): Promise<string> {
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
async function buscarServicio(
  mensaje: string,
  contexto: any
): Promise<string> {
  try {
    const servicios = await db.product.findMany({
      where: {
        category: 'SERVICE',
        status: 'AVAILABLE',
      },
      take: 3,
    });

    if (servicios.length > 0) {
      const servicio = servicios[0];
      const productoInfo: ProductoInfo = {
        id: parseInt(servicio.id) || 0,
        nombre: servicio.name,
        descripcion: servicio.description || undefined,
        precio: servicio.price,
        categoria: servicio.category,
      };

      return await procesarFlujoServicio(mensaje, productoInfo, contexto);
    }

    return `¡Claro! Ofrecemos servicio técnico 🔧

Cuéntame:
- ¿Qué equipo es?
- ¿Qué problema presenta?

Así puedo ayudarte mejor 😊`;

  } catch (error) {
    console.error('[BuscarServicio] Error:', error);
    return 'Ofrecemos servicio técnico. ¿Qué problema tienes? 🔧';
  }
}

/**
 * Procesa quejas o reclamos
 */
async function procesarQuejaReclamo(
  mensaje: string,
  contexto: any
): Promise<string> {
  return `Lamento mucho que hayas tenido un inconveniente 😔

Tu satisfacción es muy importante para nosotros. 

¿Podrías contarme qué sucedió? Voy a ayudarte a resolverlo lo antes posible 🙏`;
}

/**
 * Obtiene estadísticas de uso (local vs IA)
 */
export function obtenerEstadisticas() {
  return LocalResponseStats.getStats();
}

/**
 * Reinicia estadísticas
 */
export function reiniciarEstadisticas() {
  LocalResponseStats.reset();
}

/**
 * 🛡️ Maneja objeciones del cliente
 */
async function manejarObjecion(
  mensaje: string,
  intencion: string,
  contexto: any,
  botUserId?: string
): Promise<string> {
  try {
    const { ObjectionHandler } = await import('../services/objection-handler');
    
    // Obtener producto del contexto
    const producto = await obtenerProductoDelContexto(contexto, botUserId);
    
    if (!producto) {
      return `Entiendo tu preocupación 😊

¿Sobre qué producto tienes dudas? Así puedo ayudarte mejor 💬`;
    }

    // Detectar y manejar objeción
    const objecion = ObjectionHandler.detectObjection(mensaje);
    
    if (objecion) {
      const respuesta = ObjectionHandler.handleObjection(objecion, producto);
      return respuesta;
    }

    return `Entiendo 😊 ¿Hay algo específico que te preocupa sobre ${producto.nombre}?`;
  } catch (error) {
    console.error('[ManejarObjecion] Error:', error);
    return `Entiendo tu preocupación. ¿Podrías contarme más para ayudarte mejor? 😊`;
  }
}

/**
 * 💰 Genera oferta especial cuando solicitan descuento
 */
async function generarOfertaEspecial(
  mensaje: string,
  contexto: any,
  botUserId?: string
): Promise<string> {
  try {
    const producto = await obtenerProductoDelContexto(contexto, botUserId);
    
    if (!producto) {
      return `¡Claro! Tenemos ofertas especiales 🎁

¿Qué producto te interesa? Así te cuento sobre las promociones disponibles 😊`;
    }

    const esDigital = producto.categoria.toLowerCase().includes('digital') || 
                      producto.categoria.toLowerCase().includes('curso') ||
                      producto.categoria.toLowerCase().includes('megapack');

    if (esDigital) {
      // ESTRATEGIA DIGITAL: Anchor Pricing
      const sobreprecio = 1.25;
      const precioLista = Math.round(producto.precio * sobreprecio);
      const precioOferta = producto.precio;
      const descuento = Math.round(((precioLista - precioOferta) / precioLista) * 100);
      const ahorro = precioLista - precioOferta;

      return `¡Excelente noticia! 🎉

Tengo una oferta ESPECIAL para ti:

━━━━━━━━━━━━━━━━━━━━
✨ *${producto.nombre}*
━━━━━━━━━━━━━━━━━━━━

💰 Precio de lista: $${precioLista.toLocaleString('es-CO')}
🔥 Precio OFERTA: $${precioOferta.toLocaleString('es-CO')}
⚡ Ahorro: $${ahorro.toLocaleString('es-CO')} (${descuento}%)

⏰ *OFERTA VÁLIDA SOLO HOY*

¿Aprovechamos esta oferta? 🚀`;
    } else {
      // ESTRATEGIA FÍSICA: Stock Limitado (Sin descuento fake)
      return `¡Excelente elección! 🎉

Para *${producto.nombre}* no manejamos descuentos adicionales ya que el precio actual es el mejor del mercado considerando su calidad y garantía.

📦 *PERO TEN CUIDADO:*
Nos quedan muy pocas unidades en stock de este lote.

Si confirmas tu pedido hoy, te aseguro:
✅ Envío prioritario
✅ Garantía directa
✅ Soporte post-venta

¿Te gustaría asegurar tu unidad ahora? 🚀`;
    }
  } catch (error) {
    console.error('[GenerarOfertaEspecial] Error:', error);
    return `¡Sí! Tenemos ofertas especiales. ¿Qué producto te interesa? 😊`;
  }
}

/**
 * Obtiene producto del contexto para manejo de objeciones
 */
async function obtenerProductoDelContexto(
  contexto: any,
  botUserId?: string
): Promise<ProductoInfo | null> {
  try {
    // Intentar obtener del contexto híbrido
    if (botUserId && contexto.userId) {
      const { ConversationContextHybrid } = await import('@/lib/conversation-context-hybrid');
      const contextData = await ConversationContextHybrid.getProductContext(botUserId, contexto.userId);
      
      if (contextData && contextData.productId) {
        const producto = await db.product.findUnique({
          where: { id: contextData.productId }
        });
        
        if (producto) {
          return {
            id: producto.id,
            nombre: producto.name,
            descripcion: producto.description || undefined,
            precio: producto.price,
            categoria: producto.category,
          };
        }
      }
    }

    // Fallback: buscar en contexto local
    if (contexto.ultimoProductoId) {
      const producto = await db.product.findUnique({
        where: { id: contexto.ultimoProductoId }
      });
      
      if (producto) {
        return {
          id: producto.id,
          nombre: producto.name,
          descripcion: producto.description || undefined,
          precio: producto.price,
          categoria: producto.category,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[ObtenerProductoDelContexto] Error:', error);
    return null;
  }
}

