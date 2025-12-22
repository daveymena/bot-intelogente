# 🧠 Sistema de Aprendizaje Continuo para el Bot

## 🎯 Objetivo

Crear un sistema que:
1. **Capture** todas las conversaciones reales
2. **Evalúe** la calidad de las respuestas
3. **Almacene** los mejores ejemplos
4. **Entrene** un modelo local (LLM) con estos datos
5. **Mejore** continuamente el bot

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CONVERSACIÓN REAL                         │
│              Cliente ↔ Bot (Groq/Local)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  1. CAPTURA AUTOMÁTICA                       │
│   • Guarda pregunta + respuesta + contexto                  │
│   • Marca timestamp, usuario, producto                       │
│   • Almacena en tabla TrainingData                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  2. EVALUACIÓN AUTOMÁTICA                    │
│   • ¿El cliente respondió positivamente?                    │
│   • ¿Hubo venta?                                            │
│   • ¿El cliente pidió más información?                      │
│   • Asigna score de calidad (1-5)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  3. CURACIÓN DE DATOS                        │
│   • Filtra respuestas con score >= 4                        │
│   • Elimina duplicados                                       │
│   • Agrupa por categoría (productos, pagos, etc.)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  4. GENERACIÓN DE DATASET                    │
│   • Formato JSONL para fine-tuning                          │
│   • Formato compatible con Ollama/LLaMA                     │
│   • Incluye system prompt + ejemplos                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  5. ENTRENAMIENTO LOCAL                      │
│   • Fine-tune de modelo local (Ollama)                      │
│   • Validación con datos de prueba                          │
│   • Despliegue del modelo mejorado                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  6. MEJORA CONTINUA                          │
│   • Bot local cada vez más inteligente                      │
│   • Menos dependencia de APIs externas                      │
│   • Respuestas más precisas y contextuales                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estructura de Base de Datos

### Nueva Tabla: TrainingData

```prisma
model TrainingData {
  id                String   @id @default(cuid())
  userId            String
  conversationId    String
  
  // Datos de entrada
  userMessage       String   @db.Text
  botResponse       String   @db.Text
  context           Json?    // Historial, producto mencionado, etc.
  
  // Metadatos
  productId         String?
  productName       String?
  category          String?  // "producto", "pago", "soporte", etc.
  
  // Evaluación
  qualityScore      Int?     // 1-5
  wasSuccessful     Boolean? // ¿Hubo venta o respuesta positiva?
  userFeedback      String?  // Respuesta del cliente después
  
  // Timestamps
  createdAt         DateTime @default(now())
  evaluatedAt       DateTime?
  
  // Relaciones
  user              User     @relation(fields: [userId], references: [id])
  conversation      Conversation @relation(fields: [conversationId], references: [id])
  
  @@map("training_data")
  @@index([userId, qualityScore])
  @@index([category, qualityScore])
}
```

---

## 📝 Implementación

### 1. Servicio de Captura

```typescript
// src/lib/training-capture-service.ts

export class TrainingCaptureService {
  /**
   * Capturar interacción para entrenamiento
   */
  static async captureInteraction(
    userId: string,
    conversationId: string,
    userMessage: string,
    botResponse: string,
    context: {
      historial?: any[]
      productId?: string
      productName?: string
      category?: string
    }
  ): Promise<void> {
    try {
      await db.trainingData.create({
        data: {
          userId,
          conversationId,
          userMessage,
          botResponse,
          context: context.historial || [],
          productId: context.productId,
          productName: context.productName,
          category: context.category || this.detectCategory(userMessage),
          qualityScore: null, // Se evaluará después
          wasSuccessful: null
        }
      })
      
      console.log('[Training] ✅ Interacción capturada para entrenamiento')
    } catch (error) {
      console.error('[Training] ❌ Error capturando:', error)
    }
  }
  
  /**
   * Detectar categoría automáticamente
   */
  private static detectCategory(message: string): string {
    const normalized = message.toLowerCase()
    
    if (/\b(busco|quiero|necesito|recomienda)\b/.test(normalized)) {
      return 'consulta_producto'
    }
    if (/\b(pago|pagar|comprar|link|método)\b/.test(normalized)) {
      return 'proceso_pago'
    }
    if (/\b(foto|imagen|ver|muestra)\b/.test(normalized)) {
      return 'solicitud_foto'
    }
    if (/\b(precio|cuesta|cuánto|valor)\b/.test(normalized)) {
      return 'consulta_precio'
    }
    if (/\b(envío|entrega|domicilio)\b/.test(normalized)) {
      return 'consulta_envio'
    }
    
    return 'general'
  }
}
```

