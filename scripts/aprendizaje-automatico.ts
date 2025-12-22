/**
 * 🤖 Sistema de Aprendizaje Automático del Bot
 * 
 * Este script implementa un sistema de aprendizaje continuo que:
 * 1. Analiza conversaciones reales
 * 2. Identifica patrones exitosos
 * 3. Genera nuevos ejemplos de entrenamiento
 * 4. Actualiza automáticamente el sistema
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

interface ConversationPattern {
  userPattern: string
  botPattern: string
  frequency: number
  successRate: number
  context: string
  intent: string
}

interface LearningInsight {
  pattern: ConversationPattern
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

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
 * Analizar conversaciones y extraer patrones
 */
async function analyzeConversationPatterns(): Promise<ConversationPattern[]> {
  section('1. ANÁLISIS DE PATRONES DE CONVERSACIÓN')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const conversations = await db.conversation.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    },
    take: 100 // Limitar a últimas 100 conversaciones
  })

  log('📊', `Analizando ${conversations.length} conversaciones...`, colors.cyan)

  const patterns: Map<string, ConversationPattern> = new Map()

  for (const conv of conversations) {
    const messages = conv.messages

    for (let i = 0; i < messages.length - 1; i++) {
      const userMsg = messages[i]
      const botMsg = messages[i + 1]

      if (userMsg.direction === 'INCOMING' && botMsg.direction === 'OUTGOING') {
        const userPattern = extractPattern(userMsg.content)
        const botPattern = extractPattern(botMsg.content)
        const key = `${userPattern}:${botPattern}`

        if (patterns.has(key)) {
          const existing = patterns.get(key)!
          existing.frequency++
        } else {
          patterns.set(key, {
            userPattern,
            botPattern,
            frequency: 1,
            successRate: calculateSuccessRate(messages, i),
            context: detectContext(userMsg.content),
            intent: detectIntent(userMsg.content)
          })
        }
      }
    }
  }

  const sortedPatterns = Array.from(patterns.values())
    .filter(p => p.frequency >= 3) // Mínimo 3 ocurrencias
    .sort((a, b) => b.frequency - a.frequency)

  log('✅', `Encontrados ${sortedPatterns.length} patrones significativos`, colors.green)

  return sortedPatterns
}

/**
 * Identificar insights de aprendizaje
 */
function identifyLearningInsights(patterns: ConversationPattern[]): LearningInsight[] {
  section('2. IDENTIFICACIÓN DE INSIGHTS')

  const insights: LearningInsight[] = []

  for (const pattern of patterns) {
    // Patrones de alta frecuencia y éxito
    if (pattern.frequency >= 10 && pattern.successRate >= 0.8) {
      insights.push({
        pattern,
        recommendation: `Agregar este patrón exitoso a los ejemplos de entrenamiento`,
        priority: 'high'
      })
    }

    // Patrones frecuentes pero con bajo éxito
    if (pattern.frequency >= 5 && pattern.successRate < 0.5) {
      insights.push({
        pattern,
        recommendation: `Mejorar la respuesta para este patrón común`,
        priority: 'high'
      })
    }

    // Patrones emergentes
    if (pattern.frequency >= 3 && pattern.frequency < 10) {
      insights.push({
        pattern,
        recommendation: `Monitorear este patrón emergente`,
        priority: 'medium'
      })
    }
  }

  log('💡', `Identificados ${insights.length} insights de aprendizaje`, colors.yellow)

  // Mostrar top 10
  const topInsights = insights.slice(0, 10)
  topInsights.forEach((insight, i) => {
    console.log(`\n   ${i + 1}. ${insight.priority.toUpperCase()} - ${insight.recommendation}`)
    console.log(`      Patrón: "${insight.pattern.userPattern}"`)
    console.log(`      Frecuencia: ${insight.pattern.frequency} veces`)
    console.log(`      Éxito: ${(insight.pattern.successRate * 100).toFixed(0)}%`)
  })

  return insights
}

/**
 * Generar nuevos ejemplos de entrenamiento
 */
async function generateTrainingExamples(insights: LearningInsight[]): Promise<any[]> {
  section('3. GENERACIÓN DE EJEMPLOS DE ENTRENAMIENTO')

  const newExamples: any[] = []

  // Filtrar solo insights de alta prioridad con buen éxito
  const goodInsights = insights.filter(
    i => i.priority === 'high' && i.pattern.successRate >= 0.7
  )

  log('🎯', `Generando ejemplos de ${goodInsights.length} patrones exitosos...`, colors.cyan)

  for (const insight of goodInsights) {
    // Buscar ejemplos reales de este patrón
    const examples = await findRealExamples(insight.pattern)

    if (examples.length > 0) {
      // Tomar el mejor ejemplo
      const bestExample = examples[0]

      newExamples.push({
        userMessage: bestExample.userMessage,
        botResponse: bestExample.botResponse,
        context: insight.pattern.context,
        intent: insight.pattern.intent,
        frequency: insight.pattern.frequency,
        successRate: insight.pattern.successRate,
        learnedFrom: 'real_conversations',
        learnedAt: new Date().toISOString()
      })
    }
  }

  log('✅', `Generados ${newExamples.length} nuevos ejemplos`, colors.green)

  return newExamples
}

