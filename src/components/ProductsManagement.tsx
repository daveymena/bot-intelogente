'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  Image as ImageIcon,
  Upload,
  Download,
  FileJson,
  ExternalLink,
  Copy,
  Sparkles
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

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  category: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED'
  images: string[]
  tags: string[]
  autoResponse?: string
  stock?: number
  paymentLinkMercadoPago?: string
  paymentLinkPayPal?: string
  paymentLinkCustom?: string
  createdAt: string
  user: {
    name?: string
    businessName?: string
  }
}

const categoryIcons = {
  PHYSICAL: '📦',
  DIGITAL: '💻',
  SERVICE: '🛠️'
}

const statusColors = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
  DISCONTINUED: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  AVAILABLE: 'Disponible',
  OUT_OF_STOCK: 'Agotado',
  DISCONTINUED: 'Descontinuado'
}

const categoryLabels = {
  PHYSICAL: 'Físico',
  DIGITAL: 'Digital',
  SERVICE: 'Servicio'
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    price: string
    currency: string
    category: 'PHYSICAL' | 'DIGITAL' | 'SERVICE'
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED'
    images: string
    tags: string
    autoResponse: string
    stock: string
    paymentLinkMercadoPago: string
    paymentLinkPayPal: string
    paymentLinkCustom: string
  }>({
    name: '',
    description: '',
    price: '',
    currency: 'COP',
    category: 'PHYSICAL',
    status: 'AVAILABLE',
    images: '',
    tags: '',
    autoResponse: '',
    stock: '',
    paymentLinkMercadoPago: '',
    paymentLinkPayPal: '',
    paymentLinkCustom: ''
  })

  // Get user ID from session/auth
  const [userId, setUserId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    // Get user from session
    const getUserId = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          if (data.user?.id) {
            setUserId(data.user.id)
          }
        }
      } catch (error) {
        console.error('Error getting user:', error)
        toast.error('Error al obtener información del usuario')
      }
    }
    getUserId()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchProducts()
    }
  }, [userId])

  const fetchProducts = async () => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/products?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      toast.error('No se pudo obtener el ID del usuario')
      return
    }
    
    try {
      // Convertir tags de string separado por comas a JSON array
      let tagsArray: string[] = []
      if (formData.tags) {
        tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      }
      
      // Convertir images de string separado por comas a JSON array
      let imagesArray: string[] = []
      if (formData.images) {
        imagesArray = formData.images.split(',').map(i => i.trim()).filter(i => i.length > 0)
      }
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        images: imagesArray, // Enviar como array, el backend lo convierte a JSON
        tags: tagsArray, // Enviar como array, el backend lo convierte a JSON
        paymentLinkMercadoPago: formData.paymentLinkMercadoPago || null,
        paymentLinkPayPal: formData.paymentLinkPayPal || null,
        paymentLinkCustom: formData.paymentLinkCustom || null,
        userId
      }

      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado')
        setIsCreateDialogOpen(false)
        setEditingProduct(null)
        resetForm()
        fetchProducts()
      } else {
        toast.error('Error al guardar producto')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Error al guardar producto')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    
    // 🔧 CORRECCIÓN: Convertir images y tags a string limpio (sin JSON)
    let imagesStr = ''
    if (Array.isArray(product.images)) {
      // Si ya es array, unir con comas
      imagesStr = product.images.filter(img => img && typeof img === 'string').join(', ')
    } else if (typeof product.images === 'string') {
      // Si es string, intentar parsear
      try {
        const parsed = JSON.parse(product.images)
        if (Array.isArray(parsed)) {
          imagesStr = parsed.filter(img => img && typeof img === 'string').join(', ')
        } else {
          imagesStr = product.images
        }
      } catch {
        // Si no es JSON válido, usar como está (puede ser una URL simple)
        imagesStr = product.images
      }
    }
    
    let tagsStr = ''
    if (Array.isArray(product.tags)) {
      // Si ya es array, unir con comas
      tagsStr = product.tags.filter(tag => tag && typeof tag === 'string').join(', ')
    } else if (typeof product.tags === 'string') {
      // Si es string, intentar parsear
      try {
        const parsed = JSON.parse(product.tags)
        if (Array.isArray(parsed)) {
          tagsStr = parsed.filter(tag => tag && typeof tag === 'string').join(', ')
        } else {
          tagsStr = product.tags
        }
      } catch {
        // Si no es JSON válido, usar como está
        tagsStr = product.tags
      }
    }
    
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      currency: product.currency,
      category: product.category as 'PHYSICAL' | 'DIGITAL' | 'SERVICE',
      status: product.status as 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED',
      images: imagesStr,
      tags: tagsStr,
      autoResponse: product.autoResponse || '',
      stock: product.stock?.toString() || '',
      paymentLinkMercadoPago: (product as any).paymentLinkMercadoPago || '',
      paymentLinkPayPal: (product as any).paymentLinkPayPal || '',
      paymentLinkCustom: (product as any).paymentLinkCustom || ''
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          toast.success('Producto eliminado')
          fetchProducts()
        } else {
          toast.error('Error al eliminar producto')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Error al eliminar producto')
      }
    }
  }

  // Funciones de selección múltiple
  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) {
      toast.error('No hay productos seleccionados')
      return
    }

    const count = selectedProducts.size
    if (!confirm(`¿Estás seguro de que quieres eliminar ${count} producto(s)?`)) {
      return
    }

    setIsDeleting(true)
    let deleted = 0
    let failed = 0

    try {
      for (const productId of selectedProducts) {
        try {
          const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
          })
          if (response.ok) {
            deleted++
          } else {
            failed++
          }
        } catch (error) {
          failed++
        }
      }

      if (deleted > 0) {
        toast.success(`${deleted} producto(s) eliminado(s)`)
      }
      if (failed > 0) {
        toast.error(`${failed} producto(s) no se pudieron eliminar`)
      }

      setSelectedProducts(new Set())
      fetchProducts()
    } catch (error) {
      console.error('Error deleting products:', error)
      toast.error('Error al eliminar productos')
    } finally {
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'COP',
      category: 'PHYSICAL',
      status: 'AVAILABLE',
      images: '',
      tags: '',
      autoResponse: '',
      stock: '',
      paymentLinkMercadoPago: '',
      paymentLinkPayPal: '',
      paymentLinkCustom: ''
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Importar productos
  const handleImport = async (file: File) => {
    if (!userId) {
      toast.error('No se pudo obtener el ID del usuario')
      return
    }

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const response = await fetch('/api/import-export', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar')
      }

      toast.success(`✅ ${data.imported} productos importados correctamente`)
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message || 'Error al importar productos')
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    if (!userId) {
      toast.error('No se pudo obtener el ID del usuario')
      return
    }

    setExporting(true)
    try {
      const response = await fetch(`/api/import-export?format=${format}&userId=${userId}`)
      
      if (!response.ok) throw new Error('Error al exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `productos-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`✅ Productos exportados en formato ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Error al exportar productos')
    } finally {
      setExporting(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImport(e.target.files[0])
    }
  }

  // Funciones para Landing Pages
  const getLandingPageUrl = (productId: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/landing/${productId}`
  }

  const copyLandingPageUrl = (productId: string, productName: string) => {
    const url = getLandingPageUrl(productId)
    navigator.clipboard.writeText(url)
    toast.success(`✅ URL copiada: ${productName}`, {
      description: 'Pégala en tus anuncios de Facebook, Google, Instagram, etc.'
    })
  }

  const openLandingPage = (productId: string) => {
    const url = getLandingPageUrl(productId)
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Gestión de Productos</h3>
          <p className="text-sm text-gray-500">Administra tu catálogo de productos</p>
        </div>
        <div className="flex gap-2">
          {/* Botón Importar */}
          <div className="relative">
            <input
              id="file-import"
              type="file"
              accept=".json,.csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={importing}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-import')?.click()}
              disabled={importing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? 'Importando...' : 'Importar'}
            </Button>
          </div>

          {/* Botón Exportar */}
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar'}
          </Button>

          {/* Botón Nuevo Producto */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setEditingProduct(null)
                  resetForm()
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Modifica la información del producto'
                  : 'Agrega un nuevo producto a tu catálogo'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHYSICAL">Físico</SelectItem>
                      <SelectItem value="DIGITAL">Digital</SelectItem>
                      <SelectItem value="SERVICE">Servicio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Disponible</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Agotado</SelectItem>
                      <SelectItem value="DISCONTINUED">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock (solo productos físicos)</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="images">Imágenes (URLs separadas por comas)</Label>
                <Textarea
                  id="images"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="moto, vehiculo, transporte"
                />
              </div>

              <div>
                <Label htmlFor="autoResponse">Respuesta Automática</Label>
                <Textarea
                  id="autoResponse"
                  value={formData.autoResponse}
                  onChange={(e) => setFormData({ ...formData, autoResponse: e.target.value })}
                  placeholder="Respuesta predefinida para consultas sobre este producto"
                  rows={3}
                />
              </div>

              <Separator className="my-4" />

              {/* Métodos de Pago */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">💳 Métodos de Pago (Opcional)</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Configura los links de pago para este producto. El bot los usará automáticamente.
                  </p>
                </div>

                <div>
                  <Label htmlFor="paymentLinkMercadoPago">
                    Link de MercadoPago
                    <span className="text-xs text-gray-500 ml-2">(Acepta tarjetas y transferencias)</span>
                  </Label>
                  <Input
                    id="paymentLinkMercadoPago"
                    value={formData.paymentLinkMercadoPago}
                    onChange={(e) => setFormData({ ...formData, paymentLinkMercadoPago: e.target.value })}
                    placeholder="https://mpago.li/..."
                  />
                </div>

                <div>
                  <Label htmlFor="paymentLinkPayPal">
                    Link de PayPal
                    <span className="text-xs text-gray-500 ml-2">(Acepta tarjetas internacionales)</span>
                  </Label>
                  <Input
                    id="paymentLinkPayPal"
                    value={formData.paymentLinkPayPal}
                    onChange={(e) => setFormData({ ...formData, paymentLinkPayPal: e.target.value })}
                    placeholder="https://paypal.me/... o https://www.paypal.com/paypalme/..."
                  />
                </div>

                <div>
                  <Label htmlFor="paymentLinkCustom">
                    Link Personalizado
                    <span className="text-xs text-gray-500 ml-2">(Hotmart, Payco, etc.)</span>
                  </Label>
                  <Input
                    id="paymentLinkCustom"
                    value={formData.paymentLinkCustom}
                    onChange={(e) => setFormData({ ...formData, paymentLinkCustom: e.target.value })}
                    placeholder="https://pay.hotmart.com/... o cualquier otro link"
                  />
                </div>
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
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="PHYSICAL">Físicos</SelectItem>
            <SelectItem value="DIGITAL">Digitales</SelectItem>
            <SelectItem value="SERVICE">Servicios</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="AVAILABLE">Disponibles</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Agotados</SelectItem>
            <SelectItem value="DISCONTINUED">Descontinuados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Barra de selección múltiple */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">
                {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'}
              </span>
            </label>
            {selectedProducts.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedProducts.size} producto(s) seleccionado(s)
              </span>
            )}
          </div>
          {selectedProducts.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Eliminando...' : `Eliminar ${selectedProducts.size} producto(s)`}
            </Button>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden relative">
            {/* Checkbox de selección */}
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedProducts.has(product.id)}
                onChange={() => toggleSelectProduct(product.id)}
                className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Imagen del producto */}
            {product.images.length > 0 ? (
              <div className="relative h-48 w-full bg-gray-100">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si la imagen falla, mostrar placeholder
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen'
                  }}
                />
                <Badge className={`absolute top-2 right-2 ${statusColors[product.status]}`}>
                  {statusLabels[product.status]}
                </Badge>
              </div>
            ) : (
              <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin imagen</p>
                </div>
                <Badge className={`absolute top-2 right-2 ${statusColors[product.status]}`}>
                  {statusLabels[product.status]}
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[product.category]}</span>
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {categoryLabels[product.category]}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    ${product.price.toLocaleString()} {product.currency}
                  </p>
                  {product.category === 'PHYSICAL' && product.stock !== undefined && (
                    <p className="text-sm text-gray-500">
                      Stock: {product.stock} unidades
                    </p>
                  )}
                </div>
              </div>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <Separator />

              {/* Botón de Landing Page */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Landing Page</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white hover:bg-blue-50 border-blue-300"
                    onClick={() => copyLandingPageUrl(product.id, product.name)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white hover:bg-purple-50 border-purple-300"
                    onClick={() => openLandingPage(product.id)}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Para anuncios de Facebook, Google Ads, Instagram
                </p>
              </div>

              <Separator />

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}