# 🚀 Solución Rápida: Bot que se Queda Pegado

## ⚡ Problema
El bot se queda "pegado" y no responde a algunas preguntas porque:
- Las búsquedas en Supabase tardan mucho
- No hay timeouts configurados
- Faltan fallbacks cuando algo falla

## ✅ Solución Aplicada

He agregado **timeouts automáticos** al código para que el bot SIEMPRE responda, incluso si algo falla.

### Cambios Realizados

#### 1. Función de Timeout (✅ Aplicado)
```typescript
// Ahora el bot tiene un timeout helper que evita quedarse colgado
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
                console.log(`[OpenClaw] ⏱️ Timeout en ${operationName} (${timeoutMs}ms) - usando fallback`);
                resolve(fallbackValue);
            }, timeoutMs);
        })
    ]);
};
```

#### 2. Timeout en Búsqueda de Productos (✅ Aplicado)
```typescript
// Antes: Podía quedarse esperando indefinidamente
const supabaseResults = await SupabaseProductService.searchProducts(...);

// Ahora: Máximo 3 segundos, luego usa búsqueda local
const supabaseResults = await withTimeout(
    SupabaseProductService.searchProducts(context.userId, searchTerm),
    3000, // 3 segundos máximo
    [], // Si falla, retornar array vacío y usar búsqueda local
    'Supabase Product Search'
);
```

## 🔍 Qué Hacer Ahora

### Opción 1: Reiniciar el Bot (Recomendado)

```bash
# Detener el bot actual (Ctrl+C si está corriendo)
# Luego reiniciar:
npm run dev
```

### Opción 2: Verificar que Funciona

Prueba con estos mensajes en WhatsApp:

1. **Búsqueda general:**
   - "Tienes cursos de piano?"
   - "Qué laptops tienes?"
   - "Muéstrame megapacks"

2. **Búsqueda específica:**
   - "Mega Pack 11"
   - "Curso de Piano Avanzado"

3. **Preguntas ambiguas:**
   - "Busco un teclado" (debería preguntar: ¿computadora o musical?)
   - "Algo para trabajar" (debería preguntar más detalles)

### Opción 3: Ver Logs en Tiempo Real

```bash
# Ejecuta el bot y observa los logs
npm run dev

# Verás mensajes como:
# ✅ [OpenClaw] ✅ Supabase encontró 5 productos
# ⏱️ [OpenClaw] ⏱️ Timeout en Supabase (3000ms) - usando fallback
# 🔍 [OpenClaw] 🔍 Usando búsqueda local (fallback)
```

## 📊 Mejoras Adicionales Pendientes

### Para Mejorar Aún Más (Opcional)

1. **Aumentar el timeout de Supabase** si tu conexión es lenta:
   ```typescript
   // En línea ~95 de openclaw-orchestrator.ts
   3000, // Cambiar a 5000 si necesitas más tiempo
   ```

2. **Agregar respuesta de emergencia** si TODO falla:
   ```typescript
   // Ya está implementado en línea ~748
   if (!response || response.trim().length === 0) {
       response = "¡Hola! Soy David. Estoy aquí para ayudarte. " +
                 "¿Podrías reformular tu pregunta? 😊";
   }
   ```

3. **Monitorear errores** en los logs:
   ```bash
   # Buscar líneas con ❌ o ⏱️
   npm run dev | grep -E "(❌|⏱️)"
   ```

## 🎯 Resultado Esperado

### Antes:
```
Usuario: "Tienes cursos de piano?"
Bot: [Esperando... esperando... sin respuesta] ❌
```

### Ahora:
```
Usuario: "Tienes cursos de piano?"
Bot: "¡Claro! Tengo estos cursos disponibles:
      1. Curso de Piano Avanzado - $50,000
      2. Mega Pack 11 (incluye piano) - $20,000
      ¿Cuál te interesa?" ✅
```

## 🐛 Troubleshooting

### Si el bot sigue sin responder:

1. **Verifica que Supabase esté activo:**
   ```bash
   # Revisa las variables de entorno
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   ```

2. **Verifica las API keys de Groq:**
   ```bash
   # Asegúrate de tener al menos una key válida
   echo $GROQ_API_KEY
   ```

3. **Revisa los logs del bot:**
   - Busca mensajes con `⏱️ Timeout` - indica que algo está tardando mucho
   - Busca mensajes con `❌ Error` - indica que algo falló
   - Busca mensajes con `🔍 Fallback` - indica que usó plan B

4. **Aumenta los timeouts temporalmente:**
   ```typescript
   // Para debugging, aumenta los timeouts:
   3000 → 10000 // 10 segundos
   ```

## 📞 Siguiente Paso

Si después de reiniciar el bot sigue teniendo problemas:

1. Comparte los logs de la consola
2. Indica qué mensaje específico no funciona
3. Verifica que Supabase y Groq estén configurados correctamente

---

**Estado:** ✅ Timeouts aplicados
**Próximo paso:** Reiniciar el bot con `npm run dev`
**Fecha:** 2026-02-13
