
# 🚀 Configuración Final para Easypanel (Ollama 3b)

Estas son las variables de entorno EXACTAS que debe tener tu proyecto en Easypanel para que funcione con la optimización que acabamos de hacer (velocidad + inteligencia).

## 1. Variables de Entorno (Environment Variables)

Ve a tu proyecto en Easypanel -> Environment y asegúrate de tener estas:

```bash
# --- CONEXIÓN OLLAMA (Local) ---
OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_TIMEOUT=120000

# --- CONFIGURACIÓN BOT ---
# (Asegúrate de que GROQ_API_KEY ya no esté o esté vacía, ya no se usa)
AI_PROVIDER=ollama
```

## 2. Por qué esta configuración:
- **`qwen2.5:3b`**: Es el modelo que probamos que responde en ~16s y razona bien en español.
- **`https://ollama-ollama...`**: Es la dirección interna de tu servicio Ollama en el mismo Easypanel.
- **`TIMEOUT=120000`**: Le damos 2 minutos de margen por si el servidor está muy cargado, para que no corte la respuesta.

## 3. Verificación
Una vez guardes estos cambios en Easypanel, redeploya el bot.
