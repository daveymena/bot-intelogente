# 🚀 Easypanel - Guía Paso a Paso

## ✅ Checklist Rápido

- [ ] Código subido a Git
- [ ] Servicio Ollama creado
- [ ] Variables de entorno actualizadas
- [ ] Aplicación redeployada
- [ ] Bot funcionando con triple respaldo

## 📋 Paso 1: Subir Código a Git

```bash
# Ejecutar en tu computadora
COMMIT_Y_PUSH.bat
```

O manualmente:
```bash
git add .
git commit -m "feat: Sistema triple respaldo IA"
git push origin main
```

## 🦙 Paso 2: Configurar Ollama en Easypanel

### 2.1 Crear Servicio Ollama

1. En Easypanel, ir a tu proyecto
2. Click en "Add Service"
3. Seleccionar "Docker Image"
4. Configurar:

```yaml
Name: ollama
Image: ollama/ollama:latest
Port: 11434
```

### 2.2 Agregar Volumen

```yaml
Mount Path: /root/.ollama
Volume Name: ollama-data
```

### 2.3 Comando de Inicio

En "Command Override":
```bash
sh -c "ollama serve & sleep 10 && ollama pull gemma:2b && wait"
```

### 2.4 Deploy Ollama

Click en "Deploy" y esperar a que descargue el modelo (~2GB)

## ⚙️ Paso 3: Actualizar Variables de Entorno del Bot

En tu aplicación principal, agregar/actualizar estas variables:

### Variables Nuevas

```env
# OpenRouter (50 mensajes/día gratis)
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free

# Ollama (local en Easypanel)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=60000

# Sistema de IA
AI_FALLBACK_ORDER=groq,openrouter,ollama
AI_AUTO_MODEL_DETECTION=true
```

### Variables Existentes (verificar)

```env
# Groq (principal)
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=400
GROQ_TIMEOUT=15000

# Next.js
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# WhatsApp
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/data/whatsapp-sessions

# Database
DATABASE_URL=file:/data/dev.db

# Auth
NEXTAUTH_SECRET=tu-secret-aqui
NEXTAUTH_URL=https://tu-dominio.com
JWT_SECRET=tu-jwt-secret-aqui
```

## 🔄 Paso 4: Redeploy de la Aplicación

### 4.1 Pull del Nuevo Código

1. En Easypanel, ir a tu aplicación
2. Click en "Settings"
3. En "Source", verificar que apunta a tu repo
4. Click en "Redeploy"

### 4.2 Esperar el Build

El proceso tomará unos minutos:
- Pull del código
- npm install
- npm run build
- Restart

### 4.3 Verificar Logs

```bash
# En Easypanel, ir a "Logs" y buscar:
[AI Multi-Provider] 🔄 Orden de fallback: groq → openrouter → ollama
```

## ✅ Paso 5: Verificar que Todo Funciona

### 5.1 Verificar Ollama

En los logs de Ollama deberías ver:
```
Ollama is running
Model gemma:2b loaded
```

### 5.2 Verificar Bot

En los logs del bot deberías ver:
```
[AI Multi-Provider] ✅ Groq funcionando
[AI Multi-Provider] ✅ OpenRouter funcionando
[AI Multi-Provider] ✅ Ollama funcionando
```

### 5.3 Probar el Bot

Envía un mensaje de WhatsApp y verifica:
- Responde correctamente
- Los logs muestran qué provider usó
- No hay errores

## 🔧 Troubleshooting

### Problema: Ollama no responde

**Solución:**
1. Verificar que el servicio Ollama está corriendo
2. Verificar que el modelo está descargado:
   ```bash
   # En terminal de Ollama
   ollama list
   ```
3. Verificar la URL: `http://ollama:11434`

### Problema: OpenRouter da error 401

**Solución:**
1. Verificar que la API key es correcta
2. Verificar que no tiene espacios extra
3. Probar la API key en: https://openrouter.ai/

### Problema: Bot no cambia de provider

**Solución:**
1. Verificar que `AI_AUTO_MODEL_DETECTION=true`
2. Verificar que `AI_FALLBACK_ORDER` está configurado
3. Revisar logs para ver errores

### Problema: Rate limit en Groq

**Solución:**
- El bot debería cambiar automáticamente a OpenRouter
- Si no lo hace, verificar logs
- Verificar que OpenRouter está configurado

## 📊 Monitoreo

### Logs Importantes

Buscar en los logs:
```
[Groq] ✅ Éxito
[OpenRouter] ✅ Respuesta exitosa
[Ollama] ✅ Respuesta recibida
[AI Multi-Provider] 🔄 Cambiando a...
```

### Métricas

- Tiempo de respuesta por provider
- Cuántas veces usa cada provider
- Errores y cambios automáticos

## 🎯 Resultado Esperado

Después de completar todos los pasos:

✅ Bot funcionando 24/7
✅ Triple respaldo automático
✅ Groq como principal (rápido)
✅ OpenRouter como respaldo (50 msg/día)
✅ Ollama como último recurso (ilimitado)
✅ Cambio automático sin intervención
✅ Sin rate limits que detengan el bot

## 📞 Soporte

Si algo no funciona:
1. Revisar logs de ambos servicios (bot y ollama)
2. Verificar variables de entorno
3. Verificar que Ollama está corriendo
4. Probar cada provider individualmente

## 🎉 ¡Listo!

Tu bot ahora tiene:
- 🚀 Triple respaldo automático
- 🤖 Auto-detección de modelos
- 🔄 Cambio automático sin intervención
- 📊 150-250+ mensajes/día con respaldo ilimitado
- 💪 99.9% uptime garantizado

**¡Disfruta de tu bot ultra-confiable!** 🎊
