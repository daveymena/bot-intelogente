/**
 * Controlador principal de conversación
 * Orquesta la detección de intención, búsqueda de productos y flujos
 */

import { db } from '@/lib/db';
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
import { construirPromptPago, construirPromptMultiplesProductos, type ProductoInfo } from '../ai/promptBuilder';
import { sendWithFallback, type GroqMessage } from './groqClient';
import { generarLinksPago, formatearLinksPago, generarLinkMercadoPago } from '../services/paymentService';
import { obtenerFotosProducto, detectarSolicitudFotos, tienefotos } from '../services/photoService';
import { procesarAudio } from '../services/audioService';
import { 
  analizarConRazonamientoProfundo, 
  necesitaRazonamientoProfundo,
  generarRespuestaAmigable,
  type ReasoningResult 
} from '../services/deepReasoningService';

/**
 * Procesa un mensaje del usuario y genera respuesta
 */
export async function procesarMensaje(
  userId: string,
  mensaje: string,
  opciones?: {
    esAudio?: boolean;
    audioBuffer?: Buffer;
    tieneImagen?: boolean;
  }
): Promise<{
  texto: string;
  fotos?: Array<{ url: string; caption?: string }>;
  linksPago?: any;
}> {
  try {
    console.log(`[Conversación] Usuario: ${userId}, Mensaje: ${mensaje}`);

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

    // Guardar mensaje del usuario
    await agregarMensajeAlHistorial(userId, 'user', mensajeTexto);

    // Obtener contexto
    const contexto = await obtenerContexto(userId);

    // Detectar intención
    const { intencion, entidades } = detectarIntencion(mensajeTexto);
    console.log(`[Conversación] Intención detectada: ${intencion}`);

    // 📸 DETECTAR SOLICITUD DE FOTOS
    const solicitaFotos = detectarSolicitudFotos(mensajeTexto);

    // 🚀 INTENTAR RESPUESTA LOCAL PRIMERO (ahorro de tokens)
    const localResponse = tryLocalResponse(mensajeTexto, intencion);
    
    if (localResponse.canHandle && localResponse.response) {
      console.log(`[Conversación] ✅ Respuesta local (sin IA) - Tokens ahorrados`);
      LocalResponseStats.incrementLocal();
      
      // Guardar respuesta del bot
      await agregarMensajeAlHistorial(userId, 'assistant', localResponse.response);
      
      return {
        texto: localResponse.response,
      };
    }

    // Si no se puede manejar localmente, usar IA
    console.log(`[Conversación] 🤖 Requiere IA para respuesta compleja`);
    LocalResponseStats.incrementAI();

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
        respuesta = await procesarFlujoGeneral(mensajeTexto, 'general', contexto);
    }

    // Guardar respuesta del bot
    await agregarMensajeAlHistorial(userId, 'assistant', respuesta);

    console.log(`[Conversación] Respuesta generada: ${respuesta.substring(0, 100)}...`);
    
    return {
      texto: respuesta,
    };

  } catch (error) {
    console.error('[Conversación] Error:', error);
    return {
      texto: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías intentar de nuevo? 🙏',
    };
  }
}

/**
 * Busca productos y genera respuesta
 */
