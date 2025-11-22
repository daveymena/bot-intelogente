'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, ExternalLink, Sparkles, Youtube } from 'lucide-react'
import Link from 'next/link'

export function DemoSection() {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-purple-900">Demo y Tutorial</CardTitle>
        </div>
        <CardDescription>
          Aprende a usar la plataforma con nuestro video tutorial completo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Tutorial de YouTube */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Youtube className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">📺 Video Tutorial Completo</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Mira este video instructivo para aprender a usar todas las funcionalidades de la plataforma paso a paso.
          </p>
          
          {/* Video Embed Responsive */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/kQclScVbkJg"
              title="Tutorial Smart Sales Bot Pro"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="mt-3 flex items-center justify-center gap-2">
            <a 
              href="https://www.youtube.com/watch?v=kQclScVbkJg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Ver en YouTube
            </a>
          </div>
        </div>

        {/* Demo Interactiva */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-2">🎬 Demo Interactiva</h3>
          <p className="text-sm text-gray-600 mb-4">
            Explora todas las funcionalidades del bot en una presentación interactiva de 10 pantallas.
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
        </div>

        <div className="text-xs text-center text-gray-500">
          💡 Combina el video tutorial con la demo interactiva para una experiencia completa
        </div>
      </CardContent>
    </Card>
  )
}
