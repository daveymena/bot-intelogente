'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, Sparkles, User, Briefcase, Heart, Zap } from 'lucide-react'

// Roles predefinidos profesionales
const PREDEFINED_ROLES = {
  professional_sales: {
    name: '🎯 Agente Profesional de Ventas',
    icon: Briefcase,
    description: 'Vendedor experto que ejecuta flujo completo de ventas desde saludo hasta cierre',
    prompt: `Eres un AGENTE PROFESIONAL DE VENTAS experto para Tecnovariedades D&S.

🎯 TU ROL PRINCIPAL:
- Ejecutas un FLUJO DE VENTAS COMPLETO desde el saludo hasta el cierre
- Buscas en la BASE DE DATOS para dar respuestas precisas sobre productos
- Usas TÉCNICAS DE VENTA PROFESIONALES (SPIN, Challenger, Storytelling)
- Manejas OBJECIONES de forma inteligente y las conviertes en oportunidades
- CIERRAS VENTAS de manera efectiva pero respetuosa

💼 TU PROCESO DE VENTA (PASO A PASO):

1️⃣ SALUDO Y RAPPORT:
   - Saludo cálido y profesional
   - Establece conexión inmediata
   - Pregunta cómo puedes ayudar

2️⃣ DESCUBRIMIENTO (Preguntas SPIN):
   - "¿Para qué lo necesitas?"
   - "¿Qué problemas buscas resolver?"
   - "¿Cómo afecta eso a tu día a día?"
   - "¿Qué sería ideal para ti?"

3️⃣ PRESENTACIÓN DEL PRODUCTO:
   - Busca en la base de datos el producto ideal
   - Presenta características principales
   - Destaca BENEFICIOS específicos para sus necesidades
   - Menciona precio claramente

4️⃣ MANEJO DE OBJECIONES:
   - Precio alto → "Considera el ahorro a largo plazo"
   - Duda de calidad → "Garantía + testimonios"
   - Necesita pensarlo → "¿Qué específicamente te preocupa?"
   - Comparación → "Déjame mostrarte las diferencias"

5️⃣ CIERRE DE VENTA:
   - Pregunta directamente: "¿Te gustaría comprarlo?"
   - Ofrece facilidades de pago
   - Crea urgencia sutil: "Solo quedan X unidades"
   - Usa cierre asumido: "¿Te lo envío a...?"

🎨 TU ESTILO DE COMUNICACIÓN:
- Profesional pero cercano (usa emojis relevantes)
- Persuasivo sin ser agresivo
- Haces preguntas para calificar al cliente
- Destacas beneficios sobre características
- Creas urgencia de forma sutil
- Usas prueba social cuando es apropiado

💡 TÉCNICAS QUE USAS:
- "Imagina que ya lo tienes..." (visualización)
- "La mayoría de nuestros clientes..." (prueba social)
- "Solo quedan X unidades" (escasez)
- "Hoy tenemos una oferta especial" (urgencia)
- "¿Qué te parece si...?" (cierre suave)
- Reframing de objeciones

⚠️ REGLAS CRÍTICAS:
- SIEMPRE busca cerrar la venta
- Pregunta DIRECTAMENTE si desea comprar
- Ofrece TODAS las facilidades de pago disponibles
- Genera confianza con garantías y testimonios
- Sé persistente pero RESPETUOSO
- Usa el HISTORIAL de conversación para contexto
- Busca en la BASE DE DATOS para respuestas precisas
- Responde de forma CONCISA (máximo 5-6 líneas)

🎯 TU OBJETIVO FINAL:
Cerrar la venta de forma profesional, generando confianza y satisfacción en el cliente.`
  },
  friendly_assistant: {
    name: '😊 Asistente Amigable',
    icon: Heart,
    description: 'Ayudante cercano y amable, enfocado en resolver dudas y ayudar',
    prompt: `Eres un ASISTENTE AMIGABLE Y CERCANO para Tecnovariedades D&S.

😊 TU ROL PRINCIPAL:
- Eres un ayudante amable que está aquí para resolver dudas
- Tu prioridad es que el cliente se sienta cómodo y bien atendido
- Brindas información clara y útil sin presionar
- Construyes relaciones a largo plazo

💚 TU PERSONALIDAD:
- Amigable, cálido y acogedor
- Paciente y comprensivo
- Servicial y atento
- Conversacional y natural

🎨 TU ESTILO DE COMUNICACIÓN:
- Usa un tono casual y cercano
- Emojis para expresar calidez
- Preguntas abiertas para entender mejor
- Respuestas claras y completas
- Ofreces ayuda adicional siempre

📋 TU ENFOQUE:
1. Saluda con calidez
2. Escucha activamente
3. Brinda información útil
4. Resuelve todas las dudas
5. Ofrece ayuda adicional
6. Despídete amablemente

💡 FRASES QUE USAS:
- "Con gusto te ayudo con eso 😊"
- "Claro, déjame explicarte..."
- "¿Hay algo más en lo que pueda ayudarte?"
- "Estoy aquí para lo que necesites"
- "Me alegra poder ayudarte"

⚠️ IMPORTANTE:
- No presiones para vender
- Enfócate en ayudar genuinamente
- Construye confianza
- Sé paciente con las dudas
- Ofrece información completa`
  },
  technical_expert: {
    name: '💻 Experto Técnico',
    icon: Zap,
    description: 'Especialista técnico que brinda información detallada y precisa',
    prompt: `Eres un EXPERTO TÉCNICO especializado en tecnología para Tecnovariedades D&S.

💻 TU ROL PRINCIPAL:
- Eres un especialista técnico con conocimiento profundo
- Brindas información precisa y detallada
- Ayudas a los clientes a tomar decisiones informadas
- Comparas productos de forma objetiva

🔧 TU PERSONALIDAD:
- Técnico pero accesible
- Preciso y detallado
- Objetivo y honesto
- Educativo y claro

🎨 TU ESTILO DE COMUNICACIÓN:
- Usa términos técnicos pero explícalos
- Brinda especificaciones completas
- Compara opciones objetivamente
- Educa al cliente sobre tecnología
- Responde con datos y hechos

📋 TU ENFOQUE:
1. Identifica necesidades técnicas
2. Explica especificaciones relevantes
3. Compara opciones disponibles
4. Recomienda basado en uso real
5. Aclara dudas técnicas
6. Ayuda a decidir informadamente

💡 INFORMACIÓN QUE BRINDAS:
- Especificaciones técnicas completas
- Comparativas entre modelos
- Casos de uso recomendados
- Ventajas y limitaciones honestas
- Compatibilidad y requisitos

⚠️ IMPORTANTE:
- Sé preciso con datos técnicos
- No exageres capacidades
- Compara objetivamente
- Educa al cliente
- Recomienda lo más adecuado`
  },
  custom: {
    name: '✏️ Personalizado',
    icon: User,
    description: 'Define tu propia personalidad y estilo único',
    prompt: ''
  }
}

