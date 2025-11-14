# ✅ Checklist: Sistema Multi-Provider de IA

## 📋 Verificación Completa

### 1️⃣ Instalación de LM Studio

- [ ] LM Studio descargado de https://lmstudio.ai/
- [ ] LM Studio instalado correctamente
- [ ] LM Studio abierto y funcionando
- [ ] Modelo phi-2 descargado
- [ ] Modelo phi-2 cargado en la pestaña Chat

**Cómo verificar**:
```
1. Abre LM Studio
2. Ve a Chat
3. Deberías ver "Model loaded: phi-2"
```

---

### 2️⃣ Configuración del Servidor API

- [ ] Settings → "Enable local REST API server" activado
- [ ] Puerto configurado en 1234
- [ ] URL: http://localhost:1234
- [ ] CORS habilitado
- [ ] Servidor ejecutándose (luz verde)

**Cómo verificar**:
```
Abre en navegador: http://localhost:1234/v1/models
Deberías ver: {"object":"list","data":[...]}
```

---

### 3️⃣ Configuración en .env

- [ ] `AI_FALLBACK_ENABLED=true`
- [ ] `AI_FALLBACK_ORDER=groq,lmstudio,openai`
- [ ] `GROQ_API_KEY` configurada
- [ ] `LM_STUDIO_URL=http://localhost:1234/v1/chat/completions`
- [ ] `LM_STUDIO_MODEL=phi-2`

**Cómo verificar**:
```bash
# Ver contenido del .env
type .env | findstr AI_FALLBACK
type .env | findstr LM_STUDIO
```

---

### 4️⃣ Archivos Creados

- [ ] `src/lib/ai-multi-provider.ts` existe
- [ ] `src/lib/ai-service.ts` actualizado
- [ ] `src/app/api/ai/test-providers/route.ts` existe
- [ ] `scripts/test-multi-provider.ts` existe
- [ ] `probar-multi-provider.bat` existe

**Cómo verificar**:
```bash
dir src\lib\ai-multi-provider.ts
dir scripts\test-multi-provider.ts
dir probar-multi-provider.bat
```

---

### 5️⃣ Prueba de Conectividad

- [ ] Script de prueba ejecutado
- [ ] Groq muestra ✅ FUNCIONANDO
- [ ] LM Studio muestra ✅ FUNCIONANDO
- [ ] Sin errores en consola

**Cómo verificar**:
```bash
# Ejecutar prueba
probar-multi-provider.bat

# Deberías ver:
# ✅ GROQ: FUNCIONANDO
# ✅ LMSTUDIO: FUNCIONANDO
```

---

### 6️⃣ Prueba de Respuesta

- [ ] Script genera respuesta exitosamente
- [ ] Respuesta tiene contenido coherente
- [ ] Muestra qué provider usó
- [ ] Tiempo de respuesta < 5 segundos

**Cómo verificar**:
```bash
# El script también prueba generar una respuesta
# Deberías ver:
# ✅ RESPUESTA RECIBIDA:
# Provider usado: GROQ
# Contenido: [respuesta del bot]
```

---

### 7️⃣ Integración con el Bot

- [ ] Bot inicia sin errores
- [ ] Logs muestran "Usando sistema multi-provider"
- [ ] Bot responde mensajes de WhatsApp
- [ ] Logs muestran qué provider usa

**Cómo verificar**:
```bash
# Iniciar bot
npm run dev

# En los logs deberías ver:
# [AI] 🔄 Usando sistema multi-provider con fallback automático
# [AI] ✅ Respuesta generada con: groq (llama-3.1-8b-instant)
```

---

### 8️⃣ Prueba de Fallback

- [ ] Desconectar internet temporalmente
- [ ] Bot sigue respondiendo con LM Studio
- [ ] Logs muestran cambio de provider
- [ ] Reconectar internet y vuelve a Groq

**Cómo verificar**:
```bash
# 1. Desconecta WiFi
# 2. Envía mensaje al bot
# 3. Deberías ver en logs:
# [AI Multi-Provider] ❌ Error con groq: fetch failed
# [AI Multi-Provider] ✅ Éxito con: lmstudio
```

---

