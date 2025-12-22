/**
 * 🎓 Script para Mejorar el LLM del Bot
 * 
 * Funciones:
 * 1. Analizar conversaciones reales
 * 2. Generar dataset de entrenamiento
 * 3. Optimizar prompts
 * 4. Ajustar parámetros
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

interface ConversationAnalysis {
  totalConversations: number
  totalMessages: number
  avgMessagesPerConversation: number
  commonIntents: Map<string, number>
  commonKeywords: Map<string, number>
  responsePatterns: Map<string, number>
  avgResponseTime: number
}

interface TrainingExample {
  userMessage: string
  botResponse: string
  context: string
  intent: string
  keywords: string[]
  timestamp: Date
}

// Colores
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`)
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`)
}

/**
 * Analizar conversaciones reales de la base de datos
 */
async function analyzeConversations(): Promise<ConversationAnalysis> {
  section('1. ANÁLISIS DE CONVERSACIONES REALES')

  // Obtener conversaciones de los últimos 30 días
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const conversations = await db.conversation.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  log('📊', `Conversaciones encontradas: ${conversations.length}`, colors.cyan)

  const analysis: ConversationAnalysis = {
    totalConversations: conversations.length,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
    commonIntents: new Map(),
    commonKeywords: new Map(),
    responsePatterns: new Map(),
    avgResponseTime: 0
  }

  // Analizar cada conversación
  for (const conv of conversations) {
    analysis.totalMessages += conv.messages.length

    // Analizar mensajes
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i]

      if (msg.direction === 'INCOMING') {
        // Detectar intenciones
        const intent = detectIntent(msg.content)
        analysis.commonIntents.set(
          intent,
          (analysis.commonIntents.get(intent) || 0) + 1
        )

        // Extraer keywords
        const keywords = extractKeywords(msg.content)
        keywords.forEach(keyword => {
          analysis.commonKeywords.set(
            keyword,
            (analysis.commonKeywords.get(keyword) || 0) + 1
          )
        })
      }

      if (msg.direction === 'OUTGOING') {
        // Analizar patrones de respuesta
        const pattern = detectResponsePattern(msg.content)
        analysis.responsePatterns.set(
          pattern,
          (analysis.responsePatterns.get(pattern) || 0) + 1
        )
      }
    }
  }

  analysis.avgMessagesPerConversation = 
    analysis.totalMessages / analysis.totalConversations

  // Mostrar resultados
  log('💬', `Total de mensajes: ${analysis.totalMessages}`, colors.blue)
  log('📈', `Promedio por conversación: ${analysis.avgMessagesPerConversation.toFixed(1)}`, colors.blue)

  console.log()
  log('🎯', 'Intenciones más comunes:', colors.yellow)
  const topIntents = Array.from(analysis.commonIntents.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  topIntents.forEach(([intent, count], i) => {
    console.log(`   ${i + 1}. ${intent}: ${count} veces`)
  })

  console.log()
  log('🔑', 'Keywords más frecuentes:', colors.yellow)
  const topKeywords = Array.from(analysis.commonKeywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
  
  topKeywords.forEach(([keyword, count], i) => {
    console.log(`   ${i + 1}. ${keyword}: ${count} veces`)
  })

  return analysis
}

/**
 * Generar dataset de entrenamiento
 */
async function generateTrainingDataset(): Promise<TrainingExample[]> {
  section('2. GENERACIÓN DE DATASET DE ENTRENAMIENTO')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const conversations = await db.conversation.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  const trainingExamples: TrainingExample[] = []

  for (const conv of conversations) {
    const messages = conv.messages

    // Crear pares de pregunta-respuesta
    for (let i = 0; i < messages.length - 1; i++) {
      const userMsg = messages[i]
      const botMsg = messages[i + 1]

      if (userMsg.direction === 'INCOMING' && botMsg.direction === 'OUTGOING') {
        const example: TrainingExample = {
          userMessage: userMsg.content,
          botResponse: botMsg.content,
          context: extractContext(messages, i),
          intent: detectIntent(userMsg.content),
          keywords: extractKeywords(userMsg.content),
          timestamp: userMsg.createdAt
        }

        trainingExamples.push(example)
      }
    }
  }

  log('📚', `Ejemplos de entrenamiento generados: ${trainingExamples.length}`, colors.green)

  // Guardar dataset
  const datasetPath = path.join(process.cwd(), 'training-dataset.json')
  fs.writeFileSync(
    datasetPath,
    JSON.stringify(trainingExamples, null, 2),
    'utf-8'
  )

  log('💾', `Dataset guardado en: ${datasetPath}`, colors.blue)

  return trainingExamples
}

/**
 * Optimizar prompts basado en análisis
 */
async function optimizePrompts(analysis: ConversationAnalysis) {
  section('3. OPTIMIZACIÓN DE PROMPTS')

  // Generar system prompt optimizado
  const topIntents = Array.from(analysis.commonIntents.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intent]) => intent)

  const topKeywords = Array.from(analysis.commonKeywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword]) => keyword)

  const optimizedPrompt = `
Eres un asistente de ventas experto de Tecnovariedades D&S, especializado en:
- Laptops y computadoras
- Motos y vehículos
- Cursos digitales
- Megapacks de contenido

INTENCIONES PRINCIPALES QUE DEBES MANEJAR:
${topIntents.map((intent, i) => `${i + 1}. ${intent}`).join('\n')}

KEYWORDS IMPORTANTES:
${topKeywords.join(', ')}

ESTILO DE COMUNICACIÓN:
- Amigable y conversacional
- Usa emojis apropiados
- Respuestas concisas (máximo 3-4 líneas)
- Enfócate en beneficios, no en especificaciones técnicas
- Siempre ofrece ayuda adicional

REGLAS:
1. Si preguntan por un producto, describe beneficios primero
2. Si mencionan presupuesto, busca opciones en ese rango
3. Si piden fotos, confirma que las enviarás
4. Si preguntan por pago, lista los métodos disponibles
5. Si no entiendes, pide aclaración de forma amable

NUNCA:
- Inventes información que no tienes
- Copies ejemplos literalmente
- Seas demasiado técnico
- Presiones al cliente
`.trim()

  log('📝', 'Prompt optimizado generado:', colors.green)
  console.log()
  console.log(colors.blue + optimizedPrompt + colors.reset)
  console.log()

  // Guardar prompt
  const promptPath = path.join(process.cwd(), 'optimized-system-prompt.txt')
  fs.writeFileSync(promptPath, optimizedPrompt, 'utf-8')

  log('💾', `Prompt guardado en: ${promptPath}`, colors.blue)
}

