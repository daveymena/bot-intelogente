# 🔗 Integración Core AI con Proyecto Actual

## 🎯 Objetivo

Agregar capacidades neuronales avanzadas a tu bot de WhatsApp existente sin romper nada.

## 📊 Arquitectura Híbrida

```
WhatsApp (Baileys) ✅
    ↓
Tu Proyecto Node.js ✅
    ↓
Hybrid AI Service (NUEVO)
    ├─ 1. Core AI (neuronal) 🧠 ← NUEVO
    ├─ 2. Ollama (LLM local) ✅
    └─ 3. Local Generator (fallback) ✅
```

## ⚡ Inicio Rápido (5 minutos)

### 1. Agregar Variables de Entorno

Agregar a tu `.env`:

```env
# Core AI Service
USE_CORE_AI=true
CORE_AI_URL=http://localhost:8000

# Qdrant Vector DB
QDRANT_HOST=localhost
QDRANT_PORT=6333

# AI Configuration
AI_MODEL=Qwen/Qwen2.5-0.5B-Instruct
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
MAX_TOKENS=512
TEMPERATURE=0.7
CONFIDENCE_THRESHOLD=0.75

# Training
AUTO_TRAIN_ENABLED=true
AUTO_TRAIN_INTERVAL=86400
MIN_SAMPLES_FOR_TRAIN=100
```

### 2. Iniciar Servicios de IA

```bash
# Opción A: Usar docker-compose.ai.yml
docker-compose -f docker-compose.ai.yml up -d

# Opción B: Iniciar manualmente
cd ai-local-system/core-ai
docker build -t core-ai .
docker run -d -p 8000:8000 --name core-ai core-ai
```

### 3. Entrenar Modelo Inicial

```bash
# Entrenar clasificador de intenciones
docker exec core-ai python scripts/train_intent.py

# Cargar base de conocimiento
docker exec core-ai python scripts/load_kb.py
```

### 4. Sincronizar tus Datos

```bash
# Sincronizar productos, conversaciones y KB
npm run sync:ai

# O manualmente:
npx tsx scripts/sync-to-core-ai.ts
```

### 5. Probar Integración

```bash
# Health check
curl http://localhost:8000/health

# Test query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "text": "¿Cuánto cuesta el Macbook?"
  }'
```

## 🔧 Integración con tu Código

### Opción 1: Usar Hybrid AI Service (Recomendado)

Modificar tu handler de mensajes de WhatsApp:

```typescript
// En src/lib/baileys-stable-service.ts o donde manejes mensajes

import { hybridAI } from './hybrid-ai-service';

async function handleIncomingMessage(message: any) {
  const userPhone = message.key.remoteJid;
  const messageText = getMessageText(message);
  
  if (!messageText) return;

  try {
    // Usar Hybrid AI (automáticamente elige el mejor sistema)
    const response = await hybridAI.generateResponse({
      userPhone,
      message: messageText,
      context: {
        recentMessages: await getRecentMessages(userPhone),
        userPreferences: await getUserPreferences(userPhone)
      }
    });

    // Enviar respuesta
    await sendMessage(userPhone, response.text);

    // Ejecutar acciones si las hay
    if (response.actions) {
      await executeActions(userPhone, response.actions);
    }

    // Log para análisis
    console.log(`[AI] Source: ${response.source}, Confidence: ${response.confidence}`);

  } catch (error) {
    console.error('[AI] Error:', error);
    // Tu manejo de errores actual
  }
}
```

### Opción 2: Usar Core AI Directamente

```typescript
import { coreAI } from './core-ai-client';

async function handleIncomingMessage(message: any) {
  const userPhone = message.key.remoteJid;
  const messageText = getMessageText(message);
  
  if (!messageText) return;

  try {
    // Verificar si Core AI está disponible
    if (coreAI.isAvailable()) {
      const response = await coreAI.query({
        user_id: userPhone,
        text: messageText,
        context: {}
      });

      // Si tiene alta confianza, usar respuesta
      if (response.confidence > 0.75) {
        await sendMessage(userPhone, response.reply);
        return;
      }
    }

    // Fallback a tu sistema actual
    const localResponse = await generateLocalResponse(messageText);
    await sendMessage(userPhone, localResponse);

  } catch (error) {
    console.error('[AI] Error:', error);
  }
}
```

## 📦 Scripts Disponibles

Agregar a tu `package.json`:

```json
{
  "scripts": {
    "ai:start": "docker-compose -f docker-compose.ai.yml up -d",
    "ai:stop": "docker-compose -f docker-compose.ai.yml down",
    "ai:logs": "docker-compose -f docker-compose.ai.yml logs -f core-ai",
    "ai:train": "docker exec core-ai python scripts/train_intent.py",
    "ai:load-kb": "docker exec core-ai python scripts/load_kb.py",
    "sync:ai": "npx tsx scripts/sync-to-core-ai.ts",
    "ai:health": "curl http://localhost:8000/health",
    "ai:stats": "curl http://localhost:8000/stats"
  }
}
```

## 🎓 Entrenamiento Automático

El sistema aprende automáticamente de conversaciones exitosas:

