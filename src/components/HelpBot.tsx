'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, HelpCircle, Package, Settings, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

const helpTopics = [
  {
    id: 'whatsapp',
    icon: MessageSquare,
    title: 'Conectar WhatsApp',
    description: 'Aprende a conectar tu número',
    response: '📱 Para conectar WhatsApp:\n\n1. Ve a la pestaña "WhatsApp"\n2. Click en "Conectar"\n3. Escanea el código QR con tu teléfono\n4. ¡Listo! Tu bot está conectado\n\n¿Necesitas más ayuda?'
  },
  {
    id: 'products',
    icon: Package,
    title: 'Gestionar Productos',
    description: 'Agrega y edita tu catálogo',
    response: '📦 Para gestionar productos:\n\n1. Ve a "Productos"\n2. Click en "Nuevo Producto"\n3. Completa la información\n4. Agrega imágenes y precio\n5. Guarda\n\nTambién puedes importar productos en masa con CSV o JSON.'
  },
  {
    id: 'import',
    icon: Package,
    title: 'Importar Productos',
    description: 'Importa tu catálogo masivamente',
    response: '📥 Para importar productos:\n\n1. Ve a "Productos"\n2. Click en "Importar"\n3. Selecciona tu archivo CSV o JSON\n4. El sistema validará los datos\n5. ¡Productos importados!\n\nPuedes descargar ejemplos desde el dashboard.'
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Configuración',
    description: 'Personaliza tu bot',
    response: '⚙️ Para configurar tu bot:\n\n1. Ve a "Configuración"\n2. Edita tu perfil y datos del negocio\n3. Ajusta las respuestas automáticas\n4. Configura los tiempos de espera\n5. Guarda los cambios\n\nLos cambios se aplican inmediatamente.'
  }
]

export function HelpBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 ¡Hola! Soy tu asistente virtual.\n\n¿En qué puedo ayudarte hoy?',
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleTopicClick = (topic: typeof helpTopics[0]) => {
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      text: topic.title,
      isBot: false,
      timestamp: new Date()
    }

    // Agregar respuesta del bot
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: topic.response,
      isBot: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botMessage])
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '🤔 Entiendo tu pregunta. Aquí hay algunos temas que podrían ayudarte:\n\n' +
            '• Conectar WhatsApp\n' +
            '• Gestionar Productos\n' +
            '• Importar Catálogo\n' +
            '• Configuración\n\n' +
            'Selecciona uno de los botones de ayuda rápida.',
      isBot: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botMessage])
    setInputMessage('')
  }

  return (
    <>
      {/* Botón Flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ¿Necesitas ayuda?
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Asistente Virtual</h3>
                <p className="text-white/80 text-xs">Siempre disponible</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isBot ? 'text-gray-500' : 'text-white/70'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Help Topics */}
          <div className="p-3 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-medium">Ayuda Rápida:</p>
            <div className="grid grid-cols-2 gap-2">
              {helpTopics.map((topic) => {
                const Icon = topic.icon
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {topic.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