async function buscarYResponderProducto(
  mensaje: string,
  contexto: any,
  solicitaFotos: boolean = false
): Promise<{
  texto: string;
  fotos?: Array<{ url: string; caption?: string }>;
  linksPago?: any;
}> {
  try {
    // Buscar productos
    let productos = await buscarProductos(mensaje);

    // 🧠 SI NO ENCUENTRA NADA, USAR RAZONAMIENTO PROFUNDO
    if (productos.length === 0) {
      console.log('[Conversación] 🧠 No se encontraron productos, activando razonamiento profundo...');
      
      try {
        const razonamiento = await analizarConRazonamientoProfundo(
          mensaje,
          contexto.historialMensajes?.slice(-3).map((m: any) => m.contenido).join('\n')
        );

        console.log('[Conversación] 💡 Interpretación:', razonamiento.interpretacion);
        console.log('[Conversación] 🔍 Búsqueda sugerida:', razonamiento.busquedaSugerida);

        // Buscar con la interpretación mejorada
        productos = await buscarProductos(razonamiento.busquedaSugerida);

        if (productos.length > 0) {
          // Encontró productos con razonamiento profundo
          console.log('[Conversación] ✅ Razonamiento profundo exitoso - Encontrados:', productos.length);
          
          // Actualizar contexto con la interpretación
          await actualizarContexto(contexto.userId, {
            metadata: {
              ...contexto.metadata,
              ultimaInterpretacion: razonamiento.interpretacion,
              ultimaBusqueda: razonamiento.busquedaSugerida,
            },
          });

          // Continuar con el flujo normal
        } else {
          // Ni con razonamiento profundo encontró
          console.log('[Conversación] ❌ Razonamiento profundo no encontró productos');
          
          return {
            texto: `${generarRespuestaAmigable(razonamiento)}

Lamentablemente no tengo productos que coincidan exactamente.

¿Podrías darme más detalles sobre lo que buscas? 🤔`
          };
        }
      } catch (error) {
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
      await actualizarContexto(contexto.userId, {
        ultimoProductoId: typeof producto.id === 'string' ? producto.id : producto.id.toString(),
        ultimoProductoNombre: producto.nombre,
        ultimaCategoria: producto.categoria,
      });

      // 💾 GUARDAR EN CONTEXTO DE CONVERSACIÓN PARA PAGOS
      try {
        const { ConversationContextService } = await import('@/lib/conversation-context-service');

        // Buscar el userId del dueño del bot desde la conversación
        const conversation = await db.conversation.findFirst({
          where: { customerPhone: contexto.userId },
          select: { userId: true }
        });

        if (conversation) {
          // La clave es: userId_del_bot:numero_del_cliente
          const conversationKey = `${conversation.userId}:${contexto.userId}`;
          const productId = typeof producto.id === 'string' ? producto.id : producto.id.toString();
          ConversationContextService.setProductContext(
            conversationKey,
            productId,
            producto.nombre
          );
          console.log(`[Conversación] ✅ Producto guardado en contexto para pagos: ${producto.nombre} (${conversationKey})`);
          console.log(`[Conversación] 🆔 ID del producto: ${productId}`);
        }
      } catch (error) {
        console.error('[Conversación] Error guardando contexto:', error);
      }

      // 🚀 INTENTAR RESPUESTA LOCAL CON PRODUCTO
      const localResponse = tryLocalResponse(mensaje, 'busqueda_producto', producto);

      if (localResponse.canHandle && localResponse.response) {
        console.log(`[Conversación] ✅ Respuesta de producto local (sin IA)`);
        LocalResponseStats.incrementLocal();

        // 📸 ENVIAR FOTOS AUTOMÁTICAMENTE si el producto tiene imágenes
        const fotosProducto = obtenerFotosProducto(producto);
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
      LocalResponseStats.incrementAI();

      // Dirigir al flujo según tipo y enviar fotos si disponibles
      const respuestaTexto = await dirigirAFlujo(mensaje, producto, contexto);

      // 📸 ENVIAR FOTOS AUTOMÁTICAMENTE si el producto tiene imágenes
      const fotosProducto = obtenerFotosProducto(producto);
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

  } catch (error) {
    console.error('[BuscarProducto] Error:', error);
    return { texto: 'Tuve un problema al buscar productos. ¿Podrías intentar de nuevo? 🙏' };
  }
}

/**
 * Busca productos en la base de datos con búsqueda inteligente mejorada
 * CORRECCIÓN CRÍTICA: Ahora filtra por categorías y subcategorías para evitar resultados irrelevantes
 */
export async function buscarProductos(query: string): Promise<ProductoInfo[]> {
  try {
    const queryLower = query.toLowerCase().trim();

    console.log('[BuscarProductos] 🔍 Query original:', query);
    console.log('[BuscarProductos] 🔍 Query procesado:', queryLower);

    // 1. DETECTAR CATEGORÍA PRINCIPAL DE LA BÚSQUEDA
    const categoriaDetectada = detectarCategoriaBusqueda(queryLower);
    console.log('[BuscarProductos] 📂 Categoría detectada:', categoriaDetectada);

    // 2. Extraer palabras clave importantes (filtrando palabras comunes)
    const palabrasClave = extraerPalabrasClaveInteligentes(queryLower);
    console.log('[BuscarProductos] 🔑 Palabras clave:', palabrasClave);

    // 3. CONSTRUIR CONSULTA INTELIGENTE CON ESTRATEGIA DE FALLBACK
    let whereCondition: any = {
      status: 'AVAILABLE'
    };

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
      whereCondition.AND = palabrasClave.map(palabra => ({
        OR: [
          { name: { contains: palabra, mode: 'insensitive' } },
          { description: { contains: palabra, mode: 'insensitive' } },
        ]
      }));
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
      const subcategoriaLower = (producto.subcategory || '').toLowerCase();

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

      // Penalización por productos que no deberían estar en esta categoría
      if (categoriaDetectada.categoria === 'COMPUTER' && !esProductoComputacion(producto)) {
        score -= 20;
        razonesScore.push(`penalizacion_categoria`);
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
      // 🎯 ESTRATEGIA 1: Subcategoría específica detectada (ej: LAPTOP)
      console.log('[BuscarProductos] 🎯 SUBCATEGORÍA detectada - Aplicando filtro por subcategoría');
      productosFiltrados = productosPuntuados.filter(p =>
        p.producto.subcategory === categoriaDetectada.subcategoria &&
        p.score > 0 &&
        esProductoComputacion(p.producto)
      );

      console.log(`[BuscarProductos] 📊 Encontrados en subcategoría ${categoriaDetectada.subcategoria}: ${productosFiltrados.length}`);

      // Si no hay productos en subcategoría específica, fallback a categoría completa
      if (productosFiltrados.length === 0 && categoriaDetectada.categoria) {
        console.log('[BuscarProductos] ⚠️ No hay productos en subcategoría, haciendo fallback a categoría completa');
        productosFiltrados = productosPuntuados.filter(p =>
          p.categoriaMatch &&
          p.score > 0 &&
          esProductoComputacion(p.producto)
        );
        console.log(`[BuscarProductos] 📊 Encontrados en categoría completa: ${productosFiltrados.length}`);
      }
    } else if (categoriaDetectada.categoria) {
      // 🎯 ESTRATEGIA 2: Solo categoría detectada
      console.log('[BuscarProductos] 🎯 CATEGORÍA detectada - Aplicando filtro estricto');
      productosFiltrados = productosPuntuados.filter(p =>
        p.categoriaMatch &&
        p.score > 0 &&
        esProductoComputacion(p.producto)
      );
      console.log(`[BuscarProductos] 📊 Productos válidos en categoría: ${productosFiltrados.length}`);
    } else {
      // 🎯 ESTRATEGIA 3: No se detectó categoría, usar búsqueda amplia
      console.log('[BuscarProductos] 🎯 Sin categoría detectada - Búsqueda amplia');
      productosFiltrados = productosPuntuados.filter(p => p.score > 0);
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

    const mejorScore = productosFiltrados[0]?.score || 0;

    // Si tenemos productos válidos, devolver máximo 3
    if (productosFiltrados.length <= 3) {
      console.log(`[BuscarProductos] 📋 Devolviendo ${productosFiltrados.length} productos válidos`);
      productosSeleccionados = productosFiltrados;
    } else {
      console.log('[BuscarProductos] 📋 Devolviendo top 3 productos válidos');
      productosSeleccionados = productosFiltrados.slice(0, 3);
    }

    // 8. CONVERTIR AL FORMATO REQUERIDO
    const resultadoFinal = productosSeleccionados.map(({ producto: p }) => ({
      id: p.id,
      nombre: p.name,
      descripcion: p.description || undefined,
      precio: p.price,
      categoria: p.category,
      tipoVenta: p.subcategory || undefined,
      imagenes: p.images ? JSON.parse(p.images) : [],
      stock: p.stock || undefined,
      metodosPago: [],
    }));

    console.log('[BuscarProductos] 🎯 Resultado final:', resultadoFinal.length, 'productos');
    resultadoFinal.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.nombre} (${p.categoria})`);
    });

    return resultadoFinal;

  } catch (error) {
    console.error('[BuscarProductos] ❌ Error:', error);
    return [];
  }
}

/**
 * Detecta la categoría principal de una búsqueda
 */
function detectarCategoriaBusqueda(query: string): { categoria: string | null, subcategoria: string | null } {
  const queryLower = query.toLowerCase();

  // PATRONES DE COMPUTACIÓN
  if (/\b(portatil|laptop|notebook|computador|pc|ordenador|cpu|procesador|ram|disco|ssd|hdd|teclado|mouse|monitor|impresora|portátil)\b/.test(queryLower)) {
    return { categoria: 'COMPUTER', subcategoria: detectarSubcategoriaComputacion(queryLower) };
  }

  // PATRONES DE TELÉFONOS/CELULARES
  if (/\b(celular|telefono|teléfono|iphone|samsung|huawei|xiaomi|motorola|android|ios|smartphone)\b/.test(queryLower)) {
    return { categoria: 'PHONE', subcategoria: null };
  }

  // PATRONES DE AUDIO
  if (/\b(audifono|audífonos|headset|parlante|altavoz|speaker|bluetooth|wireless|inalambrico|inalámbrico)\b/.test(queryLower)) {
    return { categoria: 'AUDIO', subcategoria: null };
  }

  // PATRONES DE ELECTRÓNICA GENERAL
  if (/\b(cable|adaptador|cargador|usb|hdmi|vga|ethernet|wifi|router|modem)\b/.test(queryLower)) {
    return { categoria: 'ELECTRONICS', subcategoria: null };
  }

  // PATRONES DE SERVICIOS DIGITALES
  if (/\b(curso|megapack|software|digital|online|virtual|descarga|download)\b/.test(queryLower)) {
    return { categoria: 'DIGITAL', subcategoria: null };
  }

  // PATRONES DE SERVICIOS
  if (/\b(servicio|service|reparacion|reparación|mantenimiento|instalacion|instalación)\b/.test(queryLower)) {
    return { categoria: 'SERVICE', subcategoria: null };
  }

  return { categoria: null, subcategoria: null };
}

/**
 * Detecta subcategoría específica para computación
 */
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
    'aqui', 'alla', 'aca', 'alla', 'ahora', 'hoy', 'ayer', 'mañana'
  ];

  const palabras = query
    .replace(/[¿?¡!.,;()]/g, ' ')
    .split(' ')
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length >= 3 && !palabrasComunes.includes(p));

  // Remover duplicados
  return [...new Set(palabras)];
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
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: construirPromptMultiplesProductos(productos),
      },
      {
        role: 'user',
        content: '¿Cuáles son las opciones disponibles?',
      },
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
  contexto: any
): Promise<string> {
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

    const producto = await db.product.findUnique({
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
    const { BotPaymentLinkGenerator } = await import('@/lib/bot-payment-link-generator');
    const paymentResult = await BotPaymentLinkGenerator.generatePaymentLinks(
      producto.id,
      producto.userId,
      1
    );

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
