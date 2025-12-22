'use client'

import { useState, useEffect } from 'react'
import { Store, Palette, Image as ImageIcon, Globe, Save, Eye } from 'lucide-react'

interface StoreSettings {
  storeName: string
  storeSlogan: string
  description: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  logo: string
  logoSquare: string
  favicon: string
  bannerImage: string
  email: string
  phone: string
  whatsapp: string
  address: string
  city: string
  country: string
  facebook: string
  instagram: string
  twitter: string
  tiktok: string
}

export function StoreSettingsTab() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Mi Tienda',
    storeSlogan: '',
    description: '',
    primaryColor: '#10b981',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    logo: '',
    logoSquare: '',
    favicon: '',
    bannerImage: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    country: 'Colombia',
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/store-settings')
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/store-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Configuración guardada correctamente')
      } else {
        alert(`❌ Error: ${data.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error guardando:', error)
      alert('❌ Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏪 Mi Tienda</h1>
        <p className="text-gray-600">Personaliza la apariencia y configuración de tu tienda online</p>
      </div>

      {/* Información Básica */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Store className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Información Básica</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la Tienda *</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              placeholder="Mi Tienda Tech"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Eslogan</label>
            <input
              type="text"
              value={settings.storeSlogan}
              onChange={(e) => setSettings({ ...settings, storeSlogan: e.target.value })}
              placeholder="Los mejores productos al mejor precio"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Describe tu tienda..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Colores de la Tienda</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Color Principal</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color Secundario</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color de Acento</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">Vista previa de colores:</p>
          <div className="flex gap-3">
            <div 
              className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: settings.primaryColor }}
            >
              Principal
            </div>
            <div 
              className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: settings.secondaryColor }}
            >
              Secundario
            </div>
            <div 
              className="w-20 h-20 rounded-lg shadow-md flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: settings.accentColor }}
            >
              Acento
            </div>
          </div>
        </div>
      </div>

      {/* Imágenes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold">Imágenes</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Logo (URL)</label>
            <input
              type="url"
              value={settings.logo}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              placeholder="https://ejemplo.com/logo.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Logo principal de tu tienda (recomendado: 200x60px)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo Cuadrado (URL)</label>
            <input
              type="url"
              value={settings.logoSquare}
              onChange={(e) => setSettings({ ...settings, logoSquare: e.target.value })}
              placeholder="https://ejemplo.com/logo-square.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Para redes sociales y favicon (recomendado: 512x512px)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banner Principal (URL)</label>
            <input
              type="url"
              value={settings.bannerImage}
              onChange={(e) => setSettings({ ...settings, bannerImage: e.target.value })}
              placeholder="https://ejemplo.com/banner.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Banner hero de la tienda (recomendado: 1920x600px)</p>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold">Información de Contacto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="contacto@mitienda.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+57 300 123 4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">WhatsApp</label>
            <input
              type="tel"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              placeholder="573001234567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ciudad</label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              placeholder="Bogotá"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Dirección</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Calle 123 #45-67"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-pink-600" />
          <h2 className="text-xl font-bold">Redes Sociales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Facebook</label>
            <input
              type="url"
              value={settings.facebook}
              onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
              placeholder="https://facebook.com/mitienda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instagram</label>
            <input
              type="url"
              value={settings.instagram}
              onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              placeholder="https://instagram.com/mitienda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Twitter / X</label>
            <input
              type="url"
              value={settings.twitter}
              onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
              placeholder="https://twitter.com/mitienda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">TikTok</label>
            <input
              type="url"
              value={settings.tiktok}
              onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
              placeholder="https://tiktok.com/@mitienda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
        </button>

        <a
          href="/tienda"
          target="_blank"
          className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          <span>Vista Previa</span>
        </a>
      </div>
    </div>
  )
}
