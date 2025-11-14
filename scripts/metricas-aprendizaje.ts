/**
 * 📊 Métricas de Aprendizaje
 * 
 * Muestra métricas detalladas del sistema de aprendizaje reforzado
 */

import { ReinforcementLearningSystem } from '../src/lib/reinforcement-learning-system'
import { db } from '../src/lib/db'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`)
}

async function main() {
  console.clear()

  log('📊', 'MÉTRICAS DE APRENDIZAJE', colors.bright + colors.cyan)
  log('📅', new Date().toLocaleString('es-CO'), colors.cyan)
  console.log()

  try {
    const users = await db.user.findMany({ take: 1 })
    
    if (users.length === 0) {
      log('⚠️', 'No hay usuarios en el sistema', colors.yellow)
      return
    }

    const userId = users[0].id
    const metrics = await ReinforcementLearningSystem.getLearningMetrics(userId)

    // Mostrar métricas
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`)
    console.log(`${colors.bright}${colors.cyan}  MÉTRICAS GENERALES${colors.reset}`)
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)

    log('💬', `Total de conversaciones: ${metrics.totalConversations}`, colors.blue)
    log('🎯', `Recompensa promedio: ${metrics.averageReward.toFixed(2)}`, colors.blue)
    log('💰', `Tasa de conversión: ${(metrics.conversionRate * 100).toFixed(1)}%`, colors.blue)
    log('📈', `Engagement promedio: ${metrics.engagementRate.toFixed(1)} mensajes`, colors.blue)

    // Tendencia
    const trendEmoji = metrics.improvementTrend > 0 ? '📈' : 
                       metrics.improvementTrend < 0 ? '📉' : '➡️'
    const trendColor = metrics.improvementTrend > 0 ? colors.green :
                       metrics.improvementTrend < 0 ? colors.red : colors.yellow
    
    log(trendEmoji, `Tendencia: ${metrics.improvementTrend > 0 ? '+' : ''}${metrics.improvementTrend.toFixed(2)}`, trendColor)

    // Interpretación
    console.log()
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`)
    console.log(`${colors.bright}${colors.cyan}  INTERPRETACIÓN${colors.reset}`)
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)

    if (metrics.averageReward > 5) {
      log('✅', 'Excelente: El bot está funcionando muy bien', colors.green)
    } else if (metrics.averageReward > 0) {
      log('👍', 'Bien: El bot está funcionando correctamente', colors.blue)
    } else if (metrics.averageReward > -3) {
      log('⚠️', 'Regular: El bot necesita mejoras', colors.yellow)
    } else {
      log('❌', 'Mal: El bot necesita atención urgente', colors.red)
    }

    if (metrics.conversionRate > 0.3) {
      log('✅', 'Excelente tasa de conversión', colors.green)
    } else if (metrics.conversionRate > 0.1) {
      log('👍', 'Buena tasa de conversión', colors.blue)
    } else {
      log('⚠️', 'Tasa de conversión baja - Mejorar respuestas sobre pagos', colors.yellow)
    }

    if (metrics.improvementTrend > 1) {
      log('📈', 'El bot está mejorando rápidamente', colors.green)
    } else if (metrics.improvementTrend > 0) {
      log('📈', 'El bot está mejorando gradualmente', colors.blue)
    } else if (metrics.improvementTrend < -1) {
      log('📉', 'El bot está empeorando - Revisar cambios recientes', colors.red)
    } else {
      log('➡️', 'El bot se mantiene estable', colors.yellow)
    }

  } catch (error: any) {
    log('❌', `Error: ${error.message}`, colors.red)
    console.error(error)
    process.exit(1)
  }
}

main()
