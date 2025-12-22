'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Eye, EyeOff, Save, Key, Zap, CreditCard, ShoppingCart } from 'lucide-react'

interface APIConfig {
  // IA APIs
  groqApiKey?: string
  openaiApiKey?: string
  claudeApiKey?: string
  geminiApiKey?: string
  openrouterApiKey?: string
  mistralApiKey?: string
  deepseekApiKey?: string
  ollamaBaseUrl?: string
  
  // Payment APIs
  mercadopagoAccessToken?: string
  mercadopagoPublicKey?: string
  paypalClientId?: string
  paypalClientSecret?: string
  mercadolibreAccessToken?: string
  mercadolibreClientId?: string
}

export default function APIConfiguration() {
  const [config, setConfig] = useState<APIConfig>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/settings/api-config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config || {})
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/api-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast.success('✅ Configuración guardada correctamente')
      } else {
        toast.error('Error al guardar configuración')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const maskKey = (key: string | undefined) => {
    if (!key) return ''
    if (key.length <= 8) return '••••••••'
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando configuración...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Configuración de APIs</h3>
        <p className="text-sm text-gray-500">
          Configura tus claves de API para IA y métodos de pago
        </p>
      </div>

      {/* IA APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            APIs de Inteligencia Artificial
          </CardTitle>
          <CardDescription>
            Configura las APIs de IA para el bot de WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Groq */}
          <div className="space-y-2">
            <Label htmlFor="groqApiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Groq API Key
              <span className="text-xs text-gray-500">(Recomendado - Rápido y gratuito)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="groqApiKey"
                type={showKeys.groq ? 'text' : 'password'}
                value={showKeys.groq ? config.groqApiKey || '' : maskKey(config.groqApiKey)}
                onChange={(e) => setConfig({ ...config, groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('groq')}
              >
                {showKeys.groq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtén tu API key en: <a href="https://console.groq.com" target="_blank" className="text-blue-600 hover:underline">console.groq.com</a>
            </p>
          </div>

          <Separator />

          {/* OpenAI */}
          <div className="space-y-2">
            <Label htmlFor="openaiApiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              OpenAI API Key
              <span className="text-xs text-gray-500">(Opcional - GPT-4)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="openaiApiKey"
                type={showKeys.openai ? 'text' : 'password'}
                value={showKeys.openai ? config.openaiApiKey || '' : maskKey(config.openaiApiKey)}
                onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                placeholder="sk-..."
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('openai')}
              >
                {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtén tu API key en: <a href="https://platform.openai.com" target="_blank" className="text-blue-600 hover:underline">platform.openai.com</a>
            </p>
          </div>

          <Separator />

          {/* Claude */}
          <div className="space-y-2">
            <Label htmlFor="claudeApiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Claude API Key
              <span className="text-xs text-gray-500">(Opcional - Anthropic)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="claudeApiKey"
                type={showKeys.claude ? 'text' : 'password'}
                value={showKeys.claude ? config.claudeApiKey || '' : maskKey(config.claudeApiKey)}
                onChange={(e) => setConfig({ ...config, claudeApiKey: e.target.value })}
                placeholder="sk-ant-..."
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('claude')}
              >
                {showKeys.claude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtén tu API key en: <a href="https://console.anthropic.com" target="_blank" className="text-blue-600 hover:underline">console.anthropic.com</a>
            </p>
          </div>

          <Separator />

          {/* Gemini */}
          <div className="space-y-2">
            <Label htmlFor="geminiApiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Google Gemini API Key
              <span className="text-xs text-gray-500">(Opcional - Google AI)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="geminiApiKey"
                type={showKeys.gemini ? 'text' : 'password'}
                value={showKeys.gemini ? config.geminiApiKey || '' : maskKey(config.geminiApiKey)}
                onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                placeholder="AIza..."
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('gemini')}
              >
                {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtén tu API key en: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline">makersuite.google.com</a>
            </p>
          </div>

          <Separator />

          {/* OpenRouter */}
          <div className="space-y-2">
            <Label htmlFor="openrouterApiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              OpenRouter API Key
              <span className="text-xs text-gray-500">(Opcional - Múltiples modelos)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="openrouterApiKey"
                type={showKeys.openrouter ? 'text' : 'password'}
                value={showKeys.openrouter ? config.openrouterApiKey || '' : maskKey(config.openrouterApiKey)}
                onChange={(e) => setConfig({ ...config, openrouterApiKey: e.target.value })}
                placeholder="sk-or-..."
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('openrouter')}
              >
                {showKeys.openrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtén tu API key en: <a href="https://openrouter.ai/keys" target="_blank" className="text-blue-600 hover:underline">openrouter.ai/keys</a>
            </p>
          </div>

          <Separator />

          {/* Mistral */}
          <div className="space-y-2">
            <Label htmlFor="mistralApiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Mistral AI API Key
              <span className="text-xs text-gray-500">(Opcional - Mistral)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="mistralApiKey"
                type={showKeys.mistral ? 'text' : 'password'}
                value={showKeys.mistral ? config.mistralApiKey || '' : maskKey(config.mistralApiKey)}
                onChange={(e) => setConfig({ ...config, mistralApiKey: e.target.value })}
                placeholder="..."
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('mistral')}
              >
                {showKeys.mistral ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtén tu API key en: <a href="https://console.mistral.ai" target="_blank" className="text-blue-600 hover:underline">console.mistral.ai</a>
            </p>
          </div>

          <Separator />

          {/* DeepSeek */}
          <div className="space-y-2">
            <Label htmlFor="deepseekApiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              DeepSeek API Key
              <span className="text-xs text-gray-500">(Opcional - DeepSeek)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="deepseekApiKey"
                type={showKeys.deepseek ? 'text' : 'password'}
                value={showKeys.deepseek ? config.deepseekApiKey || '' : maskKey(config.deepseekApiKey)}
                onChange={(e) => setConfig({ ...config, deepseekApiKey: e.target.value })}
                placeholder="sk-..."
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleShowKey('deepseek')}
              >
                {showKeys.deepseek ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Obtén tu API key en: <a href="https://platform.deepseek.com" target="_blank" className="text-blue-600 hover:underline">platform.deepseek.com</a>
            </p>
          </div>

          <Separator />

          {/* Ollama */}
          <div className="space-y-2">
            <Label htmlFor="ollamaBaseUrl" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Ollama Base URL
              <span className="text-xs text-gray-500">(Opcional - IA Local)</span>
            </Label>
            <Input
              id="ollamaBaseUrl"
              type="text"
              value={config.ollamaBaseUrl || ''}
              onChange={(e) => setConfig({ ...config, ollamaBaseUrl: e.target.value })}
              placeholder="http://localhost:11434 o https://tu-ollama.easypanel.host"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              URL de tu servidor Ollama local o remoto
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            APIs de Métodos de Pago
          </CardTitle>
          <CardDescription>
            Configura tus credenciales para generar links de pago dinámicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* MercadoPago */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900">MercadoPago</h4>
            
            <div className="space-y-2">
              <Label htmlFor="mercadopagoAccessToken">Access Token</Label>
              <div className="flex gap-2">
                <Input
                  id="mercadopagoAccessToken"
                  type={showKeys.mpToken ? 'text' : 'password'}
                  value={showKeys.mpToken ? config.mercadopagoAccessToken || '' : maskKey(config.mercadopagoAccessToken)}
                  onChange={(e) => setConfig({ ...config, mercadopagoAccessToken: e.target.value })}
                  placeholder="APP_USR-..."
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowKey('mpToken')}
                >
                  {showKeys.mpToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mercadopagoPublicKey">Public Key</Label>
              <Input
                id="mercadopagoPublicKey"
                value={config.mercadopagoPublicKey || ''}
                onChange={(e) => setConfig({ ...config, mercadopagoPublicKey: e.target.value })}
                placeholder="APP_USR-..."
                className="font-mono text-sm"
              />
            </div>

            <p className="text-xs text-gray-600">
              Obtén tus credenciales en: <a href="https://www.mercadopago.com/developers" target="_blank" className="text-blue-600 hover:underline">mercadopago.com/developers</a>
            </p>
          </div>

          <Separator />

          {/* PayPal */}
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900">PayPal</h4>
            
            <div className="space-y-2">
              <Label htmlFor="paypalClientId">Client ID</Label>
              <Input
                id="paypalClientId"
                value={config.paypalClientId || ''}
                onChange={(e) => setConfig({ ...config, paypalClientId: e.target.value })}
                placeholder="AY..."
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypalClientSecret">Client Secret</Label>
              <div className="flex gap-2">
                <Input
                  id="paypalClientSecret"
                  type={showKeys.paypal ? 'text' : 'password'}
                  value={showKeys.paypal ? config.paypalClientSecret || '' : maskKey(config.paypalClientSecret)}
                  onChange={(e) => setConfig({ ...config, paypalClientSecret: e.target.value })}
                  placeholder="EP..."
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowKey('paypal')}
                >
                  {showKeys.paypal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Obtén tus credenciales en: <a href="https://developer.paypal.com" target="_blank" className="text-blue-600 hover:underline">developer.paypal.com</a>
            </p>
          </div>

          <Separator />

          {/* MercadoLibre */}
          <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900">MercadoLibre</h4>
            
            <div className="space-y-2">
              <Label htmlFor="mercadolibreAccessToken">Access Token</Label>
              <div className="flex gap-2">
                <Input
                  id="mercadolibreAccessToken"
                  type={showKeys.mlToken ? 'text' : 'password'}
                  value={showKeys.mlToken ? config.mercadolibreAccessToken || '' : maskKey(config.mercadolibreAccessToken)}
                  onChange={(e) => setConfig({ ...config, mercadolibreAccessToken: e.target.value })}
                  placeholder="APP_USR-..."
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => toggleShowKey('mlToken')}
                >
                  {showKeys.mlToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mercadolibreClientId">Client ID</Label>
              <Input
                id="mercadolibreClientId"
                value={config.mercadolibreClientId || ''}
                onChange={(e) => setConfig({ ...config, mercadolibreClientId: e.target.value })}
                placeholder="..."
                className="font-mono text-sm"
              />
            </div>

            <p className="text-xs text-gray-600">
              Obtén tus credenciales en: <a href="https://developers.mercadolibre.com" target="_blank" className="text-yellow-700 hover:underline">developers.mercadolibre.com</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
  )
}
