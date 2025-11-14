'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function DemoSection() {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-purple-900">Demo Interactiva</CardTitle>
        </div>
        <CardDescription>
          Descubre cómo funciona el bot con una demostración interactiva
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-2">🎬 Ver Demo Completa</h3>
          <p className="text-sm text-gray-600 mb-4">
            Explora todas las funcionalidades del bot en una presentación interactiva de 10 pantallas.
            Incluye ejemplos de IA, catálogo, tienda y más.
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="bg-purple-50 p-2 rounded">
              <span className="font-semibold text-purple-900">✅ Dashboard</span>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <span className="font-semibold text-purple-900">✅ WhatsApp</span>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <span className="font-semibold text-purple-900">✅ IA Multi-Proveedor</span>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <span className="font-semibold text-purple-900">✅ Catálogo + Tienda</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/demo" className="flex-1">
            <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
              <Play className="mr-2 h-4 w-4" />
              Ver Demo Interactiva
            </Button>
          </Link>
          
          <a 
            href="/demo-interactiva.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <Button variant="outline" size="lg" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>

        <div className="text-xs text-center text-gray-500">
          💡 Usa las flechas del teclado o los botones para navegar
        </div>
      </CardContent>
    </Card>
  )
}
