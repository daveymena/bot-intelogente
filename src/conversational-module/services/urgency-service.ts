/**
 * ⏰ URGENCY & SCARCITY SERVICE
 * 
 * Genera tácticas de urgencia y escasez para aumentar conversiones
 * Basado en principios de psicología de ventas
 */

import { type ProductoInfo } from '../ai/promptBuilder-simple';

export type TacticaUrgencia = 
  | 'descuento_temporal'    // Descuento que expira pronto
  | 'stock_limitado'        // Pocas unidades disponibles
  | 'demanda_alta'          // Muchas personas viendo
  | 'precio_sube';          // El precio aumentará pronto

// ... (skipping interface)

  /**
   * Determina qué tácticas son apropiadas para el producto
   */
  private static obtenerTacticasDisponibles(producto: ProductoInfo): TacticaUrgencia[] {
    const tacticas: TacticaUrgencia[] = [];

    // Productos digitales: siempre disponibles, usar descuentos temporales (Anchor Pricing)
    if (this.esProductoDigital(producto)) {
      tacticas.push('descuento_temporal', 'demanda_alta');
    } else {
      // Productos físicos: Stock limitado, demanda alta, precio sube
      // NO usar descuento_temporal (Anchor Pricing) en físicos
      tacticas.push('stock_limitado', 'demanda_alta', 'precio_sube');
    }

    return tacticas;
  }

  /**
   * Genera el mensaje según la táctica
   */
  private static generarMensaje(
    tactica: TacticaUrgencia,
    producto: ProductoInfo,
    intensidad: 'baja' | 'media' | 'alta'
  ): string {
    switch (tactica) {
      case 'descuento_temporal':
        return this.mensajeDescuentoTemporal(producto, intensidad);
      case 'stock_limitado':
        return this.mensajeStockLimitado(producto, intensidad);
      case 'demanda_alta':
        return this.mensajeDemandaAlta(producto, intensidad);
      case 'precio_sube':
        return this.mensajePrecioSube(producto, intensidad);
      default:
        return '';
    }
  }

  // ... (skipping other message methods)

  private static mensajePrecioSube(producto: ProductoInfo, intensidad: string): string {
    const aumento = intensidad === 'alta' ? 30 : intensidad === 'media' ? 20 : 15;
    const precioNuevo = Math.round(producto.precio * (1 + aumento / 100));

    return `⚠️ *AVISO IMPORTANTE*
📈 El precio sube mañana
💰 Precio actual: $${producto.precio.toLocaleString('es-CO')}
📊 Precio desde mañana: $${precioNuevo.toLocaleString('es-CO')}

⏰ Aprovecha el precio actual HOY`;
  }

  // ... (skipping utilities)

  /**
   * Genera urgencia específica para objeciones de precio
   */
  static urgenciaParaObjecionPrecio(producto: ProductoInfo): string {
    // ESTRATEGIA ANCHOR PRICING
    const sobreprecio = 1.25;
    const precioLista = Math.round(producto.precio * sobreprecio);
    const precioOferta = producto.precio;
    const ahorro = precioLista - precioOferta;

    return `⏰ *OFERTA ESPECIAL SOLO PARA TI*
🔥 Precio de lista: $${precioLista.toLocaleString('es-CO')}
✅ Precio HOY: $${precioOferta.toLocaleString('es-CO')}
⚡ Ahorro: $${ahorro.toLocaleString('es-CO')}

⏰ Esta oferta NO se repetirá`;
  }


  /**
   * Genera urgencia para objeciones de tiempo
   */
  static urgenciaParaObjecionTiempo(producto: ProductoInfo): string {
    return `⏰ *¿POR QUÉ DECIDIR HOY?*

1️⃣ La oferta vence en 3 horas
2️⃣ Solo quedan 3 unidades a este precio
3️⃣ El precio sube mañana un 25%

🛡️ *SIN RIESGO:*
✅ 30 días de garantía
✅ Devolución del 100%

💡 *Pruébalo hoy, decide después*`;
  }
}
