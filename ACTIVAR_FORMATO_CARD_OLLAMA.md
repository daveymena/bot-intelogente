# 🎨 ACTIVAR FORMATO CARD CON OLLAMA

## 🎯 Objetivo

Hacer que el bot use las **plantillas de formato CARD profesional** con emojis, estructura ordenada y metodología AIDA cuando presenta productos.

## 📋 Estado Actual

### ✅ Lo que YA existe:
1. **Plantillas CARD definidas** en `src/conversational-module/ai/ollamaClient.ts`
2. **Función `generateCardResponse()`** lista para usar
3. **Prompt profesional** con formato estructurado

### ❌ Problema:
Los flujos (digital, físico, etc.) **NO están usando** estas plantillas. Están generando respuestas simples sin el formato CARD.

## 🔧 Solución

### Modificar Flujos para Usar Ollama con CARD

**Archivo a modificar:** `src/conversational-module/flows/flujoDigital.ts`

**Cambio necesario:**

```typescript
// ❌ ANTES (línea ~25-70)
export async function procesarFlujoDigital(
  mensaje: string,
  producto: ProductoInfo,
  contexto: ContextoConversacion
): Promise<string> {
  // ... código actual que usa AIMultiProvider o AIDA simple
}

// ✅ DESPUÉS
export async function procesarFlujoDigital(
  mensaje: string,
  producto: ProductoInfo,
  contexto: ContextoConversacion
): Promise<string> {
  console.log('[FlujoDigital] 🎯 PRODUCTO EN FLUJO:');
  console.log('[FlujoDigital]    Nombre:', producto.nombre);
  
  // 🤖 USAR OLLAMA CON FORMATO CARD PROFESIONAL
  try {
    console.log('[FlujoDigital] 🤖 Usando Ollama con formato CARD...');
    
    const { generateCardResponse } = await import('../ai/ollamaClient');
    
    // Preparar contexto
    const contextoTexto = contexto.historialMensajes
      ?.slice(-5)
      .map((m: any) => `${m.rol}: ${m.contenido}`)
      .join('\n') || 'Primera interacción';
    
    // Generar respuesta CARD
    const respuesta = await generateCardResponse(
      {
        nombre: producto.nombre,
        precio: producto.precio,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        imagenes: producto.imagenes
      },
      contextoTexto,
      mensaje
    );
    
    console.log('[FlujoDigital] ✅ Respuesta CARD generada');
    return respuesta;
    
  } catch (error) {
    console.error('[FlujoDigital] ❌ Error con Ollama, usando fallback');
    return generarRespuestaAIDA(producto); // Fallback existente
  }
}
```

## 📝 Formato CARD que se Generará

```
🎯 🎹 Curso Completo de Piano
💰 Precio: $50.000 COP

📘 Incluye/Características:
✅ 40 lecciones en video HD
✅ Partituras descargables
✅ Acceso de por vida
✅ Certificado al finalizar

🔗 [Link de compra]

🧠 AIDA:
✨ Atención: ¿Siempre quisiste tocar piano?
🔥 Interés: Aprende desde cero con método probado
⭐ Deseo: Más de 500 estudiantes satisfechos
👉 Acción: ¿Empezamos hoy?

💬 ¿Te gustaría conocer las formas de pago? 🔗
```

## 🚀 Cómo Aplicar

### Opción 1: Modificación Manual

1. Abrir `src/conversational-module/flows/flujoDigital.ts`
2. Reemplazar la función `procesarFlujoDigital` con el código de arriba
3. Guardar
4. Reiniciar servidor: `npm run dev`

### Opción 2: Aplicar a Todos los Flujos

Modificar también:
- `src/conversational-module/flows/flujoFisico.ts`
- `src/conversational-module/flows/flujoDropshipping.ts`
- `src/conversational-module/flows/flujoServicio.ts`

Usar el mismo patrón en cada uno.

## 🧪 Probar

```bash
# 1. Reiniciar servidor
npm run dev

# 2. Enviar mensaje de prueba
"curso de piano"

# 3. Verificar en logs
[FlujoDigital] 🤖 Usando Ollama con formato CARD...
[FlujoDigital] ✅ Respuesta CARD generada
```

## 📊 Resultado Esperado

### ✅ CON FORMATO CARD (Después)

```
Usuario: "curso de piano"

Bot:
🎯 🎹 Curso Completo de Piano
💰 Precio: $50.000 COP

📘 Incluye:
✅ 40 lecciones en video
✅ Partituras descargables
✅ Acceso de por vida

🧠 AIDA:
✨ ¿Siempre quisiste tocar piano?
🔥 Aprende desde cero con método probado
⭐ Más de 500 estudiantes satisfechos
👉 ¿Empezamos hoy?

💬 ¿Te gustaría conocer las formas de pago?
```

### ❌ SIN FORMATO CARD (Antes)

```
Usuario: "curso de piano"

Bot:
¡Excelente elección! 🎯 📚

✨ Curso Completo de Piano
💰 50.000

Acceso inmediato y de por vida
Soporte incluido

¿Te gustaría conocer los métodos de pago? 🔗
```

## 🔧 Configuración Necesaria

Asegúrate de tener en `.env`:

```env
USE_OLLAMA=true
OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
OLLAMA_MODEL=gemma2:2b
OLLAMA_TIMEOUT=30000
```

## ✅ Checklist

- [ ] `.env` tiene `USE_OLLAMA=true`
- [ ] Modificar `flujoDigital.ts`
- [ ] (Opcional) Modificar `flujoFisico.ts`
- [ ] (Opcional) Modificar otros flujos
- [ ] Reiniciar servidor
- [ ] Probar con "curso de piano"
- [ ] Verificar formato CARD en respuesta

## 🎨 Ventajas del Formato CARD

✅ **Profesional**: Estructura clara y ordenada
✅ **Visual**: Emojis estratégicos que llaman la atención
✅ **AIDA**: Metodología de ventas integrada
✅ **Completo**: Toda la información necesaria
✅ **Persuasivo**: Preguntas de cierre efectivas

## 📝 Notas

- El formato CARD se genera automáticamente con Ollama
- Si Ollama falla, usa el fallback AIDA existente
- El prompt está optimizado para productos digitales y físicos
- Puedes personalizar el prompt en `ollamaClient.ts`

---

**Fecha:** 9 de diciembre de 2025
**Estado:** Documentado - Pendiente de aplicar
**Impacto:** Alto - Mejora significativa en presentación de productos
