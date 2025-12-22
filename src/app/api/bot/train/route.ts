import { NextRequest, NextResponse } from 'next/server'
import { BotTrainingService } from '@/lib/bot-training-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`🎓 Iniciando entrenamiento del bot para usuario: ${userId}`)

    // Iniciar entrenamiento en segundo plano
    const analysis = await BotTrainingService.startBackgroundTraining(userId)

    return NextResponse.json({
      success: true,
      message: 'Entrenamiento completado',
      analysis
    })

  } catch (error) {
    console.error('Error en entrenamiento del bot:', error)
    return NextResponse.json(
      { error: 'Failed to train bot' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const results = BotTrainingService.getTrainingResults()
    const patterns = BotTrainingService.getLearningPatterns()

    return NextResponse.json({
      success: true,
      results,
      patterns,
      summary: {
        totalCases: results.length,
        correctCases: results.filter(r => r.isCorrect).length,
        accuracy: results.length > 0 
          ? ((results.filter(r => r.isCorrect).length / results.length) * 100).toFixed(2) + '%'
          : '0%',
        patternsLearned: patterns.length
      }
    })

  } catch (error) {
    console.error('Error obteniendo resultados de entrenamiento:', error)
    return NextResponse.json(
      { error: 'Failed to get training results' },
      { status: 500 }
    )
  }
}