```typescript
// Después de una conversación exitosa
import { hybridAI } from './hybrid-ai-service';

async function onConversationComplete(conversationId: string, outcome: 'success' | 'failure') {
  if (outcome === 'success') {
    const conversation = await getConversation(conversationId);
    
    await hybridAI.trainFromConversation({
      conversationId,
      messages: conversation.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      outcome: 'success'
    });
    
    console.log(`✅ Conversación ${conversationId} enviada para entrenamiento`);
  }
}
```

## 📊 Monitoreo

### Ver Logs

```bash
# Logs de Core AI
docker logs -f core-ai

# Logs de Qdrant
docker logs -f qdrant
```

### Health Check

```bash
# Core AI
curl http://localhost:8000/health

# Qdrant
curl http://localhost:6333/health
```

### Estadísticas

```bash
# Stats de Core AI
curl http://localhost:8000/stats

# O desde tu código:
const stats = await hybridAI.getStats();
console.log(stats);
```

## 🔄 Sincronización Periódica

Configurar cron job para sincronizar datos automáticamente:

```bash
# Agregar a crontab (Linux/Mac)
# Sincronizar cada 6 horas
0 */6 * * * cd /path/to/project && npm run sync:ai

# O usar node-cron en tu aplicación:
```

```typescript
import cron from 'node-cron';
import { exec } from 'child_process';

// Sincronizar cada 6 horas
cron.schedule('0 */6 * * *', () => {
  console.log('🔄 Iniciando sincronización automática...');
  exec('npm run sync:ai', (error, stdout, stderr) => {
    if (error) {
      console.error('Error en sincronización:', error);
    } else {
      console.log('✅ Sincronización completada');
    }
  });
});
```

## 🎯 Casos de Uso

### 1. Consulta de Producto

```
Usuario: "¿Cuánto cuesta el Macbook Pro?"

Core AI:
- Intent: product_price (confidence: 0.95)
- Retrieval: Busca en productos indexados
- Response: "El Macbook Pro M4 16GB está en $4.500.000. 
            Tenemos 3 unidades disponibles. ¿Te gustaría reservar uno?"
```

### 2. Agendamiento de Cita

```
Usuario: "Quiero cita para corte de cabello"

Core AI:
- Intent: schedule_appointment (confidence: 0.92)
- Rules Engine: Maneja flujo de agendamiento
- Response: "Horarios disponibles mañana:
            1. 10:00 AM
            2. 2:00 PM
            3. 4:00 PM
            ¿Cuál prefieres?"
```

### 3. Consulta Compleja

```
Usuario: "Necesito un portátil para diseño gráfico, presupuesto 3-4 millones"

Core AI:
- Intent: product_recommend (confidence: 0.88)
- Retrieval: Busca productos relevantes
- LLM: Genera recomendación personalizada
- Response: "Te recomiendo el Dell XPS 15 ($3.800.000) 
            o el Macbook Pro M4 ($4.500.000). 
            Ambos excelentes para diseño. ¿Cuál prefieres?"
```

## 🐛 Troubleshooting

### Core AI no inicia

```bash
# Ver logs
docker logs core-ai

# Verificar puerto
lsof -i :8000

# Reiniciar
docker restart core-ai
```

### Qdrant no conecta

```bash
# Verificar servicio
docker ps | grep qdrant

# Reiniciar
docker restart qdrant

# Verificar health
curl http://localhost:6333/health
```

### Sincronización falla

```bash
# Verificar conexión a DB
echo $DATABASE_URL

# Verificar Core AI
curl http://localhost:8000/health

# Ejecutar con logs
npx tsx scripts/sync-to-core-ai.ts
```

### Respuestas lentas

```bash
# Opción 1: Cambiar a modelo más pequeño
# En .env: AI_MODEL=Qwen/Qwen2.5-0.5B-Instruct

# Opción 2: Reducir tokens
# En .env: MAX_TOKENS=256

# Opción 3: Aumentar threshold
# En .env: CONFIDENCE_THRESHOLD=0.85
```

## 📈 Métricas de Éxito

Después de integrar, monitorear:

- ✅ **Accuracy**: % de respuestas correctas
- ✅ **Confidence**: Promedio de confianza
- ✅ **Latency**: Tiempo de respuesta
- ✅ **Fallback Rate**: % de veces que usa fallback
- ✅ **Training Rate**: Conversaciones entrenadas/día

## 🎉 Próximos Pasos

1. ✅ Iniciar servicios
2. ✅ Entrenar modelo inicial
3. ✅ Sincronizar datos
4. ✅ Integrar con Baileys
5. ✅ Probar con mensajes reales
6. 📊 Monitorear métricas
7. 🎓 Dejar que aprenda automáticamente
8. 🚀 Optimizar según resultados

## 🆘 Soporte

- **Documentación completa**: `ai-local-system/README.md`
- **Guía de despliegue**: `ai-local-system/EASYPANEL_DEPLOY.md`
- **Inicio rápido**: `ai-local-system/QUICK_START.md`
- **Integración**: `ai-local-system/INTEGRACION_PROYECTO_ACTUAL.md`

---

**¿Listo para empezar?** Ejecuta:

```bash
npm run ai:start
npm run ai:train
npm run ai:load-kb
npm run sync:ai
```

¡Y tu bot tendrá capacidades neuronales! 🧠🚀
