# PARTE 4: IMPLEMENTACIÓN PASO A PASO

## 📝 PASO 1: Crear Enhanced Local Bot

### Archivo: `src/lib/enhanced-local-bot.ts`

```typescript
/**
 * BOT LOCAL ROBUSTO Y PERFECTO
 * Maneja TODAS las respuestas posibles sin usar IA
 */

import { db } from './db'

interface LocalResponse {
  handled: boolean
  message?: string
  category?: string
}

export class EnhancedLocalBot {
  
  /**
   * Intentar manejar el mensaje localmente
   */
  static async handleMessage(
    message: string,
    userId: string
  ): Promise<LocalResponse> {
    const normalized = message.toLowerCase().trim()
    
    // 1. Saludos
    if (this.isSaludo(normalized)) {
      return {
        handled: true,
        message: await this.getSaludoResponse(userId),
        category: 'saludo'
      }
    }
    
    // 2. Despedidas
    if (this.isDespedida(normalized)) {
      return {
        handled: true,
        message: this.getDespedidaResponse(),
        category: 'despedida'
      }
    }
    
    // 3. Métodos de pago (info)
    if (this.isPreguntaMetodosPago(normalized)) {
      return {
        handled: true,
        message: this.getMetodosPagoResponse(),
        category: 'metodos_pago'
      }
    }
    
    // 4. Envío
    if (this.isPreguntaEnvio(normalized)) {
      return {
        handled: true,
        message: this.getEnvioResponse(),
        category: 'envio'
      }
    }
    
    // 5. Garantía
    if (this.isPreguntaGarantia(normalized)) {
      return {
        handled: true,
        message: this.getGarantiaResponse(),
        category: 'garantia'
      }
    }
    
    // 6. Horarios
    if (this.isPreguntaHorario(normalized)) {
      return {
        handled: true,
        message: this.getHorarioResponse(),
        category: 'horario'
      }
    }
    
    // 7. Ubicación
    if (this.isPreguntaUbicacion(normalized)) {
      return {
        handled: true,
        message: this.getUbicacionResponse(),
        category: 'ubicacion'
      }
    }
    
    // 8. Disponibilidad
    if (this.isPreguntaDisponibilidad(normalized)) {
      return {
        handled: true,
        message: this.getDisponibilidadResponse(),
        category: 'disponibilidad'
      }
    }
    
    // 9. Agradecimientos
    if (this.isAgradecimiento(normalized)) {
      return {
        handled: true,
        message: this.getAgradecimientoResponse(),
        category: 'agradecimiento'
      }
    }
    
    // 10. Confirmaciones
    if (this.isConfirmacion(normalized)) {
      return {
        handled: true,
        message: this.getConfirmacionResponse(),
        category: 'confirmacion'
      }
    }
    
    // 11. Sobre el negocio
    if (this.isPreguntaNegocio(normalized)) {
      return {
        handled: true,
        message: this.getNegocioResponse(),
        category: 'negocio'
      }
    }
    
    // No puede manejar localmente
    return { handled: false }
  }
  
  // ==========================================
  // DETECCIÓN DE PATRONES
  // ==========================================
  
  private static isSaludo(text: string): boolean {
    const patrones = [
      /^(hola|holi|holaaa|holaa|hey|ey|epa)\b/i,
      /^(buenas|buenos días|buenas tardes|buenas noches|buen día)\b/i,
      /^(que tal|qué tal|como estas|cómo estás|como va)\b/i,
      /^(quiubo|quihubo|qué hubo|que hubo|bien o qué)\b/i,
      /^(todo bien|todo bn|q mas|que mas|qué más)\b/i,
      /^(👋|🙋|✋)/
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isDespedida(text: string): boolean {
    const patrones = [
      /^(adiós|adios|chao|chau|hasta luego|nos vemos)\b/i,
      /^(hasta pronto|bye|bay|bai|chaoo|byee)\b/i,
      /^(nos vidrios|nos pillamos|listo|vale)\b/i,
      /^(hablamos|te escribo)\b/i,
      /^(👋|✌️|🙏)/
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isPreguntaMetodosPago(text: string): boolean {
    // NO debe ser solicitud de pago (eso lo maneja otro servicio)
    const esSolicitudPago = /\b(quiero pagar|voy a pagar|dame el link|genera|generar)\b/i.test(text)
    if (esSolicitudPago) return false
    
    const patrones = [
      /\b(cómo|como)\s+(puedo\s+)?(pago|pagar)\b/i,
      /\b(qué|que|cuáles|cuales)\s+(métodos|metodos|formas|opciones)\s+de\s+pago\b/i,
      /\b(aceptan|tienen|manejan)\s+(nequi|daviplata|tarjeta|mercadopago|paypal|transferencia|efectivo)\b/i,
      /\b(puedo\s+pagar\s+con)\s+(nequi|daviplata|tarjeta|mercadopago|paypal)\b/i,
      /\b(métodos|metodos|formas|opciones)\s+pago\b/i
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isPreguntaEnvio(text: string): boolean {
    const patrones = [
      /\b(hacen|tienen|hay)\s+(envíos|envios|envío|envio)\b/i,
      /\b(cuánto|cuanto)\s+(cuesta|vale|es)\s+(el\s+)?(envío|envio)\b/i,
      /\b(envían|envian)\s+(a\s+toda\s+colombia|a\s+todo\s+el\s+país)\b/i,
      /\b(a\s+dónde|a\s+donde)\s+(envían|envian)\b/i,
      /\b(cuánto|cuanto)\s+(demora|tarda)\s+(el\s+)?(envío|envio|entrega)\b/i,
      /\b(envío|envio|envíos|envios|entrega|domicilio|delivery|shipping)\b/i
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isPreguntaGarantia(text: string): boolean {
    const patrones = [
      /\b(tienen|hay|incluye)\s+garantía\b/i,
      /\b(cuánto|cuanto)\s+dura\s+(la\s+)?garantía\b/i,
      /\b(qué|que)\s+cubre\s+(la\s+)?garantía\b/i,
      /\b(cómo|como)\s+funciona\s+(la\s+)?garantía\b/i,
      /\bgarantía\b/i,
      /\bgarantia\b/i,
      /\bwarranty\b/i
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isPreguntaHorario(text: string): boolean {
    const patrones = [
      /\b(a\s+qué|a\s+que)\s+hora\s+(abren|atienden|cierran)\b/i,
      /\b(cuál|cual)\s+es\s+el\s+horario\b/i,
      /\b(hasta\s+qué|hasta\s+que)\s+hora\s+atienden\b/i,
      /\b(están|estan)\s+abiertos\b/i,
      /\b(atienden|abren)\s+(los\s+)?(domingos|sábados|sabados|festivos)\b/i,
      /\bhorario\b/i,
      /\bhorarios\b/i
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isPreguntaUbicacion(text: string): boolean {
    const patrones = [
      /\b(dónde|donde)\s+(están|estan|quedan)\b/i,
      /\b(cuál|cual)\s+es\s+(la\s+)?dirección\b/i,
      /\b(dirección|direccion|ubicación|ubicacion)\b/i,
      /\b(address|location)\b/i
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isPreguntaDisponibilidad(text: string): boolean {
    const patrones = [
      /\b(está|esta)\s+disponible\b/i,
      /\b(tienen|hay)\s+(en\s+)?stock\b/i,
      /\b(hay|existe)\s+disponibilidad\b/i,
      /\b(cuándo|cuando)\s+(llega|tienen)\b/i,
      /\b(lo\s+tienen|lo\s+tienen\s+disponible)\b/i,
      /\bdisponible\b/i,
      /\bdisponibilidad\b/i,
      /\bstock\b/i
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isAgradecimiento(text: string): boolean {
    const patrones = [
      /^(gracias|muchas gracias|mil gracias|te agradezco)\b/i,
      /^(thank you|thanks|thx)\b/i,
      /^(🙏|👍|👌)/
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isConfirmacion(text: string): boolean {
    const patrones = [
      /^(ok|okay|vale|entendido|perfecto|listo|dale)\b/i,
      /^(si|sí|claro|de acuerdo|está bien|esta bien)\b/i,
      /^(👍|👌|✅|✔️)/
    ]
    return patrones.some(p => p.test(text))
  }
  
  private static isPreguntaNegocio(text: string): boolean {
    const patrones = [
      /\b(quiénes|quienes)\s+son\b/i,
      /\b(qué|que)\s+venden\b/i,
      /\b(a\s+qué|a\s+que)\s+se\s+dedican\b/i,
      /\bsobre\s+ustedes\b/i,
      /\b(son\s+)?(confiables|de\s+confianza|legítimos|legitimos)\b/i,
      /\binformación\b/i,
      /\binformacion\b/i
    ]
    return patrones.some(p => p.test(text))
  }
  
  // ==========================================
  // GENERACIÓN DE RESPUESTAS
  // ==========================================
  
  private static async getSaludoResponse(userId: string): Promise<string> {
    // Obtener nombre del negocio de la BD
    const settings = await db.botSettings.findUnique({
      where: { userId }
    })
    
    const businessName = settings?.businessName || 'Tecnovariedades D&S'
    
    return `¡Hola! 👋 Bienvenido a ${businessName} 😊

