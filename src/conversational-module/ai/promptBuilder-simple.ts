/**
 * Constructor de prompts ULTRA SIMPLIFICADOS
 * SIN IA - Solo respuestas directas
 */

export interface ProductoInfo {
  id: string | number; // ✅ Puede ser string o number
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  tipoVenta?: string;
  imagenes?: string[];
  stock?: number;
  metodosPago?: string[];
}

/**
 * Respuesta DIRECTA para productos digitales (SIN IA)
 * SOLO usa información REAL de la base de datos
 */
export function respuestaDirectaProductoDigital(producto: ProductoInfo): string {
  let respuesta = `✅ *${producto.nombre}*\n\n`;
  
  // Agregar descripción REAL si existe
  if (producto.descripcion && producto.descripcion.trim()) {
    respuesta += `📋 ${producto.descripcion}\n\n`;
  }
  
  respuesta += `💰 *Precio:* ${producto.precio.toLocaleString('es-CO')} COP\n`;
  respuesta += `📲 *Entrega:* Digital inmediata\n\n`;
  respuesta += `¿Quieres comprarlo? 🔗`;
  
  return respuesta;
}

/**
 * Respuesta DETALLADA para productos digitales
 * Cuando el cliente pide "más información"
 */
export function respuestaDetalladaProductoDigital(producto: ProductoInfo): string {
  let respuesta = `━━━━━━━━━━━━━━━━━━━━━━\n`;
  respuesta += `✅ *${producto.nombre}*\n`;
  respuesta += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  // Descripción REAL
  if (producto.descripcion && producto.descripcion.trim()) {
    respuesta += `📋 *Descripción:*\n${producto.descripcion}\n\n`;
  }
  
  respuesta += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  respuesta += `💰 *Precio:* ${producto.precio.toLocaleString('es-CO')} COP\n\n`;
  respuesta += `📲 *Tipo:* Producto digital\n`;
  respuesta += `⚡ *Entrega:* Inmediata después del pago\n`;
  respuesta += `📱 *Envío:* Por WhatsApp o Email\n\n`;
  respuesta += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  respuesta += `¿Quieres comprarlo? Te genero el link de pago 🔗`;
  
  return respuesta;
}

/**
 * Respuesta DIRECTA para solicitud de pago (SIN IA)
 */
export function respuestaDirectaPago(producto: ProductoInfo): string {
  return `¡Perfecto! Te genero el link de pago

💰 ${producto.precio.toLocaleString('es-CO')} COP

⏳ Un momento...`;
}
