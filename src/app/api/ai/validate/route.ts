import { NextRequest, NextResponse } from 'next/server'

/**
 * API para validar API keys de diferentes proveedores de IA
 */
export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { valid: false, error: 'Provider and API key required' },
        { status: 400 }
      )
    }

    let isValid = false
    let errorMessage = ''

    switch (provider) {
      case 'groq':
        isValid = await validateGroq(apiKey)
        break
      
      case 'openai':
        isValid = await validateOpenAI(apiKey)
        break
      
      case 'gemini':
        isValid = await validateGemini(apiKey)
        break
      
      case 'claude':
      case 'anthropic':
        isValid = await validateClaude(apiKey)
        break
      
      case 'mistral':
        isValid = await validateMistral(apiKey)
        break
      
      case 'openrouter':
        isValid = await validateOpenRouter(apiKey)
        break
      
      case 'ollama':
        isValid = await validateOllama(apiKey) // apiKey es la URL base
        break
      
      default:
        errorMessage = 'Unknown provider'
    }

    return NextResponse.json({ 
      valid: isValid,
      provider,
      error: errorMessage || undefined
    })
  } catch (error: any) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { valid: false, error: error.message },
      { status: 500 }
    )
  }
}

// Validadores específicos por proveedor

async function validateGroq(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function validateOpenAI(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function validateGemini(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    )
    return response.ok
  } catch (error) {
    return false
  }
}

async function validateClaude(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
    })
    return response.ok || response.status === 400 // 400 también indica que la key es válida
  } catch (error) {
    return false
  }
}

async function validateMistral(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function validateOpenRouter(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function validateOllama(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000) // 5 segundos timeout
    })
    return response.ok
  } catch (error) {
    return false
  }
}
