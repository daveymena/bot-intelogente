# 🦙 Guía de Instalación de Ollama

Ollama es tu respaldo local ilimitado. Funciona en tu computadora sin necesidad de internet.

## 🚀 Instalación Rápida

### Windows

1. **Descargar Ollama:**
   - Ve a: https://ollama.com/download
   - Descarga el instalador para Windows
   - Ejecuta el instalador

2. **Verificar instalación:**
```bash
ollama --version
```

3. **Descargar un modelo ligero:**
```bash
# Modelo recomendado: Gemma 2B (solo 2GB)
ollama pull gemma:2b

# Alternativas:
ollama pull llama3.2:3b    # 3GB - Mejor calidad
ollama pull phi3:mini      # 2GB - Muy eficiente
```

## 📋 Modelos Recomendados

### Para Computadoras con 8GB RAM o menos:
```bash
ollama pull gemma:2b       # Más ligero (2GB)
ollama pull phi3:mini      # Muy eficiente (2GB)
```

### Para Computadoras con 16GB RAM o más:
```bash
ollama pull llama3.2:3b    # Balance perfecto (3GB)
ollama pull mistral:7b     # Muy bueno (4GB)
```

## ⚙️ Configuración en el Bot

Una vez instalado Ollama, agrega esto a tu `.env`:

```env
# Ollama (IA Local - Sin límites)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=60000
```

## 🧪 Probar Ollama

### Desde la terminal:
```bash
# Probar el modelo
ollama run gemma:2b "Hola, ¿cómo estás?"
```

### Desde el bot:
```bash
node test-triple-respaldo.js
```

## 💡 Ventajas de Ollama

- ✅ **Sin límites** - Usa cuanto quieras
- ✅ **100% privado** - Todo en tu computadora
- ✅ **Funciona offline** - No necesita internet
- ✅ **Gratis** - Sin costos mensuales
- ✅ **Rápido** - Respuestas en 3-5 segundos

## 🔧 Comandos Útiles

```bash
# Ver modelos instalados
ollama list

# Descargar un modelo
ollama pull gemma:2b

# Eliminar un modelo
ollama rm gemma:2b

# Ver uso de recursos
ollama ps

# Detener Ollama
ollama stop
```

## 🎯 Integración con el Bot

Una vez instalado, el bot usará Ollama automáticamente cuando:
1. Groq alcance su rate limit
2. OpenRouter agote sus 50 mensajes/día
3. Cualquier otro provider falle

**No necesitas hacer nada más!** El sistema lo detecta y usa automáticamente.

## 📊 Rendimiento Esperado

| Modelo | RAM Necesaria | Velocidad | Calidad |
|--------|---------------|-----------|---------|
| gemma:2b | 2GB | ⚡⚡⚡ Rápido | ⭐⭐⭐ Buena |
| phi3:mini | 2GB | ⚡⚡⚡ Rápido | ⭐⭐⭐ Buena |
| llama3.2:3b | 4GB | ⚡⚡ Medio | ⭐⭐⭐⭐ Muy buena |
| mistral:7b | 4GB | ⚡⚡ Medio | ⭐⭐⭐⭐⭐ Excelente |

## 🆘 Solución de Problemas

### Ollama no inicia:
```bash
# Reiniciar el servicio
ollama serve
```

### Puerto ocupado:
```bash
# Cambiar puerto en .env
OLLAMA_BASE_URL=http://localhost:11435
```

### Modelo muy lento:
```bash
# Usar un modelo más ligero
ollama pull gemma:2b
```

## 🎉 Resultado Final

Con Ollama instalado, tu bot tiene:
- ✅ Groq (principal, rápido)
- ✅ OpenRouter (50 msg/día gratis)
- ✅ Ollama (ilimitado, local)

**= Sistema 100% resiliente y sin límites!** 🚀
