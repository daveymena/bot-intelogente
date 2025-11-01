// 🤖 Sistema Multi-Provider de IA con Fallback Automático
// Si una API falla, automáticamente usa las otras

import Groq from 'groq-sdk'

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AICompletionOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  top_p?: number
}

interface AICompletionResponse {
  content: string
  provider: string
  model: string
  success: boolean
}

export class AIMultiProvider {
  private static groqClient: Groq | null = null
  
  // Inicializar clientes
  private static initGroq() {
    if (!this.groqClient && process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY
      })
    }
    return this.groqClient
  }

  // Inicializar OpenRouter (usa fetch, no necesita cliente especial)
  private static hasOpenRouter(): boolean {
    return !!process.env.OPENROUTER_API_KEY
  }

  // 🎯 Método principal: Intenta con todas las APIs hasta que una funcione
  static async generateCompletion(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResponse> {
    // Obtener orden de fallback desde .env o usar default
    const fallbackOrderEnv = process.env.AI_FALLBACK_ORDER || 'groq,openrouter,lmstudio'
    const fallbackOrder = fallbackOrderEnv.split(',').map(p => p.trim())
    
    // Configuración de reintentos
    const maxRetries = 2
    const retryDelay = 1000 // 1 segundo
    
    console.log(`[AI Multi-Provider] 🔄 Orden de fallback: ${fallbackOrder.join(' → ')}`)
    
    for (const provider of fallbackOrder) {
      try {
        console.log(`[AI Multi-Provider] 🔄 Intentando con: ${provider}`)
        
        let response: AICompletionResponse | null = null
        
        switch (provider.trim().toLowerCase()) {
          case 'openrouter':
            response = await this.tryOpenRouter(messages, options)
            break
          case 'groq':
            response = await this.tryGroq(messages, options)
            break
          case 'lmstudio':
            response = await this.tryLMStudio(messages, options)
            break
          case 'openai':
            response = await this.tryOpenAI(messages, options)
            break
          case 'ollama':
            response = await this.tryOllama(messages, options)
            break
          default:
            console.log(`[AI Multi-Provider] ⚠️ Provider desconocido: ${provider}`)
            continue
        }
        
        if (response && response.success) {
          console.log(`[AI Multi-Provider] ✅ Éxito con: ${provider}`)
          return response
        }
        
      } catch (error: any) {
        console.error(`[AI Multi-Provider] ❌ Error con ${provider}:`, error.message)
        // Continuar con el siguiente provider
        continue
      }
    }
    
    // Si todos fallaron, lanzar error
    throw new Error('Todas las APIs de IA fallaron. Verifica tu configuración.')
  }

  // 🌐 OpenRouter API (Acceso a múltiples modelos)
  private static async tryOpenRouter(
    messages: AIMessage[],
    options: AICompletionOptions
  ): Promise<AICompletionResponse> {
    if (!this.hasOpenRouter()) {
      throw new Error('OpenRouter no configurado (falta OPENROUTER_API_KEY)')
    }
    
    const apiKey = process.env.OPENROUTER_API_KEY!
    const model = options.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet'
    const timeout = 30000 // 30 segundos
    
    console.log(`[OpenRouter] Usando modelo: ${model}`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
          'X-Title': 'Tecnovariedades D&S Bot'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 500,
          top_p: options.top_p || 1
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[OpenRouter] Error response:`, errorText)
        throw new Error(`OpenRouter HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      if (!content) {
        throw new Error('OpenRouter no devolvió contenido')
      }
      
      return {
        content,
        provider: 'openrouter',
        model: data.model || model,
        success: true
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('OpenRouter timeout')
      }
      throw error
    }
  }

  // 🚀 Groq API (Principal) - Con reintentos automáticos
  private static async tryGroq(
    messages: AIMessage[],
    options: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const client = this.initGroq()
    
    if (!client) {
      throw new Error('Groq no configurado (falta GROQ_API_KEY)')
    }
    
    const model = options.model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
    const timeout = parseInt(process.env.GROQ_TIMEOUT || '15000') // Aumentado a 15s
    const maxRetries = 3 // 3 intentos
    
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Groq] Intento ${attempt}/${maxRetries}`)
        
        // Crear promesa con timeout
        const completionPromise = client.chat.completions.create({
          model,
          messages: messages as any,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || parseInt(process.env.GROQ_MAX_TOKENS || '400'),
          top_p: options.top_p || 1,
          stream: false
        })
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Groq timeout')), timeout)
        )
        
        const completion = await Promise.race([completionPromise, timeoutPromise]) as any
        
        const content = completion.choices[0]?.message?.content
        
        if (!content) {
          throw new Error('Groq no devolvió contenido')
        }
        
        console.log(`[Groq] ✅ Éxito en intento ${attempt}`)
        
        return {
          content,
          provider: 'groq',
          model,
          success: true
        }
      } catch (error: any) {
        lastError = error
        console.log(`[Groq] ❌ Intento ${attempt} falló: ${error.message}`)
        
        // Si no es el último intento, esperar antes de reintentar
        if (attempt < maxRetries) {
          const delay = attempt * 1000 // 1s, 2s, 3s
          console.log(`[Groq] ⏳ Esperando ${delay}ms antes de reintentar...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    // Si todos los intentos fallaron, lanzar el último error
    throw lastError || new Error('Groq falló después de múltiples intentos')
  }

  // 🏠 LM Studio (Local - Sin límites)
  private static async tryLMStudio(
    messages: AIMessage[],
    options: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const url = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions'
    const timeout = parseInt(process.env.LM_STUDIO_TIMEOUT || '30000')
    
    console.log(`[LM Studio] Conectando a: ${url}`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    // Preparar el body - LM Studio no siempre necesita el campo "model"
    const requestBody: any = {
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 400,
      stream: false
    }
    
    // Solo agregar model si está configurado explícitamente
    const configuredModel = process.env.LM_STUDIO_MODEL
    if (configuredModel && configuredModel !== 'phi-2') {
      requestBody.model = configuredModel
    }
    
    console.log(`[LM Studio] Request:`, JSON.stringify(requestBody, null, 2))
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[LM Studio] Error response:`, errorText)
        throw new Error(`LM Studio HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`[LM Studio] Response:`, JSON.stringify(data, null, 2))
      
      const content = data.choices?.[0]?.message?.content
      
      if (!content) {
        throw new Error('LM Studio no devolvió contenido')
      }
      
      const usedModel = data.model || configuredModel || 'lmstudio-local'
      
      return {
        content,
        provider: 'lmstudio',
        model: usedModel,
        success: true
      }
      
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('LM Studio timeout')
      }
      
      throw error
    }
  }

  // 🌐 OpenAI (Respaldo Premium)
  private static async tryOpenAI(
    messages: AIMessage[],
    options: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('OpenAI no configurado (falta OPENAI_API_KEY)')
    }
    
    const model = options.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 400
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI error: ${error.error?.message || response.statusText}`)
    }
    
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('OpenAI no devolvió contenido')
    }
    
    return {
      content,
      provider: 'openai',
      model,
      success: true
    }
  }

  // 🦙 Ollama (IA Local en tu VPS)
  private static async tryOllama(
    messages: AIMessage[],
    options: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434'
    const model = options.model || process.env.OLLAMA_MODEL || 'llama3.2'

    if (!process.env.OLLAMA_URL && !process.env.OLLAMA_MODEL) {
      throw new Error('Ollama no configurado (falta OLLAMA_URL o OLLAMA_MODEL)')
    }

    const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '30000')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 400
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Ollama error: ${error || response.statusText}`)
      }

      const data = await response.json()
      const content = data.message?.content

      if (!content) {
        throw new Error('Ollama no devolvió contenido')
      }

      return {
        content,
        provider: 'ollama',
        model,
        success: true
      }
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new Error('Ollama timeout')
      }

      throw error
    }
  }

  // 🧪 Probar conectividad de todos los providers
  static async testAllProviders(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    const testMessage: AIMessage[] = [
      { role: 'system', content: 'Eres un asistente útil.' },
      { role: 'user', content: 'Di "OK" si me entiendes.' }
    ]
    
    // Probar Groq
    try {
      await this.tryGroq(testMessage, { max_tokens: 10 })
      results.groq = true
      console.log('[Test] ✅ Groq funcionando')
    } catch (error: any) {
      results.groq = false
      console.log('[Test] ❌ Groq falló:', error.message)
    }
    
    // Probar LM Studio
    try {
      await this.tryLMStudio(testMessage, { max_tokens: 10 })
      results.lmstudio = true
      console.log('[Test] ✅ LM Studio funcionando')
    } catch (error: any) {
      results.lmstudio = false
      console.log('[Test] ❌ LM Studio falló:', error.message)
    }
    
    // Probar OpenAI (si está configurado)
    if (process.env.OPENAI_API_KEY) {
      try {
        await this.tryOpenAI(testMessage, { max_tokens: 10 })
        results.openai = true
        console.log('[Test] ✅ OpenAI funcionando')
      } catch (error: any) {
        results.openai = false
        console.log('[Test] ❌ OpenAI falló:', error.message)
      }
    }
    
    // Probar Ollama (si está configurado)
    if (process.env.OLLAMA_URL || process.env.OLLAMA_MODEL) {
      try {
        await this.tryOllama(testMessage, { max_tokens: 10 })
        results.ollama = true
        console.log('[Test] ✅ Ollama funcionando')
      } catch (error: any) {
        results.ollama = false
        console.log('[Test] ❌ Ollama falló:', error.message)
      }
    }
    
    return results
  }
}
