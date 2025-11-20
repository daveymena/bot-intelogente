'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import APIConfiguration from '@/components/APIConfiguration'
import { BotPersonalityConfig } from '@/components/BotPersonalityConfig'
import { 
  Settings, 
  CreditCard, 
  Bot, 
  Database, 
  Mail,
  Building2,
  Smartphone
} from 'lucide-react'

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('apis')

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground">
          Administra todas las configuraciones de tu bot, APIs, métodos de pago y más
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="apis" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">APIs IA</span>
            <span className="sm:hidden">APIs</span>
          </TabsTrigger>
          
          <TabsTrigger value="pagos" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Métodos de Pago</span>
            <span className="sm:hidden">Pagos</span>
          </TabsTrigger>
          
          <TabsTrigger value="bot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Personalidad Bot</span>
            <span className="sm:hidden">Bot</span>
          </TabsTrigger>
          
          <TabsTrigger value="negocio" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Info Negocio</span>
            <span className="sm:hidden">Negocio</span>
          </TabsTrigger>
          
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
            <span className="sm:hidden">Email</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: APIs de IA */}
        <TabsContent value="apis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración de APIs de Inteligencia Artificial
              </CardTitle>
              <CardDescription>
                Configura las APIs de IA que usará tu bot para responder a los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APIConfiguration />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Métodos de Pago */}
        <TabsContent value="pagos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pago
              </CardTitle>
              <CardDescription>
                Configura las cuentas bancarias y métodos de pago que aceptas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodsConfig />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Personalidad del Bot */}
        <TabsContent value="bot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Personalidad del Bot
              </CardTitle>
              <CardDescription>
                Personaliza cómo se comporta y comunica tu bot con los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotPersonalityConfig />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Información del Negocio */}
        <TabsContent value="negocio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información del Negocio
              </CardTitle>
              <CardDescription>
                Configura los datos de tu negocio que el bot compartirá con los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessInfoConfig />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Notificaciones */}
        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Configura el email y notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente para Métodos de Pago
