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
  Image as ImageIcon
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
    stock: ''
  })

  // Get user ID from session/auth
  const [userId, setUserId] = useState<string | null>(null)

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
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: formData.stock ? parseInt(formData.stock) : undefined,
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
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      currency: product.currency,
      category: product.category as 'PHYSICAL' | 'DIGITAL' | 'SERVICE',
      status: product.status as 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED',
      images: product.images.join(', '),
      tags: product.tags.join(', '),
      autoResponse: product.autoResponse || '',
      stock: product.stock?.toString() || ''
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
      stock: ''
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Gestión de Productos</h3>
          <p className="text-sm text-gray-500">Administra tu catálogo de productos</p>
        </div>
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow overflow-hidden">
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