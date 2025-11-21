'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Copy, Check, ExternalLink, Share2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareStoreButtonProps {
  userId: string
  productCount?: number
}

export default function ShareStoreButton({ userId, productCount = 0 }: ShareStoreButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
  
  // Usar la nueva ruta de tienda sin userId (catálogo general)
  const storeUrl = `${baseUrl}/tienda`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      toast({
        title: '✅ URL copiada',
        description: 'La URL de tu tienda se copió al portapapeles'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo copiar la URL',
        variant: 'destructive'
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Tienda Online',
          text: '¡Visita mi tienda online! 🛍️',
          url: storeUrl
        })
      } catch (error) {
        // Usuario canceló o error
      }
    } else {
      handleCopy()
    }
  }

  const handleOpen = () => {
    window.open(storeUrl, '_blank')
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-blue-600" />
          Tu Tienda Personal
        </CardTitle>
        <CardDescription>
          Comparte tu catálogo con tus clientes ({productCount} productos disponibles)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Display */}
        <div className="bg-white border rounded-lg p-3 flex items-center gap-2">
          <code className="flex-1 text-sm text-gray-700 truncate">
            {storeUrl}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 w-full sm:w-auto"
            size="sm"
          >
            <Copy className="mr-2 h-4 w-4" />
            <span className="truncate">Copiar URL</span>
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 w-full sm:w-auto"
            size="sm"
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span className="truncate">Compartir</span>
          </Button>
          <Button
            onClick={handleOpen}
            className="flex-1 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="truncate">Ver Tienda</span>
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>✅ Pública - No requiere login</p>
          <p>✅ Personalizada - Solo tus productos</p>
          <p>✅ Compartible - URL única para redes sociales</p>
        </div>
      </CardContent>
    </Card>
  )
}

