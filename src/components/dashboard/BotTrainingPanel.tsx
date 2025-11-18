'use client'

import { useState } from 'react'
import { Brain, Play, RefreshCw, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface TrainingAnalysis {
  total: number
  correct: number
  incorrect: number
  accuracy: string
  byComplexity: {
    easy: { total: number; correct: number; accuracy: string }
    medium: { total: number; correct: number; accuracy: string }
    hard: { total: number; correct: number; accuracy: string }
    expert: { total: number; correct: number; accuracy: string }
    trap: { total: number; correct: number; accuracy: string }
  }
  commonErrors: string[]
  topSuggestions: string[]
}

export default function BotTrainingPanel() {
  const [isTraining, setIsTraining] = useState(false)
  const [analysis, setAnalysis] = useState<TrainingAnalysis | null>(null)
  const [progress, setProgress] = useState(0)

  const startTraining = async () => {
    setIsTraining(true)
    setProgress(0)
    toast.info('🎓 Iniciando entrenamiento del bot...')

    try {
      // Obtener userId
      const userId = localStorage.getItem('userId') || document.cookie
        .split('; ')
        .find(row => row.startsWith('user-id='))
        ?.split('=')[1]

      if (!userId) {
        toast.error('No se pudo obtener el ID de usuario')
        return
      }

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95))
      }, 500)

      const response = await fetch('/api/bot/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
        toast.success('✅ Entrenamiento completado')
      } else {
        toast.error('Error en el entrenamiento')
      }

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al entrenar el bot')
    } finally {
      setIsTraining(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const getAccuracyColor = (accuracy: string) => {
    const value = parseFloat(accuracy)
    if (value >= 90) return 'text-green-600'
    if (value >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyBg = (accuracy: string) => {
    const value = parseFloat(accuracy)
    if (value >= 90) return 'bg-green-100'
    if (value >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Entrenamiento del Bot
          </h3>
          <p className="text-sm text-gray-500">
            Entrena al bot con casos complejos para mejorar sus respuestas
          </p>
        </div>
        <Button
          onClick={startTraining}
          disabled={isTraining}
          className="gap-2"
        >
          {isTraining ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Entrenando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Iniciar Entrenamiento
            </>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isTraining && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso del entrenamiento</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500">
                Probando casos de diferentes complejidades...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          El entrenamiento prueba al bot con <strong>20+ casos complejos</strong> que incluyen:
          consultas ambiguas, múltiples preguntas, comparaciones, objeciones y casos trampa.
          El bot aprende de sus errores y mejora automáticamente.
        </AlertDescription>
      </Alert>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{analysis.total}</div>
                  <div className="text-sm text-gray-500">Casos Probados</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    {analysis.correct}
                  </div>
                  <div className="text-sm text-gray-500">Correctos</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 flex items-center justify-center gap-2">
                    <XCircle className="w-6 h-6" />
                    {analysis.incorrect}
                  </div>
                  <div className="text-sm text-gray-500">Incorrectos</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${getAccuracyColor(analysis.accuracy)}`}>
                    <TrendingUp className="w-6 h-6" />
                    {analysis.accuracy}
                  </div>
                  <div className="text-sm text-gray-500">Precisión</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* By Complexity */}
          <Card>
            <CardHeader>
              <CardTitle>Precisión por Complejidad</CardTitle>
              <CardDescription>
                Rendimiento del bot en diferentes niveles de dificultad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysis.byComplexity).map(([level, stats]) => (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {level === 'easy' && '🟢 Fácil'}
                        {level === 'medium' && '🟡 Medio'}
                        {level === 'hard' && '🟠 Difícil'}
                        {level === 'expert' && '🔴 Experto'}
                        {level === 'trap' && '⚠️ Trampa'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {stats.correct}/{stats.total}
                        </span>
                        <span className={`text-sm font-bold ${getAccuracyColor(stats.accuracy)}`}>
                          {stats.accuracy}
                        </span>
                      </div>
                    </div>
                    <div className={`h-2 rounded-full ${getAccuracyBg(stats.accuracy)}`}>
                      <div
                        className={`h-full rounded-full ${
                          parseFloat(stats.accuracy) >= 90 ? 'bg-green-600' :
                          parseFloat(stats.accuracy) >= 70 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: stats.accuracy }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Errors */}
          {analysis.commonErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Errores Más Comunes
                </CardTitle>
                <CardDescription>
                  Áreas donde el bot necesita mejorar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.commonErrors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-600 font-bold">{index + 1}.</span>
                      <span className="text-gray-700">{error}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Top Suggestions */}
          {analysis.topSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Sugerencias de Mejora
                </CardTitle>
                <CardDescription>
                  Recomendaciones para optimizar las respuestas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.topSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 font-bold">{index + 1}.</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Training Info */}
      {!analysis && !isTraining && (
        <Card>
          <CardHeader>
            <CardTitle>¿Cómo funciona el entrenamiento?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Casos de Prueba</h4>
                  <p className="text-sm text-gray-600">
                    El bot se prueba con 20+ casos reales de diferentes complejidades
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Evaluación Automática</h4>
                  <p className="text-sm text-gray-600">
                    Cada respuesta se evalúa automáticamente contra la respuesta esperada
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Aprendizaje Continuo</h4>
                  <p className="text-sm text-gray-600">
                    El bot aprende de sus errores y guarda patrones exitosos para futuras respuestas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Mejora Automática</h4>
                  <p className="text-sm text-gray-600">
                    Los patrones aprendidos se aplican automáticamente en conversaciones reales
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Recomendación:</strong> Ejecuta el entrenamiento después de agregar nuevos productos
                o cuando notes que el bot comete errores frecuentes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
