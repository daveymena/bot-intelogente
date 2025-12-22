# 🤖 OLLAMA ACTIVADO EN PRODUCCIÓN

## ✅ Configuración Actual

**Ollama es ahora tu IA PRINCIPAL** para responder a clientes en WhatsApp.

### Orden de Prioridad de IAs:

```
1️⃣ OLLAMA (Principal)
   ├── URL: https://bot-whatsapp-ollama.sqaoeo.easypanel.host
   ├── Modelo: gemma:2b
   ├── Velocidad: 3-15s (después de calentar)
   ├── Costo: $0 (GRATIS E ILIMITADO)
   └── Límites: Ninguno ✅

2️⃣ GROQ (Fallback automático)
   ├── 8 API keys con rotación automática
   ├── Velocidad: 1-2s
   ├── Costo: Gratis hasta límite
   └── Se activa si Ollama falla

3️⃣ BASE DE CONOCIMIENTO LOCAL (Último recurso)
   ├── 158+ respuestas guardadas
   └── Respuestas instantáneas
```

## 📊 Desempeño de Ollama

### Velocidad Observada:
- **Primera respuesta**: 65s (carga inicial)
- **Segunda respuesta**: 20s (calentamiento)
- **Tercera respuesta**: 9s (optimizando)
- **Cuarta respuesta**: 3s ⚡ (óptimo)
- **Promedio estable**: 3-15s

### Ventajas:
✅ **Gratis e ilimitado** - Sin rate limits ni costos
✅ **Privacidad total** - Todo en tu servidor
✅ **Mejora con el uso** - Se optimiza automáticamente
✅ **Sin dependencias** - No depende de APIs externas
✅ **Entrenamiento ilimitado** - Aprende sin límites

### Desventajas:
⚠️ **Primera respuesta lenta** - 65s en arranque frío
⚠️ **Más lento que Groq** - 3-15s vs 1-2s
⚠️ **Requiere servidor** - Necesita Easypanel corriendo

## 🚀 Cómo Funciona

### Flujo de Respuesta:

```
Cliente envía mensaje
        ↓
¿Ollama disponible?
        ↓
    SÍ → Ollama genera respuesta (3-15s)
        ↓
    ✅ Respuesta enviada
        ↓
    💾 Guardada en base de conocimiento
```

### Si Ollama Falla:

```
Ollama no responde
        ↓
Groq toma el control (1-2s)
        ↓
✅ Respuesta enviada
        ↓
💾 Guardada en base de conocimiento
```

## 🔧 Variables de Entorno Activas

```env
# Ollama como principal
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=60000
OLLAMA_MAX_TOKENS=500

# Sistema de IA
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ENABLED=true

# Groq como fallback
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
# + 7 API keys adicionales para rotación
```

## 📝 Comandos Útiles

### Verificar Ollama:
```bash
npx tsx scripts/verificar-ollama.ts
```

### Entrenar con Ollama:
```bash
npx tsx scripts/entrenar-solo-ollama.ts
```

### Entrenamiento automático completo:
```bash
npx tsx scripts/entrenar-bot-automatico.ts
```

### Probar URLs de Ollama:
```bash
npx tsx scripts/test-ollama-urls.ts
```

### Test simple de Ollama:
```bash
npx tsx scripts/test-ollama-simple.ts
```

## 🎯 Recomendaciones

### Para Producción:
1. **Deja que Ollama se caliente** - Las primeras respuestas son lentas
2. **Monitorea el desempeño** - Observa los tiempos de respuesta
3. **Groq como respaldo** - Está configurado automáticamente
4. **Entrena regularmente** - Mejora las respuestas con el tiempo

### Si Ollama es Muy Lento:
```bash
# Cambiar a Groq como principal
AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq

# Mantener Ollama para entrenamiento
OLLAMA_ENABLED=true
```

### Si Quieres Más Velocidad:
Considera usar un modelo más pequeño o aumentar recursos del servidor Ollama en Easypanel.

## 🔄 Volver a Groq

Si decides que Ollama es muy lento para producción:

```env
# En .env
AI_PROVIDER=groq
DEFAULT_AI_PROVIDER=groq
AI_FALLBACK_ENABLED=true

# Mantener Ollama para entrenamiento
OLLAMA_ENABLED=true
```

Luego reinicia el bot:
```bash
npm run dev
```

## 📈 Monitoreo

### Logs a Observar:
```
[IntelligentEngine] 🤖 Intentando con Ollama local...
[Ollama] 🤖 Generando respuesta con gemma:2b
[Ollama] ✅ Respuesta generada: ...
[IntelligentEngine] ✅ Respuesta generada con Ollama
```

### Si Ollama Falla:
```
[IntelligentEngine] ⚠️ Ollama no disponible, usando Groq...
```

## ✅ Estado Actual

- ✅ Ollama conectado y funcionando
- ✅ Modelo gemma:2b disponible
- ✅ Configurado como IA principal
- ✅ Groq configurado como fallback
- ✅ 8 API keys de Groq con rotación
- ✅ Base de conocimiento con 158+ entradas
- ✅ Sistema de entrenamiento automático listo

## 🚀 Siguiente Paso

**Inicia el bot y prueba con clientes reales:**

```bash
npm run dev
```

Observa los logs para ver:
- Tiempos de respuesta de Ollama
- Calidad de las respuestas
- Cuándo se activa el fallback a Groq

**¡Ollama está listo para producción!** 🎉
