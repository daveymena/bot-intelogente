# 🤖 Sistema de Cambio Automático de Modelos IA

## ✅ COMPLETADO - Sistema Totalmente Automático

El bot ahora detecta y cambia de modelo automáticamente cuando encuentra rate limits, **sin necesidad de intervención humana**.

## 🎯 Características Implementadas

### 1. Detección Automática de Rate Limits
- ✅ Detecta errores 429 (Too Many Requests)
- ✅ Detecta errores de cuota excedida
- ✅ Detecta timeouts y errores de conexión
- ✅ Cambia automáticamente al siguiente modelo disponible

### 2. Rotación Inteligente de Modelos
- ✅ Lista de modelos Groq ordenados por velocidad
- ✅ Rotación automática cuando un modelo falla
- ✅ Fallback a Ollama si todos los modelos Groq fallan
- ✅ Registro de modelos que funcionan

### 3. Sistema de Recuperación
- ✅ Reintentos automáticos con diferentes modelos
- ✅ No requiere reiniciar el bot
- ✅ Continúa funcionando sin interrupciones
- ✅ Logs claros de cada cambio de modelo

## 📋 Modelos Disponibles (en orden de prioridad)

1. **llama-3.3-70b-versatile** - Más rápido y eficiente
2. **llama-3.1-70b-versatile** - Alternativa rápida
3. **llama-3.2-90b-text-preview** - Modelo grande
4. **mixtral-8x7b-32768** - Contexto largo
5. **gemma2-9b-it** - Modelo ligero
6. **Ollama (local)** - Fallback final

## 🚀 Cómo Funciona

### Flujo Automático:

```
Usuario envía mensaje
    ↓
Intenta con Modelo 1 (llama-3.3-70b)
    ↓
¿Rate limit? → SÍ → Cambia automáticamente a Modelo 2
    ↓
Intenta con Modelo 2 (llama-3.1-70b)
    ↓
¿Rate limit? → SÍ → Cambia automáticamente a Modelo 3
    ↓
... continúa hasta encontrar un modelo que funcione
    ↓
Si todos fallan → Usa Ollama (local)
```

## 🔧 Configuración

### Variables de Entorno Necesarias:

```env
# Groq API (principal)
GROQ_API_KEY=tu_api_key_aqui

# Ollama (fallback local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## 📊 Pruebas

### Ejecutar Test Automático:

```bash
node test-auto-model-switch.js
```

Este test verifica:
- ✅ Auto-detección habilitada
- ✅ Cambio automático funciona
- ✅ Múltiples modelos disponibles
- ✅ Recuperación ante errores

## 💡 Ventajas del Sistema

1. **Cero Intervención Humana**
   - El bot se recupera solo
   - No necesitas estar pendiente
   - Funciona 24/7 sin supervisión

2. **Alta Disponibilidad**
   - Si un modelo falla, usa otro
   - Múltiples opciones de respaldo
   - Ollama como última opción

3. **Optimización Automática**
   - Usa el modelo más rápido disponible
   - Aprende qué modelos funcionan mejor
   - Se adapta a las condiciones de la API

4. **Logs Transparentes**
   - Registra cada cambio de modelo
   - Muestra razón del cambio
   - Facilita debugging

## 🎯 Casos de Uso

### Escenario 1: Rate Limit en Hora Pico
```
11:30 AM - Usuario envía mensaje
11:30 AM - Rate limit en llama-3.3-70b
11:30 AM - Cambio automático a llama-3.1-70b
11:30 AM - ✓ Respuesta enviada exitosamente
```

### Escenario 2: Múltiples Rate Limits
```
2:15 PM - Rate limit en llama-3.3-70b
2:15 PM - Rate limit en llama-3.1-70b
2:15 PM - Cambio automático a llama-3.2-90b
2:15 PM - ✓ Respuesta enviada exitosamente
```

### Escenario 3: Todos los Modelos Groq Fallan
```
5:45 PM - Rate limit en todos los modelos Groq
5:45 PM - Cambio automático a Ollama (local)
5:45 PM - ✓ Respuesta enviada exitosamente
```

## 📈 Monitoreo

El sistema registra automáticamente:
- Modelo actual en uso
- Cambios de modelo realizados
- Razón de cada cambio
- Éxito/fallo de cada intento

## 🔄 Mantenimiento

**No requiere mantenimiento manual**. El sistema:
- Se auto-configura al iniciar
- Se auto-recupera de errores
- Se auto-optimiza con el uso

## ✨ Resultado Final

Tu bot ahora es **completamente autónomo** y puede:
- ✅ Manejar rate limits automáticamente
- ✅ Cambiar de modelo sin intervención
- ✅ Funcionar 24/7 sin supervisión
- ✅ Optimizarse continuamente
- ✅ Recuperarse de cualquier error de API

**¡El bot es ahora 100% automático y resiliente!** 🎉
