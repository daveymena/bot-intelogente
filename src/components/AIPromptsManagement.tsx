'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy,
  Brain,
  MessageSquare,
  DollarSign,
  HelpCircle,
  LogOut,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface AIPrompt {
  id: string
  name: string
  prompt: string
  type: 'WELCOME' | 'PRODUCT_INFO' | 'PRICING' | 'SUPPORT' | 'CLOSING' | 'CUSTOM'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const typeIcons = {
  WELCOME: MessageSquare,
  PRODUCT_INFO: Brain,
  PRICING: DollarSign,
  SUPPORT: HelpCircle,
  CLOSING: LogOut,
  CUSTOM: Settings
}

const typeLabels = {
  WELCOME: 'Bienvenida',
  PRODUCT_INFO: 'Info Producto',
  PRICING: 'Precios',
  SUPPORT: 'Soporte',
  CLOSING: 'Cierre',
  CUSTOM: 'Personalizado'
}

const typeColors = {
  WELCOME: 'bg-blue-100 text-blue-800',
  PRODUCT_INFO: 'bg-green-100 text-green-800',
  PRICING: 'bg-yellow-100 text-yellow-800',
  SUPPORT: 'bg-purple-100 text-purple-800',
  CLOSING: 'bg-red-100 text-red-800',
  CUSTOM: 'bg-gray-100 text-gray-800'
}

const defaultPrompts = {
  WELCOME: `¡Hola! 😊 Bienvenido a Tecnovariedades D&S. Soy tu asistente virtual y estoy aquí para ayudarte. 

¿En qué puedo asistirte hoy?
- 🏍️ Motos y vehículos
- 💻 Laptops y tecnología  
- 🎹 Cursos y educación
- 📦 Otros productos

Escribe lo que buscas y te ayudaré a encontrarlo.`,
  
  PRODUCT_INFO: `Basado en tu consulta, aquí tienes la información del producto:

📦 {product_name}
💰 Precio: {price}
📝 Descripción: {description}
✅ Estado: {status}

¿Te gustaría:
1. Ver más fotos del producto?
2. Conocer los métodos de pago?
3. Agendar una visita?
4. Hacer otra consulta?

Escribe el número de tu opción o pregunta lo que necesites.`,
  
  PRICING: `💰 Información de Precios

{product_name}: {price}

💳 Métodos de pago disponibles:
- Efectivo
- Transferencia bancaria
- PSE
- Tarjeta de crédito (cuotas disponibles)

🎁 ¿Interesado en este producto? Puedo ayudarte a:
- Calcular cuotas
- Verificar disponibilidad
- Agendar una cita
- Reservar el producto

¿Qué te gustaría hacer?`,
  
  SUPPORT: `🤝 Soporte al Cliente

Entiendo tu consulta. Estoy aquí para ayudarte a resolverlo.

¿Necesitas ayuda con:
1. Información de productos
2. Estado de tu pedido
3. Métodos de pago
4. Garantía y devoluciones
5. Otra consulta

Escribe el número o describe tu problema y te ayudaré inmediatamente.`,
  
  CLOSING: `¡Gracias por contactarnos! 🎉

Ha sido un placer atenderte. 

📞 Si necesitas más ayuda:
- WhatsApp: {business_phone}
- Email: {business_email}
- Horario: Lunes a Sábado 8am-6pm

✨ No olvides seguirnos en nuestras redes sociales para más ofertas y novedades.

¡Que tengas un excelente día! 😊`
}

export default function AIPromptsManagement() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    type: 'WELCOME' as const,
    isActive: true
  })

  // Obtener userId real del usuario autenticado
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    // Obtener el usuario autenticado
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user?.id) {
          setUserId(data.user.id)
        }
      })
      .catch(err => console.error('Error obteniendo sesión:', err))
  }, [])

  useEffect(() => {
    if (userId) {
      fetchPrompts()
    }
  }, [userId])

  const fetchPrompts = async () => {
    try {
      const response = await fetch(`/api/prompts?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPrompts(data)
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
      toast.error('Error al cargar prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        ...formData,
        userId
      }

      const url = editingPrompt 
        ? `/api/prompts/${editingPrompt.id}`
        : '/api/prompts'
      
      const method = editingPrompt ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(editingPrompt ? 'Prompt actualizado' : 'Prompt creado')
        setIsCreateDialogOpen(false)
        setEditingPrompt(null)
        resetForm()
        fetchPrompts()
      } else {
        toast.error('Error al guardar prompt')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Error al guardar prompt')
    }
  }

  const handleEdit = (prompt: AIPrompt) => {
    setEditingPrompt(prompt)
    setFormData({
      name: prompt.name,
      prompt: prompt.prompt,
      type: prompt.type,
      isActive: prompt.isActive
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (promptId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este prompt?')) {
      try {
        const response = await fetch(`/api/prompts/${promptId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          toast.success('Prompt eliminado')
          fetchPrompts()
        } else {
          toast.error('Error al eliminar prompt')
        }
      } catch (error) {
        console.error('Error deleting prompt:', error)
        toast.error('Error al eliminar prompt')
      }
    }
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copiado al portapapeles')
  }

  const handleUseDefault = (type: keyof typeof defaultPrompts) => {
    setFormData({
      ...formData,
      prompt: defaultPrompts[type],
      name: `${typeLabels[type]} - Por defecto`
    })
  }

  const togglePromptStatus = async (promptId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(isActive ? 'Prompt activado' : 'Prompt desactivado')
        fetchPrompts()
      } else {
        toast.error('Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error toggling prompt status:', error)
      toast.error('Error al actualizar estado')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      prompt: '',
      type: 'WELCOME',
      isActive: true
    })
  }

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || prompt.type === typeFilter
    
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Gestión de Prompts IA</h3>
          <p className="text-sm text-gray-500">Configura las respuestas automáticas de tu bot</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setEditingPrompt(null)
                resetForm()
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrompt ? 'Editar Prompt' : 'Crear Nuevo Prompt'}
              </DialogTitle>
              <DialogDescription>
                {editingPrompt 
                  ? 'Modifica la configuración del prompt'
                  : 'Agrega un nuevo prompt para tu bot'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Prompt</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleUseDefault(formData.type)}
                      title="Usar plantilla por defecto"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="prompt">Contenido del Prompt</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={12}
                  placeholder="Escribe el contenido del prompt aquí. Puedes usar variables como {product_name}, {price}, {customer_name}, etc."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables disponibles: {'{product_name}'}, {'{price}'}, {'{description}'}, {'{customer_name}'}, {'{business_phone}'}, {'{business_email}'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Prompt activo</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingPrompt ? 'Actualizar' : 'Crear'} Prompt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(typeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrompts.map((prompt) => {
          const IconComponent = typeIcons[prompt.type]
          return (
            <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[prompt.type]}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{prompt.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {typeLabels[prompt.type]}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={prompt.isActive ? 'default' : 'secondary'}>
                      {prompt.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePromptStatus(prompt.id, !prompt.isActive)}
                    >
                      {prompt.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-700 line-clamp-4">
                    {prompt.prompt}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Creado: {new Date(prompt.createdAt).toLocaleDateString()}
                  {prompt.updatedAt !== prompt.createdAt && (
                    <span className="ml-2">
                      • Actualizado: {new Date(prompt.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPrompt(prompt.prompt)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(prompt)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(prompt.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron prompts
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || typeFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer prompt para configurar tu bot'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Prompt
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Start Templates */}
      {prompts.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plantillas Rápidas</CardTitle>
            <CardDescription>
              Usa estas plantillas predefinidas para comenzar rápidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(typeLabels).map(([type, label]) => {
                const IconComponent = typeIcons[type as keyof typeof typeIcons]
                return (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setFormData({
                        name: `${label} - Por defecto`,
                        prompt: defaultPrompts[type as keyof typeof defaultPrompts],
                        type: type as any,
                        isActive: true
                      })
                      setIsCreateDialogOpen(true)
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span>{label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}