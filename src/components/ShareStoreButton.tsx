'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Copy, Check, ExternalLink, Share2, ShoppingCart, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareStoreButtonProps {
  userId: string
  productCount?: number
}

export default function ShareStoreButton({ userId, productCount = 0 }: ShareStoreButtonProps) {
  const [copiedCatalog, setCopiedCatalog] = useState(false)
  const { toast } = useToast()

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const catalogUrl = `${baseUrl}/tienda`

  const handleCopyCatalog = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl)
      setCopiedCatalog(true)
      toast({
        title: '✅ URL copiada',
        description: 'La URL de la tienda se copió al portapapeles'
      })
      setTimeout(() => setCopiedCatalog(false), 2000)
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo copiar la URL',
        variant: 'destructive'
      })
    }
  }

  const handleShareCatalog = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Tienda de Productos',
          text: '¡Mira mi tienda de productos! 🛍️',
          url: catalogUrl
        })
      } catch (error) {
        // Usuario canceló o error
      }
    } else {
      handleCopyCatalog()
    }
  }

  const handleOpenCatalog = () => {
    window.open(catalogUrl, '_blank')
  }

  return (
    <div className="max-w-2xl">
      {/* Tienda Completa - Diseño Premium */}
      <Card className="border-red-300 bg-gradient-to-br from-red-50 via-white to-red-50 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="h-6 w-6 text-red-600" />
                Mi Tienda Completa
              </CardTitle>
              <CardDescription className="mt-1">
                Catálogo profesional con {productCount} productos disponibles
              </CardDescription>
            </div>
            <div className="bg-red-100 rounded-full p-2">
              <Zap className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Display */}
          <div className="bg-gradient-to-r from-red-50 to-white border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <code className="flex-1 text-sm text-gray-700 truncate font-mono">
              {catalogUrl}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyCatalog}
              className="shrink-0 cursor-pointer hover:bg-red-100"
            >
              {copiedCatalog ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-red-600" />
              )}
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-red-50 rounded-lg p-2 border border-red-100">
              <p className="font-semibold text-red-700">📱 Responsive</p>
              <p className="text-gray-600">Funciona en móvil</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-100">
              <p className="font-semibold text-red-700">⚡ Rápido</p>
              <p className="text-gray-600">Carga al instante</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-100">
              <p className="font-semibold text-red-700">💬 WhatsApp</p>
              <p className="text-gray-600">Contacto directo</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 border border-red-100">
              <p className="font-semibold text-red-700">🎨 Profesional</p>
              <p className="text-gray-600">Diseño moderno</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleOpenCatalog}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-md hover:shadow-lg transition-all"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Mi Tienda
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyCatalog}
                variant="outline"
                className="flex-1 cursor-pointer border-red-200 hover:bg-red-50"
                size="sm"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button
                onClick={handleShareCatalog}
                variant="outline"
                className="flex-1 cursor-pointer border-red-200 hover:bg-red-50"
                size="sm"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Info Badge */}
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-xs text-red-800">
            <p className="font-semibold mb-1">✨ Tu tienda está lista para compartir</p>
            <p>Comparte el enlace con tus clientes y comienza a vender</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
