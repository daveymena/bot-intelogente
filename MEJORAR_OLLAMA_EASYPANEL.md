# 🚀 MEJORAR OLLAMA EN EASYPANEL

## Configuración Actual

```env
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=10000
OLLAMA_MAX_TOKENS=300
AI_PROVIDER=ollama
```

## ⚠️ Problemas con `gemma:2b`

El modelo `gemma:2b` es MUY pequeño:
- Solo 2 billones de parámetros
- Respuestas de baja calidad
- Puede dar respuestas incoherentes
- No entiende bien el contexto

## ✅ Modelos Recomendados

### Opción 1: `llama3.2:3b` (Recomendado)
```env
OLLAMA_MODEL=llama3.2:3b
OLLAMA_MAX_TOKENS=500
```

**Ventajas:**
- ✅ 3 billones de parámetros (50% más potente)
- ✅ Mejor comprensión del español
- ✅ Respuestas más coherentes
- ✅ Rápido (2-3 segundos)
- ✅ Usa ~2GB RAM

**Instalar:**
```bash
# Conectar a Easypanel Console del contenedor Ollama
docker exec -it ollama ollama pull llama3.2:3b
```

### Opción 2: `llama3.1:8b` (Mejor Calidad)
```env
OLLAMA_MODEL=llama3.1:8b
OLLAMA_MAX_TOKENS=800
```

**Ventajas:**
- ✅ 8 billones de parámetros (4x más potente)
- ✅ Excelente comprensión del español
- ✅ Respuestas de alta calidad
- ✅ Mejor razonamiento
- ✅ Usa ~4GB RAM

**Desventajas:**
- ⚠️ Más lento (4-6 segundos)
- ⚠️ Requiere más RAM

**Instalar:**
```bash
docker exec -it ollama ollama pull llama3.1:8b
```

### Opción 3: `qwen2.5:3b` (Alternativa)
```env
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_MAX_TOKENS=500
```

**Ventajas:**
- ✅ Muy rápido
- ✅ Bueno con productos y comercio
- ✅ Usa ~2GB RAM

**Instalar:**
```bash
docker exec -it ollama ollama pull qwen2.5:3b
```

## 📊 Comparación

| Modelo | Parámetros | RAM | Velocidad | Calidad | Recomendado |
|--------|-----------|-----|-----------|---------|-------------|
| gemma:2b | 2B | 1.5GB | ⚡⚡⚡ | ⭐⭐ | ❌ No |
| llama3.2:3b | 3B | 2GB | ⚡⚡ | ⭐⭐⭐⭐ | ✅ Sí |
| qwen2.5:3b | 3B | 2GB | ⚡⚡⚡ | ⭐⭐⭐ | ✅ Sí |
| llama3.1:8b | 8B | 4GB | ⚡ | ⭐⭐⭐⭐⭐ | ✅ Sí (si tienes RAM) |

## 🔧 Cómo Cambiar el Modelo

### Paso 1: Instalar el Modelo

Conecta a la consola de Easypanel del contenedor Ollama:

```bash
# Ver modelos instalados
docker exec -it ollama ollama list

# Instalar nuevo modelo (ejemplo: llama3.2:3b)
docker exec -it ollama ollama pull llama3.2:3b

# Verificar que se instaló
docker exec -it ollama ollama list
```

### Paso 2: Actualizar Variables de Entorno

En Easypanel → Settings → Environment Variables:

```env
OLLAMA_MODEL=llama3.2:3b
OLLAMA_MAX_TOKENS=500
OLLAMA_TIMEOUT=15000
```

### Paso 3: Reiniciar el Servicio

Reinicia el servicio del bot en Easypanel para que tome los cambios.

## 💡 Configuración Óptima Recomendada

### Para Servidor con 4GB+ RAM:
```env
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=llama3.1:8b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=15000
OLLAMA_MAX_TOKENS=800
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq
```

### Para Servidor con 2-4GB RAM:
```env
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=llama3.2:3b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=12000
OLLAMA_MAX_TOKENS=500
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq
```

### Para Servidor con <2GB RAM:
```env
# Mantener gemma:2b pero aumentar tokens
OLLAMA_BASE_URL=https://bot-whatsapp-ollama.sqaoeo.easypanel.host
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=10000
OLLAMA_MAX_TOKENS=500
AI_PROVIDER=ollama
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_ORDER=ollama,groq
```

## 🎯 Aumentar MAX_TOKENS

El valor actual de `300` es muy bajo. Recomendaciones:

- **Mínimo:** 500 tokens (respuestas completas)
- **Recomendado:** 800 tokens (respuestas detalladas)
- **Máximo:** 1000 tokens (conversaciones largas)

```env
# Cambiar de:
OLLAMA_MAX_TOKENS=300

# A:
OLLAMA_MAX_TOKENS=500  # O 800 si tienes recursos
```

## 🔍 Verificar que Funciona

### 1. Ver logs del bot:
```
[Ollama] Usando modelo llama3.2:3b
[Ollama] ✅ Respuesta generada en 2.3s
```

### 2. Probar con mensaje:
Envía: "Hola, tienes laptops para diseño gráfico?"

**Con gemma:2b (malo):**
```
Sí tengo laptop
```

**Con llama3.2:3b (bueno):**
```
¡Claro! Tengo varias opciones de laptops ideales para diseño gráfico:

1️⃣ Laptop HP con Ryzen 7
   💰 $2.500.000
   
2️⃣ Laptop Asus con Intel i7
   💰 $2.800.000

¿Cuál te interesa?
```

## 🚨 Troubleshooting

### Ollama muy lento

**Solución 1:** Usar modelo más pequeño
```env
OLLAMA_MODEL=llama3.2:3b
```

**Solución 2:** Aumentar recursos en Easypanel
- CPU: 2+ cores
- RAM: 4GB+

### Respuestas de baja calidad

**Solución:** Cambiar a modelo más grande
```env
OLLAMA_MODEL=llama3.1:8b
```

### Error "model not found"

**Solución:** Instalar el modelo
```bash
docker exec -it ollama ollama pull llama3.2:3b
```

## 📈 Resultado Esperado

Con `llama3.2:3b` o superior:
- ✅ Respuestas coherentes y naturales
- ✅ Mejor comprensión del español
- ✅ Respuestas más completas
- ✅ Mejor manejo de productos
- ✅ Conversaciones más fluidas

---

**Recomendación Final:** Cambia a `llama3.2:3b` como mínimo para tener respuestas de calidad aceptable.
