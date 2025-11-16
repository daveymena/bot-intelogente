# ⚡ Guía Rápida - Sistema Sin Docker

## 🎯 Objetivo

Generar 1,000+ conversaciones realistas para entrenar tu bot **sin necesidad de Docker**.

## ✅ Lo que Necesitas

- ✅ Node.js (ya lo tienes)
- ✅ Groq API Key (gratis en https://console.groq.com/)
- ⚪ Ollama (opcional)

## 🚀 Inicio en 3 Pasos

### Paso 1: Configurar Groq API

```bash
# 1. Obtener API key gratis de: https://console.groq.com/
# 2. Agregar a tu .env:
GROQ_API_KEY=gsk_tu_api_key_aqui
```

### Paso 2: Generar Dataset

```bash
# Opción A: Usar script .bat (Windows)
scripts\generar-dataset-simple.bat

# Opción B: Comando directo
npx tsx scripts/generar-dataset-completo.ts
```

**Tiempo**: 30-60 minutos  
**Resultado**: 1,000+ conversaciones en `data/training/`

### Paso 3: Usar el Dataset

El dataset generado incluye:

```
data/training/
├── dataset_completo_*.json          # Dataset completo
├── intent_training.txt              # Para entrenar clasificadores
├── conversations.jsonl              # Para embeddings
└── qdrant_documents.json            # Para búsqueda semántica
```

## 📊 Qué Genera

### 8 Mega-Flujos con Variaciones:

1. **Tecnología/Contraentrega** (50 conversaciones)
   - Cliente preguntón y desconfiado
   - Objeciones: "¿me estafas?", "¿es nuevo?", "vi más barato"
   - Preguntas técnicas: RAM, procesador, garantía

2. **Dropshipping** (40 conversaciones)
   - Tiempos de entrega, seguimiento
   - Garantías y devoluciones

3. **Servicios/Citas** (30 conversaciones)
   - Agendamiento, cambios, cancelaciones

4. **Soporte Técnico** (35 conversaciones)
   - Diagnóstico, reparación, cotización

5. **Productos Digitales** (45 conversaciones)
   - Megapacks, cursos, entrega inmediata

6. **Fiados/Crédito** (25 conversaciones)
   - Validación, plazos, pagos

7. **Cliente Agresivo** (30 conversaciones)
   - Objeciones fuertes, desconfianza extrema

8. **Cliente Indeciso** (40 conversaciones)
   - Comparaciones, dudas constantes

**Total: ~295 conversaciones × variaciones = 1,000+**

## 💡 Cómo Usar el Dataset

### Opción 1: Entrenar tu Sistema Actual

```typescript
// Cargar dataset
import dataset from './data/training/dataset_completo_*.json';

// Usar conversaciones para entrenar
for (const flujo of Object.values(dataset.flujos)) {
  for (const conv of flujo.conversaciones) {
    // Entrenar con conv.messages
    await entrenarConConversacion(conv);
  }
}
```

### Opción 2: Usar con Ollama

```typescript
// Usar conversaciones como ejemplos para Ollama
const ejemplos = dataset.flujos.tecnologia_contraentrega.conversaciones
  .map(c => c.messages)
  .flat();

// Incluir en contexto de Ollama
const response = await ollama.generate({
  prompt: userMessage,
  context: ejemplos.slice(0, 10) // Últimos 10 ejemplos
});
```

### Opción 3: Usar con Groq

```typescript
// Usar conversaciones como few-shot examples
const examples = dataset.flujos.tecnologia_contraentrega.conversaciones
  .slice(0, 3)
  .map(c => ({
    messages: c.messages
  }));

const response = await groq.chat.completions.create({
  messages: [
    { role: 'system', content: 'Eres asistente de ventas...' },
    ...examples.flatMap(e => e.messages),
    { role: 'user', content: userMessage }
  ]
});
```

### Opción 4: Crear Base de Conocimiento

```typescript
// Extraer pares Q&A
const qaDatabase = [];

for (const flujo of Object.values(dataset.flujos)) {
  for (const conv of flujo.conversaciones) {
    for (let i = 0; i < conv.messages.length - 1; i++) {
      if (conv.messages[i].role === 'user' && 
          conv.messages[i + 1].role === 'assistant') {
        qaDatabase.push({
          question: conv.messages[i].content,
          answer: conv.messages[i + 1].content,
          flujo: conv.flujo,
          intent: conv.metadata.intents_used[0]
        });
      }
    }
  }
}

// Guardar en tu base de datos
await prisma.knowledgeBase.createMany({ data: qaDatabase });
```

## 🎓 Ejemplo de Conversación Generada

```json
{
  "conversation_id": "conv_tecnologia_15",
  "flujo": "tecnologia_contraentrega",
  "outcome": "success",
  "messages": [
    {
      "role": "user",
      "content": "Hola, ¿tienes portátiles económicos?"
    },
    {
      "role": "assistant",
      "content": "¡Hola! 👋 Claro, ¿qué tipo de portátil buscas? ¿Para estudio, trabajo o algo más específico?"
    },
    {
      "role": "user",
      "content": "Para estudiar ingeniería, pero no quiero que se trabe"
    },
    {
      "role": "assistant",
      "content": "Perfecto 🙌 Para ingeniería básica necesitas:\n✔ 8GB RAM\n✔ SSD 256GB o más\n✔ Procesador i3/Ryzen 3 o mejor\n\n¿Cuánto es tu presupuesto máximo?"
    },
    // ... 20+ mensajes más con objeciones, preguntas, comparaciones
  ],
  "metadata": {
    "intents_used": ["product_price", "product_info", "product_compare"],
    "products_mentioned": ["HP 14", "ASUS 14"],
    "objections_handled": ["es_nuevo", "garantia", "contraentrega", "precio"],
    "final_action": "purchase"
  }
}
```

## 📈 Métricas del Dataset

Cada conversación incluye:
- ✅ 15-30 mensajes (conversación larga)
- ✅ 5-10 objeciones manejadas
- ✅ 3-5 intenciones diferentes
- ✅ Productos reales de tu BD
- ✅ Precios reales
- ✅ Flujo completo hasta cierre

## 🔧 Personalizar Generación

### Cambiar Cantidad de Variaciones

Editar `scripts/generar-dataset-completo.ts`:

```typescript
const MEGA_FLUJOS = {
  tecnologia_contraentrega: {
    variaciones: 100, // Cambiar de 50 a 100
    complejidad: 'alta'
  }
};
```

### Cambiar Temperatura (Creatividad)

```typescript
// En generarConversacionGroq()
temperature: 0.9, // 0.7 = conservador, 1.0 = muy creativo
```

### Agregar Más Objeciones

```typescript
// En crearPromptGeneracion()
3. Incluir TODAS estas objeciones reales:
   - "¿Es nuevo o usado?"
   - "¿Me estafas?"
   - "TU NUEVA OBJECIÓN AQUÍ"
```

## 🐛 Troubleshooting

### Error: Groq API no responde

```bash
# Verificar API key
echo %GROQ_API_KEY%

# Probar manualmente
curl https://api.groq.com/openai/v1/models ^
  -H "Authorization: Bearer %GROQ_API_KEY%"
```

### Error: Ollama no disponible

```bash
# Verificar Ollama
ollama list

# Si no está instalado, el sistema usará solo Groq
# Descargar de: https://ollama.ai/download
```

### Dataset vacío o incompleto

```bash
# Ver logs detallados
npx tsx scripts/generar-dataset-completo.ts > generation.log 2>&1

# Revisar log
type generation.log
```

## 📊 Próximos Pasos

1. ✅ **Generar dataset** (30-60 min)
2. ✅ **Revisar conversaciones** en `data/training/`
3. ✅ **Integrar con tu bot** (usar ejemplos arriba)
4. ✅ **Probar con usuarios reales**
5. ✅ **Recopilar feedback**
6. ✅ **Re-generar con ajustes**

## 💰 Costos

- **Groq API**: Gratis (6,000 requests/min)
- **Ollama**: Gratis (local)
- **Tiempo**: 30-60 minutos
- **Resultado**: 1,000+ conversaciones

**Total: $0 USD** 🎉

## 🎉 Ventajas de Este Enfoque

- ✅ **No necesitas Docker**
- ✅ **No necesitas Python**
- ✅ **Solo Node.js** (que ya tienes)
- ✅ **Gratis** (Groq API gratuita)
- ✅ **Rápido** (30-60 min)
- ✅ **Flexible** (usa el dataset como quieras)
- ✅ **Compatible** con cualquier sistema

## 📞 Comandos Útiles

```bash
# Generar dataset
scripts\generar-dataset-simple.bat

# Ver dataset generado
type data\training\dataset_completo_*.json | more

# Contar conversaciones
find /c "conversation_id" data\training\dataset_completo_*.json

# Ver estadísticas
npx tsx -e "console.log(require('./data/training/dataset_completo_*.json').metadata)"
```

---

**¡Listo! Ahora puedes generar 1,000+ conversaciones sin Docker!** 🚀

**Ejecuta**: `scripts\generar-dataset-simple.bat`
