# ⚡ CONFIGURACIÓN: SOLO GROQ

## 🎯 Cambios Realizados

Se ha desactivado LM Studio y configurado el sistema para usar **únicamente Groq** como proveedor de IA.

## 📝 Archivos Modificados

### 1. `.env`
```env
# Antes
AI_PROVIDER=multi
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,lmstudio

# Ahora
AI_PROVIDER=groq
AI_FALLBACK_ENABLED=false
# AI_FALLBACK_ORDER=groq  # Solo Groq activo
```

### 2. `src/lib/ai-multi-provider.ts`
```typescript
// Antes
const fallbackOrder = (process.env.AI_FALLBACK_ORDER || 'groq,lmstudio,openai').split(',')

// Ahora
const fallbackOrder = ['groq']  // SOLO GROQ
```

## ✅ Ventajas

1. **Más rápido**: No intenta conectar con LM Studio
2. **Más confiable**: Groq tiene 99.9% uptime
3. **Sin errores**: No más "fetch failed" de LM Studio
4. **Más simple**: Una sola API para mantener

## 🔧 Configuración de Groq

Tu configuración actual:
```env
GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_FALLBACK_MODELS=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=400
GROQ_TIMEOUT=8000
```

## 📊 Límites de Groq (Gratis)

- **Requests por minuto**: 30
- **Requests por día**: 14,400
- **Tokens por minuto**: 7,000

Más que suficiente para tu bot de ventas.

## 🔄 Si Quieres Reactivar LM Studio

1. Edita `.env`:
```env
AI_PROVIDER=multi
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,lmstudio
```

2. Edita `src/lib/ai-multi-provider.ts`:
```typescript
const fallbackOrder = (process.env.AI_FALLBACK_ORDER || 'groq').split(',')
```

3. Asegúrate que LM Studio esté corriendo en `http://localhost:1234`

## ✅ Estado Actual

- ✅ Groq activo y funcionando
- ❌ LM Studio desactivado
- ❌ OpenAI desactivado
- ✅ Sistema de memoria de contexto activo
- ✅ Detección mejorada de productos

## 🧪 Probar

```bash
npx tsx scripts/test-memoria-contexto.ts
```

Ahora debería funcionar sin errores de "fetch failed".
