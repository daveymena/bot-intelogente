'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, MessageCircle, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function PageAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 ¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?\n\nPuedo explicarte:\n• Cómo configurar el bot\n• Cómo conectar WhatsApp\n• Cómo agregar productos\n• Cómo funciona el sistema de pagos\n• Y mucho más...'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')

    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsTyping(true)

    // Simular delay de respuesta
    await new Promise(resolve => setTimeout(resolve, 500))

    // Generar respuesta (ahora es async)
    const response = await generateResponse(userMessage)
    setMessages(prev => [...prev, { role: 'assistant', content: response }])
    setIsTyping(false)
  }

  const generateResponse = async (question: string): Promise<string> => {
    const q = question.toLowerCase()

    // Intentar usar IA para respuesta más natural
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          history: messages.slice(-5) // Últimos 5 mensajes para contexto
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.response) {
          return data.response
        }
      }
    } catch (error) {
      console.log('Usando respuestas predefinidas como fallback')
    }

    // Fallback a respuestas predefinidas
    // Configuración inicial
    if (q.includes('configurar') || q.includes('empezar') || q.includes('inicio')) {
      return `🚀 **CONFIGURACIÓN INICIAL**\n\n` +
             `**Paso 1: Crear cuenta**\n` +
             `• Regístrate con tu email\n` +
             `• Verifica tu correo\n\n` +
             `**Paso 2: Conectar WhatsApp**\n` +
             `• Ve a "Conexión WhatsApp"\n` +
             `• Escanea el código QR\n` +
             `• Espera la confirmación\n\n` +
             `**Paso 3: Agregar productos**\n` +
             `• Ve a "Productos"\n` +
             `• Haz clic en "Agregar producto"\n` +
             `• Completa la información\n\n` +
             `¿Necesitas ayuda con algún paso específico?`
    }

    // WhatsApp
    if (q.includes('whatsapp') || q.includes('qr') || q.includes('conectar')) {
      return `📱 **CONECTAR WHATSAPP**\n\n` +
             `**Pasos:**\n` +
             `1. Ve a la sección "Conexión WhatsApp"\n` +
             `2. Haz clic en "Conectar WhatsApp"\n` +
             `3. Escanea el código QR con tu teléfono:\n` +
             `   • Abre WhatsApp\n` +
             `   • Toca los 3 puntos (⋮)\n` +
             `   • Selecciona "Dispositivos vinculados"\n` +
             `   • Toca "Vincular dispositivo"\n` +
             `   • Escanea el QR\n\n` +
             `4. Espera la confirmación (10-30 segundos)\n\n` +
             `✅ Una vez conectado, el bot responderá automáticamente\n\n` +
             `⚠️ **Importante:** No cierres WhatsApp en tu teléfono`
    }

    // Productos
    if (q.includes('producto') || q.includes('agregar') || q.includes('importar')) {
      return `📦 **GESTIÓN DE PRODUCTOS**\n\n` +
             `**Agregar producto individual:**\n` +
             `1. Ve a "Productos"\n` +
             `2. Clic en "Agregar producto"\n` +
             `3. Completa:\n` +
             `   • Nombre\n` +
             `   • Precio\n` +
             `   • Descripción\n` +
             `   • Categoría\n` +
             `   • Stock (opcional)\n` +
             `4. Guarda\n\n` +
             `**Importar múltiples productos:**\n` +
             `1. Ve a "Productos"\n` +
             `2. Clic en "Importar/Exportar"\n` +
             `3. Descarga la plantilla CSV\n` +
             `4. Completa la plantilla\n` +
             `5. Sube el archivo\n\n` +
             `¿Necesitas ayuda con algo específico?`
    }

    // Pagos
    if (q.includes('pago') || q.includes('mercadopago') || q.includes('paypal') || q.includes('nequi')) {
      return `💳 **CONFIGURAR PAGOS**\n\n` +
             `**Métodos disponibles:**\n\n` +
             `1️⃣ **Nequi/Daviplata**\n` +
             `   • Configura tu número en Settings\n` +
             `   • Los clientes te envían el pago\n` +
             `   • Verificas el comprobante\n\n` +
             `2️⃣ **MercadoPago**\n` +
             `   • Crea cuenta en mercadopago.com.co\n` +
             `   • Obtén tu Access Token\n` +
             `   • Agrégalo en Settings > Pagos\n` +
             `   • El bot generará links automáticos\n\n` +
             `3️⃣ **PayPal**\n` +
             `   • Crea cuenta Business en paypal.com\n` +
             `   • Obtén Client ID y Secret\n` +
             `   • Agrégalos en Settings > Pagos\n\n` +
             `4️⃣ **Transferencia bancaria**\n` +
             `   • Configura tus datos bancarios\n` +
             `   • El bot los compartirá automáticamente\n\n` +
             `¿Necesitas ayuda configurando alguno?`
    }

    // Bot IA
    if (q.includes('bot') || q.includes('responde') || q.includes('automático')) {
      return `🤖 **CÓMO FUNCIONA EL BOT**\n\n` +
             `El bot usa IA para responder automáticamente:\n\n` +
             `**Qué hace:**\n` +
             `✅ Responde preguntas sobre productos\n` +
             `✅ Envía información de precios\n` +
             `✅ Comparte links de pago\n` +
             `✅ Maneja múltiples conversaciones\n` +
             `✅ Recuerda el contexto (24h)\n\n` +
             `**Personalización:**\n` +
             `• Ve a Settings > Bot\n` +
             `• Personaliza el saludo\n` +
             `• Ajusta el tono de respuesta\n` +
             `• Agrega instrucciones personalizadas\n\n` +
             `**Razonamiento profundo:**\n` +
             `El bot analiza cada mensaje en 4 pasos:\n` +
             `1. Entiende la intención\n` +
             `2. Busca el producto relevante\n` +
             `3. Verifica información de pago\n` +
             `4. Genera respuesta apropiada\n\n` +
             `¿Quieres saber más sobre alguna función?`
    }

    // Conversaciones
    if (q.includes('conversacion') || q.includes('cliente') || q.includes('mensaje')) {
      return `💬 **GESTIÓN DE CONVERSACIONES**\n\n` +
             `**Ver conversaciones:**\n` +
             `1. Ve a "Conversaciones"\n` +
             `2. Verás lista de chats activos\n` +
             `3. Haz clic para ver detalles\n\n` +
             `**Responder manualmente:**\n` +
             `• Abre la conversación\n` +
             `• Escribe tu mensaje\n` +
             `• Envía\n\n` +
             `**Modo automático:**\n` +
             `• El bot responde automáticamente\n` +
             `• Puedes intervenir cuando quieras\n` +
             `• El bot detecta cuando necesitas ayuda\n\n` +
             `**Estadísticas:**\n` +
             `• Ve a "Dashboard"\n` +
             `• Verás métricas de conversaciones\n` +
             `• Tasa de respuesta\n` +
             `• Tiempo promedio\n\n` +
             `¿Necesitas ayuda con algo más?`
    }

    // Problemas comunes
    if (q.includes('error') || q.includes('problema') || q.includes('no funciona')) {
      return `🔧 **SOLUCIÓN DE PROBLEMAS**\n\n` +
             `**WhatsApp desconectado:**\n` +
             `• Reconecta escaneando el QR\n` +
             `• Verifica que WhatsApp esté abierto\n` +
             `• Revisa tu conexión a internet\n\n` +
             `**Bot no responde:**\n` +
             `• Verifica que WhatsApp esté conectado\n` +
             `• Revisa que el bot esté activado\n` +
             `• Verifica tu API key de Groq\n\n` +
             `**Productos no aparecen:**\n` +
             `• Verifica que estén en estado "Disponible"\n` +
             `• Revisa que tengan precio\n` +
             `• Actualiza la página\n\n` +
             `**Links de pago no funcionan:**\n` +
             `• Verifica credenciales de MercadoPago/PayPal\n` +
             `• Revisa que el producto tenga precio\n` +
             `• Contacta soporte si persiste\n\n` +
             `¿Necesitas ayuda con algo específico?`
    }

    // Respuesta por defecto
    return `Entiendo que preguntas sobre: "${question}"\n\n` +
           `Puedo ayudarte con:\n\n` +
           `📱 **WhatsApp:** Conexión y configuración\n` +
           `📦 **Productos:** Agregar, editar, importar\n` +
           `💳 **Pagos:** MercadoPago, PayPal, Nequi\n` +
           `🤖 **Bot:** Configuración y personalización\n` +
           `💬 **Conversaciones:** Gestión de chats\n` +
           `🔧 **Problemas:** Solución de errores\n\n` +
           `¿Sobre qué tema específico necesitas ayuda?`
  }

  // Solo mostrar en rutas de dashboard (administrador)
  // NO mostrar en tienda pública, catálogo, checkout, etc.
  const isAdminRoute = pathname?.startsWith('/dashboard')
  
  // No renderizar nada si no es ruta de admin
  if (!isAdminRoute) {
    return null
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Abrir asistente"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Virtual</h3>
                <p className="text-xs text-green-100">Siempre disponible</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-600 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
