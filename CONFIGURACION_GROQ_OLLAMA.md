# ✅ CONFIGURACIÓN GROQ + OLLAMA COMPLETADA

## 🎯 Estado Actual

Las IAs de Groq y Ollama están **ACTIVAS y CONFIGURADAS** correctamente.

## 🔧 Configuración Aplicada

### Groq (Primario)
```env
GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_API_KEY_2=tu_groq_api_key_2_aqui
GROQ_API_KEY_6=tu_groq_api_key_6_aqui
GROQ_ENABLED=true
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=300
GROQ_TIMEOUT=60000
```

**Características:**
- ✅ 3 API keys configuradas
- ✅ Rotación automática cuando se alcanza el límite
- ✅ Modelo rápido: llama-3.1-8b-instant
- ✅ Límite de tokens: 300 (respuestas concisas)

### Ollama (Fallback)
```env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_TIMEOUT=60000
OLLAMA_MAX_TOKENS=500
```

**Características:**
- ✅ Activado como fallback
- ✅ Servidor en Easypanel
- ✅ Modelo ligero: gemma:2b
- ✅ Timeout de 60 segundos

### Sistema de Fallback
```env
AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true
AI_USE_REASONING=true
```

## 🔄 Flujo de Respuesta

```
1. GROQ (Primario)
   ├─ API Key 1 → Si falla por rate limit
   ├─ API Key 2 → Si falla por rate limit
   └─ API Key 3 → Si falla por rate limit
        ↓
2. OLLAMA (Fallback)
   └─ Si Groq agota todas las keys
        ↓
3. RESPUESTA ESTÁTICA (Emergencia)
   └─ Si Ollama también falla
```

## 🚀 Mejoras Implementadas

### 1. Rotación Automática de API Keys
```typescript
// El sistema rota automáticamente entre 3 API keys de Groq
const GROQ_API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_6,
];

// Cuando una key alcanza el límite, rota a la siguiente
function rotateApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
}
```

### 2. Fallback Inteligente
```typescript
// Intenta Groq → Ollama → Estático
export async function sendWithFallback(messages, options) {
  try {
    return await sendToGroq(messages, options); // Primario
  } catch (groqError) {
    try {
      return await sendToOllama(messages, options); // Fallback
    } catch (ollamaError) {
      return { content: 'Respuesta de emergencia' }; // Estático
    }
  }
}
```

### 3. Timeouts Configurables
- Groq: 60 segundos
- Ollama: 60 segundos
- Previene bloqueos indefinidos

### 4. Logs Detallados
```
[GroqClient] ✅ Respuesta exitosa con API key 1
[GroqClient] ❌ Error con API key 1: rate_limit
[GroqClient] 🔄 Rotando a API key 2
[OllamaClient] 🔄 Intentando con Ollama...
[OllamaClient] ✅ Respuesta exitosa de Ollama
```

## 🧪 Probar Configuración

### Ejecutar script de prueba
```bash
npx tsx scripts/test-groq-ollama.ts
```

Este script:
- ✅ Prueba Groq con las 3 API keys
- ✅ Prueba Ollama
- ✅ Prueba el sistema con fallback
- ✅ Muestra estadísticas de uso
- ✅ Verifica tiempos de respuesta

### Salida esperada
```
🧪 PRUEBA DE GROQ Y OLLAMA

1️⃣ PROBANDO GROQ
   • API Keys disponibles: 3
   • API Key actual: ...owIB
   • Modelo: llama-3.1-8b-instant
   ✅ Groq respondió exitosamente

2️⃣ PROBANDO OLLAMA
   • Habilitado: true
   • URL: https://bot-whatsapp-ollama.sqaoeo.easypanel.host
   ✅ Ollama respondió exitosamente

3️⃣ PROBANDO SISTEMA CON FALLBACK
   • Fallback habilitado: Sí
   ✅ Sistema respondió exitosamente

✅ PRUEBA COMPLETADA
```

## 📊 Ventajas del Sistema

### 1. Alta Disponibilidad
- 3 API keys de Groq = 3x más requests
- Fallback a Ollama si Groq falla
- Respuesta de emergencia si todo falla

### 2. Optimización de Costos
- Groq es gratuito (con límites)
- Ollama es local/self-hosted (gratis)
- Rotación automática maximiza uso gratuito

### 3. Velocidad
- Groq: ~500-1000ms (muy rápido)
- Ollama: ~2000-5000ms (más lento pero funcional)
- Modelo ligero: llama-3.1-8b-instant