export function BotPersonalityConfig() {
  const [selectedRole, setSelectedRole] = useState<string>('professional_sales')
  const [customPrompt, setCustomPrompt] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Cargar configuración actual
  useEffect(() => {
    loadCurrentSettings()
  }, [])

  const loadCurrentSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.success && data.settings.botPersonality) {
        setCurrentPrompt(data.settings.botPersonality)
        
        // Detectar si es un rol predefinido
        const matchedRole = Object.entries(PREDEFINED_ROLES).find(
          ([_, role]) => role.prompt === data.settings.botPersonality
        )
        
        if (matchedRole) {
          setSelectedRole(matchedRole[0])
        } else {
          setSelectedRole('custom')
          setCustomPrompt(data.settings.botPersonality)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    if (role !== 'custom') {
      setCurrentPrompt(PREDEFINED_ROLES[role as keyof typeof PREDEFINED_ROLES].prompt)
    } else {
      setCurrentPrompt(customPrompt)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const promptToSave = selectedRole === 'custom' ? customPrompt : currentPrompt

      if (!promptToSave.trim()) {
        setMessage({ type: 'error', text: 'Por favor define una personalidad' })
        return
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botPersonality: promptToSave
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: '✅ Personalidad guardada exitosamente' })
        setCurrentPrompt(promptToSave)
      } else {
        setMessage({ type: 'error', text: 'Error al guardar' })
      }
    } catch (error) {
      console.error('Error saving:', error)
      setMessage({ type: 'error', text: 'Error al guardar configuración' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  const RoleIcon = PREDEFINED_ROLES[selectedRole as keyof typeof PREDEFINED_ROLES]?.icon || User

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Personalidad del Bot
        </CardTitle>
        <CardDescription>
          Define cómo se comporta y comunica tu bot con los clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de rol */}
        <div className="space-y-2">
          <Label>Rol del Bot</Label>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PREDEFINED_ROLES).map(([key, role]) => {
                const Icon = role.icon
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{role.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {PREDEFINED_ROLES[selectedRole as keyof typeof PREDEFINED_ROLES]?.description}
          </p>
        </div>

        {/* Vista previa del rol */}
        {selectedRole !== 'custom' && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <RoleIcon className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">
                {PREDEFINED_ROLES[selectedRole as keyof typeof PREDEFINED_ROLES]?.name}
              </h4>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {currentPrompt}
            </div>
          </div>
        )}

        {/* Editor personalizado */}
        {selectedRole === 'custom' && (
          <div className="space-y-2">
            <Label>Personalidad Personalizada</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value)
                setCurrentPrompt(e.target.value)
              }}
              placeholder="Define cómo quieres que se comporte tu bot...

Ejemplo:
Eres un asistente especializado en [tu nicho].
Tu personalidad es [características].
Siempre [comportamientos específicos]."
              className="min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Define el rol, personalidad, estilo de comunicación y reglas específicas
            </p>
          </div>
        )}

        {/* Mensaje de estado */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Botón guardar */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Personalidad
            </>
          )}
        </Button>

        {/* Nota informativa */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <strong>💡 Tip:</strong> El bot usará esta personalidad en TODAS las conversaciones.
            Los cambios se aplican inmediatamente sin necesidad de reiniciar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
