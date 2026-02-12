# 🤖 Sistema Multi-Agente - Guía de Uso

## 🎯 ¿Qué es el Sistema Multi-Agente?

Es una arquitectura donde diferentes **agentes especializados** manejan distintos tipos de conversaciones:

- 🤝 **Agente de Ventas**: Maneja consultas de precios, comparaciones y cierres de venta
- 🛠️ **Agente de Soporte**: Resuelve problemas técnicos y reclamos
- 🔧 **Agente Técnico**: Proporciona especificaciones detalladas
- 📊 **Agente Admin**: Maneja facturación y temas administrativos

## 📋 Ejemplos de Uso

### Ejemplo 1: Consulta de Precio (Sales Agent)

**Cliente:** "Hola, ¿cuánto cuesta una laptop HP?"

**Flujo:**
1. IntentClassifier detecta: `consulta_precio`
2. AgentSelector elige: `SalesAgent`
3. SalesAgent:
   - Busca laptops HP en la BD
   - Construye respuesta con precios
   - Incrementa score de probabilidad (+10)
   - Guarda en memoria

**Respuesta:** "¡Hola! Tenemos laptops HP desde $X. ¿Te gustaría conocer las especificaciones?"

### Ejemplo 2: Soporte Técnico (Support Agent)

**Cliente:** "Mi producto llegó dañado"

**Flujo:**
1. IntentClassifier detecta: `reclamo`
2. AgentSelector elige: `SupportAgent`
3. SupportAgent:
   - Registra el reclamo
   - Proporciona solución o escala

**Respuesta:** "Lamento mucho eso. Vamos a solucionarlo de inmediato..."

### Ejemplo 3: Especificaciones (Technical Agent)

**Cliente:** "¿Cuánta RAM tiene?"

**Flujo:**
1. IntentClassifier detecta: `comparacion`
2. AgentSelector elige: `TechnicalAgent`
3. TechnicalAgent:
   - Detecta nivel técnico (intermediate)
   - Proporciona specs detalladas
   - Actualiza perfil del cliente

**Respuesta:** "Este modelo tiene 16GB DDR4 RAM..."

## 🔄 Cómo Funciona la Detección de Intención

El sistema usa IA (Groq/OpenClaw) para analizar cada mensaje:

```javascript
// Entrada
"¿Cuánto cuesta una laptop?"

// Análisis de IA
{
  "intent": "consulta_precio",
  "confidence": 0.95,
  "entities": {
    "categoria": "laptop"
  }
}

// Acción
→ Enruta a SalesAgent
```

## 🧠 Sistema de Scoring

Cada interacción suma puntos a la probabilidad de compra:

| Acción | Puntos |
|--------|--------|
| Consulta precio | +10 |
| Pregunta disponibilidad | +15 |
| Menciona presupuesto | +20 |
| Pregunta método de pago | +30 |

Cuando el score > 70, el cliente se marca como **HOT LEAD**.

## 📊 Personalización de Agentes

### Modificar el Agente de Ventas

Edita `src/prompts/salesPrompt.js`:

```javascript
getSystemPrompt: (clientName, recentProducts, leadStatus) => `
  Eres María, vendedora experta en tecnología.
  
  Reglas:
  1. Sé amigable y profesional
  2. Nunca inventes precios
  3. Si el cliente es HOT (${leadStatus}), ofrece descuento
  4. Siempre cierra con una pregunta
`
```

### Agregar Nuevo Agente

1. Crea `src/agents/customAgent.js`
2. Registra en `src/core/agentSelector.js`:

```javascript
const intentMap = {
  'nueva_intencion': customAgent,
  // ...
};
```

## 🔧 Configuración Avanzada

### Cambiar Modelo de IA

En `.env`:

```env
# Para Groq
AI_PROVIDER=groq
GROQ_API_KEY=tu_clave

# Para OpenClaw
AI_PROVIDER=openclaw
OPENCLAW_API_KEY=tu_clave
```

### Ajustar Timeouts

En `src/services/aiService.js`:

```javascript
const completion = await groq.chat.completions.create({
  messages: [...],
  model: 'llama3-8b-8192',
  max_tokens: 500, // Ajusta según necesidad
  temperature: 0.7 // 0 = preciso, 1 = creativo
});
```

## 📈 Monitoreo y Métricas

### Ver Conversiones

```javascript
const metricsService = require('./src/services/metricsService');

const rate = await metricsService.getConversionRate();
console.log(`Tasa de conversión: ${rate}%`);
```

### Ver Clientes Activos

```javascript
const active = await metricsService.getActiveClientsLastMonth();
console.log(`Clientes activos: ${active}`);
```

## 🚀 Mejores Prácticas

### 1. Mantén los Prompts Actualizados

Los prompts son el "cerebro" de cada agente. Actualízalos regularmente basándote en:
- Feedback de clientes
- Conversaciones exitosas
- Nuevos productos

### 2. Monitorea el Score de Clientes

Revisa periódicamente los clientes con alto score:

```sql
SELECT * FROM clients 
WHERE purchase_probability > 70 
ORDER BY purchase_probability DESC;
```

### 3. Limpia la Memoria Periódicamente

Archiva conversaciones antiguas para mantener la BD rápida:

```sql
-- Archivar conversaciones > 90 días
DELETE FROM conversations 
WHERE created_at < NOW() - INTERVAL '90 days';
```

## 🔍 Debugging

### Ver Logs Detallados

```bash
LOG_LEVEL=debug npm run bot:dev
```

### Probar Clasificación de Intención

```javascript
const intentClassifier = require('./src/core/intentClassifier');

const result = await intentClassifier.classify("¿Cuánto cuesta?");
console.log(result);
// { intent: 'consulta_precio', confidence: 0.9, entities: {} }
```

### Probar un Agente Directamente

```javascript
const salesAgent = require('./src/agents/salesAgent');

const response = await salesAgent.handle(
  'client-uuid',
  { intent: 'consulta_precio', confidence: 0.9 },
  '¿Cuánto cuesta una laptop?'
);
console.log(response);
```

## 🎓 Casos de Uso Avanzados

### Multi-Tenancy (SaaS)

El sistema soporta múltiples negocios:

```javascript
// Crear tenant
await db.query(
  'INSERT INTO tenants (name, plan) VALUES ($1, $2)',
  ['Tienda ABC', 'premium']
);

// Asociar cliente a tenant
await db.query(
  'INSERT INTO clients (phone, tenant_id) VALUES ($1, $2)',
  ['+573001234567', 'tenant-uuid']
);
```

### Integración con CRM

Exporta datos de clientes:

```javascript
const clients = await db.query(`
  SELECT 
    c.name,
    c.phone,
    c.purchase_probability,
    COUNT(cv.id) as interactions
  FROM clients c
  LEFT JOIN conversations cv ON c.id = cv.client_id
  GROUP BY c.id
  ORDER BY c.purchase_probability DESC
`);
```

## 📞 Soporte

Para dudas específicas:
1. Revisa `GUIA_MIGRACION.md`
2. Consulta los logs con `LOG_LEVEL=debug`
3. Verifica la conexión a BD con `node scripts/test-db-connection.js`
