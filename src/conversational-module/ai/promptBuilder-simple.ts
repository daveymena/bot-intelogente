/**
 * Constructor de prompts SIMPLIFICADO para la IA
 * Respuestas cortas y directas
 */

import type { ProductKnowledgeEntry } from '../services/productKnowledgeService';

export interface ProductoInfo {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  tipoVenta?: string;
  imagenes?: string[];
  stock?: number;
  metodosPago?: string[];
  knowledge?: ProductKnowledgeEntry;
}

/**
 * Construye prompt para producto digital - VERSION PROFESIONAL
 */
export function construirPromptDigital(producto: ProductoInfo): string {
  return `PRODUCTO: ${producto.nombre}
PRECIO: ${producto.precio.toLocaleString('es-CO')} COP
DESCRIPCIÓN: ${producto.descripcion || 'Producto digital de alta calidad'}

INSTRUCCIONES PARA AGENTE PROFESIONAL:
- Actúa como un asesor comercial experimentado y confiable
- Resalta los beneficios y valor del producto
- Usa lenguaje profesional pero cercano
- Crea urgencia positiva sin presión
- Incluye garantía de satisfacción
- Termina con llamada a acción clara

ESTILO PROFESIONAL:
- Lenguaje: Formal pero amigable
- Tono: Confiado y experto
- Enfoque: Beneficios para el cliente

RESPUESTA ESPERADA:
¡Excelente elección! El ${producto.nombre} es una solución premium que te ofrece...

[Beneficios específicos del producto]

💰 Valor: ${producto.precio.toLocaleString('es-CO')} COP
✅ Digital - Acceso inmediato tras el pago
🛡️ Garantía de satisfacción de 30 días

¿Te gustaría proceder con el pago seguro?`;
}

/**
 * Construye prompt para múltiples productos - VERSION EXPERTA
 */
export function construirPromptMultiplesProductos(productos: ProductoInfo[]): string {
  const productosFormateados = productos.map((p, i) => {
    const desc = p.descripcion ? `- ${p.descripcion.substring(0, 100)}...` : '';
    return `${i + 1}. ${p.nombre} | $${p.precio.toLocaleString('es-CO')} ${desc}`;
  }).join('\n');

  return `PRODUCTOS DISPONIBLES:
${productosFormateados}

INSTRUCCIONES PARA ASESOR EXPERTO (NO ROBOT):
- Eres un consultor de alto nivel, no un bot simple.
- Tu objetivo es AYUDAR al cliente a elegir la mejor opción, no solo listar cosas.
- Usa un tono seguro, directo y profesional.
- FORMATO VISUAL: Usa negritas (*texto*), emojis estratégicos y listas limpias.
- Si los productos son similares, explica brevemente la diferencia o cuál recomiendas.
- NO uses frases de relleno como "Espero que esto ayude". Ve al grano.

ESTRUCTURA DE RESPUESTA REQUERIDA:
1. Frase de apertura segura y experta (ej: "He seleccionado las mejores opciones para ti:")
2. Lista de productos (Máximo 3-4 destacados si hay muchos):
   * *Nombre del Producto* - Precio
     "Breve razón de por qué es bueno o característica clave"
3. Cierre con pregunta de cierre (ej: "¿Cuál prefieres para enviarte los detalles?")

RESPUESTA ESPERADA (Ejemplo):
Aquí tienes las mejores opciones disponibles:

1️⃣ *Curso de Piano Master* - $50.000
   "Ideal si buscas aprender desde cero con metodología práctica."

2️⃣ *Pack Músico Pro* - $80.000
   "Incluye piano, guitarra y teoría musical. La mejor relación costo-beneficio."

¿Por cuál te gustaría empezar?`;
}

/**
 * Construye prompt para solicitud de pago - SIMPLIFICADO
 */
export function construirPromptPago(producto: ProductoInfo): string {
  return `GENERAR LINK DE PAGO PARA:
${producto.nombre}
💰 ${producto.precio.toLocaleString('es-CO')} COP

INSTRUCCIONES:
- Generar link de pago real
- NO inventar información
- Respuesta simple y directa

¿Te gustaría el link de pago?`;
}
