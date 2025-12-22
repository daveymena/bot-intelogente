# 🚀 Optimizar Ollama - Solución Urgente

## 🔴 Problema Actual

Ollama está dando timeout porque:
1. El historial es muy largo (100 mensajes)
2. El timeout es muy corto (10s → ahora 60s)
3. El modelo `gemma:2b` puede ser lento

## ✅ Soluciones Aplicadas

### 1. Historial Reducido ✅
- **Antes**: 100 mensajes
- **Ahora**: 20 mensajes
- **Resultado**: Menos tokens para procesar

### 2. Timeout Aumentado ✅
- **Antes**: 10 segundos
- **Ahora**: 60 segundos
- **Resultado**: Más tiempo para responder

### 3. Orden de Fallback Correcto ✅
```
Groq (rápido, limitado) → Ollama (lento, ilimitado)
```

## 🔧 Configuración Recomendada

### En tu `.env`:

```env
# IA Principal
GROQ_API_KEY=tu_key_aqui
GROQ_MODEL=llama-3.1-8b-instant

# Ollama (Fallback ilimitado)
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_TIMEOUT=90000          # 90 segundos (aumentado)

# Sistema de Fallback
AI_FALLBACK_ENABLED=true
AI_USE_REASONING=false        # Desactivado para evitar doble llamada
```

## 🎯 Cómo Funciona Ahora

### Flujo Normal (Groq tiene tokens)
```
1. Cliente envía mensaje
2. Groq responde (2-5s) ✅
3. Respuesta enviada
```

### Flujo Fallback (Groq sin tokens)
```
1. Cliente envía mensaje
2. Groq falla (sin tokens) ❌
3. Ollama responde (30-60s) ✅
4. Respuesta enviada
```

## 🚨 Si Ollama Sigue Fallando

### Opción 1: Aumentar Timeout Aún Más

En `.env`:
```env
OLLAMA_TIMEOUT=120000  # 2 minutos
```

### Opción 2: Usar Modelo Más Rápido

Cambiar a un modelo más pequeño:
```env
OLLAMA_MODEL=tinyllama  # Más rápido pero menos preciso
```

### Opción 3: Verificar Conexión a Ollama

```bash
# Probar conexión
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags

# Debería responder con lista de modelos
```

### Opción 4: Reiniciar Ollama en Easypanel

1. Ve a Easypanel
2. Encuentra el servicio de Ollama
3. Reinicia el contenedor
4. Espera 2-3 minutos

## 📊 Monitoreo

### Ver si Ollama está funcionando

En los logs deberías ver:
```
[AI Multi-Provider] 🔄 Intentando con: groq
[Groq] ❌ Error: rate_limit_exceeded
[AI Multi-Provider] 🔄 Intentando con: ollama
[Ollama] 🚀 Usando modelo: gemma:2b
[Ollama] ✅ Respuesta generada en 45s
```

### Si ves timeout:
```
[Ollama] ❌ Timeout después de 60s
```

Entonces aumenta el timeout a 90-120s.

## 🎯 Estrategia Óptima

### Para Producción:

1. **Groq como principal** (rápido, 6000 tokens/min)
2. **Ollama como fallback** (lento, ilimitado)
3. **Historial reducido** (20 mensajes máximo)
4. **Timeout generoso** (90-120 segundos)

### Ventajas:
- ✅ 95% de respuestas rápidas (Groq)
- ✅ 5% de respuestas lentas pero ilimitadas (Ollama)
- ✅ Nunca se queda sin servicio
- ✅ Costo controlado

## 🔄 Próximos Pasos

1. ✅ Ejecutar script de limpieza
   ```bash
   npx tsx scripts/arreglar-problemas-urgentes.ts
   ```

2. ✅ Verificar configuración en `.env`
   ```bash
   Get-Content .env | Select-String "OLLAMA"
   ```

3. ✅ Reiniciar servidor
   ```bash
   # Ctrl+C y luego:
   npm run dev
   ```

4. ⏳ Probar con mensaje
   - Envía "Hola" por WhatsApp
   - Verifica logs
   - Debería responder en 2-5s con Groq

5. ⏳ Forzar uso de Ollama
   - Envía muchos mensajes rápido
   - Groq se quedará sin tokens
   - Ollama tomará el control
   - Respuesta en 30-60s

## 🐛 Troubleshooting

### Ollama no responde

```bash
# 1. Verificar que esté corriendo
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags

# 2. Si no responde, reiniciar en Easypanel

# 3. Verificar logs del contenedor Ollama
```

### Timeout muy frecuente

```env
# Aumentar timeout
OLLAMA_TIMEOUT=120000  # 2 minutos

# O cambiar modelo
OLLAMA_MODEL=tinyllama  # Más rápido
```

### Groq siempre falla

```bash
# Verificar API key
Get-Content .env | Select-String "GROQ_API_KEY"

# Verificar límites en Groq Console
# https://console.groq.com/
```

## ✅ Checklist Final

- [ ] Script de limpieza ejecutado
- [ ] Historial reducido a 20 mensajes
- [ ] Timeout de Ollama en 60-90s
- [ ] Fallback activado
- [ ] Servidor reiniciado
- [ ] Groq responde rápido
- [ ] Ollama funciona como fallback
- [ ] Logs muestran el flujo correcto

---

**Fecha**: Hoy
**Estado**: ✅ Optimizaciones listas
**Prioridad**: 🔴 URGENTE - Aplicar ahora