/**
 * Actualizar archivo de entrenamiento
 */
async function updateTrainingFile(newExamples: any[]): Promise<void> {
  section('4. ACTUALIZACIÓN DE ARCHIVO DE ENTRENAMIENTO')

  const trainingFilePath = path.join(process.cwd(), 'src/lib/sales-training-data.ts')

  // Leer archivo actual
  let currentContent = ''
  try {
    currentContent = fs.readFileSync(trainingFilePath, 'utf-8')
  } catch (error) {
    log('⚠️', 'No se pudo leer el archivo de entrenamiento actual', colors.yellow)
    return
  }

  // Generar nuevos ejemplos en formato TypeScript
  const newExamplesCode = newExamples.map(ex => `  {
    userMessage: "${ex.userMessage}",
    botResponse: "${ex.botResponse}",
    context: "${ex.context}",
    intent: "${ex.intent}",
    // Aprendido automáticamente: ${ex.frequency} veces, ${(ex.successRate * 100).toFixed(0)}% éxito
  }`).join(',\n')

  // Crear archivo de backup
  const backupPath = trainingFilePath.replace('.ts', `.backup.${Date.now()}.ts`)
  fs.writeFileSync(backupPath, currentContent, 'utf-8')
  log('💾', `Backup creado: ${path.basename(backupPath)}`, colors.blue)

  // Crear archivo con nuevos ejemplos aprendidos
  const learnedExamplesPath = path.join(
    process.cwd(),
    'src/lib/learned-training-examples.ts'
  )

  const learnedContent = `/**
 * 🤖 Ejemplos de Entrenamiento Aprendidos Automáticamente
 * 
 * Estos ejemplos fueron generados automáticamente analizando
 * conversaciones reales del bot.
 * 
 * Generado: ${new Date().toLocaleString('es-CO')}
 */

export const LEARNED_TRAINING_EXAMPLES = [
${newExamplesCode}
]

export const LEARNING_METADATA = {
  totalExamples: ${newExamples.length},
  generatedAt: "${new Date().toISOString()}",
  source: "real_conversations",
  minFrequency: 3,
  minSuccessRate: 0.7
}
`

  fs.writeFileSync(learnedExamplesPath, learnedContent, 'utf-8')
  log('✅', `Archivo de ejemplos aprendidos creado: learned-training-examples.ts`, colors.green)
}

/**
 * Generar reporte de aprendizaje
 */
function generateLearningReport(
  patterns: ConversationPattern[],
  insights: LearningInsight[],
  newExamples: any[]
): void {
  section('5. REPORTE DE APRENDIZAJE')

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPatterns: patterns.length,
      totalInsights: insights.length,
      newExamples: newExamples.length,
      highPriorityInsights: insights.filter(i => i.priority === 'high').length
    },
    topPatterns: patterns.slice(0, 10).map(p => ({
      userPattern: p.userPattern,
      frequency: p.frequency,
      successRate: p.successRate,
      context: p.context
    })),
    recommendations: insights.slice(0, 20).map(i => ({
      priority: i.priority,
      recommendation: i.recommendation,
      pattern: i.pattern.userPattern,
      frequency: i.pattern.frequency
    })),
    newExamples: newExamples.map(ex => ({
      userMessage: ex.userMessage,
      context: ex.context,
      frequency: ex.frequency,
      successRate: ex.successRate
    }))
  }

  const reportPath = path.join(process.cwd(), 'learning-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')

  log('📊', 'Resumen del Aprendizaje:', colors.cyan)
  console.log(`   • Patrones analizados: ${report.summary.totalPatterns}`)
  console.log(`   • Insights identificados: ${report.summary.totalInsights}`)
  console.log(`   • Nuevos ejemplos: ${report.summary.newExamples}`)
  console.log(`   • Prioridad alta: ${report.summary.highPriorityInsights}`)

  log('💾', `Reporte completo guardado: learning-report.json`, colors.blue)
}

/**
 * Funciones auxiliares
 */

function extractPattern(message: string): string {
  // Normalizar y extraer patrón general
  const normalized = message.toLowerCase().trim()
  
  // Reemplazar números con placeholder
  let pattern = normalized.replace(/\d+/g, '[NUM]')
  
  // Reemplazar nombres de productos con placeholder
  pattern = pattern.replace(/\b(laptop|moto|curso|megapack)\b/gi, '[PRODUCT]')
  
  // Limitar longitud
  if (pattern.length > 100) {
    pattern = pattern.substring(0, 100) + '...'
  }
  
  return pattern
}

