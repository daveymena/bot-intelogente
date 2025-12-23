/**
 * 🤖 SISTEMA HÍBRIDO CON OLLAMA COMO PRINCIPAL
 * 
 * Prioridad:
 * 1. 🆓 Ollama (Local - GRATIS)
 * 2. 💰 Groq (Cloud - Solo fallback)
 * 3. 📝 Plantillas locales (Último recurso)
 */

import { HybridIntelligentResponseSystem } from './hybrid-intelligent-response-system'
import Groq from 'groq-sdk'

interface OllamaResponse {
  model: string
  response: string
  done: boolean
}

/**
 * Proveedor de IA que usa Ollama primero, Groq como fallback
 */
class OllamaFirstAIProvider {
  private groqClient: Groq | null = null
  private ollamaUrl: string
  private ollamaModel: string

  constructor(groqApiKey?: string) {
    if (groqApiKey) {
      this.groqClient = new Groq({ apiKey: groqApiKey })
    }
    // Usar Ollama de Easypanel
    this.ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://davey-ollama.mapf5v.easypanel.host'
    this.ollamaModel = process.env.OLLAMA_MODEL || 'mistral:latest'
  }

  /**
   * Intentar con Ollama primero, fallback a Groq
   */
  async chat(messages: any[], options?: any): Promise<string> {
    // ⚠️ VERIFICAR SI OLLAMA ESTÁ DESACTIVADO
    const disableOllama = process.env.DISABLE_OLLAMA === 'true'
    
    if (disableOllama) {
      console.log('[OllamaFirst] ⚠️ Ollama desactivado, usando Groq directamente...')
      
      // Usar Groq directamente
      if (this.groqClient) {
        try {
          const response = await this.chatWithGroq(messages, options)
          console.log('[OllamaFirst] ✅ Respuesta generada con Groq')
          return response
        } catch (groqError) {
          console.error('[OllamaFirst] ❌ Groq falló:', (groqError as Error).message)
          throw new Error('Groq no disponible')
        }
      } else {
        throw new Error('Groq no configurado')
      }
    }
    
    // 1️⃣ INTENTAR CON OLLAMA PRIMERO (GRATIS)
    try {
      console.log('[OllamaFirst] 🤖 Intentando con Ollama (Easypanel)...')
      const response = await this.chatWithOllama(messages, options)
      console.log('[OllamaFirst] ✅ Respuesta generada con Ollama')
      return response
    } catch (ollamaError) {
      console.log('[OllamaFirst] ⚠️ Ollama no disponible:', (ollamaError as Error).message)
      
      // 2️⃣ FALLBACK A GROQ (SOLO SI OLLAMA FALLA)
      if (this.groqClient) {
        try {
          console.log('[OllamaFirst] 🌐 Usando Groq como fallback...')
          const response = await this.chatWithGroq(messages, options)
          console.log('[OllamaFirst] ✅ Respuesta generada con Groq (fallback)')
          return response
        } catch (groqError) {
          console.error('[OllamaFirst] ❌ Groq también falló:', (groqError as Error).message)
          throw new Error('Ambos proveedores de IA fallaron')
        }
      } else {
        console.error('[OllamaFirst] ❌ Groq no configurado y Ollama no disponible')
        throw new Error('No hay proveedores de IA disponibles')
      }
    }
  }

  /**
   * Chat con Ollama (Easypanel)
   */
  private async chatWithOllama(messages: any[], options?: any): Promise<string> {
    // Convertir mensajes al formato de Ollama
    const prompt = this.convertMessagesToPrompt(messages)

    // Timeout de 15 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
            num_predict: options?.max_tokens || 500
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
      }

      const data: OllamaResponse = await response.json()
      return data.response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Ollama timeout (15s)')
      }
      throw error
    }
  }

  /**
   * Chat con Groq (cloud fallback)
   */
  private async chatWithGroq(messages: any[], options?: any): Promise<string> {
    if (!this.groqClient) {
      throw new Error('Groq client not initialized')
    }

    const completion = await this.groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Modelo actualizado (no deprecado)
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 500
    })

    return completion.choices[0]?.message?.content || ''
  }

  /**
   * Convertir mensajes al formato de prompt para Ollama
   */
  private convertMessagesToPrompt(messages: any[]): string {
    let prompt = ''
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `Sistema: ${msg.content}\n\n`
      } else if (msg.role === 'user') {
        prompt += `Usuario: ${msg.content}\n\n`
      } else if (msg.role === 'assistant') {
        prompt += `Asistente: ${msg.content}\n\n`
      }
    }
    
    prompt += 'Asistente:'
    return prompt
  }
}

/**
 * Crear sistema híbrido con Ollama como principal
 */
export async function createOllamaHybridSystem(groqApiKey?: string): Promise<HybridIntelligentResponseSystem> {
  console.log('🤖 Creando sistema híbrido con Ollama como principal...')
  
  const aiProvider = new OllamaFirstAIProvider(groqApiKey)
  
  // Verificar que Ollama está disponible
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://davey-ollama.mapf5v.easypanel.host'
    const response = await fetch(`${ollamaUrl}/api/tags`)
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Ollama (Easypanel) disponible')
      console.log(`📦 Modelos: ${data.models?.map((m: any) => m.name).join(', ') || 'ninguno'}`)
    }
  } catch (error) {
    console.log('⚠️ Ollama no está corriendo, se usará Groq como fallback')
  }
  
  return new HybridIntelligentResponseSystem(aiProvider)
}

/**
 * Verificar si Ollama está disponible
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://localhost:11434'
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000) // 5 segundos timeout para Easypanel
    })
    return response.ok
  } catch {
    return false
  }
}
