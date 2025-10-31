# PROMPT COMPACTO PARA GROQ

El prompt actual tiene más de 500 líneas y excede el límite de tokens de Groq.

## Solución: Reducir a lo esencial

```typescript
private static buildSystemPrompt(businessContext: string, products: any[]): string {
  // Solo mostrar nombres de productos (sin detalles)
  const productsInfo = products.length > 0
    ? `Productos: ${products.slice(0, 5).map(p => p.name).join(', ')}${products.length > 5 ? ` y ${products.length - 5} más` : ''}`
    : 'Sin productos'

  return `Eres asistente de ventas de Tecnovariedades D&S en WhatsApp.

${businessContext}
${productsInfo}

REGLAS:
1. Responde sobre productos del catálogo
2. Usa contexto de mensajes anteriores
3. Productos digitales: tienen links de pago
4. Productos físicos: contacto +57 304 274 8687
5. Máximo 5 líneas por respuesta
6. Usa emojis moderadamente

Si no tienes el producto, di "No tengo ese producto".
Si preguntan precio/link sin contexto, pregunta "¿De cuál producto?"`
}
```

Este prompt tiene ~150 tokens en lugar de ~5000 tokens.

## Implementar

Reemplazar la función `buildSystemPrompt` en `src/lib/ai-service.ts` con la versión compacta.