/**
 * Generar recomendaciones de mejora
 */
async function generateRecommendations(
  analysis: ConversationAnalysis,
  trainingExamples: TrainingExample[]
) {
  section('4. RECOMENDACIONES DE MEJORA')

  const recommendations: string[] = []

  // Analizar cobertura de intenciones
  const intentCoverage = analysis.commonIntents.size
  if (intentCoverage < 10) {
    recommendations.push(
      '⚠️  Pocas intenciones detectadas. Considera agregar más ejemplos de entrenamiento.'
    )
  }

  // Analizar calidad de respuestas
  const avgResponseLength = trainingExamples.reduce(
    (sum, ex) => sum + ex.botResponse.length,
    0
  ) / trainingExamples.length

  if (avgResponseLength > 500) {
    recommendations.push(
      '⚠️  Respuestas muy largas. Considera hacerlas más concisas.'
    )
  } else if (avgResponseLength < 100) {
    recommendations.push(
      '⚠️  Respuestas muy cortas. Considera agregar más contexto.'
    )
  }

  // Analizar keywords
  const productKeywords = ['laptop', 'moto', 'curso', 'megapack']
  const hasProductKeywords = productKeywords.some(keyword =>
    analysis.commonKeywords.has(keyword)
  )

  if (!hasProductKeywords) {
    recommendations.push(
      '⚠️  Pocas menciones de productos. Verifica que el bot esté recomendando productos.'
    )
  }

  // Mostrar recomendaciones
  if (recommendations.length > 0) {
    log('💡', 'Recomendaciones:', colors.yellow)
    recommendations.forEach(rec => {
      console.log(`   ${rec}`)
    })
  } else {
    log('✅', 'El sistema está funcionando correctamente', colors.green)
  }

  console.log()

  // Recomendaciones específicas
  log('🎯', 'Acciones sugeridas:', colors.cyan)
  console.log(`   1. Revisar y actualizar sales-training-data.ts`)
  console.log(`   2. Ajustar system prompt en ai-service.ts`)
  console.log(`   3. Agregar más ejemplos de conversaciones exitosas`)
  console.log(`   4. Monitorear métricas de satisfacción del cliente`)
  console.log(`   5. Realizar A/B testing con diferentes prompts`)
}

