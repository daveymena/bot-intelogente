import { supabase } from '../supabase'

export interface SupabaseProduct {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  category: string
  images: string | string[] | null
  tags: string | null
  tipo_producto: string
  tipo_entrega: string
  configurations: any
  userId: string
  paymentLinkMercadoPago: string | null
  paymentLinkPayPal: string | null
  deliveryLink: string | null
}

export class SupabaseProductService {
  /**
   * Obtiene productos disponibles para un usuario
   */
  static async getAvailableProducts(userId: string): Promise<SupabaseProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'AVAILABLE')

      if (error) {
        console.error('[SupabaseProducts] ❌ Error fetching products:', error.message)
        return []
      }

      return data as SupabaseProduct[]
    } catch (error) {
      console.error('[SupabaseProducts] ❌ Critical error:', error)
      return []
    }
  }

  /**
   * Búsqueda profesional por nombre o tags (usando Full Text Search de Supabase si está habilitado)
   */
  static async searchProducts(userId: string, searchTerm: string): Promise<SupabaseProduct[]> {
    try {
      // Intentar búsqueda por texto en Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'AVAILABLE')
        .or(`name.ilike.%${searchTerm}%,tags.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) {
        console.error('[SupabaseProducts] ❌ Search error:', error.message)
        return []
      }

      return data as SupabaseProduct[]
    } catch (error) {
      console.error('[SupabaseProducts] ❌ Search critical error:', error)
      return []
    }
  }
}