### 2. Servicio de Evaluación

```typescript
// src/lib/training-evaluation-service.ts

export class TrainingEvaluationService {
  /**
   * Evaluar calidad de la interacción basado en la siguiente respuesta
   */
  static async evaluateInteraction(
    trainingDataId: string,
    nextUserMessage: string
  ): Promise<void> {
    try {
      const score = this.calculateQualityScore(nextUserMessage)
      const wasSuccessful = this.wasSuccessful(nextUserMessage)
      
      await db.trainingData.update({
        where: { id: trainingDataId },
        data: {
          qualityScore: score,
          wasSuccessful,
          userFeedback: nextUserMessage,
          evaluatedAt: new Date()
        }
      })
      
      console.log(`[Training] ✅ Evaluación: score=${score}, success=${wasSuccessful}`)
    } catch (error) {
      console.error('[Training] ❌ Error evaluando:', error)
    }
  }
  
  /**
   * Calcular score de calidad (1-5)
   */
  private static calculateQualityScore(nextMessage: string): number {
    const normalized = nextMessage.toLowerCase()
    
    // Score 5: Respuestas muy positivas
    if (/\b(perfecto|excelente|genial|gracias|me gusta|lo quiero|voy a comprar)\b/.test(normalized)) {
      return 5
    }
    
    // Score 4: Respuestas positivas
    if (/\b(ok|bien|sí|si|dale|listo)\b/.test(normalized)) {
      return 4
    }
    
    // Score 3: Neutral (pide más info)
    if (/\b(más|info|detalles|cuéntame|explica)\b/.test(normalized)) {
      return 3
    }
    
    // Score 2: Negativas suaves
    if (/\b(no entiendo|confuso|no sé|duda)\b/.test(normalized)) {
      return 2
    }
    
    // Score 1: Negativas fuertes
    if (/\b(no me sirve|no me gusta|no quiero|mal)\b/.test(normalized)) {
      return 1
    }
    
    return 3 // Neutral por defecto
  }
  
  /**
   * Determinar si fue exitosa
   */
  private static wasSuccessful(nextMessage: string): boolean {
    const normalized = nextMessage.toLowerCase()
    
    return /\b(comprar|pagar|link|método|voy a|lo quiero|me interesa)\b/.test(normalized)
  }
}
```

### 3. Generador de Dataset

```typescript
// src/lib/training-dataset-generator.ts

export class TrainingDatasetGenerator {
  /**
   * Generar dataset en formato JSONL para fine-tuning
   */
  static async generateDataset(
    userId: string,
    minQualityScore: number = 4
  ): Promise<string> {
    try {
      // Obtener datos de alta calidad
      const trainingData = await db.trainingData.findMany({
        where: {
          userId,
          qualityScore: { gte: minQualityScore },
          evaluatedAt: { not: null }
        },
        orderBy: { createdAt: 'desc' },
        take: 1000 // Últimos 1000 ejemplos de calidad
      })
      
      console.log(`[Training] 📊 Generando dataset con ${trainingData.length} ejemplos`)
      
      // Formato JSONL para fine-tuning
      const jsonl = trainingData.map(data => {
        return JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente de ventas experto en Tecnovariedades D&S. Respondes de manera natural, amigable y profesional.'
            },
            {
              role: 'user',
              content: data.userMessage
            },
            {
              role: 'assistant',
              content: data.botResponse
            }
          ],
          metadata: {
            category: data.category,
            productName: data.productName,
            qualityScore: data.qualityScore
          }
        })
      }).join('\n')
      
      // Guardar archivo
      const filename = `training-dataset-${Date.now()}.jsonl`
      const filepath = path.join(process.cwd(), 'training-data', filename)
      
      await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
      await fs.promises.writeFile(filepath, jsonl)
      
      console.log(`[Training] ✅ Dataset generado: ${filepath}`)
      console.log(`[Training] 📊 Total de ejemplos: ${trainingData.length}`)
      
      return filepath
    } catch (error) {
      console.error('[Training] ❌ Error generando dataset:', error)
      throw error
    }
  }
  
  /**
   * Generar estadísticas del dataset
   */
  static async getDatasetStats(userId: string): Promise<any> {
    const stats = await db.trainingData.groupBy({
      by: ['category', 'qualityScore'],
      where: { userId },
      _count: true
    })
    
    return {
      total: await db.trainingData.count({ where: { userId } }),
      byCategory: stats,
      highQuality: await db.trainingData.count({
        where: { userId, qualityScore: { gte: 4 } }
      })
    }
  }
}
```

