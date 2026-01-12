# 🚀 ACTUALIZAR EASYPANEL CON OLLAMA OPTIMIZADO

## Variables a Actualizar en Easypanel

Ve a tu proyecto en Easypanel → Settings → Environment Variables y actualiza estas variables:

### 1. Cambiar Prioridad de IA

```env
# Cambiar de Groq a Ollama como principal
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq
```

### 2. Configurar Ollama

```env
# URL de Ollama en Easypanel
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host

# O si está en el mismo proyecto (más rápido):
OLLAMA_BASE_URL=http://ollama:11434

# Modelo más potente
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=30000
OLLAMA_MAX_TOKENS=800
```

### 3. Optimizar Groq (Fallback)

```env
# Usar modelos pequeños primero
GROQ_MODEL=llama-3.1-8b-instant
GROQ_FALLBACK_MODELS=llama-3.1-8b-instant,gemma2-9b-it
```

## Verificar que Ollama Funciona

### Opción 1: Desde Easypanel Console

```bash
# Conectar al contenedor de Ollama
docker exec -it ollama ollama list

# Debería mostrar los modelos instalados
```

### Opción 2: Desde URL Externa

```bash
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags
```

Debería retornar JSON con los modelos disponibles.

## Instalar Modelo Recomendado

Si `llama3.1:8b` no está instalado:

```bash
# Conectar a Easypanel Console
docker exec -it ollama ollama pull qwen2.5:7b

# O modelo más pequeño pero rápido:
docker exec -it ollama ollama pull llama3.2:3b
```

## Configuración Recomendada

### Para Máximo Rendimiento (Ollama en mismo proyecto)

```env
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:7b
AI_PROVIDER=ollama
```

**Ventajas:**
- ✅ Más rápido (red interna)
- ✅ Sin latencia de internet
- ✅ Más seguro

### Para Máxima Compatibilidad (URL externa)

```env
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=qwen2.5:7b
AI_PROVIDER=ollama
```

**Ventajas:**
- ✅ Funciona aunque estén en proyectos diferentes
- ✅ Más fácil de debuggear
- ✅ Accesible desde fuera

## Después de Actualizar

1. **Reiniciar el servicio** en Easypanel
2. **Verificar logs** para ver que usa Ollama:
   ```
   [Ollama] Usando modelo qwen2.5:7b
   ✅ Búsqueda local: 4 productos encontrados (sin usar IA)
   ```

3. **Probar con un mensaje:**
   - Envía: "Hola, tienes parlantes?"
   - Debería responder sin errores de rate limit

## Troubleshooting

### Error: "Cannot connect to Ollama"

**Solución 1:** Verificar que Ollama esté corriendo
```bash
docker ps | grep ollama
```

**Solución 2:** Usar URL interna si están en mismo proyecto
```env
OLLAMA_BASE_URL=http://ollama:11434
```

**Solución 3:** Verificar que el puerto esté expuesto en Easypanel

### Error: "Model not found"

**Solución:** Instalar el modelo
```bash
docker exec -it ollama ollama pull qwen2.5:7b
```

### Ollama muy lento

**Solución 1:** Usar modelo más pequeño
```env
OLLAMA_MODEL=llama3.2:3b
```

**Solución 2:** Aumentar recursos del contenedor en Easypanel
- CPU: Mínimo 2 cores
- RAM: Mínimo 4GB

### Sigue usando Groq en lugar de Ollama

**Solución:** Verificar variables de entorno
```env
AI_PROVIDER=ollama  # NO groq
DEFAULT_AI_PROVIDER=ollama  # NO groq
```

## Monitoreo

### Ver qué proveedor está usando:

En los logs del bot busca:
- `[Ollama]` = Usando Ollama ✅
- `[Groq Rotator]` = Usando Groq (fallback) ⚠️
- `✅ Búsqueda local` = Sin usar IA (óptimo) 🚀

### Estadísticas esperadas:

- 90% de consultas: Búsqueda local (0 tokens)
- 8% de consultas: Ollama (0 tokens, ilimitado)
- 2% de consultas: Groq (solo si Ollama falla)

## Resultado Final

✅ **IA ilimitada** con Ollama
✅ **Sin límites de tokens**
✅ **Fallback automático** a Groq si falla
✅ **90% de consultas sin IA** (búsqueda local)
✅ **Ahorro del 95% en costos** de API

---

**Archivo de referencia completo:** `VARIABLES_ENTORNO_EASYPANEL_COMPLETAS.env`
