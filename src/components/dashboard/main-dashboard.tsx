 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useSessionPersistence } from '@/hooks/useSessionPersistence'
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
  Loader2,
  Store,
  Brain
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
import BotPersonalityGenerator from '@/components/BotPersonalityGenerator'
import BotTrainingPanel from '@/components/dashboard/BotTrainingPanel'
import ShareStoreButton from '@/components/ShareStoreButton'
import { DemoSection } from '@/components/dashboard/DemoSection'
import { StoreSettingsTab } from '@/components/dashboard/store-settings-tab'
import { SubscriptionStatus } from '@/components/SubscriptionStatus'
import AntiBanMonitor from '@/components/AntiBanMonitor'

export function MainDashboard() {
  const { user, subscription, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobile, setIsMobile] = useState(false)

  // 🔒 Mantener sesión activa automáticamente
  useSessionPersistence()

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
    { id: 'store', label: 'Mi Tienda', icon: Store },
    { id: 'personality', label: 'Personalidad Bot', icon: Bot },
    { id: 'prompts', label: 'IA & Prompts', icon: Bot },
    { id: 'training', label: 'Entrenamiento Bot', icon: Brain },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Navigation - Ultra Premium */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(!sidebarOpen)
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed)
                  }
                }}
                className="p-2.5 rounded-xl text-slate-600 hover:text-green-600 hover:bg-green-50 transition-all duration-300"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Logo Premium */}
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#25d366] to-[#128c7e] rounded-xl flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-105 transition-transform duration-300">
                    <Bot className="text-white w-6 h-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-black bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-900 bg-clip-text text-transparent tracking-tight">
                    OpenClaw<span className="text-emerald-500 font-extrabold">System</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Search Bar Premium */}
              <div className="hidden md:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {user?.name || 'Administrador'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {user?.email}
                  </p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-white shadow-xl ring-2 ring-emerald-100 ring-offset-2 transition-transform hover:scale-110">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-bold text-shadow-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Moderno */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/50 transition-all duration-300 z-30 ${isMobile
          ? sidebarOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full w-72'
          : sidebarCollapsed
            ? 'w-24'
            : 'w-72'
          }`}
      >
        <div className="p-4 flex flex-col h-full">
          <nav className="space-y-1 flex-1">
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
                  className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive
                    ? 'bg-green-50 text-green-700 shadow-sm border border-green-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    } ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-green-600' : ''}`} />
                  {(!sidebarCollapsed || isMobile) && (
                    <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                  )}
                  {isActive && (!sidebarCollapsed || isMobile) && (
                    <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Upgrade Card */}
          {(!sidebarCollapsed || isMobile) && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden mt-8 mb-4">
              <div className="relative z-10">
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Plan Pro</p>
                <h4 className="font-black text-lg mb-4 leading-tight">Mejora tu Bot con IA</h4>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white border-none rounded-xl font-bold py-5">
                  Actualizar
                </Button>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-500 min-h-screen ${isMobile
          ? 'ml-0'
          : sidebarCollapsed
            ? 'ml-24'
            : 'ml-72'
          }`}
      >
        <div className="p-4 sm:p-10">
          <div className="max-w-7xl mx-auto page-transition">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'whatsapp' && <WhatsAppConnection />}
            {activeTab === 'products' && <ProductsManagement />}
            {activeTab === 'store' && <StoreSettingsTab />}
            {activeTab === 'personality' && <BotPersonalityGenerator />}
            {activeTab === 'prompts' && <AIPromptsManagement />}
            {activeTab === 'training' && <BotTrainingPanel />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </main>
    </div>
  )
}

function OverviewTab() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    
    // Actualizar stats cada 10 segundos para métricas en vivo
    const interval = setInterval(() => {
      fetchStats()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/overview')
      if (!response.ok) {
        console.log('Stats endpoint no disponible, usando datos por defecto')
        setStats({
          totalConversations: 0,
          totalProducts: 0,
          totalCustomers: 0,
          totalMessages: 0,
          activeConversations: 0,
          botStatus: 'DISCONNECTED',
          isConnected: false
        })
        return
      }
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.log('Stats no disponibles:', error)
      setStats({
        totalConversations: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalMessages: 0,
        activeConversations: 0,
        botStatus: 'DISCONNECTED',
        isConnected: false
      })
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
        <h1 className="text-4xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Panel de Inteligencia</h1>
        <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Sistema OpenClaw v1.0 • Gestión Avanzada de WhatsApp
        </p>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Demo Section */}
      <DemoSection />

      {/* Share Store Button */}
      {user && (
        <ShareStoreButton
          userId={user.id}
          productCount={stats?.totalProducts || 0}
        />
      )}

      {/* Stats Grid - Métricas en Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conversaciones */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalConversations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.activeConversations || 0} activas hoy
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.totalProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En catálogo
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.totalCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalMessages || 0} mensajes totales
            </p>
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          </CardContent>
        </Card>

        {/* OpenClaw Intelligence Status - Ultra Mode */}
        <Card className="relative overflow-hidden group border-2 border-emerald-100 shadow-emerald-50 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">Motor OpenClaw</CardTitle>
            <Brain className={`h-5 w-5 ${stats?.isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-300'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge className={`${stats?.isConnected ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-400'} text-xs font-bold`}>
                  {stats?.isConnected ? 'IA NATIVA ACTIVA' : 'SISTEMA STANDBY'}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-200 text-emerald-700">GROQ Priority</Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                {stats?.isConnected 
                  ? 'Orquestando agentes y herramientas en tiempo real...' 
                  : 'Esperando conexión de WhatsApp...'}
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-50 rounded-full opacity-30 group-hover:scale-125 transition-transform duration-500"></div>
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

      {/* Anti-Ban Monitor - Solo para Admin */}
      {user && user.email === 'daveymena16@gmail.com' && (
        <div className="mt-6">
          <AntiBanMonitor userId={user.id} />
        </div>
      )}
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
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-green-600 text-white text-lg">
                          {conv.customerName?.charAt(0)?.toUpperCase() || '👤'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {conv.customerName || 'Cliente'}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          📱 {conv.customerPhone}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conv.messages[0]?.content || 'Sin mensajes'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={conv.status === 'ACTIVE' ? 'default' : 'secondary'} className="bg-green-600">
                          {conv._count.messages} msgs
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString('es-CO')}
                        </span>
                      </div>
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
  const router = useRouter()
  
  // Redirigir a la página de configuración completa
  useEffect(() => {
    router.push('/dashboard/configuracion')
  }, [router])
  
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Cargando configuración...</p>
      </div>
    </div>
  )
}