### 4. Resiliencia
- No hay punto único de falla
- Rotación automática
- Fallback automático
- Respuesta de emergencia

## 🔍 Verificar Estado

### Ver API key actual
```typescript
import { getApiStats } from '@/conversational-module/ai/groqClient';

const stats = getApiStats();
console.log('API Key actual:', stats.currentKey);
console.log('Total keys:', stats.totalKeys);
console.log('Índice actual:', stats.currentKeyIndex);
```

### Ver logs en tiempo real
```bash
npm run dev | grep -E "\[GroqClient\]|\[OllamaClient\]|\[AI\]"
```

## ⚙️ Ajustar Configuración

### Cambiar modelo de Groq
```env
# Más rápido (recomendado)
GROQ_MODEL=llama-3.1-8b-instant

# Más inteligente (más lento)
GROQ_MODEL=llama-3.1-70b-versatile

# Alternativa
GROQ_MODEL=gemma2-9b-it
```

### Cambiar límite de tokens
```env
# Respuestas más cortas (más rápido, más barato)
GROQ_MAX_TOKENS=200

# Respuestas más largas (más lento, más caro)
GROQ_MAX_TOKENS=500
```

### Desactivar Ollama
```env
# Si Ollama es muy lento o no funciona
OLLAMA_ENABLED=false
```

### Desactivar fallback
```env
# Solo usar Groq (no recomendado)
AI_FALLBACK_ENABLED=false
```

## 🚨 Troubleshooting

### Error: "Todas las API keys de Groq agotadas"
**Causa:** Las 3 API keys alcanzaron el límite de rate

**Solución:**
1. Esperar unos minutos (los límites se resetean)
2. Ollama tomará el control automáticamente
3. Agregar más API keys si es necesario

### Error: "Ollama está desactivado"
**Causa:** `OLLAMA_ENABLED=false` en .env

**Solución:**
```env
OLLAMA_ENABLED=true
```

### Error: "Ollama timeout"
**Causa:** Ollama es muy lento o no responde

**Solución:**
1. Aumentar timeout:
```env
OLLAMA_TIMEOUT=120000
```
2. O desactivar Ollama:
```env
OLLAMA_ENABLED=false
```

### Groq responde muy lento
**Solución:** Cambiar a modelo más rápido
```env
GROQ_MODEL=llama-3.1-8b-instant
```

## 📈 Monitoreo

### Ver uso de tokens
```bash
# Los logs mostrarán:
[GroqClient] ✅ Respuesta exitosa
   • Tokens prompt: 45
   • Tokens respuesta: 87
   • Tokens totales: 132
```

### Ver rotación de API keys
```bash
# Los logs mostrarán:
[GroqClient] 🔄 Rotando a API key 2/3
[GroqClient] 🔄 Rotando a API key 3/3
[GroqClient] 🔄 Rotando a API key 1/3
```

### Ver fallback en acción
```bash
# Los logs mostrarán:
[AI] 🚀 Usando Groq como proveedor primario...
[AI] ❌ Groq falló: rate_limit
[AI] 🔄 Groq falló, intentando con Ollama...
[OllamaClient] ✅ Respuesta exitosa de Ollama
```

## ✅ Checklist de Configuración

- [x] Groq activado con 3 API keys
- [x] Ollama activado como fallback
- [x] Rotación automática implementada
- [x] Fallback automático implementado
- [x] Timeouts configurados
- [x] Logs detallados
- [x] Script de prueba creado
- [x] Documentación completa

## 🎉 Resultado Final

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ✅ GROQ + OLLAMA CONFIGURADOS                             │
│                                                             │
│  🚀 Groq (primario)                                        │
│     • 3 API keys con rotación automática                   │
│     • Modelo: llama-3.1-8b-instant                         │
│     • Límite: 300 tokens                                   │
│                                                             │
│  🔄 Ollama (fallback)                                      │
│     • Servidor: Easypanel                                  │
│     • Modelo: gemma:2b                                     │
│     • Timeout: 60 segundos                                 │
│                                                             │
│  🎯 Sistema resiliente y confiable                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Próximo Paso

```bash
# Probar configuración
npx tsx scripts/test-groq-ollama.ts

# Integrar sistema conversacional
npx tsx scripts/integrar-sistema-conversacional.ts

# Reiniciar servidor
npm run dev
```

**¡Las IAs están listas para usar!** 🎯✨
