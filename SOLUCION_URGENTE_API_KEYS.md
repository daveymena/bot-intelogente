# 🚨 Solución Urgente: API Keys de Groq

## Problema Crítico

Todas las API keys de Groq están fallando:
- `organization_restricted` - Organización bloqueada
- `rate_limit_exceeded` - Límite de tokens excedido
- `invalid_api_key` - API key inválida

## Solución Inmediata

### Opción 1: Obtener Nuevas API Keys de Groq

1. Ve a https://console.groq.com/
2. Crea una nueva cuenta (si las actuales están bloqueadas)
3. Genera nuevas API keys
4. Actualiza el archivo `.env`:

```env
GROQ_API_KEY=gsk_NUEVA_KEY_AQUI
```

### Opción 2: Usar OpenAI como Fallback

Agrega en `.env`:

```env
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXX
AI_FALLBACK_ENABLED=true
```

### Opción 3: Usar Ollama Local (Sin límites)

1. Instala Ollama: https://ollama.ai/
2. Descarga un modelo:
```bash
ollama pull llama3.1
```

3. Actualiza `.env`:
```env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Verificar Estado de API Keys

```bash
# Crear script para verificar
node verificar-api-keys.js
```

## Mientras Tanto

El bot seguirá funcionando con respuestas básicas, pero sin IA avanzada.
