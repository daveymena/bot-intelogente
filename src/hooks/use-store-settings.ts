import { useState, useEffect } from 'react'

export interface StoreSettings {
  id: string
  userId: string
  storeName: string
  storeSlogan?: string | null
  description?: string | null
  logo?: string | null
  favicon?: string | null
  primaryColor: string
  secondaryColor: string
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  address?: string | null
  facebook?: string | null
  instagram?: string | null
  twitter?: string | null
  tiktok?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  keywords?: string | null
  currency: string
  language: string
  timezone: string
  termsUrl?: string | null
  privacyUrl?: string | null
  returnPolicy?: string | null
  createdAt: Date
  updatedAt: Date
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuración
  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/store-settings')
      const data = await response.json()

      if (data.settings) {
        setSettings(data.settings as any)
      } else {
        setError(data.error || 'Error al cargar configuración')
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  // Actualizar configuración
  const updateSettings = async (updates: Partial<StoreSettings>) => {
    try {
      const response = await fetch('/api/store-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates })
      })

      const data = await response.json()

      if (data.success) {
        setSettings(data.settings as any)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Cargar al montar
  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateSettings,
    reload: loadSettings
  }
}
