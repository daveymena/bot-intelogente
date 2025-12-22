# Problema: IA Inventa Información de Pagos

## Síntoma

Cuando el cliente dice "quiero comprar", recibe una respuesta INVENTADA por la IA:

```
¡Genial! 🎉
Puedes pagar el curso de piano completo de 60.000 COP a través de Mercado Pago.

* **Total a pagar:** 60.000 COP
* **Plazo de pago:** 12 meses sin intereses ❌ FALSO
* **Comisión Mercado Pago:** 5% (aproximadamente 3.000 COP) ❌ FALSO

Para pagar con Mercado Pago, sigue estos pasos:
1. **Visita el sitio de Mercado Pago**: *www.mercadopago.com* ❌ FALSO
2. **Crea una cuenta**: si no tienes una cuenta... ❌ FALSO
...
```

## Lo que DEBERÍA enviar

```
¡Perfecto! Te genero el link de pago

💰 60,000 COP

⏳ Un momento...

[LINK REAL DE MERCADOPAGO]
[LINK REAL DE PAYPAL]
```

## Causa

Hay DOS sistemas compitiendo:

### Sistema 1: Conversacional (CORRECTO) ✅
- Ubicación: `src/conversational-module/ai/conversacionController.ts`
- Función: `generarInformacionPago()`
- Comportamiento: Genera links REALES con `BotPaymentLinkGenerator`
- Estado: ✅ CORREGIDO con logs detallados

### Sistema 2: IA Vieja (INCORRECTO) ❌
- Ubicación: Desconocida (probablemente `ai-service.ts` o similar)
- Comportamiento: Usa IA que INVENTA instrucciones falsas
- Estado: ❌ ACTIVO y causando problemas

## Diagnóstico Necesario

Para identificar dónde está el problema, necesito ver los logs completos cuando envías "quiero comprar".

### Logs Esperados (CORRECTO):

```
[Baileys] 📨 Mensaje procesado de XXX: quiero comprar
[Baileys] 🚀 Usando NUEVO SISTEMA CONVERSACIONAL MODULAR
[Conversación] Usuario: XXX, Mensaje: quiero comprar
[Conversación] Intención detectada: solicitud_pago
[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[InformacionPago] 💳 SOLICITUD DE PAGO DETECTADA
[InformacionPago] 🔍 Buscando producto en contexto...
[InformacionPago] ultimoProductoId: cmhpw941q0000kmp85qvjm0o5-curso-completo-de-piano-online
[InformacionPago] ultimoProductoNombre: Curso Completo de Piano Online
[InformacionPago] ✅ Producto encontrado: Curso Completo de Piano Online
[InformacionPago] 💰 Precio: 60000
[InformacionPago] 🔄 Generando links REALES de pago...
[InformacionPago] ⚠️  NO USAR IA - SOLO LINKS REALES
[BotPaymentLinkGenerator] Generando links...
[InformacionPago] ✅ Links REALES generados exitosamente
[InformacionPago] 📤 Enviando links reales (no inventados)
[InformacionPago] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Baileys] ✅ Respuesta enviada
```

### Logs Problemáticos (si aparecen):

```
[AI] Generando respuesta...
[AIService] generateResponse...
[Groq] Llamando a IA...
```

Si ves estos logs DESPUÉS de `[InformacionPago]`, significa que hay un sistema viejo que está interceptando y usando IA.

## Solución Temporal

Mientras identificamos el problema, puedes:

1. **Desactivar completamente la IA** para solicitudes de pago
2. **Forzar el uso del generador de links reales**

## Archivos Modificados

1. ✅ `src/conversational-module/ai/conversacionController.ts`
   - Función `generarInformacionPago()` con logs detallados
   - NO usa IA, solo `BotPaymentLinkGenerator`

## Próximos Pasos

1. **Enviar "quiero comprar"** por WhatsApp
2. **Copiar TODOS los logs** de la consola
3. **Buscar** si aparece `[AI]` o `[AIService]` después de `[InformacionPago]`
4. **Identificar** qué sistema está llamando a la IA
5. **Desactivar** ese sistema para solicitudes de pago

## Pregunta Clave

¿Los logs muestran `[InformacionPago]` cuando envías "quiero comprar"?

- **SÍ** → El sistema conversacional se está ejecutando, pero algo más está usando IA después
- **NO** → El sistema conversacional no se está ejecutando, hay otro sistema interceptando

## Solución Definitiva

Una vez identificado el sistema que usa IA, hay que:

1. Desactivar la IA para intención `solicitud_pago`
2. Forzar el uso de `BotPaymentLinkGenerator`
3. Asegurar que SOLO se envíen links reales

## Código de Verificación

Para verificar que el generador de links funciona:

```bash
npx tsx scripts/test-generacion-links-pago.ts
```

Esto debe generar links REALES de MercadoPago y PayPal.
