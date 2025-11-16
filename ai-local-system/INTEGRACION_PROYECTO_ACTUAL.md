# 🔗 Integración con Proyecto Actual

## 📋 Análisis del Proyecto Existente

Tu proyecto actual ya tiene:
- ✅ Baileys integration (`src/lib/baileys-stable-service.ts`)
- ✅ Product intelligence (`src/lib/product-intelligence-service.ts`)
- ✅ Local response generator (`src/lib/local-response-generator.ts`)
- ✅ Ollama integration (`src/lib/ollama-service.ts`)
- ✅ Knowledge base (`src/lib/local-knowledge-base.ts`)
- ✅ Payment links (`src/lib/payment-link-generator.ts`)
- ✅ Prisma schema con PostgreSQL

## 🎯 Estrategia de Integración

### Opción 1: Híbrido (RECOMENDADO)
Mantener tu proyecto actual y agregar el Core AI como **servicio complementario**:

```
Tu Proyecto Actual (Node.js)
    ├─ Baileys (WhatsApp) ✅
    ├─ API Routes ✅
    ├─ Dashboard ✅
    └─ Llama a → Core AI Service (Python)
                    ├─ Intent Classifier
                    ├─ Embeddings
                    ├─ RAG Retriever
                    └─ Mini-LLM
```

**Ventajas**:
- ✅ No rompes nada existente
- ✅ Agregas capacidades neuronales
- ✅ Puedes usar ambos sistemas
- ✅ Migración gradual

### Opción 2: Reemplazo Completo
Migrar todo al nuevo sistema (más trabajo, más tiempo).

## 🚀 Implementación Opción 1 (Híbrido)

### Paso 1: Agregar Core AI como Servicio

Modificar tu `docker-compose.yml` o crear uno nuevo:

```yaml
# Agregar al docker-compose.yml existente o crear nuevo
services:
  # ... tus servicios actuales ...
  
  core-ai:
    build: ./ai-local-system/core-ai
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      QDRANT_HOST: qdrant
      QDRANT_PORT: 6333
    depends_on:
      - qdrant
    networks:
      - app-network
  
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - app-network

volumes:
  qdrant_data:

networks:
  app-network:
    driver: bridge
```

### Paso 2: Crear Cliente AI en tu Proyecto

Crear `src/lib/core-ai-client.ts`:

```typescript
import axios from 'axios';

interface QueryRequest {
  user_id: string;
  text: string;
  context?: Record<string, any>;
}

interface QueryResponse {
  intent: string;
  confidence: number;
  reply: string;
  actions?: Record<string, any>;
  retrieved_docs?: Array<any>;
  metadata?: Record<string, any>;
}

export class CoreAIClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.CORE_AI_URL || 'http://localhost:8000';
  }
  
  async query(request: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/query`, request, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Error calling Core AI:', error);
      throw error;
    }
  }
  
  async health(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }
  
  async stats(): Promise<any> {
    const response = await axios.get(`${this.baseURL}/stats`);
    return response.data;
  }
}

export const coreAI = new CoreAIClient();
```

### Paso 3: Integrar con tu Baileys Service

Modificar `src/lib/baileys-stable-service.ts` para usar Core AI:

```typescript
import { coreAI } from './core-ai-client';

// En tu función de manejo de mensajes:
async function handleIncomingMessage(message: any) {
  const userPhone = message.key.remoteJid;
  const messageText = message.message?.conversation || 
                      message.message?.extendedTextMessage?.text;
  
  if (!messageText) return;
  
  try {
    // Opción 1: Usar Core AI (neuronal)
    const aiResponse = await coreAI.query({
      user_id: userPhone,
      text: messageText,
      context: {
        // Contexto adicional de tu sistema
      }
    });
    
    // Si Core AI tiene alta confianza, usar su respuesta
    if (aiResponse.confidence > 0.8) {
      await sendMessage(userPhone, aiResponse.reply);
      
      // Ejecutar acciones si las hay
      if (aiResponse.actions) {
        await executeActions(userPhone, aiResponse.actions);
      }
      
      return;
    }
    
    // Opción 2: Fallback a tu sistema actual
    const localResponse = await generateLocalResponse(messageText);
    await sendMessage(userPhone, localResponse);
    
  } catch (error) {
    console.error('Error processing message:', error);
    // Fallback a sistema actual
    const localResponse = await generateLocalResponse(messageText);
    await sendMessage(userPhone, localResponse);
  }
}
```

### Paso 4: Crear Servicio Híbrido

Crear `src/lib/hybrid-ai-service.ts`:

```typescript
import { coreAI } from './core-ai-client';
import { OllamaService } from './ollama-service';
import { LocalResponseGenerator } from './local-response-generator';

export class HybridAIService {
  private ollama: OllamaService;
  private localGenerator: LocalResponseGenerator;
  private useCoreAI: boolean;
  
  constructor() {
    this.ollama = new OllamaService();
    this.localGenerator = new LocalResponseGenerator();
    this.useCoreAI = process.env.USE_CORE_AI === 'true';
  }
  
  async generateResponse(
    userPhone: string,
    message: string,
    context?: any
  ): Promise<string> {
    
    // 1. Intentar con Core AI (neuronal)
    if (this.useCoreAI) {
      try {
        const isHealthy = await coreAI.health();
        
        if (isHealthy) {
          const response = await coreAI.query({
            user_id: userPhone,
            text: message,
            context
          });
          
          if (response.confidence > 0.75) {
            console.log(`✅ Core AI (confidence: ${response.confidence})`);
            return response.reply;
          }
        }
      } catch (error) {
        console.warn('Core AI failed, using fallback');
      }
    }
    
    // 2. Fallback a Ollama
    try {
      const ollamaResponse = await this.ollama.generate(message, context);
      console.log('✅ Ollama response');
      return ollamaResponse;
    } catch (error) {
      console.warn('Ollama failed, using local generator');
    }
    
    // 3. Fallback a generador local
    const localResponse = await this.localGenerator.generate(message, context);
    console.log('✅ Local generator response');
    return localResponse;
  }
}

