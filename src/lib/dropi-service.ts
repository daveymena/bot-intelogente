// Dropi Service - Integración con API de Dropi para dropshipping
// Token JWT de Chatbot Agents

function getDropiConfig() {
  return {
    apiUrl: process.env.DROPI_API_URL || 'https://app.dropi.co/api/v1',
    token: process.env.DROPI_AGENT_TOKEN
  }
}

export interface DropiProduct {
  id: number
  name: string
  description: string
  price: number
  sale_price?: number
  images: string[]
  stock: number
  sku: string
  category?: string
  variants?: DropiVariant[]
}

export interface DropiVariant {
  id: number
  name: string
  price: number
  stock: number
  sku: string
}

export interface DropiOrder {
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  items: Array<{
    product_id: number
    variant_id?: number
    quantity: number
    price: number
  }>
  shipping_method?: string
  payment_method?: string
  notes?: string
}

export interface DropiOrderResponse {
  id: number
  order_number: string
  status: string
  total: number
  tracking_number?: string
  tracking_url?: string
}

export class DropiService {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const config = getDropiConfig()
    
    if (!config.token) {
      throw new Error('DROPI_AGENT_TOKEN no configurado en .env')
    }

    const url = `${config.apiUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Dropi API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Obtener todos los productos disponibles
  static async getProducts(): Promise<DropiProduct[]> {
    try {
      console.log('📦 Obteniendo productos de Dropi...')
      const data = await this.request('/products')
      
      // La respuesta puede venir en data.data o directamente
      const products = data.data || data
      console.log(`✅ ${products.length || 0} productos obtenidos de Dropi`)
      return products
    } catch (error) {
      console.error('❌ Error obteniendo productos de Dropi:', error)
      throw error
    }
  }

  // Obtener un producto específico
  static async getProduct(productId: number): Promise<DropiProduct> {
    try {
      console.log(`📦 Obteniendo producto ${productId} de Dropi...`)
      const data = await this.request(`/products/${productId}`)
      console.log(`✅ Producto obtenido: ${data.name}`)
      return data
    } catch (error) {
      console.error(`❌ Error obteniendo producto ${productId}:`, error)
      throw error
    }
  }

  // Buscar productos por término
  static async searchProducts(query: string): Promise<DropiProduct[]> {
    try {
      console.log(`🔍 Buscando productos en Dropi: "${query}"`)
      const data = await this.request(`/products/search?q=${encodeURIComponent(query)}`)
      console.log(`✅ ${data.length || 0} productos encontrados`)
      return data
    } catch (error) {
      console.error('❌ Error buscando productos:', error)
      throw error
    }
  }

  // Crear una orden en Dropi
  static async createOrder(orderData: DropiOrder): Promise<DropiOrderResponse> {
    try {
      console.log('🛒 Creando orden en Dropi...')
      console.log('Cliente:', orderData.customer.name)
      console.log('Items:', orderData.items.length)
      
      const data = await this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      })
      
      console.log(`✅ Orden creada: #${data.order_number}`)
      return data
    } catch (error) {
      console.error('❌ Error creando orden:', error)
      throw error
    }
  }

  // Obtener estado de una orden
  static async getOrder(orderId: number): Promise<DropiOrderResponse> {
    try {
      console.log(`📋 Consultando orden ${orderId}...`)
      const data = await this.request(`/orders/${orderId}`)
      console.log(`✅ Orden #${data.order_number} - Estado: ${data.status}`)
      return data
    } catch (error) {
      console.error(`❌ Error consultando orden ${orderId}:`, error)
      throw error
    }
  }

  // Obtener órdenes del usuario
  static async getOrders(filters?: {
    status?: string
    limit?: number
    offset?: number
  }): Promise<DropiOrderResponse[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())
      
      const query = params.toString() ? `?${params.toString()}` : ''
      console.log(`📋 Obteniendo órdenes${query}...`)
      
      const data = await this.request(`/orders${query}`)
      console.log(`✅ ${data.length || 0} órdenes obtenidas`)
      return data
    } catch (error) {
      console.error('❌ Error obteniendo órdenes:', error)
      throw error
    }
  }

  // Sincronizar productos de Dropi a la base de datos local
  static async syncProducts(): Promise<{
    success: boolean
    imported: number
    updated: number
    errors: number
  }> {
    try {
      console.log('🔄 Iniciando sincronización de productos Dropi...')
      
      const dropiProducts = await this.getProducts()
      let imported = 0
      let updated = 0
      let errors = 0

      for (const product of dropiProducts) {
        try {
          // Aquí puedes guardar en tu base de datos
          // Por ahora solo contamos
          imported++
        } catch (error) {
          console.error(`Error importando producto ${product.id}:`, error)
          errors++
        }
      }

      console.log(`✅ Sincronización completada:`)
      console.log(`   - Importados: ${imported}`)
      console.log(`   - Actualizados: ${updated}`)
      console.log(`   - Errores: ${errors}`)

      return {
        success: errors === 0,
        imported,
        updated,
        errors,
      }
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      throw error
    }
  }

  // Verificar conexión con Dropi
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 Probando conexión con Dropi...')
      await this.request('/products?limit=1')
      console.log('✅ Conexión exitosa con Dropi')
      return true
    } catch (error) {
      console.error('❌ Error de conexión con Dropi:', error)
      return false
    }
  }
}