/**
 * Funciones auxiliares
 */

function detectIntent(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('busco') || normalized.includes('necesito') || normalized.includes('quiero')) {
    return 'product_search'
  }
  if (normalized.includes('precio') || normalized.includes('cuesta') || normalized.includes('valor')) {
    return 'price_inquiry'
  }
  if (normalized.includes('foto') || normalized.includes('imagen') || normalized.includes('ver')) {
    return 'photo_request'
  }
  if (normalized.includes('pago') || normalized.includes('comprar') || normalized.includes('link')) {
    return 'payment_inquiry'
  }
  if (normalized.includes('hola') || normalized.includes('buenos') || normalized.includes('buenas')) {
    return 'greeting'
  }
  if (normalized.includes('gracias') || normalized.includes('perfecto') || normalized.includes('excelente')) {
    return 'gratitude'
  }
  if (normalized.includes('horario') || normalized.includes('ubicación') || normalized.includes('dirección')) {
    return 'business_info'
  }

  return 'general_inquiry'
}

function extractKeywords(message: string): string[] {
  const normalized = message.toLowerCase()
  const keywords: string[] = []

  // Productos
  const products = ['laptop', 'moto', 'curso', 'megapack', 'computadora', 'pc']
  products.forEach(product => {
    if (normalized.includes(product)) {
      keywords.push(product)
    }
  })

  // Características
  const features = ['gaming', 'diseño', 'económica', 'potente', 'barata', 'rápida']
  features.forEach(feature => {
    if (normalized.includes(feature)) {
      keywords.push(feature)
    }
  })

  // Acciones
  const actions = ['busco', 'necesito', 'quiero', 'comprar', 'ver']
  actions.forEach(action => {
    if (normalized.includes(action)) {
      keywords.push(action)
    }
  })

  return keywords
}

function detectResponsePattern(response: string): string {
  if (response.includes('✅') || response.includes('💰') || response.includes('📦')) {
    return 'formatted_with_emojis'
  }
  if (response.includes('\n-') || response.includes('\n•')) {
    return 'bullet_points'
  }
  if (response.length > 300) {
    return 'detailed_response'
  }
  if (response.length < 100) {
    return 'short_response'
  }

  return 'standard_response'
}

function extractContext(messages: any[], currentIndex: number): string {
  // Obtener últimos 3 mensajes como contexto
  const contextMessages = messages
    .slice(Math.max(0, currentIndex - 3), currentIndex)
    .map(msg => msg.content)
    .join(' | ')

  return contextMessages
}

/**
 * Main
 */
async function main() {
  console.clear()

  log('🎓', 'MEJORA DEL SISTEMA LLM', colors.bright + colors.cyan)
  log('📅', new Date().toLocaleString('es-CO'), colors.cyan)
  console.log()

  try {
    // 1. Analizar conversaciones
    const analysis = await analyzeConversations()

    // 2. Generar dataset
    const trainingExamples = await generateTrainingDataset()

    // 3. Optimizar prompts
    await optimizePrompts(analysis)

    // 4. Generar recomendaciones
    await generateRecommendations(analysis, trainingExamples)

    section('✅ PROCESO COMPLETADO')
    log('🎉', 'Análisis y optimización completados exitosamente', colors.green)
    log('📁', 'Archivos generados:', colors.cyan)
    console.log('   - training-dataset.json')
    console.log('   - optimized-system-prompt.txt')

  } catch (error: any) {
    section('❌ ERROR')
    log('💥', error.message, colors.red)
    console.error(error)
    process.exit(1)
  }
}

main()
