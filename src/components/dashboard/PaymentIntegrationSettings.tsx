'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CreditCard, DollarSign, Smartphone, Save, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentIntegrationSettingsProps {
  userId: string
}

export default function PaymentIntegrationSettings({ userId }: PaymentIntegrationSettingsProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [showSecrets, setShowSecrets] = useState({
    mercadopago: false,
    paypal: false
  })

  const [config, setConfig] = useState({
    // MercadoPago
    mercadopagoEnabled: false,
    mercadopagoAccessToken: '',
    mercadopagoPublicKey: '',
    mercadopagoEmail: '',

    // PayPal
    paypalEnabled: false,
    paypalClientId: '',
    paypalClientSecret: '',
    paypalEmail: '',
    paypalMode: 'live',

    // Nequi
    nequiEnabled: false,
    nequiPhone: '',
    nequiName: '',

    // Daviplata
    daviplataEnabled: false,
    daviplataPhone: '',
    daviplataName: ''
  })

  useEffect(() => {
    loadConfig()
  }, [userId])

  const loadConfig = async () => {
    try {
      const res = await fetch(`/api/payment-integration?userId=${userId}`)
      const data = await res.json()
      if (data.integration) {
        setConfig({
          mercadopagoEnabled: data.integration.mercadopagoEnabled || false,
          mercadopagoAccessToken: data.integration.mercadopagoAccessToken || '',
          mercadopagoPublicKey: data.integration.mercadopagoPublicKey || '',
          mercadopagoEmail: data.integration.mercadopagoEmail || '',
          paypalEnabled: data.integration.paypalEnabled || false,
          paypalClientId: data.integration.paypalClientId || '',
          paypalClientSecret: data.integration.paypalClientSecret || '',
          paypalEmail: data.integration.paypalEmail || '',
          paypalMode: data.integration.paypalMode || 'live',
          nequiEnabled: data.integration.nequiEnabled || false,
          nequiPhone: data.integration.nequiPhone || '',
          nequiName: data.integration.nequiName || '',
          daviplataEnabled: data.integration.daviplataEnabled || false,
          daviplataPhone: data.integration.daviplataPhone || '',
          daviplataName: data.integration.daviplataName || ''
        })
      }
    } catch (error) {
      console.error('Error loading config:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/payment-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...config
        })
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: '✅ Guardado',
          description: 'Configuración de pagos actualizada correctamente'
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* MercadoPago */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <CardTitle>MercadoPago</CardTitle>
            </div>
            <Switch
              checked={config.mercadopagoEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, mercadopagoEnabled: checked })}
            />
          </div>
          <CardDescription>
            Acepta pagos con tarjetas, PSE y efectivo en Colombia
          </CardDescription>
        </CardHeader>
        {config.mercadopagoEnabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Access Token *</Label>
              <div className="relative">
                <Input
                  type={showSecrets.mercadopago ? 'text' : 'password'}
                  value={config.mercadopagoAccessToken}
                  onChange={(e) => setConfig({ ...config, mercadopagoAccessToken: e.target.value })}
                  placeholder="APP_USR-..."
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets({ ...showSecrets, mercadopago: !showSecrets.mercadopago })}
                  className="absolute right-2 top-2.5"
                >
                  {showSecrets.mercadopago ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Obtén tu token en: <a href="https://www.mercadopago.com.co/developers" target="_blank" className="text-blue-600 hover:underline">MercadoPago Developers</a>
              </p>
            </div>
            <div>
              <Label>Public Key</Label>
              <Input
                value={config.mercadopagoPublicKey}
                onChange={(e) => setConfig({ ...config, mercadopagoPublicKey: e.target.value })}
                placeholder="APP_USR-..."
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={config.mercadopagoEmail}
                onChange={(e) => setConfig({ ...config, mercadopagoEmail: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* PayPal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-700" />
              <CardTitle>PayPal</CardTitle>
            </div>
            <Switch
              checked={config.paypalEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, paypalEnabled: checked })}
            />
          </div>
          <CardDescription>
            Acepta pagos internacionales con tarjetas
          </CardDescription>
        </CardHeader>
        {config.paypalEnabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Client ID *</Label>
              <Input
                value={config.paypalClientId}
                onChange={(e) => setConfig({ ...config, paypalClientId: e.target.value })}
                placeholder="AXxxx..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtén tus credenciales en: <a href="https://developer.paypal.com" target="_blank" className="text-blue-600 hover:underline">PayPal Developer</a>
              </p>
            </div>
            <div>
              <Label>Client Secret *</Label>
              <div className="relative">
                <Input
                  type={showSecrets.paypal ? 'text' : 'password'}
                  value={config.paypalClientSecret}
                  onChange={(e) => setConfig({ ...config, paypalClientSecret: e.target.value })}
                  placeholder="EXxxx..."
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets({ ...showSecrets, paypal: !showSecrets.paypal })}
                  className="absolute right-2 top-2.5"
                >
                  {showSecrets.paypal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={config.paypalEmail}
                onChange={(e) => setConfig({ ...config, paypalEmail: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <Label>Modo</Label>
              <select
                value={config.paypalMode}
                onChange={(e) => setConfig({ ...config, paypalMode: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="sandbox">Sandbox (Pruebas)</option>
                <option value="live">Live (Producción)</option>
              </select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Nequi/Daviplata */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-purple-600" />
            <CardTitle>Billeteras Digitales (Colombia)</CardTitle>
          </div>
          <CardDescription>
            Nequi y Daviplata para pagos locales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nequi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Nequi</Label>
              <Switch
                checked={config.nequiEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, nequiEnabled: checked })}
              />
            </div>
            {config.nequiEnabled && (
              <div className="space-y-3 pl-4">
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={config.nequiPhone}
                    onChange={(e) => setConfig({ ...config, nequiPhone: e.target.value })}
                    placeholder="3001234567"
                  />
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={config.nequiName}
                    onChange={(e) => setConfig({ ...config, nequiName: e.target.value })}
                    placeholder="Tu Nombre"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Daviplata */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Daviplata</Label>
              <Switch
                checked={config.daviplataEnabled}
                onCheckedChange={(checked) => setConfig({ ...config, daviplataEnabled: checked })}
              />
            </div>
            {config.daviplataEnabled && (
              <div className="space-y-3 pl-4">
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={config.daviplataPhone}
                    onChange={(e) => setConfig({ ...config, daviplataPhone: e.target.value })}
                    placeholder="3001234567"
                  />
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={config.daviplataName}
                    onChange={(e) => setConfig({ ...config, daviplataName: e.target.value })}
                    placeholder="Tu Nombre"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botón Guardar */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
        size="lg"
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </Button>

      {/* Ayuda */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">💡 ¿Cómo obtener las credenciales?</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>MercadoPago:</strong> Ve a{' '}
              <a href="https://www.mercadopago.com.co/developers" target="_blank" className="text-blue-600 hover:underline">
                MercadoPago Developers
              </a>
              {' '}→ Tus integraciones → Credenciales
            </li>
            <li>
              <strong>PayPal:</strong> Ve a{' '}
              <a href="https://developer.paypal.com" target="_blank" className="text-blue-600 hover:underline">
                PayPal Developer
              </a>
              {' '}→ Apps & Credentials → Create App
            </li>
            <li>
              <strong>Nequi/Daviplata:</strong> Solo necesitas tu número de teléfono y nombre
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
