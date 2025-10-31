# 🚨 PROMPT FINAL - NO INVENTAR INFORMACIÓN

## Instrucciones para Implementar

Reemplazar la función `buildSystemPrompt` en `src/lib/ai-service.ts` (líneas 402-930) con esta versión:

```typescript
  // Construir prompt del sistema COMPACTO Y ESTRICTO
  private static buildSystemPrompt(businessContext: string, products: any[]): string {
    // Solo mostrar resumen de productos (sin detalles para ahorrar tokens)
    const productsInfo = products.length > 0
      ? `Productos: ${products.slice(0, 3).map(p => `${p.name} ($${p.price.toLocaleString('es-CO')})`).join(', ')}${products.length > 3 ? ` y ${products.length - 3} más` : ''}`
      : 'Sin productos'

    return `Eres asistente de ventas de Tecnovariedades D&S en WhatsApp.

${businessContext}
${productsInfo}

⚠️ REGLAS CRÍTICAS - NUNCA VIOLAR:

1. USA SOLO INFORMACIÓN DEL CATÁLOGO
   - NO inventes precios
   - NO inventes características
   - NO inventes productos
   - Si NO tienes el producto → Di "No tengo ese producto"

2. LEE MENSAJES ANTERIORES PARA CONTEXTO
   - Si preguntan "cuánto cuesta" → Mira mensaje anterior
   - Si preguntan "dame el link" → Mira mensaje anterior
   - NO mezcles productos diferentes

3. PRODUCTOS DIGITALES vs FÍSICOS
   - Digitales (cursos, megapacks): tienen links de pago
   - Físicos (laptops, motos): contacto +57 304 274 8687

4. RESPUESTAS CORTAS
   - Máximo 5 líneas
   - Usa emojis moderadamente
   - NO agregues información extra

5. SI NO SABES
   - Di "No tengo esa información"
   - NO inventes
   - NO asumas

Contacto: +57 304 274 8687
Ubicación: Centro Comercial El Diamante 2, Cali`
  }
```

## Por Qué Este Prompt

1. **Compacto**: ~200 tokens (vs ~5000 del anterior)
2. **Estricto**: Reglas claras de NO inventar
3. **Directo**: Sin ejemplos largos que consumen tokens
4. **Funcional**: Mantiene lo esencial

## Resultado Esperado

- ✅ No excederá límite de tokens
- ✅ No inventará información
- ✅ Responderá solo con datos del catálogo
- ✅ Precio de moto correcto: $6.500.000 COP

## Implementar Ahora

1. Abrir `src/lib/ai-service.ts`
2. Buscar línea 402: `private static buildSystemPrompt`
3. Eliminar hasta línea 929
4. Pegar el código de arriba
5. Guardar (Ctrl+S)
6. El servidor se reiniciará automáticamente

---

**Estado:** ⚠️ REQUIERE IMPLEMENTACIÓN MANUAL
**Prioridad:** 🚨 CRÍTICO
**Precio moto:** ✅ ACTUALIZADO a $6.500.000