export const hybridAI = new HybridAIService();
```

### Paso 5: Actualizar Variables de Entorno

Agregar a tu `.env`:

```env
# Core AI Service
USE_CORE_AI=true
CORE_AI_URL=http://localhost:8000

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333
```

### Paso 6: Sincronizar Datos

Crear script `scripts/sync-to-core-ai.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const CORE_AI_URL = process.env.CORE_AI_URL || 'http://localhost:8000';

async function syncProducts() {
  console.log('📦 Sincronizando productos...');
  
  const products = await prisma.product.findMany({
    where: { active: true }
  });
  
  const documents = products.map(p => ({
    id: `prod_${p.id}`,
    text: `${p.name}. ${p.description}. Precio: $${p.price}. Stock: ${p.stock} unidades.`,
    metadata: {
      category: p.category,
      price: p.price,
      stock: p.stock,
      tags: p.tags
    }
  }));
  
  // Enviar a Core AI para indexar
  await axios.post(`${CORE_AI_URL}/index/products`, {
    documents
  });
  
  console.log(`✅ ${documents.length} productos sincronizados`);
}

async function syncConversations() {
  console.log('💬 Sincronizando conversaciones...');
  
  const conversations = await prisma.conversation.findMany({
    where: {
      outcome: 'success',
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 días
      }
    },
    include: {
      messages: true
    }
  });
  
  for (const conv of conversations) {
    await axios.post(`${CORE_AI_URL}/train`, {
      conversation_id: conv.id,
      messages: conv.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      outcome: conv.outcome
    });
  }
  
  console.log(`✅ ${conversations.length} conversaciones sincronizadas`);
}

async function main() {
  await syncProducts();
  await syncConversations();
  console.log('🎉 Sincronización completa');
}

main();
```

### Paso 7: Crear Endpoint de Sincronización

Crear `src/app/api/ai/sync/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    // Ejecutar script de sincronización
    await execAsync('npx tsx scripts/sync-to-core-ai.ts');
    
    return NextResponse.json({
      success: true,
      message: 'Sincronización completada'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

## 🎯 Plan de Migración Gradual

### Fase 1: Setup (Día 1)
- [x] Agregar Core AI al docker-compose
- [x] Crear cliente TypeScript
- [x] Configurar variables de entorno
- [x] Iniciar servicios

### Fase 2: Integración (Día 2)
- [ ] Integrar con Baileys
- [ ] Crear servicio híbrido
- [ ] Sincronizar productos
- [ ] Probar con mensajes reales

### Fase 3: Entrenamiento (Día 3-7)
- [ ] Sincronizar conversaciones históricas
- [ ] Entrenar con datos reales
- [ ] Ajustar confianza threshold
- [ ] Monitorear accuracy

### Fase 4: Optimización (Semana 2)
- [ ] Ajustar prompts
- [ ] Optimizar retrieval
- [ ] Mejorar templates
- [ ] A/B testing

### Fase 5: Producción (Semana 3)
- [ ] Core AI como principal
- [ ] Ollama como fallback
- [ ] Monitoreo completo
- [ ] Auto-entrenamiento activo

## 📊 Comparación de Sistemas

| Característica | Sistema Actual | Core AI | Híbrido |
|----------------|----------------|---------|---------|
| Velocidad | ⚡⚡⚡ Rápido | ⚡⚡ Medio | ⚡⚡⚡ Rápido |
| Inteligencia | ⭐⭐ Básica | ⭐⭐⭐⭐ Alta | ⭐⭐⭐⭐ Alta |
| Aprendizaje | ❌ Manual | ✅ Automático | ✅ Automático |
| Costo | 💰 Bajo | 💰 Bajo | 💰 Bajo |
| Mantenimiento | 🔧🔧 Medio | 🔧 Bajo | 🔧 Bajo |
| Escalabilidad | ⬆️⬆️ Media | ⬆️⬆️⬆️ Alta | ⬆️⬆️⬆️ Alta |

## 🚀 Comandos Rápidos

```bash
# Iniciar Core AI
docker-compose up -d qdrant core-ai

# Entrenar modelo inicial
docker-compose exec core-ai python scripts/train_intent.py

# Cargar KB inicial
docker-compose exec core-ai python scripts/load_kb.py

# Sincronizar productos
npm run sync:ai

# Ver logs
docker-compose logs -f core-ai

# Health check
curl http://localhost:8000/health

# Test query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "text": "Hola"}'
```

## ✅ Checklist de Integración

- [ ] Core AI service corriendo
- [ ] Qdrant funcionando
- [ ] Cliente TypeScript creado
- [ ] Servicio híbrido implementado
- [ ] Variables de entorno configuradas
- [ ] Productos sincronizados
- [ ] Conversaciones sincronizadas
- [ ] Pruebas exitosas
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

## 🎉 Resultado Final

Tendrás un sistema híbrido que:
1. ✅ Mantiene todo tu código actual funcionando
2. ✅ Agrega capacidades neuronales avanzadas
3. ✅ Aprende automáticamente de conversaciones
4. ✅ Tiene múltiples niveles de fallback
5. ✅ Es fácil de mantener y escalar

**Próximo paso**: Ejecutar los comandos de la sección "Comandos Rápidos" para iniciar la integración.
