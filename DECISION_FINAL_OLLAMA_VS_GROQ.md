# 🎯 DECISIÓN FINAL: Ollama vs Groq

## 📊 Resultados de Pruebas Reales

### Test con Prompts del Sistema Real

| Configuración | Tiempo | Evaluación |
|---------------|--------|------------|
| Ollama + 20 productos | **29.8s** | ❌❌ Inaceptable |
| Ollama + 10 productos | **4.5s** | ⚡ Aceptable |
| Groq + 20 productos | **0.5-0.8s** | ⚡⚡⚡ Excelente |

## 💡 Análisis

### Por qué Ollama es tan lento con 20 productos:

1. **Prompt muy largo:** 2,680 caracteres
2. **Modelo pequeño:** llama3.2:3b tiene que procesar mucho texto
3. **Servidor limitado:** Recursos compartidos en Easypanel
4. **Generación de JSON:** Requiere precisión y múltiples tokens

### Por qué Ollama es aceptable con 10 productos:

1. **Prompt más corto:** ~1,400 caracteres (50% menos)
2. **Menos procesamiento:** Modelo analiza menos opciones
3. **Respuesta más rápida:** 4.5s es aceptable para WhatsApp

## 🎯 Configuración Aplicada (Opción 1)

**Usar Ollama con productos reducidos:**

```env
# Ollama principal con timeout razonable
OLLAMA_TIMEOUT=8000
AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq
```

```typescript
// Reducir productos de 20 a 10
take: 10
```

**Resultado esperado:**
- ⚡ Ollama responde en 4-6s (aceptable)
- 💰 Gratis e ilimitado
- ✅ Groq como fallback si falla

## 📊 Comparación de Opciones

### Opción 1: Ollama (10 productos) + Groq fallback ✅ APLICADA

**Pros:**
- 💰 Gratis (90% del tráfico)
- ⚡ Aceptable (4-6s)
- ✅ Ilimitado
- ✅ Fallback confiable

**Contras:**
- 🐢 Más lento que Groq
- ⚠️ Solo muestra 10 productos (no 20)
- ⚠️ Puede hacer timeout ocasionalmente

**Ideal para:**
- Tráfico bajo-medio (<100 msg/día)
- Presupuesto limitado
- Catálogo pequeño (<50 productos)

### Opción 2: Groq principal + Ollama fallback

**Pros:**
- ⚡⚡⚡ Ultra rápido (0.5-0.8s)
- ✅ Muestra 20 productos
- ✅ Alta confiabilidad
- ✅ Mejor UX

**Contras:**
- 💰 Usa tokens (~$3-15/mes)
- ⚠️ Límite 30 req/min
- ⚠️ Requiere API key

**Ideal para:**
- Tráfico medio-alto (>100 msg/día)
- Prioridad en velocidad
- Catálogo grande (>50 productos)

## 🚀 Recomendación Final

### Para tu caso:

**Usa Opción 1 (Ollama 10 productos)** si:
- ✅ Tienes <100 mensajes/día
- ✅ Puedes esperar 4-6s por respuesta
- ✅ Tu catálogo tiene <50 productos
- ✅ Quieres $0 de costo

**Cambia a Opción 2 (Groq principal)** si:
- ❌ Ollama sigue haciendo timeout
- ❌ Usuarios se quejan de lentitud
- ❌ Tienes >100 mensajes/día
- ❌ Necesitas mostrar >10 productos

## 📈 Métricas a Monitorear

Después de reiniciar con Opción 1, observa:

### Logs esperados:
```
🤖 Llamando a Ollama...
🤖 Respuesta IA (Ollama): ... (4-6s después)
[Baileys] ✅ Respuesta híbrida enviada
```

### Si ves esto frecuentemente:
```
⏱️ Timeout de Ollama - tardó más de 8000 ms
🔄 Intentando con Groq como fallback...
```
**→ Cambia a Groq principal (Opción 2)**

## 🔧 Cómo Cambiar a Groq Principal

Si decides cambiar después:

```env
# En .env
AI_PROVIDER=groq
AI_FALLBACK_ORDER=groq,ollama
OLLAMA_TIMEOUT=12000
```

```typescript
// En intelligent-product-search.ts
take: 20  // Volver a 20 productos
```

## ✅ Estado Actual

**Configuración aplicada:** Opción 1 (Ollama 10 productos)

**Cambios realizados:**
- ✅ Productos reducidos: 20 → 10
- ✅ Timeout ajustado: 30s → 8s
- ✅ Ollama como principal
- ✅ Groq como fallback

**Próximo paso:**
- Reiniciar servidor: `npm run dev`
- Probar con mensajes reales
- Monitorear velocidad y timeouts
- Ajustar según resultados

---

**Fecha:** 7 de noviembre de 2025  
**Configuración:** Ollama (10 productos) + Groq fallback  
**Velocidad esperada:** 4-6s con Ollama, 1-2s con Groq fallback  
**Costo esperado:** ~$0-3/mes (solo fallbacks)
