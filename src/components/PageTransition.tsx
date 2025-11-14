'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bot } from 'lucide-react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Mostrar transición al cambiar de ruta
    setIsTransitioning(true)
    
    // Ocultar después de 500ms
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      {/* Overlay de transición */}
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="text-center">
          {/* Logo animado */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Bot className="w-10 h-10 text-white" />
            </div>
            
            {/* Spinner */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          </div>
          
          <p className="text-gray-600 mt-12 font-medium">Cargando...</p>
        </div>
      </div>

      {/* Contenido con fade-in */}
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </>
  )
}
