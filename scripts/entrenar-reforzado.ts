/**
 * 🧠 Entrenamiento con Aprendizaje Reforzado
 * 
 * Este script entrena el bot usando feedback de conversaciones reales,
 * mejorando automáticamente las respuestas basándose en señales positivas y negativas.
 */

import { ReinforcementLearningSystem } from '../src/lib/reinforcement-learning-system'
import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

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
 * Analizar feedback de todas las conversaciones
 */
async function analyzeFeedback(userId: string) {
  section('1. ANÁLISIS DE FEEDBACK')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const conversations = await db.conversation.findMany({
    where: {
      userId
    },
    take: 100 // Limitar a últimas 100 conversaciones
  })

  log('📊', `Analizando ${conversations.length} conversaciones...`, colors.cyan)

  const feedbacks = []

  for (const conv of conversations) {
    try {
      const feedback = await ReinforcementLearningSystem.captureFeedback(conv.id, userId)
      feedbacks.push(feedback)
    } catch (error) {
      // Ignorar errores en conversaciones individuales
    }
  }

  // Calcular estadísticas
  const totalReward = feedbacks.reduce((sum, f) => sum + f.totalReward, 0)
  const avgReward = feedbacks.length > 0 ? totalReward / feedbacks.length : 0
  const conversions = feedbacks.filter(f => f.conversionAchieved).length
  const conversionRate = feedbacks.length > 0 ? conversions / feedbacks.length : 0

  log('✅', `Feedback capturado de ${feedbacks.length} conversaciones`, colors.green)
  log('📈', `Recompensa promedio: ${avgReward.toFixed(2)}`, colors.blue)
  log('💰', `Tasa de conversión: ${(conversionRate * 100).toFixed(1)}%`, colors.blue)

  // Mostrar distribución de feedback
  const positive = feedbacks.filter(f => f.totalReward > 0).length
  const negative = feedbacks.filter(f => f.totalReward < 0).length
  const neutral = feedbacks.filter(f => f.totalReward === 0).length

  console.log()
  log('📊', 'Distribución de feedback:', colors.yellow)
  console.log(`   Positivo: ${positive} (${((positive / feedbacks.length) * 100).toFixed(1)}%)`)
  console.log(`   Negativo: ${negative} (${((negative / feedbacks.length) * 100).toFixed(1)}%)`)
  console.log(`   Neutral: ${neutral} (${((neutral / feedbacks.length) * 100).toFixed(1)}%)`)

  return feedbacks
}

/**
 * Evaluar patrones de respuesta
 */
async function evaluatePatterns(userId: string) {
  section('2. EVALUACIÓN DE PATRONES')

  log('🔍', 'Evaluando patrones de respuesta...', colors.cyan)

  const patterns = await ReinforcementLearningSystem.evaluatePatterns(userId)

  log('✅', `Evaluados ${patterns.length} patrones`, colors.green)

  // Mostrar top 10 patrones exitosos
  const topPatterns = patterns.slice(0, 10)
  
  console.log()
  log('🏆', 'Top 10 Patrones Exitosos:', colors.yellow)
  topPatterns.forEach((pattern, i) => {
    const trendEmoji = pattern.trend === 'improving' ? '📈' : 
                       pattern.trend === 'declining' ? '📉' : '➡️'
    console.log(`\n   ${i + 1}. ${trendEmoji} ${pattern.pattern.substring(0, 60)}...`)
    console.log(`      Frecuencia: ${pattern.frequency} veces`)
    console.log(`      Éxito: ${(pattern.successRate * 100).toFixed(0)}%`)
    console.log(`      Recompensa: ${pattern.averageReward.toFixed(2)}`)
  })

  // Mostrar patrones problemáticos
  const problematic = patterns.filter(p => p.averageReward < -1)
  
  if (problematic.length > 0) {
    console.log()
    log('⚠️', `${problematic.length} Patrones Problemáticos:`, colors.red)
    problematic.slice(0, 5).forEach((pattern, i) => {
      console.log(`\n   ${i + 1}. ${pattern.pattern.substring(0, 60)}...`)
      console.log(`      Frecuencia: ${pattern.frequency} veces`)
      console.log(`      Recompensa: ${pattern.averageReward.toFixed(2)}`)
    })
  }

  return patterns
}

/**
 * Actualizar modelo con aprendizaje
 */
async function updateModel(userId: string) {
  section('3. ACTUALIZACIÓN DEL MODELO')

  log('🔄', 'Actualizando modelo con feedback...', colors.cyan)

  const result = await ReinforcementLearningSystem.updateModel(userId)

  log('✅', 'Modelo actualizado', colors.green)
  console.log(`   Patrones mejorados: ${result.patternsImproved}`)
  console.log(`   Patrones removidos: ${result.patternsRemoved}`)
  console.log(`   Nuevos ejemplos: ${result.newExamples}`)

  return result
}

/**
 * Generar reporte de entrenamiento
 */
