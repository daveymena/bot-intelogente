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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30">
      {/* Top Navigation - Suave y Profesional */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed w-full z-30 top-0 shadow-sm">
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
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-2 sm:ml-4 flex items-center gap-3">
                <div className="relative">
                  {/* Icono estilo WhatsApp */}
                  <div className="w-10 h-10 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-full flex items-center justify-center shadow-lg shadow-[#25d366]/30">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#25d366] rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-gray-900">
                    Smart Sales Bot
                  </span>
                  <p className="text-xs text-gray-600">WhatsApp Business</p>
                </div>
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

      {/* Overlay para móvil - Suave */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-20 top-16 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Verde WhatsApp */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-[#075e54] to-[#128c7e] border-r border-[#128c7e]/30 transition-all duration-300 z-30 shadow-lg ${isMobile
          ? sidebarOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full w-64'
          : sidebarCollapsed
            ? 'w-20'
            : 'w-64'
          }`}
      >
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  if (isMobile) setSidebarOpen(false)
                }}
                className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border-l-4 border-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                  } ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
                title={sidebarCollapsed && !isMobile ? item.label : ''}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white group-hover:scale-110'
                  }`} />
                {(!sidebarCollapsed || isMobile) && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {isActive && (!sidebarCollapsed || isMobile) && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Decorative gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#075e54] via-transparent to-transparent pointer-events-none"></div>
      </aside>

      {/* Main Content - Suave y Profesional */}
      <main
        className={`pt-16 transition-all duration-300 min-h-screen ${isMobile
          ? 'ml-0'
          : sidebarCollapsed
            ? 'ml-20'
            : 'ml-64'
          }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'whatsapp' && <WhatsAppConnection />}
            {activeTab === 'products' && <ProductsManagement />}
            {activeTab === 'prompts' && <AIPromptsManagement />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
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
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-green-50' : ''
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
                          className={`max-w-[70%] rounded-lg p-3 ${msg.direction === 'OUTGOING'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.direction === 'OUTGOING' ? 'text-green-100' : 'text-gray-500'
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
        // Obtener datos del usuario desde la base de datos
        const userResponse = await fetch('/api/auth/session')
        const userData = await userResponse.json()

        // Combinar settings del bot con datos del usuario
        setSettings({
          ...data.settings,
          userName: userData.user?.name || '',
          userPhone: userData.user?.phone || '',
          userBusinessName: userData.user?.businessName || '',
          userWhatsappNumber: userData.user?.whatsappNumber || ''
        })
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
      // Guardar configuración del bot
      const settingsResponse = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      // Guardar perfil de usuario
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings?.userName,
          phone: settings?.userPhone,
          businessName: settings?.userBusinessName,
          whatsappNumber: settings?.userWhatsappNumber
        })
      })

      const settingsData = await settingsResponse.json()
      const profileData = await profileResponse.json()

      if (settingsData.success && profileData.success) {
        toast.success('✅ Configuración y perfil guardados correctamente')
        // Recargar para actualizar el contexto de usuario
        window.location.reload()
      } else {
        toast.error('Error al guardar algunos datos')
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
              <input
                type="text"
                value={settings?.userName || user?.name || ''}
                onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                title="El email no se puede cambiar"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                value={settings?.userPhone || user?.phone || ''}
                onChange={(e) => setSettings({ ...settings, userPhone: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+57 300 000 0000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre del Negocio</label>
              <input
                type="text"
                value={settings?.userBusinessName || user?.businessName || ''}
                onChange={(e) => setSettings({ ...settings, userBusinessName: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mi Negocio"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">WhatsApp del Negocio</label>
              <input
                type="tel"
                value={settings?.userWhatsappNumber || ''}
                onChange={(e) => setSettings({ ...settings, userWhatsappNumber: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+57 300 000 0000"
              />
              <p className="mt-1 text-xs text-gray-500">
                Este es el número que usarás para conectar el bot de WhatsApp
              </p>
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