## 🎯 Verificación Rápida (5 minutos)

### Checklist Mínimo

1. ✅ LM Studio ejecutándose
2. ✅ Modelo phi-2 cargado
3. ✅ Servidor API activado
4. ✅ `probar-multi-provider.bat` muestra ✅
5. ✅ Bot inicia sin errores

**Si todos están ✅ → Sistema funcionando correctamente**

---

## 🔍 Diagnóstico de Problemas

### Problema: LM Studio no funciona

**Checklist**:
- [ ] LM Studio está abierto
- [ ] Modelo está cargado (no solo descargado)
- [ ] Servidor API está activado
- [ ] Puerto es 1234
- [ ] No hay otro programa usando el puerto 1234

**Solución**:
```bash
# Verificar puerto
netstat -ano | findstr :1234

# Si está ocupado, cambiar puerto en LM Studio y .env
```

---

### Problema: Groq da timeout

**Checklist**:
- [ ] Hay conexión a internet
- [ ] GROQ_API_KEY es correcta
- [ ] No hay firewall bloqueando
- [ ] Límite de rate no excedido

**Solución**:
```env
# Aumentar timeout
GROQ_TIMEOUT=15000

# O usar otro modelo
GROQ_MODEL=llama-3.3-70b-versatile
```

---

### Problema: Bot no responde

**Checklist**:
- [ ] Bot está ejecutándose
- [ ] WhatsApp está conectado
- [ ] AI_FALLBACK_ENABLED=true
- [ ] Al menos un provider funciona
- [ ] No hay errores en consola

**Solución**:
```bash
# Ver logs del bot
npm run dev

# Buscar errores de IA
# Ejecutar prueba
probar-multi-provider.bat
```

---

## 📊 Métricas de Éxito

### Conectividad

- ✅ **Excelente**: 3/3 providers funcionando
- ⚠️ **Bueno**: 2/3 providers funcionando
- ❌ **Malo**: 0-1 providers funcionando

### Velocidad de Respuesta

- ✅ **Excelente**: < 1 segundo
- ⚠️ **Bueno**: 1-3 segundos
- ❌ **Malo**: > 5 segundos

### Tasa de Éxito

- ✅ **Excelente**: 100% respuestas exitosas
- ⚠️ **Bueno**: 95-99% respuestas exitosas
- ❌ **Malo**: < 95% respuestas exitosas

---

## 🎉 Verificación Final

### Todo Funciona Si:

1. ✅ `probar-multi-provider.bat` muestra al menos 2 providers funcionando
2. ✅ Bot inicia sin errores
3. ✅ Bot responde mensajes de WhatsApp
4. ✅ Logs muestran qué provider usa
5. ✅ Fallback funciona al desconectar internet

### Comando de Verificación Completa

```bash
# 1. Probar providers
probar-multi-provider.bat

# 2. Iniciar bot
npm run dev

# 3. Enviar mensaje de prueba por WhatsApp

# 4. Verificar logs
# Deberías ver:
# [AI] ✅ Respuesta generada con: groq (llama-3.1-8b-instant)
```

---

## 📝 Registro de Verificación

Fecha: _______________

### Resultados

| Item | Estado | Notas |
|------|--------|-------|
| LM Studio instalado | ⬜ | |
| Servidor API activo | ⬜ | |
| Configuración .env | ⬜ | |
| Prueba de conectividad | ⬜ | |
| Prueba de respuesta | ⬜ | |
| Integración con bot | ⬜ | |
| Prueba de fallback | ⬜ | |

### Providers Funcionando

- [ ] Groq
- [ ] LM Studio
- [ ] OpenAI (opcional)

### Observaciones

```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🚀 Siguiente Paso

Si todo está ✅:

1. **Documenta tu configuración**
2. **Prueba con clientes reales**
3. **Monitorea los logs**
4. **Ajusta según necesites**

Si algo está ❌:

1. **Revisa la sección de Diagnóstico**
2. **Lee GUIA_MULTI_PROVIDER_IA.md**
3. **Ejecuta probar-multi-provider.bat**
4. **Verifica los logs del bot**

---

**¡Sistema Multi-Provider verificado y listo!** ✅
