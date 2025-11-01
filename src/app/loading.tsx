import { Bot } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Logo animado */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          {/* Spinner */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        </div>
        
        <p className="text-gray-600 mt-12 font-medium animate-pulse">Cargando...</p>
        
        {/* Puntos animados */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
