'use client'

import { useEffect } from 'react'

export default function DemoPage() {
  useEffect(() => {
    // Ocultar el bot de ayuda del dashboard cuando se abre la demo
    const helpBot = document.querySelector('[data-help-bot]') as HTMLElement
    if (helpBot) {
      helpBot.style.display = 'none'
    }

    // Restaurar cuando se cierra
    return () => {
      if (helpBot) {
        helpBot.style.display = 'block'
      }
    }
  }, [])

  return (
    <div className="w-full h-screen relative">
      {/* Botón para cerrar y volver */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-50 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline">Volver al Dashboard</span>
        <span className="sm:hidden">Volver</span>
      </button>

      <iframe
        src="/demo-interactiva.html"
        className="w-full h-full border-0"
        title="Demo Interactiva - Smart Sales Bot Pro"
      />
    </div>
  )
}
