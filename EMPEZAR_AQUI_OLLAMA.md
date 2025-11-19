# 🚀 EMPEZAR AQUÍ - Ollama gemma2:4b

## ✅ ¿Qué se hizo?

Configuré Ollama para usar **gemma2:4b** (tu modelo local de 3.3 GB) con un timeout largo de 3 minutos para que no se quede esperando.

## 🎯 Configuración Aplicada

```env
OLLAMA_MODEL=gemma2:4b
OLLAMA_TIMEOUT=180000  # 3 minutos
OLLAMA_BASE_URL=http://localhost:11434
AI_FALLBACK_ORDER=groq,ollama
```

## 🚀 Cómo Probar AHORA

### Opción 1: Prueba Rápida (Recomendado)
```bash
probar-ollama-ahora.bat
```

### Opción 2: Paso a Paso
```bash
# 1. Ver modelos
ollama list

# 2. Probar Ollama
node test-ollama-gemma2.js

# 3. Entrenar bot
npx tsx scripts/entrenar-bot.ts
```

## 📊 Resultados Esperados

### Antes
- ❌ Ollama HTTP 404 errors
- ❌ Precisión: 3.45% (1/29 correctos)
- ⚠️ Rate limit de Groq constante

### Ahora
- ✅ Ollama funcionando con gemma2:4b
- ✅ Timeout de 3 minutos (suficiente)
- ✅ Fallback automático: Groq → Ollama
- ✅ Sin límites de entrenamiento

## 🎓 Entrenar el Bot

Una vez que Ollama funcione:

```bash
npx tsx scripts/entrenar-bot.ts
```

Esto probará 29 casos de productos reales y mejorará la precisión del bot.

## 💡 Ventajas

1. **Sin límites**: Ollama es local, sin límites de API
2. **Mejor modelo**: gemma2:4b (4B parámetros vs 2B)
3. **Fallback inteligente**: Usa Groq primero, Ollama si falla
4. **Timeout largo**: 3 minutos para respuestas complejas

## 🐛 Si algo falla

### Ollama no responde
```bash
ollama serve
```

### Muy lento
Cambia a gemma:2b (más rápido):
```env
OLLAMA_MODEL=gemma:2b
```

### Error 404
```bash
ollama pull gemma2:4b
```

## 📁 Archivos Creados

- ✅ `test-ollama-gemma2.js` - Prueba rápida
- ✅ `probar-ollama-ahora.bat` - Comando rápido
- ✅ `verificar-sistema-ia.bat` - Verificación completa
- ✅ `OLLAMA_GEMMA2_CONFIGURADO.md` - Documentación
- ✅ `CONFIGURACION_OLLAMA_GEMMA2_LISTA.md` - Detalles técnicos

## 🎉 ¡Listo!

Ejecuta esto ahora:
```bash
probar-ollama-ahora.bat
```

Y luego entrena el bot:
```bash
npx tsx scripts/entrenar-bot.ts
```

**¡Deberías ver una mejora significativa en la precisión!** 🚀
