# 🔍 DIAGNÓSTICO: IA No Encuentra Productos de Idiomas

## PROBLEMA REPORTADO

Usuario pregunta: **"Tienes mega packs de idiomas?"**

Bot responde: **"No tengo un curso de idiomas específico"** y sugiere otros productos incorrectos.

## VERIFICACIÓN 1: ¿Existen los productos?

```bash
node ver-todos-productos-ahora.js | Select-String -Pattern "idioma"
```

**Resultado:** ✅ SÍ EXISTEN
- Mega Pack 03: Cursos Inglés
- Mega Pack 08: Cursos Idiomas

## VERIFICACIÓN 2: ¿Qué sistema está activo?

**Sistema activo:** `SimpleConversationHandler` (confirmado en `conversacionController.ts` línea 148)

## POSIBLES CAUSAS

### Causa 1: Prompt no llega correctamente a la IA
El método `generateResponse()` en `simple-conversation-handler.ts` podría no estar enviando el catálogo completo.

### Causa 2: IA no está analizando correctamente
El modelo de IA (Groq/Ollama) podría no estar entendiendo el prompt.

### Causa 3: Filtro de productos antes de enviar
Aunque eliminamos intermediarios, podría haber un filtro oculto.

## PASOS PARA DIAGNOSTICAR

### 1. Verificar que los productos llegan al método
Agregar log en `handleSearch()`:

```typescript
console.log(`[SimpleHandler] 📊 Productos enviados a IA:`, 
  allProducts.map(p => ({ id: p.id, name: p.name }))
);
```

### 2. Verificar el prompt que recibe la IA
Agregar log en `generateResponse()`:

```typescript
console.log(`[SimpleHandler] 📝 Prompt enviado a IA:`, systemPrompt);
```

### 3. Verificar la respuesta de la IA
Agregar log después de llamar a IA:

```typescript
console.log(`[SimpleHandler] 🤖 Respuesta de IA:`, aiResponse.content);
```

### 4. Verificar extracción de productos mencionados
Agregar log en `extractMentionedProducts()`:

```typescript
console.log(`[SimpleHandler] 🔍 Buscando en respuesta:`, responseText);
console.log(`[SimpleHandler] 🔍 Productos disponibles:`, allProducts.length);
```

## SOLUCIÓN TEMPORAL

Mientras diagnosticamos, podemos forzar que la IA use un prompt más explícito:

```typescript
if (message.toLowerCase().includes('idioma')) {
  systemPrompt += `\n\n🚨 IMPORTANTE: El cliente pregunta por IDIOMAS.
  
  Productos de idiomas disponibles:
  - Mega Pack 03: Cursos de Inglés (20.000 COP)
  - Mega Pack 08: Cursos de Idiomas Completo (20.000 COP)
  
  DEBES mencionar estos productos en tu respuesta.`;
}
```

## PRÓXIMOS PASOS

1. ⏳ Agregar logs de diagnóstico
2. ⏳ Reiniciar servidor
3. ⏳ Probar query "tienes mega packs de idiomas?"
4. ⏳ Revisar logs para identificar dónde falla
5. ⏳ Aplicar corrección específica

## COMANDOS ÚTILES

```bash
# Reiniciar servidor con logs
npm run dev

# Ver productos de idiomas
node ver-todos-productos-ahora.js | Select-String -Pattern "idioma"

# Probar en WhatsApp
# Enviar: "Tienes mega packs de idiomas?"
```

## NOTAS

- El sistema `SimpleConversationHandler` SÍ está activo
- Los productos SÍ existen en la base de datos
- El problema está en la comunicación entre el handler y la IA
- Necesitamos logs para identificar el punto exacto de falla
