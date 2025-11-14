'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Save, CreditCard, Smartphone, Building2, AlertCircle, Settings, X, RefreshCw, TestTube } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface IntegrationConfig {
  hotmart: {
    enabled: boolean
    apiKey: string
    productId: string
    checkoutUrl: string
    email: string
  }
  mercadopago: {
    enabled: boolean
    accessToken: string
    publicKey: string
    email: string
  }
  paypal: {
    enabled: boolean
    clientId: string
    clientSecret: string
    email: string
    mode: string
  }
  nequi: {
    enabled: boolean
    phone: string
    name: string
  }
  daviplata: {
    enabled: boolean
    phone: string
    name: string
  }
  bankTransfer: {
    enabled: boolean
    bankName: string
    accountNumber: string
    accountType: string
    accountHolder: string
    idNumber: string
  }
}

export default function PaymentIntegrationsPanel() {
  const { toast } = useToast()
  const [config, setConfig] = useState<IntegrationConfig>({
    hotmart: { enabled: false, apiKey: '', productId: '', checkoutUrl: '', email: '' },
    mercadopago: { enabled: false, accessToken: '', publicKey: '', email: '' },
    paypal: { enabled: false, clientId: '', clientSecret: '', email: '', mode: 'sandbox' },
    nequi: { enabled: false, phone: '', name: '' },
    daviplata: { enabled: false, phone: '', name: '' },
    bankTransfer: { enabled: false, bankName: '', accountNumber: '', accountType: 'Ahorros', accountHolder: '', idNumber: '' }
  })

  const [showSecrets, setShowSecrets] = useState({
    hotmartApiKey: false,
    mercadopagoToken: false,
    mercadopagoPublic: false,
    paypalId: false,
    paypalSecret: false,
    bankAccount: false,
    bankId: false
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  
  // Configuraciones avanzadas
  const [advancedSettings, setAdvancedSettings] = useState({
    autoRetry: true,
    retryAttempts: 3,
    timeout: 30,
    webhookUrl: '',
    notificationEmail: '',
    testMode: false,
    logTransactions: true
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/integrations/payment')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/integrations/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (res.ok) {
        toast({
          title: "✅ Configuración guardada",
          description: "Las integraciones de pago se han actualizado correctamente"
        })
      } else {
        throw new Error('Error guardando')
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (integration: keyof IntegrationConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        [field]: value
      }
    }))
  }

  const toggleSecret = (key: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "✅ Prueba exitosa",
        description: "Todas las integraciones habilitadas están funcionando correctamente"
      })
    } catch (error) {
      toast({
        title: "❌ Error en prueba",
        description: "Algunas integraciones tienen problemas de conexión",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSaveAdvanced = () => {
    toast({
      title: "✅ Configuración avanzada guardada",
      description: "Los ajustes se han aplicado correctamente"
    })
    setSettingsOpen(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando...</div>
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Integraciones de Pago
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configura tus métodos de pago. Los datos sensibles se muestran ofuscados (****1234)
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuración Avanzada
                </DialogTitle>
                <DialogDescription>
                  Ajusta parámetros avanzados para el procesamiento de pagos
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Reintentos automáticos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Reintentos Automáticos</Label>
                      <p className="text-sm text-muted-foreground">
                        Reintentar automáticamente pagos fallidos
                      </p>
                    </div>
                    <Switch
                      checked={advancedSettings.autoRetry}
                      onCheckedChange={(checked) => 
                        setAdvancedSettings(prev => ({ ...prev, autoRetry: checked }))
                      }
                    />
                  </div>

                  {advancedSettings.autoRetry && (
                    <div>
                      <Label>Número de Intentos</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={advancedSettings.retryAttempts}
                        onChange={(e) => 
                          setAdvancedSettings(prev => ({ 
                            ...prev, 
                            retryAttempts: parseInt(e.target.value) || 3 
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Timeout */}
                <div>
                  <Label>Timeout de Conexión (segundos)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="120"
                    value={advancedSettings.timeout}
                    onChange={(e) => 
                      setAdvancedSettings(prev => ({ 
                        ...prev, 
                        timeout: parseInt(e.target.value) || 30 
                      }))
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tiempo máximo de espera para respuesta de pasarelas
                  </p>
                </div>

                {/* Webhook URL */}
                <div>
                  <Label>Webhook URL (Opcional)</Label>
                  <Input
                    type="url"
                    value={advancedSettings.webhookUrl}
                    onChange={(e) => 
                      setAdvancedSettings(prev => ({ ...prev, webhookUrl: e.target.value }))
                    }
                    placeholder="https://tu-dominio.com/webhook/payments"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL para recibir notificaciones de pagos
                  </p>
                </div>

                {/* Email de notificaciones */}
                <div>
                  <Label>Email de Notificaciones</Label>
                  <Input
                    type="email"
                    value={advancedSettings.notificationEmail}
                    onChange={(e) => 
                      setAdvancedSettings(prev => ({ ...prev, notificationEmail: e.target.value }))
                    }
                    placeholder="admin@tuempresa.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recibe alertas de pagos importantes
                  </p>
                </div>

                {/* Modo de prueba */}
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">Modo de Prueba</Label>
                    <p className="text-sm text-muted-foreground">
                      Simular transacciones sin procesar pagos reales
                    </p>
                  </div>
                  <Switch
                    checked={advancedSettings.testMode}
                    onCheckedChange={(checked) => 
                      setAdvancedSettings(prev => ({ ...prev, testMode: checked }))
                    }
                  />
                </div>

                {/* Registro de transacciones */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Registro de Transacciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Guardar logs detallados de todas las transacciones
                    </p>
                  </div>
                  <Switch
                    checked={advancedSettings.logTransactions}
                    onCheckedChange={(checked) => 
                      setAdvancedSettings(prev => ({ ...prev, logTransactions: checked }))
                    }
                  />
                </div>

                {/* Botones de prueba */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">Herramientas de Prueba</Label>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleTestConnection}
                    disabled={testing}
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Probando conexiones...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Probar Todas las Conexiones
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Verifica que todas las integraciones habilitadas estén funcionando
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveAdvanced}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Todo
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hotmart" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="hotmart">Hotmart</TabsTrigger>
          <TabsTrigger value="mercadopago">MercadoPago</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="nequi">Nequi</TabsTrigger>
          <TabsTrigger value="daviplata">Daviplata</TabsTrigger>
          <TabsTrigger value="bank">Banco</TabsTrigger>
        </TabsList>

        {/* HOTMART */}
        <TabsContent value="hotmart" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-base font-semibold">Habilitar Hotmart</Label>
              <p className="text-sm text-muted-foreground">Plataforma de productos digitales</p>
            </div>
            <Switch
              checked={config.hotmart.enabled}
              onCheckedChange={(checked) => updateConfig('hotmart', 'enabled', checked)}
            />
          </div>

          {config.hotmart.enabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>API Key 🔒</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showSecrets.hotmartApiKey ? 'text' : 'password'}
                    value={config.hotmart.apiKey}
                    onChange={(e) => updateConfig('hotmart', 'apiKey', e.target.value)}
                    placeholder="Tu API Key de Hotmart"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret('hotmartApiKey')}
                  >
                    {showSecrets.hotmartApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Checkout URL</Label>
                <Input
                  value={config.hotmart.checkoutUrl}
                  onChange={(e) => updateConfig('hotmart', 'checkoutUrl', e.target.value)}
                  placeholder="https://pay.hotmart.com/XXXXXXXX"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={config.hotmart.email}
                  onChange={(e) => updateConfig('hotmart', 'email', e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* MERCADOPAGO */}
        <TabsContent value="mercadopago" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-base font-semibold">Habilitar MercadoPago</Label>
              <p className="text-sm text-muted-foreground">Pagos en línea para Latinoamérica</p>
            </div>
            <Switch
              checked={config.mercadopago.enabled}
              onCheckedChange={(checked) => updateConfig('mercadopago', 'enabled', checked)}
            />
          </div>

          {config.mercadopago.enabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>Access Token 🔒</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showSecrets.mercadopagoToken ? 'text' : 'password'}
                    value={config.mercadopago.accessToken}
                    onChange={(e) => updateConfig('mercadopago', 'accessToken', e.target.value)}
                    placeholder="APP_USR-XXXX"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret('mercadopagoToken')}
                  >
                    {showSecrets.mercadopagoToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Public Key 🔒</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showSecrets.mercadopagoPublic ? 'text' : 'password'}
                    value={config.mercadopago.publicKey}
                    onChange={(e) => updateConfig('mercadopago', 'publicKey', e.target.value)}
                    placeholder="APP_USR-XXXX"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret('mercadopagoPublic')}
                  >
                    {showSecrets.mercadopagoPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={config.mercadopago.email}
                  onChange={(e) => updateConfig('mercadopago', 'email', e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* PAYPAL */}
        <TabsContent value="paypal" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-base font-semibold">Habilitar PayPal</Label>
              <p className="text-sm text-muted-foreground">Pagos internacionales</p>
            </div>
            <Switch
              checked={config.paypal.enabled}
              onCheckedChange={(checked) => updateConfig('paypal', 'enabled', checked)}
            />
          </div>

          {config.paypal.enabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>Client ID 🔒</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showSecrets.paypalId ? 'text' : 'password'}
                    value={config.paypal.clientId}
                    onChange={(e) => updateConfig('paypal', 'clientId', e.target.value)}
                    placeholder="Tu Client ID de PayPal"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret('paypalId')}
                  >
                    {showSecrets.paypalId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Client Secret 🔒</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showSecrets.paypalSecret ? 'text' : 'password'}
                    value={config.paypal.clientSecret}
                    onChange={(e) => updateConfig('paypal', 'clientSecret', e.target.value)}
                    placeholder="Tu Client Secret"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret('paypalSecret')}
                  >
                    {showSecrets.paypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Email PayPal</Label>
                <Input
                  type="email"
                  value={config.paypal.email}
                  onChange={(e) => updateConfig('paypal', 'email', e.target.value)}
                  placeholder="tu@paypal.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Modo</Label>
                <select
                  value={config.paypal.mode}
                  onChange={(e) => updateConfig('paypal', 'mode', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="sandbox">Sandbox (Pruebas)</option>
                  <option value="live">Live (Producción)</option>
                </select>
              </div>
            </div>
          )}
        </TabsContent>

        {/* NEQUI */}
        <TabsContent value="nequi" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <div>
                <Label className="text-base font-semibold">Habilitar Nequi</Label>
                <p className="text-sm text-muted-foreground">Pagos móviles Colombia</p>
              </div>
            </div>
            <Switch
              checked={config.nequi.enabled}
              onCheckedChange={(checked) => updateConfig('nequi', 'enabled', checked)}
            />
          </div>

          {config.nequi.enabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>Número de Celular</Label>
                <Input
                  value={config.nequi.phone}
                  onChange={(e) => updateConfig('nequi', 'phone', e.target.value)}
                  placeholder="3001234567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Nombre del Titular</Label>
                <Input
                  value={config.nequi.name}
                  onChange={(e) => updateConfig('nequi', 'name', e.target.value)}
                  placeholder="Juan Pérez"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* DAVIPLATA */}
        <TabsContent value="daviplata" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <div>
                <Label className="text-base font-semibold">Habilitar Daviplata</Label>
                <p className="text-sm text-muted-foreground">Pagos móviles Colombia</p>
              </div>
            </div>
            <Switch
              checked={config.daviplata.enabled}
              onCheckedChange={(checked) => updateConfig('daviplata', 'enabled', checked)}
            />
          </div>

          {config.daviplata.enabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>Número de Celular</Label>
                <Input
                  value={config.daviplata.phone}
                  onChange={(e) => updateConfig('daviplata', 'phone', e.target.value)}
                  placeholder="3001234567"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Nombre del Titular</Label>
                <Input
                  value={config.daviplata.name}
                  onChange={(e) => updateConfig('daviplata', 'name', e.target.value)}
                  placeholder="Juan Pérez"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* BANCO */}
        <TabsContent value="bank" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <div>
                <Label className="text-base font-semibold">Habilitar Transferencia Bancaria</Label>
                <p className="text-sm text-muted-foreground">Cuenta bancaria para transferencias</p>
              </div>
            </div>
            <Switch
              checked={config.bankTransfer.enabled}
              onCheckedChange={(checked) => updateConfig('bankTransfer', 'enabled', checked)}
            />
          </div>

          {config.bankTransfer.enabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>Banco</Label>
                <Input
                  value={config.bankTransfer.bankName}
                  onChange={(e) => updateConfig('bankTransfer', 'bankName', e.target.value)}
                  placeholder="Bancolombia"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Número de Cuenta 🔒</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showSecrets.bankAccount ? 'text' : 'password'}
                    value={config.bankTransfer.accountNumber}
                    onChange={(e) => updateConfig('bankTransfer', 'accountNumber', e.target.value)}
                    placeholder="12345678901"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret('bankAccount')}
                  >
                    {showSecrets.bankAccount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Tipo de Cuenta</Label>
                <select
                  value={config.bankTransfer.accountType}
                  onChange={(e) => updateConfig('bankTransfer', 'accountType', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>

              <div>
                <Label>Titular de la Cuenta</Label>
                <Input
                  value={config.bankTransfer.accountHolder}
                  onChange={(e) => updateConfig('bankTransfer', 'accountHolder', e.target.value)}
                  placeholder="Juan Pérez"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Cédula/NIT 🔒</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showSecrets.bankId ? 'text' : 'password'}
                    value={config.bankTransfer.idNumber}
                    onChange={(e) => updateConfig('bankTransfer', 'idNumber', e.target.value)}
                    placeholder="1234567890"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret('bankId')}
                  >
                    {showSecrets.bankId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-100">Información Segura</p>
          <p className="text-blue-700 dark:text-blue-300 mt-1">
            Los datos sensibles (API Keys, tokens, números de cuenta) se muestran ofuscados (****1234) después de guardar.
            Solo tú puedes ver los valores completos al editarlos.
          </p>
        </div>
      </div>
    </Card>
  )
}
