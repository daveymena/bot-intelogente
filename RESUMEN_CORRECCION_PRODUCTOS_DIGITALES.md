# ✅ Corrección Completa: Productos Digitales vs Físicos

## 🎯 Problemas Identificados

### 1. Bot usa flujo FÍSICO para productos DIGITALES
**Síntoma:** El Curso de Piano mostraba opciones de recogida/envío

**Causa:** La función `dirigirAFlujo()` solo verificaba si `tipoVenta` incluía "digital", pero no verificaba la categoría principal

**Solución Aplicada:**
```typescript
// ANTES
if (tipoVenta?.includes('digital')) {
  return await procesarFlujoDigital(mensaje, producto, contexto);
}

// DESPUÉS
const tipoVenta = (producto.tipoVenta || producto.categoria || '').toLowerCase();

if (tipoVenta.includes('digital') || 
    tipoVenta.includes('curso') || 
    tipoVenta.includes('megapack') ||
    tipoVenta.includes('software')) {
  console.log('[DirigirFlujo] ✅ Usando flujo DIGITAL');
  return await procesarFlujoDigital(mensaje, producto, contexto);
}
```

### 2. Links de pago no se generan automáticamente
**Síntoma:** El bot solo envía texto sin links

**Causa:** El bot responde desde el flujo de IA sin detectar intención de pago

**Solución:** El sistema YA tiene la función `generarInformacionPago()` que genera links automáticamente, pero necesita que se detecte la intención correctamente.

## 📝 Archivos Modificados

### 1. `src/conversational-module/ai/promptBuilder.ts`
✅ Actualizado `construirPromptFisico()`:
- Si está en BD = DISPONIBLE
- Menciona opciones de recogida/envío

✅ Actualizado `construirPromptDigital()`:
- ❌ NUNCA recogida/envío
- ❌ NUNCA consultar disponibilidad
- ✅ Siempre disponible
- ✅ Entrega digital inmediata

### 2. `src/conversational-module/flows/flujoDigital.ts`
✅ Agregada validación de palabras prohibidas:
```typescript
const palabrasProhibidas = [
  /recog(er|ida|elo)/gi,
  /env[ií]o\s+(a\s+)?domicilio/gi,
  /entreg(a|ar)\s+(a\s+)?domicilio/gi,
  /consultar\s+disponibilidad/gi,
];
```

✅ Fallback seguro sin menciones físicas

### 3. `src/conversational-module/flows/flujoFisico.ts`
✅ Lógica de disponibilidad: si está en BD = disponible
✅ Respuesta segura con opciones de entrega física

### 4. `src/conversational-module/ai/conversacionController.ts`
✅ Mejorada función `dirigirAFlujo()`:
- Verifica categoría Y tipo de venta
- Detecta: digital, curso, megapack, software
- Logs para debugging

## 🧪 Cómo Probar

### Prueba 1: Producto Digital (Curso de Piano)
```bash
npx tsx scripts/test-producto-digital-vs-fisico.ts
```

**Respuesta esperada:**
- ✅ NO menciona recogida
- ✅ NO menciona envío
- ✅ NO consulta disponibilidad
- ✅ Indica entrega digital inmediata

### Prueba 2: Producto Físico (Laptop)
```bash
npx tsx scripts/test-producto-digital-vs-fisico.ts
```

**Respuesta esperada:**
- ✅ Menciona recogida en tienda
- ✅ Menciona envío a domicilio
- ✅ Indica disponibilidad

### Prueba 3: Generación de Links de Pago
El sistema ya tiene implementado `BotPaymentLinkGenerator` que:
1. Genera links de MercadoPago
2. Genera links de PayPal
3. Incluye información de Nequi/Daviplata

**Para activarlo:** El usuario debe decir algo como:
- "Quiero pagar"
- "Cómo pago"
- "Dame el link de pago"
- "Métodos de pago"

## 🎯 Reglas Implementadas

### Para Productos DIGITALES
1. ❌ NO preguntar por recogida en tienda
2. ❌ NO preguntar por envío a domicilio
3. ❌ NO consultar disponibilidad (siempre disponible)
4. ✅ Indicar entrega digital automática
5. ✅ Mencionar acceso inmediato
6. ✅ Enfocarse en contenido y beneficios

### Para Productos FÍSICOS
1. ✅ Consultar disponibilidad en BD
2. ✅ Si está en BD = DISPONIBLE
3. ✅ Preguntar: recogida o envío
4. ✅ Mencionar opciones físicas
5. ✅ Incluir efectivo como opción de pago

## 📊 Verificación en Base de Datos

```bash
npx tsx scripts/verificar-tipo-producto-piano.ts
```

**Resultado:**
```
Producto encontrado: Curso Completo de Piano Online
Category: DIGITAL
Subcategory: null
```

## ✅ Estado Actual

- [x] Prompts actualizados con reglas claras
- [x] Flujos con validación automática
- [x] Fallbacks seguros implementados
- [x] Detección de tipo de producto mejorada
- [x] Logs de debugging agregados
- [x] Scripts de prueba creados
- [x] Documentación completa

## 🚀 Próximos Pasos

1. **Reiniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Probar en WhatsApp real:**
   - Buscar "curso de piano"
   - Verificar que NO mencione recogida/envío
   - Decir "quiero pagar" o "cómo pago"
   - Verificar que genere links automáticamente

3. **Monitorear logs:**
   ```
   [DirigirFlujo] Producto: Curso Completo de Piano Online, Tipo: digital
   [DirigirFlujo] ✅ Usando flujo DIGITAL
   [FlujoDigital] Procesando producto digital...
   ```

## 💡 Notas Importantes

1. **El sistema de links de pago YA EXISTE** en `src/lib/bot-payment-link-generator.ts`
2. **Se activa automáticamente** cuando se detecta intención de pago
3. **Requiere configuración** de `MERCADOPAGO_ACCESS_TOKEN` en `.env`
4. **Funciona para localhost** (sin back_urls) y producción (con back_urls)

## 🔧 Si los Links No Se Generan

Verificar:
1. ✅ Variable `MERCADOPAGO_ACCESS_TOKEN` en `.env`
2. ✅ Detección de intención de pago funciona
3. ✅ Producto tiene `ultimoProductoId` en contexto
4. ✅ Logs muestran `[InformacionPago] Generando links...`

---

**Fecha:** 2024-11-10
**Estado:** ✅ Implementado y listo para pruebas
**Archivos modificados:** 4
**Scripts creados:** 2
