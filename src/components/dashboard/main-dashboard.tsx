'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { 
  Bot, 
  MessageSquare, 
  Package, 
  Settings, 
  BarChart3, 
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import ProductsManagement from '@/components/ProductsManagement'
import AIPromptsManagement from '@/components/AIPromptsManagement'
import ImportExportManager from '@/components/ImportExportManager'
import { WhatsAppConnection } from '@/components/dashboard/WhatsAppConnection'

export function MainDashboard() {
  const { user, subscription, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
        setSidebarCollapsed(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'prompts', label: 'IA & Prompts', icon: Bot },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(!sidebarOpen)
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed)
                  }
                }}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-2 sm:ml-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">Smart Sales Bot</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Subscription Badge */}
              {subscription && (
                <Badge variant={subscription.hasAccess ? "default" : "destructive"} className="hidden sm:flex">
                  {subscription.type}
                  {subscription.daysLeft && ` - ${subscription.daysLeft} días`}
                </Badge>
              )}

              {/* Notifications */}
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-green-600 text-white">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30 shadow-lg ${
          isMobile
            ? sidebarOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full w-64'
            : sidebarCollapsed
            ? 'w-20'
            : 'w-64'
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  if (isMobile) setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
                title={sidebarCollapsed && !isMobile ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!sidebarCollapsed || isMobile) && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isMobile
            ? 'ml-0'
            : sidebarCollapsed
            ? 'ml-20'
            : 'ml-64'
        }`}
      >
        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'whatsapp' && <WhatsAppConnection />}
          {activeTab === 'products' && <ProductsManagement />}
          {activeTab === 'prompts' && <AIPromptsManagement />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  )
}

function OverviewTab() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/overview')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-2">Bienvenido a tu dashboard de Smart Sales Bot</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">Total de chats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">En catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">Contactos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Bot</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.botStatus === 'CONNECTED' ? (
                <span className="text-green-600">Activo</span>
              ) : (
                <span className="text-gray-500">Inactivo</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.botStatus === 'CONNECTED' ? 'Conectado' : 'Conecta WhatsApp'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Comienza a configurar tu bot</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="w-full" variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Conectar WhatsApp
          </Button>
          <Button className="w-full" variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Agregar Productos
          </Button>
          <Button className="w-full" variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            Configurar IA
          </Button>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <ImportExportManager />
    </div>
  )
}

function CustomersTab() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<any>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`)
      const data = await response.json()
      if (data.success) {
        setSelectedConversation(data.conversation)
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600 mt-2">Gestiona tus contactos y conversaciones</p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No hay clientes registrados aún</p>
              <p className="text-sm mt-2">Los clientes aparecerán cuando inicies conversaciones</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de conversaciones */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversaciones ({conversations.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => viewConversation(conv.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-green-600 text-white">
                          {conv.customerName?.charAt(0) || conv.customerPhone.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conv.customerName || conv.customerPhone}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.messages[0]?.content || 'Sin mensajes'}
                        </p>
                      </div>
                      <Badge variant={conv.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {conv._count.messages}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detalle de conversación */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedConversation ? 'Historial de Conversación' : 'Selecciona una conversación'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-green-600 text-white text-lg">
                        {selectedConversation.customerName?.charAt(0) || 
                         selectedConversation.customerPhone.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">
                        {selectedConversation.customerName || 'Cliente'}
                      </p>
                      <p className="text-sm text-gray-500">{selectedConversation.customerPhone}</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedConversation.messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'OUTGOING' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.direction === 'OUTGOING'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.direction === 'OUTGOING' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.createdAt).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Selecciona una conversación para ver los detalles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function SettingsTab() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('Configuración guardada')
      } else {
        toast.error('Error al guardar')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">Personaliza tu bot y preferencias</p>
      </div>

      {/* Perfil del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
          <CardDescription>Información de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-gray-900">{user?.name || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <p className="mt-1 text-gray-900">{user?.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Negocio</label>
              <p className="mt-1 text-gray-900">{user?.businessName || 'No especificado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración del Bot */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Bot</CardTitle>
          <CardDescription>Ajusta el comportamiento de las respuestas automáticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre del Negocio</label>
              <input
                type="text"
                value={settings?.businessName || ''}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Mi Negocio"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono del Negocio</label>
              <input
                type="text"
                value={settings?.businessPhone || ''}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="+57 300 000 0000"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Retraso de Respuesta (segundos)
              </label>
              <input
                type="number"
                value={settings?.responseDelay || 2}
                onChange={(e) => setSettings({ ...settings, responseDelay: parseInt(e.target.value) })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                max="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo de espera antes de responder (más natural)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Respuestas Automáticas</label>
                <p className="text-xs text-gray-500">Activar respuestas automáticas del bot</p>
              </div>
              <input
                type="checkbox"
                checked={settings?.autoResponseEnabled || false}
                onChange={(e) => setSettings({ ...settings, autoResponseEnabled: e.target.checked })}
                className="h-4 w-4 text-green-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Espera Inteligente</label>
                <p className="text-xs text-gray-500">No responder si el cliente está escribiendo</p>
              </div>
              <input
                type="checkbox"
                checked={settings?.smartWaitingEnabled || false}
                onChange={(e) => setSettings({ ...settings, smartWaitingEnabled: e.target.checked })}
                className="h-4 w-4 text-green-600 rounded"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Configuración de IA */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de IA</CardTitle>
          <CardDescription>Ajusta los parámetros del modelo de inteligencia artificial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tokens Máximos
            </label>
            <input
              type="number"
              value={settings?.maxTokens || 500}
              onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              min="100"
              max="2000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Longitud máxima de las respuestas (100-2000)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Temperatura: {settings?.temperature || 0.7}
            </label>
            <input
              type="range"
              value={settings?.temperature || 0.7}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="mt-1 w-full"
              min="0"
              max="1"
              step="0.1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Más preciso</span>
              <span>Más creativo</span>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Suscripción */}
      <Card>
        <CardHeader>
          <CardTitle>Suscripción</CardTitle>
          <CardDescription>Información de tu plan actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Plan Actual</p>
                <p className="text-sm text-gray-500">{user?.membershipType || 'FREE'}</p>
              </div>
              <Badge className="bg-green-600">Activo</Badge>
            </div>

            {user?.trialEnds && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  🎉 Período de prueba activo hasta:{' '}
                  {new Date(user.trialEnds).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}

            <Button variant="outline" className="w-full">
              Ver Planes y Precios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
