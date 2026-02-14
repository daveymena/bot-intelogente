# 🔧 Solución: Bot se Queda Pegado en WhatsApp

## 🎯 Problema Identificado

El bot responde a algunas preguntas pero se queda "pegado" en otras porque:

1. **Timeouts en Supabase** - Las búsquedas de productos pueden tardar mucho
2. **Errores en Groq API** - Rate limits o API keys agotadas
3. **Herramientas sin fallback** - Si una herramienta falla, no hay plan B
4. **Falta de timeouts** - Las operaciones pueden colgarse indefinidamente

## ✅ Soluciones Implementadas

### 1. **Sistema de Timeouts Globales**

```typescript
// Timeout wrapper para cualquier operación
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => 
      setTimeout(() => resolve(fallbackValue), timeoutMs)
    )
  ]);
}
```

### 2. **Fallback en Búsqueda de Productos**

**Antes:**
```typescript
// Si Supabase falla, el bot se queda sin respuesta
const supabaseResults = await SupabaseProductService.searchProducts(...);
```

**Después:**
```typescript
// Timeout de 3 segundos + fallback a búsqueda local
const supabaseResults = await withTimeout(
  SupabaseProductService.searchProducts(...),
  3000,
  []
);

if (supabaseResults.length === 0) {
  // Fallback: Búsqueda local con Fuse.js
  const localResults = await localSearch(...);
}
```

### 3. **Respuesta de Emergencia**

Si TODO falla, el bot siempre responde:

```typescript
if (!response || response.trim().length === 0) {
  response = "¡Hola! Soy David. Estoy aquí para ayudarte. " +
            "¿Podrías reformular tu pregunta? 😊";
}
```

### 4. **Logging Mejorado**

Ahora puedes ver exactamente dónde se atora:

```
[OpenClaw] 🔍 Buscando en Supabase...
[OpenClaw] ⏱️ Timeout en Supabase (3s), usando fallback local
[OpenClaw] ✅ Encontrados 5 productos localmente
```

## 🚀 Cómo Aplicar la Solución

### Opción 1: Aplicar Parche Completo (Recomendado)

```bash
# 1. Crear archivo de mejoras
cd c:\davey\bot-whatsapp

# 2. Aplicar el parche
npm run apply-timeout-fix

# 3. Reiniciar el bot
npm run dev
```

### Opción 2: Aplicar Manualmente

Edita `src/lib/bot/openclaw-orchestrator.ts`:

1. **Agregar función de timeout** (línea 15):
```typescript
// Función auxiliar para timeout
const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T,
  operationName: string = 'Operation'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => {
        console.log(`[OpenClaw] ⏱️ Timeout en ${operationName} (${timeoutMs}ms)`);
        resolve(fallbackValue);
      }, timeoutMs);
    })
  ]);
};
```

2. **Modificar búsqueda de Supabase** (línea 68-93):
```typescript
// Antes:
const supabaseResults = await SupabaseProductService.searchProducts(...);

// Después:
const supabaseResults = await withTimeout(
  SupabaseProductService.searchProducts(context.userId, searchTerm),
  3000, // 3 segundos máximo
  [],
  'Supabase Search'
);
```

3. **Modificar llamada a Groq** (línea 950+):
```typescript
// Agregar timeout a la llamada de Groq
const completion = await withTimeout(
  groq.chat.completions.create({...}),
  10000, // 10 segundos máximo
  null,
  'Groq API'
);

if (!completion) {
  // Fallback: respuesta predeterminada
  return "Disculpa, estoy teniendo problemas técnicos. " +
         "¿Podrías intentar de nuevo? 😊";
}
```

## 🔍 Debugging

Si el bot sigue teniendo problemas, revisa los logs:

```bash
# Ver logs en tiempo real
npm run dev

# Buscar errores específicos
# En los logs verás:
# ✅ [OpenClaw] ✅ Operación exitosa
# ⏱️ [OpenClaw] ⏱️ Timeout detectado
# ❌ [OpenClaw] ❌ Error crítico
```

## 📋 Checklist de Verificación

- [ ] Timeouts agregados a Supabase (3s)
- [ ] Timeouts agregados a Groq API (10s)
- [ ] Fallback local funciona
- [ ] Respuesta de emergencia configurada
- [ ] Logs mejorados activos
- [ ] Bot reiniciado

## 🎯 Resultado Esperado

**Antes:**
- Usuario: "Tienes cursos de piano?"
- Bot: [Se queda pensando... sin respuesta]

**Después:**
- Usuario: "Tienes cursos de piano?"
- Bot: "¡Claro! Tengo estos cursos de piano disponibles:
  1. Curso de Piano Avanzado - $50,000
  2. Mega Pack 11 (incluye piano) - $20,000
  ¿Cuál te interesa?"

## 📞 Soporte

Si el problema persiste:
1. Revisa los logs en la consola
2. Verifica que Supabase esté activo
3. Confirma que las API keys de Groq sean válidas
4. Contacta al equipo técnico con los logs

---

**Última actualización:** 2026-02-13
**Versión:** 1.0
