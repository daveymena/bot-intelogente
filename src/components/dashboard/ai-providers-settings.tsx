'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  Globe,
  Server
} from 'lucide-react'
import { toast } from 'sonner'

interface AIProvider {
  id: string
  name: string
  icon: any
  apiKeyField: string
  description: string
  isFree: boolean
  website: string
  placeholder: string
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'groq',
    name: 'Groq',
    icon: Zap,
    apiKeyField: 'groqApiKey',
    description: 'Ultra rápido, modelos Llama 3. Gratis con límites generosos.',
    isFree: true,
    website: 'https://console.groq.com/keys',
    placeholder: 'gsk_...'
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    icon: Sparkles,
    apiKeyField: 'openaiApiKey',
    description: 'GPT-4, GPT-3.5. Requiere pago por uso.',
    isFree: false,
    website: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: Globe,
    apiKeyField: 'geminiApiKey',
    description: 'Gemini Pro. Gratis con límites.',
    isFree: true,
    website: 'https://makersuite.google.com/app/apikey',
    placeholder: 'AIza...'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: Brain,
    apiKeyField: 'claudeApiKey',
    description: 'Claude 3. Requiere pago por uso.',
    isFree: false,
    website: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: Zap,
    apiKeyField: 'mistralApiKey',
    description: 'Mistral Large. Gratis con límites.',
    isFree: true,
    website: 'https://console.mistral.ai/api-keys',
    placeholder: 'sk-...'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: Globe,
    apiKeyField: 'openrouterApiKey',
    description: 'Acceso a múltiples modelos. Pago por uso.',
    isFree: false,
    website: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-...'
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    icon: Server,
    apiKeyField: 'ollamaBaseUrl',
    description: 'IA local en tu servidor. Completamente gratis.',
    isFree: true,
    website: 'https://ollama.ai',
    placeholder: 'http://localhost:11434'
  }
]

export function AIProvidersSettings() {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState<string | null>(null)
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/bot/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || {})
        
        // Parse priority if it's a string
        if (typeof data.settings?.aiProviderPriority === 'string') {
          try {
            data.settings.aiProviderPriority = JSON.parse(data.settings.aiProviderPriority)
          } catch (e) {
            data.settings.aiProviderPriority = ['groq', 'openai', 'gemini', 'claude', 'mistral']
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Ensure priority is a JSON string
      const settingsToSave = {
        ...settings,
        aiProviderPriority: typeof settings.aiProviderPriority === 'string' 
          ? settings.aiProviderPriority 
          : JSON.stringify(settings.aiProviderPriority || ['groq', 'openai', 'gemini', 'claude', 'mistral'])
      }

      const response = await fetch('/api/bot/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      })

      if (response.ok) {
        toast.success('✅ Configuración guardada')
        loadSettings()
      } else {
        toast.error('Error al guardar')
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const validateApiKey = async (provider: AIProvider) => {
    setValidating(provider.id)
    try {
      const response = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider.id,
          apiKey: settings[provider.apiKeyField]
        })
      })

      const result = await response.json()
      setValidationResults(prev => ({ ...prev, [provider.id]: result.valid }))
      
      if (result.valid) {
        toast.success(`✅ ${provider.name} configurado correctamente`)
      } else {
        toast.error(`❌ API key inválida para ${provider.name}`)
      }
    } catch (error) {
      toast.error(`Error al validar ${provider.name}`)
      setValidationResults(prev => ({ ...prev, [provider.id]: false }))
    } finally {
      setValidating(null)
    }
  }

  const movePriority = (providerId: string, direction: 'up' | 'down') => {
    const priority = Array.isArray(settings.aiProviderPriority) 
      ? [...settings.aiProviderPriority]
      : ['groq', 'openai', 'gemini', 'claude', 'mistral']
    
    const index = priority.indexOf(providerId)
    if (index === -1) return

    if (direction === 'up' && index > 0) {
      [priority[index], priority[index - 1]] = [priority[index - 1], priority[index]]
    } else if (direction === 'down' && index < priority.length - 1) {
      [priority[index], priority[index + 1]] = [priority[index + 1], priority[index]]
    }

    setSettings({ ...settings, aiProviderPriority: priority })
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando...</div>
  }

  const priority = Array.isArray(settings.aiProviderPriority) 
    ? settings.aiProviderPriority
    : ['groq', 'openai', 'gemini', 'claude', 'mistral']

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Configuración de Proveedores de IA
          </CardTitle>
          <CardDescription>
            Agrega tus propias API keys para usar diferentes modelos de IA. 
            El sistema intentará usar los proveedores en orden de prioridad.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración Global</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Fallback Automático</Label>
              <p className="text-sm text-gray-500">
                Si falla un proveedor, intentar con el siguiente automáticamente
              </p>
            </div>
            <Switch
              checked={settings.enableAutoFallback ?? true}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, enableAutoFallback: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Proveedor Preferido</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={settings.preferredAiProvider || 'groq'}
              onChange={(e) => 
                setSettings({ ...settings, preferredAiProvider: e.target.value })
              }
            >
              {AI_PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} {provider.isFree && '(Gratis)'}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* AI Providers */}
      {AI_PROVIDERS.map((provider) => {
        const hasKey = settings[provider.apiKeyField]
        const isValid = validationResults[provider.id]
        const priorityIndex = priority.indexOf(provider.id)

        return (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <provider.icon className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {provider.name}
                      {provider.isFree && (
                        <Badge variant="secondary" className="text-xs">
                          Gratis
                        </Badge>
                      )}
                      {hasKey && isValid && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {hasKey && isValid === false && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                </div>
                
                {/* Priority Controls */}
                {hasKey && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500 mr-2">
                      Prioridad: {priorityIndex + 1}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => movePriority(provider.id, 'up')}
                      disabled={priorityIndex === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => movePriority(provider.id, 'down')}
                      disabled={priorityIndex === priority.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder={provider.placeholder}
                    value={settings[provider.apiKeyField] || ''}
                    onChange={(e) => 
                      setSettings({ ...settings, [provider.apiKeyField]: e.target.value })
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => validateApiKey(provider)}
                    disabled={!settings[provider.apiKeyField] || validating === provider.id}
                  >
                    {validating === provider.id ? 'Validando...' : 'Validar'}
                  </Button>
                </div>
              </div>

              {provider.id === 'ollama' && (
                <div className="space-y-2">
                  <Label>Modelo Ollama</Label>
                  <Input
                    placeholder="llama3.1"
                    value={settings.ollamaModel || 'llama3.1'}
                    onChange={(e) => 
                      setSettings({ ...settings, ollamaModel: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Obtén tu API key en:{' '}
                  <a 
                    href={provider.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {provider.website}
                  </a>
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  )
}