function PaymentMethodsConfig() {
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/settings/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.paymentMethods || {})
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethods: config })
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Métodos de pago guardados correctamente')
      } else {
        console.error('Error response:', data)
        alert(`❌ Error al guardar: ${data.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert(`❌ Error al guardar: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dos formas de configurar pagos</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Opción 1 - Simple (Recomendado):</strong> Solo ingresa tus datos bancarios (Nequi, Daviplata, Banco). El bot compartirá esta información cuando el cliente quiera pagar.</p>
          <p><strong>Opción 2 - Avanzado:</strong> Configura APIs de MercadoPago/PayPal para generar links de pago automáticos. Requiere cuenta de desarrollador.</p>
        </div>
      </div>

      {/* Sección: Métodos Manuales (Recomendado) */}
      <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
        <h2 className="text-lg font-bold text-green-900 mb-2">✅ Métodos de Pago Manuales (Recomendado)</h2>
        <p className="text-sm text-green-800 mb-4">Ingresa tus datos bancarios. El bot los compartirá automáticamente con los clientes.</p>
      </div>

      {/* Nequi */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Nequi</h3>
              <p className="text-sm text-muted-foreground">Transferencias móviles</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Número de Nequi</label>
            <input 
              type="tel"
              value={config.nequi?.number || ''}
              onChange={(e) => setConfig({
                ...config,
                nequi: { ...config.nequi, number: e.target.value }
              })}
              placeholder="3001234567"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nombre del titular (opcional)</label>
            <input 
              type="text"
              value={config.nequi?.holder || ''}
              onChange={(e) => setConfig({
                ...config,
                nequi: { ...config.nequi, holder: e.target.value }
              })}
              placeholder="Juan Pérez"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Daviplata */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold">Daviplata</h3>
              <p className="text-sm text-muted-foreground">Transferencias móviles</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Número de Daviplata</label>
            <input 
              type="tel"
              value={config.daviplata?.number || ''}
              onChange={(e) => setConfig({
                ...config,
                daviplata: { ...config.daviplata, number: e.target.value }
              })}
              placeholder="3001234567"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nombre del titular (opcional)</label>
            <input 
              type="text"
              value={config.daviplata?.holder || ''}
              onChange={(e) => setConfig({
                ...config,
                daviplata: { ...config.daviplata, holder: e.target.value }
              })}
              placeholder="Juan Pérez"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Cuenta Bancaria */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Cuenta Bancaria</h3>
              <p className="text-sm text-muted-foreground">Transferencias bancarias</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Banco</label>
            <input 
              type="text"
              value={config.bank?.name || ''}
              onChange={(e) => setConfig({
                ...config,
                bank: { ...config.bank, name: e.target.value }
              })}
              placeholder="Bancolombia"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo de Cuenta</label>
            <select 
              value={config.bank?.accountType || 'Ahorros'}
              onChange={(e) => setConfig({
                ...config,
                bank: { ...config.bank, accountType: e.target.value }
              })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option>Ahorros</option>
              <option>Corriente</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Número de Cuenta</label>
            <input 
              type="text"
              value={config.bank?.accountNumber || ''}
              onChange={(e) => setConfig({
                ...config,
                bank: { ...config.bank, accountNumber: e.target.value }
              })}
              placeholder="12345678901"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Titular</label>
            <input 
              type="text"
              value={config.bank?.holder || ''}
              onChange={(e) => setConfig({
                ...config,
                bank: { ...config.bank, holder: e.target.value }
              })}
              placeholder="Nombre del titular"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-gray-300 my-8"></div>

      {/* Sección: APIs Avanzadas (Opcional) */}
      <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
        <h2 className="text-lg font-bold text-orange-900 mb-2">⚙️ APIs de Pago Automático (Opcional - Avanzado)</h2>
        <p className="text-sm text-orange-800 mb-2">Solo configura esto si quieres generar links de pago automáticos. Requiere cuenta de desarrollador.</p>
        <p className="text-xs text-orange-700">💡 Si no sabes qué es esto, déjalo vacío y usa solo los métodos manuales arriba.</p>
      </div>

      {/* MercadoPago */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">MercadoPago</h3>
              <p className="text-sm text-muted-foreground">Pagos online con tarjeta</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Access Token</label>
            <input 
              type="password"
              value={config.mercadoPago?.accessToken || ''}
              onChange={(e) => setConfig({
                ...config,
                mercadoPago: { ...config.mercadoPago, accessToken: e.target.value }
              })}
              placeholder="APP_USR-..."
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Public Key</label>
            <input 
              type="text"
              value={config.mercadoPago?.publicKey || ''}
              onChange={(e) => setConfig({
                ...config,
                mercadoPago: { ...config.mercadoPago, publicKey: e.target.value }
              })}
              placeholder="APP_USR-..."
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* PayPal */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">PayPal</h3>
              <p className="text-sm text-muted-foreground">Pagos internacionales</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Client ID</label>
            <input 
              type="text"
              value={config.paypal?.clientId || ''}
              onChange={(e) => setConfig({
                ...config,
                paypal: { ...config.paypal, clientId: e.target.value }
              })}
              placeholder="Tu PayPal Client ID"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Client Secret</label>
            <input 
              type="password"
              value={config.paypal?.clientSecret || ''}
              onChange={(e) => setConfig({
                ...config,
                paypal: { ...config.paypal, clientSecret: e.target.value }
              })}
              placeholder="Tu PayPal Client Secret"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email de PayPal</label>
            <input 
              type="email"
              value={config.paypal?.email || ''}
              onChange={(e) => setConfig({
                ...config,
                paypal: { ...config.paypal, email: e.target.value }
              })}
              placeholder="tu-email@paypal.com"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar Configuración de Pagos'}
      </button>
    </div>
  )
}

// Componente para Información del Negocio
function BusinessInfoConfig() {
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/settings/business-info')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.businessInfo || {})
      }
    } catch (error) {
      console.error('Error loading business info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/business-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInfo: config })
      })

      if (response.ok) {
        alert('✅ Información del negocio guardada correctamente')
      } else {
        alert('❌ Error al guardar')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('❌ Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Esta información se usará en las respuestas del bot y en los mensajes a los clientes.
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nombre del Negocio</label>
          <input 
            type="text"
            placeholder="Mi Tienda"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Dirección</label>
          <input 
            type="text"
            placeholder="Calle 123, Ciudad, País"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Teléfono del Negocio</label>
          <input 
            type="tel"
            placeholder="+57 300 123 4567"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email del Negocio</label>
          <input 
            type="email"
            placeholder="contacto@minegocio.com"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Horario de Atención</label>
          <textarea 
            placeholder="Lunes a Viernes: 9:00 AM - 6:00 PM&#10;Sábados: 9:00 AM - 2:00 PM"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Zonas de Entrega</label>
          <input 
            type="text"
            placeholder="Bogotá, Medellín, Cali"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90">
        Guardar Información del Negocio
      </button>
    </div>
  )
}

// Componente para Notificaciones
function NotificationsConfig() {
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Configura el email para recibir notificaciones de nuevos pedidos y mensajes importantes.
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email para Notificaciones</label>
          <input 
            type="email"
            placeholder="admin@minegocio.com"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Servidor SMTP (Gmail)</label>
          <input 
            type="text"
            placeholder="smtp.gmail.com"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            defaultValue="smtp.gmail.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Puerto SMTP</label>
          <input 
            type="number"
            placeholder="587"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            defaultValue="587"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Usuario de Email</label>
          <input 
            type="email"
            placeholder="tu-email@gmail.com"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Contraseña de Aplicación</label>
          <input 
            type="password"
            placeholder="xxxx xxxx xxxx xxxx"
            className="w-full mt-1 px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Usa una contraseña de aplicación de Gmail, no tu contraseña normal
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Notificar sobre:</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Nuevos pedidos</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Mensajes importantes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span className="text-sm">Errores del sistema</span>
            </label>
          </div>
        </div>
      </div>

      <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90">
        Guardar Configuración de Notificaciones
      </button>
    </div>
  )
}