---

## 🚀 Integración en el Flujo

### En baileys-stable-service.ts

```typescript
// Después de enviar respuesta
await socket.sendMessage(from, { text: formattedResponse })

// 📝 CAPTURAR PARA ENTRENAMIENTO
const { TrainingCaptureService } = await import('./training-capture-service')
await TrainingCaptureService.captureInteraction(
  userId,
  conversationId,
  messageText,
  formattedResponse,
  {
    historial: conversationHistory,
    productId: productContext?.lastProductId,
    productName: productContext?.lastProductName
  }
)
```

---

## 📊 Dashboard de Entrenamiento

### API Endpoint

```typescript
// src/app/api/training/stats/route.ts

export async function GET(request: Request) {
  const userId = await getUserId(request)
  
  const stats = await TrainingDatasetGenerator.getDatasetStats(userId)
  
  return NextResponse.json(stats)
}
```

### Componente React

```typescript
// src/components/TrainingDashboard.tsx

export function TrainingDashboard() {
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    fetch('/api/training/stats')
      .then(r => r.json())
      .then(setStats)
  }, [])
  
  return (
    <div>
      <h2>📊 Datos de Entrenamiento</h2>
      <p>Total de interacciones: {stats?.total}</p>
      <p>Alta calidad (score >= 4): {stats?.highQuality}</p>
      
      <button onClick={generateDataset}>
        Generar Dataset para Entrenamiento
      </button>
    </div>
  )
}
```

---

## 🎓 Entrenamiento del Modelo Local

### Script de Fine-Tuning

```bash
# scripts/train-local-model.sh

#!/bin/bash

echo "🎓 Iniciando entrenamiento del modelo local..."

# 1. Generar dataset
npx tsx scripts/generate-training-dataset.ts

# 2. Fine-tune con Ollama
ollama create tecnovariedades-bot -f Modelfile

# 3. Probar modelo
ollama run tecnovariedades-bot "Busco un curso de piano"

echo "✅ Entrenamiento completado"
```

### Modelfile

```dockerfile
# Modelfile

FROM llama3.1:8b

# System prompt
SYSTEM """
Eres un asistente de ventas experto en Tecnovariedades D&S.
Respondes de manera natural, amigable y profesional.
Conoces todos los productos del catálogo y ayudas a los clientes a encontrar lo que necesitan.
"""

# Parámetros
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

# Cargar ejemplos de entrenamiento
ADAPTER ./training-data/training-dataset-latest.jsonl
```

---

## 📈 Mejora Continua

### Ciclo de Mejora

```
Semana 1: Capturar 100+ conversaciones
         ↓
Semana 2: Evaluar calidad automáticamente
         ↓
Semana 3: Generar dataset (score >= 4)
         ↓
Semana 4: Fine-tune modelo local
         ↓
Semana 5: Desplegar modelo mejorado
         ↓
Repetir ciclo...
```

---

## ✅ Beneficios

1. **Bot más inteligente** - Aprende de conversaciones reales
2. **Menos dependencia de APIs** - Modelo local entrenado
3. **Respuestas más precisas** - Basadas en tu negocio específico
4. **Reducción de costos** - Menos llamadas a Groq/OpenAI
5. **Privacidad** - Datos de entrenamiento en tu servidor

---

## 🎯 Próximos Pasos

1. Agregar tabla `TrainingData` al schema
2. Implementar servicios de captura y evaluación
3. Integrar en el flujo de conversación
4. Crear dashboard de estadísticas
5. Generar primer dataset
6. Fine-tune modelo local
7. Probar y desplegar

---

**¿Quieres que implemente este sistema completo?** 🚀
