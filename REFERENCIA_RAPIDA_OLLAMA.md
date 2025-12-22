# 🚀 REFERENCIA RÁPIDA: OLLAMA LLAMA3.1:8B

## ⚡ Inicio Rápido

```bash
# Iniciar sistema
INICIAR_CON_OLLAMA_LLAMA31.bat

# O manualmente
npm run dev
```

## 🔧 Configuración Actual

```env
OLLAMA_MODEL=llama3.1:8b
DISABLE_GROQ=true
AI_FALLBACK_ENABLED=false
```

## 📊 Métricas

- **Velocidad:** 15-20 segundos
- **Confianza:** 80-95%
- **Costo:** $0 (gratis)
- **Memoria:** 8 mensajes de contexto

## 🧪 Tests Rápidos

```bash
# Test simple (3 casos)
npx tsx scripts/test-ollama-simple-contexto.ts

# Test completo (7 casos)
npx tsx scripts/test-ollama-con-productos-reales.ts

# Debug productos
npx tsx scripts/test-busqueda-productos-debug.ts
```

## 🔍 Verificar Ollama

```bash
# Ver modelos disponibles
curl https://davey-ollama2.mapf5v.easypanel.host/api/tags

# Probar modelo
curl -X POST https://davey-ollama2.mapf5v.easypanel.host/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"llama3.1:8b\",\"prompt\":\"Hola\",\"stream\":false}"
```

## 📝 Logs Útiles

```bash
# Ver logs del orchestrator
[Orchestrator] 🎯 Iniciando procesamiento...
[Orchestrator] 🤖 Usando Ollama...
[Ollama] 🔍 Productos encontrados: 5
[Ollama] 📦 Productos:
[Ollama]    1. Laptop Asus - $1.329.900
[Orchestrator] ✅ Ollama respondió con confianza 95%
```

## ⚠️ Troubleshooting

### Problema: "Ollama timeout"
```bash
# Aumentar timeout en .env
OLLAMA_TIMEOUT=120000  # 2 minutos
```

### Problema: "No encuentra productos"
```bash
# Verificar userId
npx tsx scripts/test-busqueda-productos-debug.ts
```

### Problema: "Respuestas muy largas"
```bash
# Reducir tokens en .env
OLLAMA_MAX_TOKENS=300
```

### Problema: "Pierde contexto"
```typescript
// Aumentar historial en ollama-orchestrator-professional.ts
...history.slice(-10)  // 10 mensajes en lugar de 8
```

## 🎯 Casos de Uso

### ✅ Funciona Bien:
- Saludos
- Búsqueda de productos
- Preguntas por "opción 2"
- Objeciones de precio
- Mantener contexto

### ⚠️ Mejorable:
- Detección de métodos de pago
- Generación de links
- Nombres de productos muy largos

## 📞 Comandos Útiles

```bash
# Reiniciar Ollama en Easypanel
docker restart ollama-container

# Ver logs de Ollama
docker logs ollama-container -f

# Descargar modelo nuevo
docker exec ollama-container ollama pull llama3.1:8b

# Listar modelos
docker exec ollama-container ollama list

# Eliminar modelo
docker exec ollama-container ollama rm llama3.2:3b
```

## 🔄 Cambiar de Modelo

### A llama3.2:3b (más rápido, menos memoria)
```env
OLLAMA_MODEL=llama3.2:3b
```

### A gemma2:2b (muy rápido, menos preciso)
```env
OLLAMA_MODEL=gemma2:2b
```

### Volver a Groq (más rápido, con costo)
```env
DISABLE_GROQ=false
AI_FALLBACK_ENABLED=true
AI_FALLBACK_ORDER=groq,ollama,local
```

## 📈 Monitoreo

### Ver estadísticas
```typescript
const stats = await OllamaProfessionalOrchestrator.getStats()
console.log(stats)
```

### Verificar disponibilidad
```typescript
const available = await OllamaProfessionalOrchestrator.isAvailable()
console.log('Ollama disponible:', available)
```

## 🎉 Estado Actual

✅ **FUNCIONANDO EN PRODUCCIÓN**
- Modelo: llama3.1:8b
- Velocidad: 15-20s
- Confianza: 80-95%
- Costo: $0
- Memoria: 8 mensajes

---

**Última actualización:** 28 Noviembre 2025  
**Próxima revisión:** 5 Diciembre 2025
