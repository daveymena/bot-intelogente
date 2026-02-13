# 🧪 Cómo Probar OpenClaw con Herramientas Semánticas

## ✅ Estado del Sistema

**Bot reiniciado exitosamente** con las nuevas herramientas semánticas:
- ✅ `analyze_intent` - Análisis de intención con AI
- ✅ `ask_clarification` - Generación de preguntas
- ✅ `semantic_product_search` - Búsqueda semántica sin tags

## 🎯 Casos de Prueba Recomendados

### 1. Prueba de Ambigüedad: "teclado"

**Envía por WhatsApp:**
```
busco un teclado
```

**Comportamiento esperado:**
1. OpenClaw detecta ambigüedad
2. Llama a `analyze_intent`
3. Detecta `requiresClarification=true`
4. Llama a `ask_clarification`
5. Te pregunta: "¿Buscas un teclado para escribir o para tocar música?"

**Responde:**
```
para tocar música
```

**Resultado esperado:**
- OpenClaw busca productos relacionados con música/piano
- Muestra cursos de piano o productos musicales

---

### 2. Prueba de Corrección Ortográfica

**Envía por WhatsApp:**
```
curzo de piyano
```

**Comportamiento esperado:**
1. OpenClaw corrige automáticamente a "curso de piano"
2. Busca productos relevantes
3. Muestra cursos de piano disponibles

---

### 3. Prueba de Búsqueda Conceptual

**Envía por WhatsApp:**
```
algo para trabajar
```

**Comportamiento esperado:**
1. OpenClaw detecta intención vaga
2. Llama a `analyze_intent`
3. Genera múltiples interpretaciones (laptop, curso, software)
4. Llama a `ask_clarification`
5. Te pregunta: "¿Para qué tipo de trabajo lo necesitas?"

**Opciones que debería dar:**
1. Trabajo de oficina (documentos, correos)
2. Diseño gráfico o edición
3. Programación o desarrollo
4. Aprender nuevas habilidades (curso)

---

### 4. Prueba de Búsqueda Específica (Sin Semántica)

**Envía por WhatsApp:**
```
Mega Pack 11
```

**Comportamiento esperado:**
1. OpenClaw detecta nombre específico
2. NO usa herramientas semánticas (no es necesario)
3. Usa `get_product_with_payment` directamente
4. Muestra el producto con precio y links de pago

---

### 5. Prueba de Búsqueda General (Lista)

**Envía por WhatsApp:**
```
cursos digitales
```

**Comportamiento esperado:**
1. OpenClaw detecta búsqueda general
2. Usa `list_products_by_category`
3. Muestra lista de 3-5 cursos digitales
4. Te pide que elijas uno

---

## 📊 Qué Observar en los Logs

Abre la consola del servidor y busca estos mensajes:

### Cuando usa herramientas semánticas:
```
[SemanticInterpreter] 🧠 Analizando intención...
[SemanticInterpreter] Keywords: teclado
[SemanticInterpreter] ✅ Intención primaria: Buscar teclado
[SemanticInterpreter] Ambigüedad: 0.70 (requiere clarificación)

[ClarificationEngine] 💬 Generando preguntas de clarificación...
[ClarificationEngine] Tipo de ambigüedad: product_type
[ClarificationEngine] ✅ 1 preguntas generadas

[Tool] 🧠 Análisis de intención completado
[Tool] 💬 1 preguntas de clarificación generadas
```

### Cuando NO usa herramientas semánticas:
```
[Architect] 🔍 Análisis búsqueda: "Mega Pack 11" | General: false | Palabras: 3
[Architect] 🛠️ Ejecutando Skill: get_product_with_payment
[Skill] ✅ Encontrado en catálogo: Mega Pack 11
```

---

## 🔍 Verificar que las Herramientas Están Disponibles

Revisa los logs al inicio del servidor, deberías ver:

```
[OpenClaw] 🔑 5 API keys disponibles para rotación
```

Y en el código de `openclaw-orchestrator.ts`, las herramientas están definidas:
- ✅ `analyze_intent`
- ✅ `ask_clarification`
- ✅ `semantic_product_search`

---

## 🚨 Problemas Comunes

### 1. OpenClaw NO hace preguntas de clarificación

**Posibles causas:**
- El umbral de ambigüedad es muy alto
- OpenClaw decide usar búsqueda directa
- Rate limit de Groq

**Solución:**
- Verifica los logs para ver qué herramienta usó
- Ajusta el umbral en `semantic-interpreter.ts` (línea 66)

### 2. Rate Limit de Groq

**Mensaje en logs:**
```
[OpenClaw] ⚠️ Rate limit en modelo llama-3.1-8b-instant con key 1
[OpenClaw] 🔄 Rotando a key 2/5
```

**Esto es NORMAL** - El sistema rota automáticamente entre 5 API keys.

### 3. OpenClaw usa búsqueda por keywords en lugar de semántica

**Esto es CORRECTO** - OpenClaw decide cuándo usar cada herramienta:
- Búsqueda específica → keywords (más rápido)
- Búsqueda ambigua → semántica (más inteligente)

---

## 📈 Métricas de Éxito

### ✅ Sistema funcionando bien:
- Detecta ambigüedad en "teclado"
- Hace preguntas de clarificación
- Corrige errores ortográficos
- Busca productos relevantes sin depender de tags

### ⚠️ Sistema necesita ajustes:
- No detecta ambigüedad cuando debería
- Hace demasiadas preguntas
- Respuestas muy lentas (>10 segundos)
- Rate limiting constante

---

## 🎯 Próximos Pasos Después de Probar

1. **Si funciona bien**: Continuar con tareas pendientes del spec
2. **Si hay problemas**: Ajustar umbrales y prompts
3. **Si es muy lento**: Optimizar llamadas a Groq
4. **Si rate limiting**: Agregar más API keys

---

## 📚 Archivos de Referencia

- **Servicios semánticos**:
  - `src/lib/bot/semantic-interpreter.ts`
  - `src/lib/bot/clarification-engine.ts`
  - `src/lib/bot/product-matcher.ts`

- **Integración OpenClaw**:
  - `src/lib/bot/openclaw-orchestrator.ts` (líneas 300-450)

- **Tests**:
  - `test-new-intelligent-system.ts`
  - `test-semantic-interpretation-unit.ts`
  - `test-clarification-scenarios.ts`

---

**¡Ahora prueba enviando mensajes por WhatsApp y observa cómo OpenClaw usa las nuevas herramientas!** 🚀

**Tip**: Mantén abierta la consola del servidor para ver los logs en tiempo real.