async function generateTrainingReport(
  userId: string,
  feedbacks: any[],
  patterns: any[],
  updateResult: any
) {
  section('4. REPORTE DE ENTRENAMIENTO')

  const metrics = await ReinforcementLearningSystem.getLearningMetrics(userId)

  const report = {
    timestamp: new Date().toISOString(),
    userId,
    metrics: {
      totalConversations: metrics.totalConversations,
      averageReward: metrics.averageReward,
      conversionRate: metrics.conversionRate,
      engagementRate: metrics.engagementRate,
      improvementTrend: metrics.improvementTrend
    },
    feedback: {
      total: feedbacks.length,
      positive: feedbacks.filter(f => f.totalReward > 0).length,
      negative: feedbacks.filter(f => f.totalReward < 0).length,
      conversions: feedbacks.filter(f => f.conversionAchieved).length
    },
    patterns: {
      total: patterns.length,
      successful: patterns.filter(p => p.averageReward > 3).length,
      problematic: patterns.filter(p => p.averageReward < -1).length,
      topPatterns: patterns.slice(0, 10).map(p => ({
        pattern: p.pattern.substring(0, 100),
        frequency: p.frequency,
        successRate: p.successRate,
        averageReward: p.averageReward,
        trend: p.trend
      }))
    },
    modelUpdate: updateResult,
    recommendations: generateRecommendations(metrics, patterns)
  }

  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'reinforcement-learning-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')

  // Mostrar resumen
  log('📊', 'Métricas de Aprendizaje:', colors.cyan)
  console.log(`   Total de conversaciones: ${metrics.totalConversations}`)
  console.log(`   Recompensa promedio: ${metrics.averageReward.toFixed(2)}`)
  console.log(`   Tasa de conversión: ${(metrics.conversionRate * 100).toFixed(1)}%`)
  console.log(`   Engagement promedio: ${metrics.engagementRate.toFixed(1)} mensajes`)
  
  const trendEmoji = metrics.improvementTrend > 0 ? '📈' : 
                     metrics.improvementTrend < 0 ? '📉' : '➡️'
  console.log(`   Tendencia: ${trendEmoji} ${metrics.improvementTrend > 0 ? '+' : ''}${metrics.improvementTrend.toFixed(2)}`)

  console.log()
  log('💾', `Reporte guardado: reinforcement-learning-report.json`, colors.blue)

  return report
}

/**
 * Generar recomendaciones
 */
function generateRecommendations(metrics: any, patterns: any[]): string[] {
  const recommendations: string[] = []

  // Recomendaciones basadas en métricas
  if (metrics.conversionRate < 0.1) {
    recommendations.push('⚠️ Tasa de conversión baja. Considera mejorar las respuestas sobre pagos.')
  }

  if (metrics.averageReward < 0) {
    recommendations.push('⚠️ Recompensa promedio negativa. Revisa los patrones problemáticos.')
  }

  if (metrics.improvementTrend < -1) {
    recommendations.push('📉 Tendencia negativa. El bot está empeorando. Revisa cambios recientes.')
  } else if (metrics.improvementTrend > 1) {
    recommendations.push('📈 Tendencia positiva. El bot está mejorando. Continúa con el entrenamiento.')
  }

  // Recomendaciones basadas en patrones
  const problematic = patterns.filter(p => p.averageReward < -1)
  if (problematic.length > 5) {
    recommendations.push(`⚠️ ${problematic.length} patrones problemáticos detectados. Considera revisarlos manualmente.`)
  }

  const successful = patterns.filter(p => p.averageReward > 5)
  if (successful.length > 0) {
    recommendations.push(`✅ ${successful.length} patrones muy exitosos. Considera reforzarlos en el entrenamiento.`)
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ El sistema está funcionando correctamente. Continúa monitoreando.')
  }

  return recommendations
}

/**
 * Main
 */
async function main() {
  console.clear()

  log('🧠', 'ENTRENAMIENTO CON APRENDIZAJE REFORZADO', colors.bright + colors.cyan)
  log('📅', new Date().toLocaleString('es-CO'), colors.cyan)
  console.log()

  try {
    // Obtener primer usuario (o especificar)
    const users = await db.user.findMany({ take: 1 })
    
    if (users.length === 0) {
      log('⚠️', 'No hay usuarios en el sistema', colors.yellow)
      return
    }

    const userId = users[0].id
    log('👤', `Usuario: ${users[0].email}`, colors.blue)

    // 1. Analizar feedback
    const feedbacks = await analyzeFeedback(userId)

    if (feedbacks.length === 0) {
      log('⚠️', 'No hay conversaciones para analizar', colors.yellow)
      log('💡', 'Deja que el bot converse más y vuelve a ejecutar', colors.cyan)
      return
    }

    // 2. Evaluar patrones
    const patterns = await evaluatePatterns(userId)

    // 3. Actualizar modelo
    const updateResult = await updateModel(userId)

    // 4. Generar reporte
    const report = await generateTrainingReport(userId, feedbacks, patterns, updateResult)

    // 5. Mostrar recomendaciones
    console.log()
    log('💡', 'Recomendaciones:', colors.yellow)
    report.recommendations.forEach(rec => {
      console.log(`   ${rec}`)
    })

    section('✅ ENTRENAMIENTO COMPLETADO')
    log('🎉', 'El bot ha sido entrenado con aprendizaje reforzado', colors.green)
    log('📁', 'Archivo generado:', colors.cyan)
    console.log('   - reinforcement-learning-report.json')
    console.log()
    log('🔄', 'El bot ahora usará el aprendizaje en futuras conversaciones', colors.blue)

  } catch (error: any) {
    section('❌ ERROR')
    log('💥', error.message, colors.red)
    console.error(error)
    process.exit(1)
  }
}

main()
