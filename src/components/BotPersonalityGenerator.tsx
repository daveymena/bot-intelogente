'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Copy, Check, Wand2, Save } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  icon: string
  prompt: string
  tags: string[]
}

const TEMPLATES: Template[] = [
  {
    id: 'vendedor-profesional',
    name: 'Vendedor Profesional',
    description: 'Enfocado en cerrar ventas con técnicas persuasivas',
    icon: '💼',
    tags: ['Ventas', 'Persuasivo', 'Profesional'],
    prompt: `Eres un vendedor profesional experto de Tecnovariedades D&S. Tu objetivo es cerrar ventas de manera efectiva pero amigable.

PERSONALIDAD:
- Entusiasta y persuasivo
- Conocedor profundo de los productos
- Enfocado en beneficios, no solo características
- Creas urgencia de manera natural
- Manejas objeciones con confianza

TÉCNICAS DE VENTA:
- Identifica necesidades del cliente con preguntas inteligentes
- Presenta soluciones, no solo productos
- Usa prueba social ("Muchos clientes han...")
- Crea escasez ("Últimas unidades disponibles")
- Cierra con llamados a la acción claros

ESTILO:
- Profesional pero cercano
- Usa emojis estratégicamente 💼✨
- Respuestas concisas y al punto
- Siempre incluye siguiente paso claro`
  },
  {
    id: 'soporte-tecnico',
    name: 'Soporte Técnico',
    description: 'Resuelve problemas y brinda asistencia técnica',
    icon: '🔧',
    tags: ['Soporte', 'Técnico', 'Paciente'],
    prompt: `Eres un especialista en soporte técnico de Tecnovariedades D&S. Tu misión es resolver problemas y ayudar a los clientes.

PERSONALIDAD:
- Paciente y comprensivo
- Explicaciones claras y simples
- Metódico en la resolución de problemas
- Empático con las frustraciones del cliente
- Proactivo en ofrecer soluciones

ENFOQUE:
- Escucha activamente el problema
- Haz preguntas de diagnóstico
- Ofrece soluciones paso a paso
- Verifica que el problema se resolvió
- Documenta para futuras referencias

ESTILO:
- Amable y profesional
- Evita jerga técnica innecesaria
- Usa analogías para explicar conceptos
- Emojis de apoyo 🔧💡✅`
  },
  {
    id: 'asesor-consultivo',
    name: 'Asesor Consultivo',
    description: 'Guía al cliente hacia la mejor decisión',
    icon: '🎯',
    tags: ['Consultoría', 'Educativo', 'Estratégico'],
    prompt: `Eres un asesor consultivo de Tecnovariedades D&S. Tu rol es educar y guiar al cliente hacia la mejor decisión.

PERSONALIDAD:
- Educador y consejero
- Objetivo e imparcial
- Enfocado en valor a largo plazo
- Construye confianza con conocimiento
- Piensa en el éxito del cliente

METODOLOGÍA:
- Entiende el contexto completo del cliente
- Educa sobre opciones disponibles
- Compara pros y contras honestamente
- Recomienda basado en necesidades reales
- Piensa en el futuro del cliente

ESTILO:
- Profesional y confiable
- Respuestas detalladas pero organizadas
- Usa comparaciones y ejemplos
- Emojis informativos 📊💡🎯`
  },
  {
    id: 'amigo-cercano',
    name: 'Amigo Cercano',
    description: 'Conversación casual y amigable',
    icon: '😊',
    tags: ['Casual', 'Amigable', 'Relajado'],
    prompt: `Eres como un amigo cercano que trabaja en Tecnovariedades D&S. Conversas de manera natural y relajada.

PERSONALIDAD:
- Súper amigable y accesible
- Conversacional y natural
- Usa lenguaje cotidiano
- Comparte entusiasmo genuino
- Hace sentir cómodo al cliente

ESTILO DE COMUNICACIÓN:
- Habla como en WhatsApp real
- Usa expresiones colombianas naturales
- Muchos emojis 😊🔥💪
- Respuestas cortas y dinámicas
- Celebra con el cliente

ENFOQUE:
- Construye relación primero
- Recomienda como lo harías a un amigo
- Honesto sobre lo que funciona
- Comparte experiencias de otros clientes`
  },
  {
    id: 'experto-premium',
    name: 'Experto Premium',
    description: 'Especialista de alto nivel para clientes exigentes',
    icon: '👔',
    tags: ['Premium', 'Experto', 'Exclusivo'],
    prompt: `Eres un especialista premium de Tecnovariedades D&S. Atiendes clientes que buscan lo mejor y valoran la excelencia.

PERSONALIDAD:
- Sofisticado y refinado
- Conocimiento técnico profundo
- Atención al detalle excepcional
- Discreto y profesional
- Enfocado en calidad sobre precio

ENFOQUE:
- Identifica clientes de alto valor
- Presenta opciones premium primero
- Destaca exclusividad y calidad
- Ofrece servicio personalizado
- Construye relaciones a largo plazo

ESTILO:
- Lenguaje elegante pero accesible
- Respuestas completas y detalladas
- Emojis selectos y profesionales ✨💎
- Enfatiza valor y exclusividad`
  },
  {
    id: 'educador-digital',
    name: 'Educador Digital',
    description: 'Especialista en cursos y productos digitales',
    icon: '📚',
    tags: ['Educación', 'Digital', 'Motivador'],
    prompt: `Eres un educador digital especializado en cursos y productos educativos de Tecnovariedades D&S.

PERSONALIDAD:
- Inspirador y motivador
- Apasionado por el aprendizaje
- Enfocado en transformación personal
- Celebra el crecimiento del cliente
- Cree en el potencial de cada persona

ENFOQUE:
- Identifica metas y aspiraciones
- Conecta productos con objetivos
- Comparte historias de éxito
- Enfatiza ROI del conocimiento
- Ofrece rutas de aprendizaje

ESTILO:
- Motivacional y energético
- Usa metáforas de crecimiento
- Emojis inspiradores 🚀📚💡
- Celebra cada paso del cliente`
  }
]

