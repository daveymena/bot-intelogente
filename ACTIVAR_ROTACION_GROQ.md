# 🔄 Activar Rotación de APIs de Groq

## 🐛 Problema

El sistema tiene un rotador de APIs (`groq-api-rotator.ts`) pero **NO se está usando** en varios archivos clave, incluyendo:
- `hybrid-intelligent-response-system.ts` ❌
- `intelligent-product-query-system.ts` ❌  
- `ai-service.ts` ❌
- Y otros...

Por eso cuando se agota el rate limit de una API, no rota automáticamente.

## ✅ Solución Rápida

### Opción 1: Agregar Más API Keys (MÁS FÁCIL)

Edita tu `.env` y agrega más keys de Groq:

```env
GROQ_API_KEY=gsk_tu_key_principal
GROQ_API_KEY_2=gsk_tu_key_secundaria
GROQ_API_KEY_3=gsk_tu_key_terciaria
GROQ_API_KEY_4=gsk_tu_key_cuarta
```

El rotador ya está configurado para detectarlas automáticamente.

**¿Dónde conseguir más keys?**
1. Crea más cuentas de Groq (con diferentes emails)
2. O espera 24 horas para que se resetee el límite

### Opción 2: Integrar el Rotador (MÁS COMPLEJO)

Modificar `src/lib/hybrid-intelligent-response-system.ts`:

**BUSCA** (línea ~794):
```typescript
const aiProvider: AIProvider = {
    chat: async (messages: any[], options?: any) => {
        const response = await groq.chat.completions.create({
            messages,
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
```

**REEMPLAZA CON**:
```typescript
const aiProvider: AIProvider = {
    chat: async (messages: any[], options?: any) => {
        // Usar rotador de APIs
        const { GroqAPIRotator } = await import('./groq-api-rotator')
        
        try {
            const response = await GroqAPIRotator.makeRequest(messages, {
                temperature: options?.temperature ?? 0.7,
                maxTokens: options?.max_tokens ?? 500
            })
            return { choices: [{ message: { content: response } }] }
        } catch (error) {
            console.error('[Hybrid] Error con rotador Groq:', error)
            throw error
        }
```

## 📊 Verificar Estado del Rotador

Crea un script para ver el estado:

```typescript
// scripts/ver-estado-groq.ts
import { GroqAPIRotator } from '../src/lib/groq-api-rotator'

const status = GroqAPIRotator.getStatus()

console.log('📊 Estado del Rotador de Groq:\n')
console.log(`API Actual: ${status.currentAPI}`)
console.log(`Modelo Actual: ${status.currentModel}\n`)

console.log('APIs Configuradas:')
status.apis.forEach(api => {
  console.log(`  ${api.name}: ${api.isActive ? '✅ Activa' : '❌ Inactiva'} (Fallos: ${api.failCount})`)
})

console.log('\nModelos Disponibles:')
status.models.forEach(model => {
  console.log(`  ${model.name}: ${model.isActive ? '✅ Activo' : '❌ Inactivo'} (Fallos: ${model.failCount})`)
})
```

Ejecutar:
```bash
npx tsx scripts/ver-estado-groq.ts
```

## 🎯 Recomendación

**Para ahora:** Agrega más API keys (Opción 1)
**Para después:** Integra el rotador en todos los archivos (Opción 2)

## 📝 APIs que Necesitan el Rotador

Archivos que usan Groq directamente:
- ✅ `groq-api-rotator.ts` - Ya lo tiene
- ❌ `hybrid-intelligent-response-system.ts` - **PRINCIPAL**
- ❌ `intelligent-product-query-system.ts`
- ❌ `ai-service.ts`
- ❌ `ai-action-orchestrator.ts`
- ❌ `intelligent-payment-detector.ts`
- ❌ `external-knowledge-service.ts`

## 🔧 Configuración Actual

El rotador ya está configurado para:
- ✅ Detectar hasta 8 API keys automáticamente
- ✅ Rotar entre 4 modelos (del más rápido al más potente)
- ✅ Reactivar APIs cada hora
- ✅ Detectar rate limits y rotar automáticamente

Solo necesita que los archivos lo usen.

## ⏰ Tiempo de Implementación

- **Opción 1 (Agregar keys):** 5 minutos
- **Opción 2 (Integrar rotador):** 30-45 minutos

---

**Recomendación:** Empieza con la Opción 1 (agregar más keys) para solucionar el problema inmediatamente, y luego implementa la Opción 2 cuando tengas tiempo.
