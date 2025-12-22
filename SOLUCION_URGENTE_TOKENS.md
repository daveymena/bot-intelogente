# 🚨 SOLUCIÓN URGENTE: Error de Tokens

## Problemas Actuales

1. ❌ **Error 413** - Excede límite de 6000 tokens de Groq
2. ❌ **No encuentra productos** - ✅ SOLUCIONADO (productos ahora pertenecen al usuario correcto)

## ✅ Productos Corregidos

Ejecutado: `scripts/corregir-usuario-productos-actual.ts`
- 77 productos ahora pertenecen a `daveymena16@gmail.com`
- El bot ahora puede encontrar productos

## ⚠️ Problema de Tokens - REQUIERE ACCIÓN MANUAL

El prompt del sistema es demasiado largo (~5000 tokens). Necesitas reemplazar la función `buildSystemPrompt` en `src/lib/ai-service.ts`.

### Paso 1: Abrir el archivo
```
src/lib/ai-service.ts
```

### Paso 2: Buscar la función
Busca: `private static buildSystemPrompt`
(Está en la línea 402 aproximadamente)

### Paso 3: Reemplazar TODA la función
Elimina desde la línea 402 hasta la línea 929 (toda la función) y reemplázala con:

```typescript
  // Construir prompt del sistema COMPACTO
  private static buildSystemPrompt(businessContext: string, products: any[]): string {
    // Solo mostrar resumen de productos (sin detalles para ahorrar tokens)
    const productsInfo = products.length > 0
      ? `Productos disponibles: ${products.slice(0, 3).map(p => p.name).join(', ')}${products.length > 3 ? ` y ${products.length - 3} más` : ''}`
      : 'Sin productos'

    return `Eres asistente de ventas profesional de Tecnovariedades D&S en WhatsApp.

${businessContext}
${productsInfo}

REGLAS ESENCIALES:
1. Responde SOLO sobre productos del catálogo
2. Lee mensajes anteriores para mantener contexto
3. Productos DIGITALES (cursos, megapacks): tienen links de pago
4. Productos FÍSICOS (laptops, motos): contacto +57 304 274 8687
5. Máximo 5-6 líneas por respuesta
6. Usa emojis moderadamente
7. Si no tienes el producto: "No tengo ese producto"
8. Si preguntan precio/link sin contexto: "¿De cuál producto?"

Contacto: +57 304 274 8687
Ubicación: Centro Comercial El Diamante 2, San Nicolás, Cali`
  }
```

### Paso 4: Guardar y reiniciar
1. Guardar el archivo (Ctrl+S)
2. El servidor se reiniciará automáticamente
3. Probar enviando mensajes

## Resultado Esperado

- Tokens usados: ~2000-3000 (dentro del límite de 6000)
- El bot responderá correctamente
- Encontrará productos
- No más error 413

## Alternativa Rápida

Si no quieres editar manualmente, puedes:

1. Activar multi-provider en `.env`:
```
AI_FALLBACK_ENABLED=true
```

2. Esto usará otros proveedores si Groq falla

---

**Estado:** ⚠️ REQUIERE ACCIÓN MANUAL
**Prioridad:** 🚨 URGENTE
