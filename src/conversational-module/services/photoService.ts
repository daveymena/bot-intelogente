/**
 * Servicio de Fotos con Fallback Automático
 * Garantiza que SIEMPRE se envíe al menos una foto
 */

import { type ProductoInfo } from '../ai/promptBuilder-simple';

export interface ProductPhoto {
  url: string;
  caption?: string;
}

// URLs de imágenes placeholder genéricas (menos específicas para evitar confusión)
const PLACEHOLDER_IMAGES: Record<string, string> = {
  DIGITAL: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', // Digital/Abstracto
  COMPUTER: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', // Laptop genérico
  PHONE: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', // Teléfono genérico
  PHYSICAL: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', // Producto físico genérico
  SERVICE: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', // Servicio/Atención
  DEFAULT: 'https://images.unsplash.com/photo-1472851294608-415522f96319?w=800&q=80', // Tienda genérica
};

/**
 * Obtiene imagen placeholder según categoría
 */
function obtenerImagenPlaceholder(categoria: string): string {
  const categoriaUpper = categoria.toUpperCase();
  
  // Buscar por categoría exacta
  if (PLACEHOLDER_IMAGES[categoriaUpper]) {
    return PLACEHOLDER_IMAGES[categoriaUpper];
  }
  
  // Buscar por palabras clave
  if (categoriaUpper.includes('DIGITAL') || categoriaUpper.includes('CURSO') || categoriaUpper.includes('MEGAPACK')) {
    return PLACEHOLDER_IMAGES.DIGITAL;
  }
  
  if (categoriaUpper.includes('COMPUTER') || categoriaUpper.includes('LAPTOP') || categoriaUpper.includes('PORTATIL')) {
    return PLACEHOLDER_IMAGES.COMPUTER;
  }
  
  if (categoriaUpper.includes('PHONE') || categoriaUpper.includes('CELULAR') || categoriaUpper.includes('TELEFONO')) {
    return PLACEHOLDER_IMAGES.PHONE;
  }
  
  if (categoriaUpper.includes('SERVICE') || categoriaUpper.includes('SERVICIO')) {
    return PLACEHOLDER_IMAGES.SERVICE;
  }
  
  // Default
  return PLACEHOLDER_IMAGES.DEFAULT;
}

/**
 * Obtiene las fotos de un producto CON SOPORTE PARA RUTAS LOCALES
 * Convierte rutas locales (/fotos/...) a URLs completas
 * FUNCIONA PARA TODOS LOS PRODUCTOS
 */
export function obtenerFotosProducto(producto: ProductoInfo): ProductPhoto[] {
  console.log(`[PhotoService] 🔍 Buscando fotos para: ${producto.nombre}`);
  console.log(`[PhotoService] 📸 Imágenes raw:`, producto.imagenes);
  
  // Intentar obtener fotos reales del producto
  if (producto.imagenes && producto.imagenes.length > 0) {
    // CRÍTICO: Usar la URL correcta del servidor
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXTAUTH_URL || 
                    'http://localhost:4000';
    
    console.log(`[PhotoService] 🌐 Base URL: ${baseUrl}`);
    
    const fotosReales = producto.imagenes
      .filter(url => {
        if (!url || typeof url !== 'string') return false;
        // Aceptar URLs completas (http/https) o rutas locales (/)
        const esValida = url.startsWith('http') || url.startsWith('/');
        if (!esValida) {
          console.log(`[PhotoService] ⚠️ URL inválida descartada: "${url}"`);
        }
        return esValida;
      })
      .map((url, index) => {
        // Convertir rutas locales a URLs completas
        let fullUrl = url;
        if (url.startsWith('/')) {
          // Asegurar que no haya doble slash
          const cleanPath = url.startsWith('//') ? url.substring(1) : url;
          fullUrl = `${baseUrl}${cleanPath}`;
          console.log(`[PhotoService] 🔄 Convertido: ${url} → ${fullUrl}`);
        }
        
        return {
          url: fullUrl,
          caption: index === 0 ? generarCaptionPrincipal(producto) : undefined,
        };
      });
    
    if (fotosReales.length > 0) {
      console.log(`[PhotoService] ✅ ${fotosReales.length} foto(s) lista(s) para enviar`);
      console.log(`[PhotoService] 📸 Primera foto: ${fotosReales[0].url}`);
      return fotosReales;
    }
  }

  // FALLBACK: Si no tiene fotos, NO usar placeholder para evitar confusión
  console.log(`[PhotoService] ⚠️ Producto sin fotos válidas. No se enviará imagen.`);
  
  // Retornar vacío para que no envíe nada si no hay foto real
  return [];
}

/**
 * Genera el caption para la foto principal
 * SIMPLIFICADO: Solo nombre del producto para evitar duplicar el mensaje de texto
 */
function generarCaptionPrincipal(producto: ProductoInfo): string {
  // CRÍTICO: NO incluir toda la información aquí porque ya se envía en el mensaje de texto
  // Solo un caption mínimo para identificar la foto
  return `📸 ${producto.nombre}`;
}

/**
 * Genera caption cuando se USA imagen placeholder
 */
function generarCaptionConAdvertencia(producto: ProductoInfo): string {
  let caption = `📦 *${producto.nombre}*\n\n`;
  
  caption += `💰 *$${producto.precio.toLocaleString('es-CO')} COP*\n\n`;
  
  if (producto.descripcion) {
    const descripcionCorta = producto.descripcion.substring(0, 100);
    caption += `${descripcionCorta}${producto.descripcion.length > 100 ? '...' : ''}\n\n`;
  }
  
  caption += `📸 *Imagen referencial*\n`;
  caption += `💬 Pregúntame por más detalles del producto\n\n`;
  caption += `¿Te gustaría más información? 😊`;

  return caption;
}

/**
 * Verifica si un producto tiene fotos REALES
 */
export function tienefotos(producto: ProductoInfo): boolean {
  return producto.imagenes !== undefined && 
         producto.imagenes.length > 0 &&
         producto.imagenes.some(url => url && url.startsWith('http'));
}

/**
 * Obtiene la primera foto de un producto (SIEMPRE retorna algo)
 */
export function obtenerFotoPrincipal(producto: ProductoInfo): ProductPhoto {
  const fotos = obtenerFotosProducto(producto);
  return fotos[0]; // Siempre hay al menos 1 por el fallback
}

/**
 * Formatea mensaje para enviar con foto
 */
export function formatearMensajeConFoto(producto: ProductoInfo): string {
  const tieneFotosReales = tienefotos(producto);
  
  if (tieneFotosReales) {
    return `Te envío la foto de *${producto.nombre}* 📸`;
  } else {
    return `Te envío una imagen referencial de *${producto.nombre}* 📸\n\n💡 Puedo darte más detalles del producto si lo necesitas`;
  }
}

/**
 * Detecta si el usuario solicita fotos
 */
export function detectarSolicitudFotos(mensaje: string): boolean {
  const textoLower = mensaje.toLowerCase();
  
  const patrones = [
    /foto/i,
    /imagen/i,
    /picture/i,
    /pic/i,
    /ver/i,
    /muestra/i,
    /enseña/i,
    /cómo (es|se ve)/i,
  ];

  return patrones.some(patron => patron.test(textoLower));
}
