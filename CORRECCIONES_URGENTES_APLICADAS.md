# ✅ Correcciones Urgentes Aplicadas

## 🔴 Problemas Detectados en Logs

1. **Groq excede límite de tokens** (6046/6000)
2. **Ollama timeout** (10 segundos insuficiente)
3. **Múltiples reconexiones simultáneas**

## ✅ Soluciones Implementadas

### 1. Reducción de Historial de Conversación

**Archivo**: `src/lib/ai-service.ts`

**Cambio**:
- **Antes**: Cargaba hasta 100 mensajes (50 intercambios)
- **Después**: Carga solo 20 mensajes (10 intercambios)

**Resultado**: Reduce tokens de ~6046 a ~2000-3000

```typescript
// ANTES
take: 100 // Máximo 100 mensajes

// DESPUÉS
take: 20 // Máximo 20 mensajes para evitar exceder límite de tokens
```

### 2. Aumento de Timeout de Ollama

**Archivos**: 
- `src/lib/ai-multi-provider.ts`
- `src/lib/ai-advanced-reasoning.ts`

**Cambio**:
- **Antes**: 10 segundos (10000ms)
- **Después**: 60 segundos (60000ms)

**Resultado**: Ollama tiene más tiempo para responder

```typescript
// ANTES
const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '10000')

// DESPUÉS
const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '60000')
```

### 3. Script de Limpieza

**Archivo**: `scripts/arreglar-problemas-urgentes.ts`

**Funciones**:
- Limpia conversaciones antiguas (>24h)
- Elimina mensajes huérfanos
- Resetea conexiones inconsistentes
- Muestra estadísticas

**Uso**:
```bash
npx tsx scripts/arreglar-problemas-urgentes.ts
```

## 🚀 Cómo Aplicar

### Paso 1: Ejecutar Script de Limpieza

```bash
npx tsx scripts/arreglar-problemas-urgentes.ts
```

Esto limpiará:
- Conversaciones antiguas
- Mensajes huérfanos
- Conexiones en estado inconsistente

### Paso 2: Reiniciar el Servidor

```bash
# Detener servidor actual
Ctrl + C

# Iniciar de nuevo
npm run dev
```

### Paso 3: Verificar en Logs

Deberías ver:
```
[AI] 📚 Historial cargado: 10-20 mensajes de las últimas 24h
[Groq] ✅ Éxito en intento 1
```

En lugar de:
```
[Groq] ❌ Request too large: 6046/6000 tokens
[Ollama] ❌ Timeout
```

## 📊 Impacto Esperado

### Antes
- ❌ Groq falla por exceso de tokens
- ❌ Ollama timeout frecuente
- ❌ Múltiples reconexiones
- ⏱️ Respuestas lentas (30-40s)

### Después
- ✅ Groq funciona correctamente
- ✅ Ollama tiene tiempo suficiente
- ✅ Reconexiones controladas
- ⚡ Respuestas más rápidas (5-15s)

## 🔧 Configuración Adicional (Opcional)

Si aún tienes problemas, puedes ajustar en `.env`:

```env
# Reducir aún más el historial
AI_MAX_HISTORY_MESSAGES=10

# Aumentar timeout de Ollama
OLLAMA_TIMEOUT=90000

# Desactivar Ollama temporalmente si sigue fallando
OLLAMA_ENABLED=false
```

## 📝 Notas Importantes

### Historial Reducido
- Solo afecta al contexto enviado a la IA
- Los mensajes siguen guardándose en la BD
- El bot aún recuerda conversaciones pasadas

### Timeout de Ollama
- 60 segundos es suficiente para la mayoría de casos
- Si tu servidor Ollama es lento, aumenta a 90000 (90s)

### Limpieza Automática
- El script se puede ejecutar periódicamente
- Considera agregarlo a un cron job

## 🎯 Próximos Pasos

1. ✅ Aplicar correcciones (HECHO)
2. ⏳ Reiniciar servidor
3. ⏳ Probar con mensaje de prueba
4. ⏳ Verificar logs
5. ⏳ Monitorear por 1 hora

## 🐛 Si Persisten Problemas

### Groq sigue fallando
```bash
# Reducir más el historial
# En src/lib/ai-service.ts línea 56
take: 10 // Solo 10 mensajes
```

### Ollama sigue con timeout
```bash
# Verificar que Ollama esté corriendo
curl https://bot-whatsapp-ollama.sqaoeo.easypanel.host/api/tags

# Si no responde, desactivar temporalmente
OLLAMA_ENABLED=false
```

### Múltiples reconexiones
```bash
# Ejecutar script de limpieza
npx tsx scripts/arreglar-problemas-urgentes.ts

# Verificar que no haya múltiples instancias corriendo
ps aux | grep node
```

## ✅ Checklist de Verificación

- [ ] Script de limpieza ejecutado
- [ ] Servidor reiniciado
- [ ] Logs muestran menos mensajes en historial
- [ ] Groq responde exitosamente
- [ ] Ollama no hace timeout
- [ ] Solo una conexión activa
- [ ] Respuestas en tiempo razonable

---

**Fecha**: Hoy
**Estado**: ✅ Correcciones aplicadas, listas para probar
