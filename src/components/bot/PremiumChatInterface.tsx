'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Phone, MapPin, Clock } from 'lucide-react';

/**
 * 🎨 Diseño Premium de Chat de Ventas
 * Interfaz WhatsApp-style profesional y moderna
 */

interface Message {
  id: string;
  sender: 'customer' | 'bot';
  content: string;
  timestamp: Date;
  images?: string[];
  actions?: Array<{ label: string; value: string }>;
}

interface SalesPreviewProps {
  businessInfo: {
    name: string;
    phone: string;
    address: string;
    hours: string;
    rating: number;
  };
}

export function PremiumChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      content: '¡Hola! 👋 Bienvenido. Soy tu asistente de ventas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Añade mensaje del usuario
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: 'customer',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simula respuesta del bot (en producción, llamaría a la API)
    setTimeout(() => {
      const botMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'bot',
        content: `Entiendo que estás interesado en "${messageText}". Déjame mostrarte nuestras mejores opciones... 🎯`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-b-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Tecnovariedades D&S</h1>
              <p className="text-green-100 text-sm">En línea • Respuesta rápida</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-green-600/50 rounded-lg transition">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-green-600/50 rounded-lg transition">
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'bot'
                  ? 'bg-gray-200 text-gray-900 rounded-bl-none'
                  : 'bg-green-500 text-white rounded-br-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'bot' ? 'text-gray-500' : 'text-green-100'
                }`}
              >
                {message.timestamp.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              {/* Acciones interactivas */}
              {message.actions && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(action.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                        message.sender === 'bot'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-green-400/20 text-white hover:bg-green-400/30'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 rounded-t-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-full p-3 transition flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Sugerencias rápidas */}
        <div className="mt-3 flex gap-2 flex-wrap">
          {['Ver Productos', 'Precios', 'Envíos', 'Contacto'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSendMessage(suggestion)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Vista previa empresarial del negocio
 */
export function BusinessPreview({ businessInfo }: SalesPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 h-24"></div>

      {/* Contenido */}
      <div className="px-6 pb-6">
        {/* Logo */}
        <div className="flex items-end gap-4 -mt-8 mb-4">
          <div className="w-20 h-20 bg-green-600 rounded-xl shadow-lg flex items-center justify-center text-white text-3xl font-bold">
            {businessInfo.name.charAt(0)}
          </div>
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{businessInfo.name}</h2>
            <div className="flex items-center gap-1 text-yellow-500">
              {'⭐'.repeat(Math.floor(businessInfo.rating))}
              <span className="text-gray-600 text-sm ml-1">({businessInfo.rating})</span>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-3 text-gray-700">
            <Phone className="w-5 h-5 text-green-600" />
            <span>{businessInfo.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="w-5 h-5 text-green-600" />
            <span>{businessInfo.address}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-green-600" />
            <span>{businessInfo.hours}</span>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">
          Contactar Ahora
        </button>
      </div>
    </div>
  );
}

export default PremiumChatInterface;