Soy tu asistente virtual y estoy aquí para ayudarte con:
💻 Laptops y computadores
🎹 Cursos digitales
📦 Megapacks de recursos
🏍️ Motos

¿En qué puedo ayudarte hoy?`
  }
  
  private static getDespedidaResponse(): string {
    return `¡Hasta pronto! 👋 Fue un gusto ayudarte 😊

Si necesitas algo más, aquí estaré.
📱 WhatsApp: +57 300 556 0186

¡Que tengas un excelente día! ✨`
  }
  
  private static getMetodosPagoResponse(): string {
    return `💳 *Métodos de Pago Disponibles*

Puedes pagar con cualquiera de estos métodos:

📱 *NEQUI*
   Número: 300 556 0186
   Transferencia instantánea

💰 *DAVIPLATA*
   Número: 300 556 0186
   Transferencia instantánea

🏦 *BANCOLOMBIA*
   Transferencia bancaria
   Te envío los datos al confirmar

💳 *MERCADOPAGO*
   Link de pago seguro
   Tarjetas de crédito/débito

🌐 *PAYPAL*
   Pagos internacionales
   Link de pago seguro

✅ Todos los métodos son seguros y confiables

¿Con cuál prefieres pagar? 😊`
  }
  
  // ... Continuar con las demás respuestas
}
```

---

Continúa en PARTE 5...