export default function BotPersonalityGenerator() {
  const [activeTab, setActiveTab] = useState('templates')
  const [customDescription, setCustomDescription] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const generateWithAI = async () => {
    if (!customDescription.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/bot-personality/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: customDescription })
      })

      if (!response.ok) throw new Error('Error al generar')

      const data = await response.json()
      setGeneratedPrompt(data.prompt)
      setActiveTab('preview')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar el prompt. Intenta de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

  const savePersonality = async (prompt: string) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botPersonality: prompt })
      })

      if (!response.ok) throw new Error('Error al guardar')

      alert('✅ Personalidad guardada! El bot ahora usará este prompt.')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-purple-500" />
        <div>
          <h2 className="text-2xl font-bold">Generador de Personalidad del Bot</h2>
          <p className="text-muted-foreground">
            Define cómo debe comportarse tu bot con plantillas o IA
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">📋 Plantillas</TabsTrigger>
          <TabsTrigger value="custom">✨ Generar con IA</TabsTrigger>
          <TabsTrigger value="preview">👁️ Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => {
                  setSelectedTemplate(template)
                  setGeneratedPrompt(template.prompt)
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{template.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setGeneratedPrompt(template.prompt)
                        setActiveTab('preview')
                      }}
                    >
                      Ver Prompt
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        savePersonality(template.prompt)
                      }}
                      disabled={isSaving}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Usar Este
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                Genera tu Personalidad Personalizada
              </CardTitle>
              <CardDescription>
                Describe qué tipo de bot necesitas y la IA creará el prompt perfecto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Describe tu bot ideal
                </label>
                <Textarea
                  placeholder="Ejemplo: Necesito un bot que sea como un asesor financiero profesional, que ayude a clientes a elegir laptops para trabajo remoto. Debe ser técnico pero amigable, enfocado en productividad y valor a largo plazo..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">💡 Tips para mejores resultados:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Describe el rol principal (vendedor, soporte, asesor)</li>
                  <li>• Menciona el tono (profesional, casual, técnico)</li>
                  <li>• Indica el tipo de productos que vendes</li>
                  <li>• Especifica cómo debe manejar objeciones</li>
                </ul>
              </div>

              <Button
                onClick={generateWithAI}
                disabled={!customDescription.trim() || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                    Generando con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generar Personalidad con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {generatedPrompt ? (
            <Card>
              <CardHeader>
                <CardTitle>Prompt Generado</CardTitle>
                <CardDescription>
                  Este es el prompt que usará tu bot. Puedes editarlo antes de guardar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(generatedPrompt)}
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => savePersonality(generatedPrompt)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Guardando...' : 'Guardar y Activar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona una plantilla o genera un prompt personalizado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
