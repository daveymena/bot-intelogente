# 🤖 Configurar Ollama con Gemma 3 4B

## 🎯 Objetivo

Integrar Ollama con Gemma 3 4B como fallback local y gratuito cuando:
- Se agotan los tokens de Groq
- No hay conexión a internet
- Quieres entrenar sin consumir tokens

## 📋 Requisitos

- Windows 10/11
- 8GB RAM mínimo (16GB recomendado)
- 5GB espacio en disco

## 🚀 Instalación

### 1. Instalar Ollama

**Opción A: Instalador Windows**
```bash
# Descargar desde:
https://ollama.com/download/windows

# Ejecutar el instalador
# Ollama se instalará y correrá automáticamente
```

**Opción B: Winget**
```bash
winget install Ollama.Ollama
```

### 2. Verificar Instalación

```bash
# Verificar que Ollama está corriendo
ollama --version

# Debería mostrar algo como: ollama version 0.x.x
```

### 3. Descargar Gemma 2 2B (Recomendado)

```bash
# Modelo pequeño y rápido (2B parámetros)
ollama pull gemma2:2b

# Esto descargará ~1.6GB
```

**Alternativas:**

```bash
# Gemma 2 9B (más potente pero más lento)
ollama pull gemma2:9b

# Llama 3.2 3B (alternativa)
ollama pull llama3.2:3b
```

### 4. Probar Ollama

```bash
# Probar el modelo
ollama run gemma2:2b

# Escribe algo y presiona Enter
# Para salir: /bye
```

## ⚙️ Configuración en el Bot

### 1. Agregar Variables de Entorno

Edita tu archivo `.env`:

```env
# Ollama Configuration
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
OLLAMA_TIMEOUT=60000
OLLAMA_MAX_TOKENS=500
```

### 2. Reiniciar el Bot

```bash
npm run dev
```

### 3. Verificar que Funciona

El bot mostrará en los logs:

```
[Ollama] ✅ Conectado exitosamente
[Ollama] 📦 Modelos disponibles: 1
```

## 🧪 Probar Ollama

### Test Manual

```bash
# En otra terminal
curl http://localhost:11434/api/tags

# Debería mostrar los modelos instalados
```

### Test en el Bot

El bot intentará usar Ollama automáticamente cuando:
1. Groq falla (rate limit, error, etc.)
2. No hay tokens disponibles
3. Ollama está habilitado en `.env`

## 📊 Comparación de Modelos

| Modelo | Tamaño | RAM | Velocidad | Calidad |
|--------|--------|-----|-----------|---------|
| gemma2:2b | 1.6GB | 4GB | ⚡⚡⚡ Muy rápido | ⭐⭐⭐ Buena |
| gemma2:9b | 5.5GB | 8GB | ⚡⚡ Rápido | ⭐⭐⭐⭐ Muy buena |
| llama3.2:3b | 2GB | 4GB | ⚡⚡⚡ Muy rápido | ⭐⭐⭐ Buena |

**Recomendación:** `gemma2:2b` para desarrollo local

## 🔄 Flujo de Fallback

```
Cliente envía mensaje
    ↓
1. Intentar con Groq (8 API keys con rotación)
    ↓ (si falla)
2. Intentar con Ollama (gemma2:2b local) ✅ NUEVO
    ↓ (si falla)
3. Buscar en base de conocimiento local
    ↓ (si falla)
4. Respuesta genérica de fallback
```

## 🎯 Ventajas de Ollama

### ✅ Gratis e Ilimitado
- No consume tokens de APIs
- Sin límites de rate limit
- Funciona offline

### ✅ Privacidad
- Todo se procesa localmente
- No se envían datos a servidores externos
- Ideal para datos sensibles

### ✅ Rápido
- Respuestas en 1-3 segundos
- No depende de conexión a internet
- Sin latencia de red

### ✅ Confiable
- Siempre disponible
- No depende de servicios externos
- Perfecto para desarrollo

## ⚠️ Limitaciones

### Calidad de Respuestas
- Gemma 2B es menos potente que Llama 3.3 70B (Groq)
- Puede generar respuestas menos precisas
- Mejor para tareas simples

### Recursos
- Consume RAM (4-8GB)
- Usa CPU/GPU
- Puede ser lento en PCs antiguos

### Contexto
- Ventana de contexto más pequeña
- Menos memoria de conversación
- Mejor para respuestas cortas

## 🔧 Troubleshooting

### Problema: "Ollama no está corriendo"

```bash
# Verificar si Ollama está corriendo
tasklist | findstr ollama

# Si no está, iniciarlo
ollama serve
```

### Problema: "Modelo no encontrado"

```bash
# Listar modelos instalados
ollama list

# Descargar el modelo
ollama pull gemma2:2b
```

### Problema: "Timeout"

Aumentar el timeout en `.env`:
```env
OLLAMA_TIMEOUT=120000  # 2 minutos
```

### Problema: "Respuestas lentas"

Usar un modelo más pequeño:
```bash
ollama pull gemma2:2b  # Más rápido
```

O aumentar recursos:
```env
OLLAMA_MAX_TOKENS=300  # Menos tokens = más rápido
```

## 📝 Comandos Útiles

```bash
# Listar modelos instalados
ollama list

# Eliminar un modelo
ollama rm gemma2:9b

# Ver información del modelo
ollama show gemma2:2b

# Actualizar Ollama
# Descargar nuevo instalador de ollama.com

# Detener Ollama
# Cerrar desde el System Tray (bandeja del sistema)
```

## 🚀 Para Producción (Easypanel)

### 1. Agregar Servicio de Ollama

En Easypanel, crear un nuevo servicio:

```yaml
name: ollama
image: ollama/ollama:latest
ports:
  - 11434:11434
volumes:
  - ollama-data:/root/.ollama
environment:
  - OLLAMA_HOST=0.0.0.0:11434
```

### 2. Descargar Modelo

```bash
# Conectar al contenedor
docker exec -it ollama ollama pull gemma2:2b
```

### 3. Configurar Bot

```env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=gemma2:2b
```

## 📊 Monitoreo

### Ver Logs de Ollama

El bot mostrará:

```
[IntelligentEngine] 🚀 Intentando con Groq...
[IntelligentEngine] ❌ Error con Groq: Rate limit
[IntelligentEngine] 🤖 Groq agotado, intentando con Ollama...
[Ollama] 🤖 Generando respuesta con gemma2:2b
[Ollama] ✅ Respuesta generada: ...
[IntelligentEngine] ✅ Respuesta generada con Ollama exitosamente
```

### Estadísticas

```bash
# Ver uso de recursos
ollama ps

# Ver modelos y tamaño
ollama list
```

## 🎓 Próximos Pasos

1. ✅ Instalar Ollama
2. ✅ Descargar gemma2:2b
3. ✅ Configurar `.env`
4. ✅ Reiniciar bot
5. ✅ Probar con consultas
6. ⏳ Entrenar el bot sin consumir tokens

## 💡 Tips

### Para Desarrollo
- Usa `gemma2:2b` (rápido y ligero)
- Habilita Ollama solo cuando necesites
- Mantén Groq como principal

### Para Producción
- Usa `gemma2:9b` (mejor calidad)
- Habilita Ollama como fallback
- Monitorea uso de recursos

### Para Entrenamiento
- Usa Ollama para entrenar sin tokens
- Guarda respuestas en base de conocimiento
- Luego usa conocimiento local (sin IA)

---

**Estado:** ✅ Listo para usar  
**Modelo recomendado:** gemma2:2b  
**Tiempo de setup:** 10-15 minutos
