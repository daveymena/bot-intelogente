# 🔄 Modelos Groq Actualizados

## ✅ Modelo Actualizado

El sistema ahora usa **`llama-3.3-70b-versatile`** que es el reemplazo oficial de `llama-3.1-70b-versatile`.

## 📋 Modelos Disponibles en Groq (2024)

### Recomendados para Conversación:

1. **`llama-3.3-70b-versatile`** ⭐ (ACTUAL)
   - Mejor para conversaciones complejas
   - Razonamiento avanzado
   - Velocidad: Media
   - Tokens: Hasta 32k

2. **`llama-3.1-8b-instant`** ⚡
   - Más rápido
   - Bueno para respuestas simples
   - Velocidad: Muy rápida
   - Tokens: Hasta 8k

3. **`mixtral-8x7b-32768`**
   - Balance entre velocidad y calidad
   - Bueno para español
   - Velocidad: Rápida
   - Tokens: Hasta 32k

4. **`gemma2-9b-it`**
   - Modelo de Google
   - Bueno para instrucciones
   - Velocidad: Rápida
   - Tokens: Hasta 8k

## 🔧 Cómo Cambiar de Modelo

Editar `src/lib/intelligent-conversation-engine.ts` (línea ~180):

```typescript
const completion = await this.groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile', // ← Cambiar aquí
  messages: chatMessages,
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 0.9
});
```

## 🎯 Recomendaciones por Caso de Uso

### Para Máxima Calidad:
```typescript
model: 'llama-3.3-70b-versatile'
```

### Para Máxima Velocidad:
```typescript
model: 'llama-3.1-8b-instant'
```

### Para Balance:
```typescript
model: 'mixtral-8x7b-32768'
```

## 📊 Comparación

| Modelo | Calidad | Velocidad | Español | Razonamiento |
|--------|---------|-----------|---------|--------------|
| llama-3.3-70b-versatile | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| llama-3.1-8b-instant | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| mixtral-8x7b-32768 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| gemma2-9b-it | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## ✅ Estado Actual

- ✅ Modelo actualizado a `llama-3.3-70b-versatile`
- ✅ Compatible con Groq API actual
- ✅ Listo para usar

## 🚀 Próximo Paso

```bash
# Reiniciar servidor para aplicar cambios
npm run dev
```

## 📚 Más Información

Documentación oficial: https://console.groq.com/docs/models
