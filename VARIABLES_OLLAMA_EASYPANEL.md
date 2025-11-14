# 🤖 Variables de Ollama para Easypanel

## Variables Necesarias

Agrega estas 3 variables en la configuración de tu proyecto en Easypanel:

### 1. OLLAMA_BASE_URL
```
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
```
**Descripción**: URL de tu servidor Ollama en Easypanel

**Nota**: Si tienes Ollama en otro servidor, usa esa URL. Si no tienes Ollama instalado, puedes:
- Dejarlo vacío (el sistema usará Groq/OpenRouter)
- O instalar Ollama en Easypanel (ver guía abajo)

### 2. OLLAMA_MODEL
```
OLLAMA_MODEL=gemma:2b
```
**Descripción**: Modelo de IA a usar

**Opciones recomendadas**:
- `gemma:2b` - Rápido y ligero (2GB RAM)
- `llama3.2:3b` - Más inteligente (3GB RAM)
- `mistral:7b` - Muy bueno (7GB RAM)
- `llama3.1:8b` - Excelente (8GB RAM)

### 3. OLLAMA_ENABLED
```
OLLAMA_ENABLED=true
```
**Descripción**: Activar/desactivar Ollama

**Valores**:
- `true` - Usar Ollama como IA principal
- `false` - Desactivar Ollama (usar Groq/OpenRouter)

## 📋 Cómo Agregar en Easypanel

### Opción 1: Desde la Interfaz Web

1. Ve a tu proyecto en Easypanel
2. Clic en **"Settings"** o **"Environment"**
3. Busca la sección **"Environment Variables"**
4. Agrega cada variable:
   ```
   Name: OLLAMA_BASE_URL
   Value: https://bot-whatsapp-ollama.sqaoeo.easypanel.host
   ```
5. Repite para `OLLAMA_MODEL` y `OLLAMA_ENABLED`
6. Clic en **"Save"** o **"Update"**
7. **Redeploy** la aplicación

### Opción 2: Desde Build Args (Dockerfile)

Si usas build args, agrégalos así:
```dockerfile
--build-arg 'OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host'
--build-arg 'OLLAMA_MODEL=gemma:2b'
--build-arg 'OLLAMA_ENABLED=true'
```

## 🎯 Configuración Recomendada para Producción

### Si TIENES Ollama instalado:
```env
OLLAMA_BASE_URL=https://tu-ollama.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq,openrouter
```

### Si NO TIENES Ollama (solo APIs):
```env
OLLAMA_ENABLED=false
AI_PROVIDER=groq
AI_FALLBACK_ORDER=groq,openrouter
```

## 🚀 Instalar Ollama en Easypanel (Opcional)

Si quieres usar Ollama (IA local gratis):

1. **Crear nuevo servicio en Easypanel**:
   - Name: `ollama`
   - Image: `ollama/ollama:latest`
   - Port: `11434`

2. **Configurar volumen**:
   - Mount path: `/root/.ollama`
   - Para persistir los modelos

3. **Exponer servicio**:
   - Enable public access
   - Obtén la URL (ej: `https://ollama.sqaoeo.easypanel.host`)

4. **Descargar modelo**:
   ```bash
   # Conectar al contenedor
   docker exec -it ollama ollama pull gemma:2b
   ```

5. **Usar la URL en tu bot**:
   ```env
   OLLAMA_BASE_URL=https://ollama.sqaoeo.easypanel.host
   ```

## ✅ Verificar que Funciona

Una vez configurado, el sistema:
1. Intentará usar Ollama primero (si está habilitado)
2. Si falla, usará Groq automáticamente
3. Si Groq falla, usará OpenRouter
4. Todo es transparente para el usuario

## 🔧 Troubleshooting

### Error: "Cannot connect to Ollama"
- Verifica que `OLLAMA_BASE_URL` sea correcta
- Verifica que el servicio Ollama esté corriendo
- Prueba la URL en el navegador: `https://tu-ollama/api/tags`

### Error: "Model not found"
- El modelo no está descargado en Ollama
- Conéctate al contenedor y descárgalo:
  ```bash
  ollama pull gemma:2b
  ```

### Ollama muy lento
- Usa un modelo más pequeño: `gemma:2b`
- Aumenta recursos del servidor
- O desactiva Ollama y usa solo Groq

## 💡 Recomendación

Para empezar rápido en producción:
```env
# Desactiva Ollama por ahora
OLLAMA_ENABLED=false

# Usa Groq como principal (es gratis y rápido)
AI_PROVIDER=groq
AI_FALLBACK_ORDER=groq,openrouter
```

Luego, cuando tengas tiempo, instala Ollama para tener IA local gratis.