function calculateSuccessRate(messages: any[], currentIndex: number): number {
  // Calcular tasa de éxito basada en si la conversación continuó positivamente
  const nextMessages = messages.slice(currentIndex + 2, currentIndex + 5)
  
  let positiveSignals = 0
  let totalSignals = 0
  
  for (const msg of nextMessages) {
    if (msg.direction === 'INCOMING') {
      totalSignals++
      
      const content = msg.content.toLowerCase()
      
      // Señales positivas
      if (
        content.includes('gracias') ||
        content.includes('perfecto') ||
        content.includes('excelente') ||
        content.includes('me interesa') ||
        content.includes('quiero') ||
        content.includes('comprar')
      ) {
        positiveSignals++
      }
    }
  }
  
  return totalSignals > 0 ? positiveSignals / totalSignals : 0.5
}

function detectContext(message: string): string {
  const normalized = message.toLowerCase()
  
  if (normalized.includes('precio') || normalized.includes('cuesta')) {
    return 'price_inquiry'
  }
  if (normalized.includes('foto') || normalized.includes('imagen')) {
    return 'photo_request'
  }
  if (normalized.includes('pago') || normalized.includes('comprar')) {
    return 'payment_inquiry'
  }
  if (normalized.includes('busco') || normalized.includes('necesito')) {
    return 'product_search'
  }
  
  return 'general_inquiry'
}

function detectIntent(message: string): string {
  const normalized = message.toLowerCase()
  
  if (normalized.includes('busco') || normalized.includes('necesito')) {
    return 'product_search'
  }
  if (normalized.includes('precio') || normalized.includes('cuesta')) {
    return 'price_inquiry'
  }
  if (normalized.includes('foto')) {
    return 'photo_request'
  }
  if (normalized.includes('pago') || normalized.includes('comprar')) {
    return 'payment_inquiry'
  }
  
  return 'general_inquiry'
}

async function findRealExamples(pattern: ConversationPattern): Promise<any[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const conversations = await db.conversation.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo }
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    },
    take: 100
  })

  const examples: any[] = []

  for (const conv of conversations) {
    const messages = conv.messages

    for (let i = 0; i < messages.length - 1; i++) {
      const userMsg = messages[i]
      const botMsg = messages[i + 1]

      if (userMsg.direction === 'INCOMING' && botMsg.direction === 'OUTGOING') {
        const userPattern = extractPattern(userMsg.content)
        const botPattern = extractPattern(botMsg.content)

        if (userPattern === pattern.userPattern && botPattern === pattern.botPattern) {
          examples.push({
            userMessage: userMsg.content,
            botResponse: botMsg.content
          })
        }
      }
    }
  }

  return examples
}

/**
 * Main
 */
async function main() {
  console.clear()

  log('🤖', 'SISTEMA DE APRENDIZAJE AUTOMÁTICO', colors.bright + colors.cyan)
  log('📅', new Date().toLocaleString('es-CO'), colors.cyan)
  console.log()

  try {
    // 1. Analizar patrones
    const patterns = await analyzeConversationPatterns()

    if (patterns.length === 0) {
      log('⚠️', 'No hay suficientes conversaciones para aprender', colors.yellow)
      log('💡', 'Deja que el bot converse más y vuelve a ejecutar este script', colors.cyan)
      return
    }

    // 2. Identificar insights
    const insights = identifyLearningInsights(patterns)

    // 3. Generar ejemplos
    const newExamples = await generateTrainingExamples(insights)

    if (newExamples.length === 0) {
      log('⚠️', 'No se generaron nuevos ejemplos', colors.yellow)
      log('💡', 'Los patrones encontrados no cumplen los criterios de calidad', colors.cyan)
      return
    }

    // 4. Actualizar archivo
    await updateTrainingFile(newExamples)

    // 5. Generar reporte
    generateLearningReport(patterns, insights, newExamples)

    section('✅ APRENDIZAJE COMPLETADO')
    log('🎉', 'El bot ha aprendido de las conversaciones reales', colors.green)
    log('📁', 'Archivos generados:', colors.cyan)
    console.log('   - src/lib/learned-training-examples.ts')
    console.log('   - learning-report.json')
    console.log()
    log('🔄', 'Próximo paso: Reinicia el bot para aplicar los cambios', colors.yellow)
    console.log('   npm run dev')

  } catch (error: any) {
    section('❌ ERROR')
    log('💥', error.message, colors.red)
    console.error(error)
    process.exit(1)
  }
}

main()
