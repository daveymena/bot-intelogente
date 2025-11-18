/**
 * Script para entrenar el bot con casos de prueba complejos
 * 
 * Uso:
 * npx tsx scripts/entrenar-bot.ts
 */

import { BotTrainingService } from '../src/lib/bot-training-service'
import { db } from '../src/lib/db'

async function main() {
  console.log('🤖 ========================================')
  console.log('🎓 SISTEMA DE ENTRENAMIENTO DEL BOT')
  console.log('🤖 ========================================\n')

  try {
    // Obtener el primer usuario admin
    const user = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!user) {
      console.error('❌ No se encontró usuario admin')
      console.log('💡 Crea un usuario admin primero con: npx tsx scripts/create-admin.ts')
      process.exit(1)
    }

    console.log(`👤 Usuario: ${user.email}`)
    console.log(`🆔 ID: ${user.id}\n`)

    // Iniciar entrenamiento
    const startTime = Date.now()
    const analysis = await BotTrainingService.startBackgroundTraining(user.id)
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('\n🤖 ========================================')
    console.log('📊 RESULTADOS DEL ENTRENAMIENTO')
    console.log('🤖 ========================================\n')

    if (analysis) {
      console.log(`⏱️  Duración: ${duration} segundos`)
      console.log(`📝 Total de casos: ${analysis.total}`)
      console.log(`✅ Correctos: ${analysis.correct}`)
      console.log(`❌ Incorrectos: ${analysis.incorrect}`)
      console.log(`🎯 Precisión general: ${analysis.accuracy}\n`)

      console.log('📊 Precisión por complejidad:')
      console.log(`   🟢 Fácil: ${analysis.byComplexity.easy.accuracy} (${analysis.byComplexity.easy.correct}/${analysis.byComplexity.easy.total})`)
      console.log(`   🟡 Medio: ${analysis.byComplexity.medium.accuracy} (${analysis.byComplexity.medium.correct}/${analysis.byComplexity.medium.total})`)
      console.log(`   🟠 Difícil: ${analysis.byComplexity.hard.accuracy} (${analysis.byComplexity.hard.correct}/${analysis.byComplexity.hard.total})`)
      console.log(`   🔴 Experto: ${analysis.byComplexity.expert.accuracy} (${analysis.byComplexity.expert.correct}/${analysis.byComplexity.expert.total})`)
      console.log(`   ⚠️  Trampa: ${analysis.byComplexity.trap.accuracy} (${analysis.byComplexity.trap.correct}/${analysis.byComplexity.trap.total})\n`)

      if (analysis.commonErrors.length > 0) {
        console.log('❌ Errores más comunes:')
        analysis.commonErrors.forEach((error, i) => {
          console.log(`   ${i + 1}. ${error}`)
        })
        console.log('')
      }

      if (analysis.topSuggestions.length > 0) {
        console.log('💡 Sugerencias principales:')
        analysis.topSuggestions.forEach((suggestion, i) => {
          console.log(`   ${i + 1}. ${suggestion}`)
        })
        console.log('')
      }

      // Mostrar patrones aprendidos
      const patterns = BotTrainingService.getLearningPatterns()
      console.log(`🧠 Patrones aprendidos: ${patterns.length}`)
      
      const topPatterns = patterns
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5)

      if (topPatterns.length > 0) {
        console.log('\n🏆 Top 5 patrones más exitosos:')
        topPatterns.forEach((pattern, i) => {
          console.log(`   ${i + 1}. "${pattern.pattern.substring(0, 50)}..." - ${(pattern.successRate * 100).toFixed(1)}% éxito`)
        })
      }
    }

    console.log('\n✅ Entrenamiento completado exitosamente')
    console.log('💾 Los patrones aprendidos se han guardado\n')

  } catch (error) {
    console.error('\n❌ Error durante el entrenamiento:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
