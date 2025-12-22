// API para probar conectividad de todos los providers de IA

import { NextResponse } from 'next/server'
import { AIMultiProvider } from '@/lib/ai-multi-provider'

export async function GET() {
  try {
    console.log('[API] Probando conectividad de providers de IA...')
    
    // Probar todos los providers
    const connectivity = await AIMultiProvider.testAllProviders()
    
    // Contar cuántos funcionan
    const workingCount = Object.values(connectivity).filter(Boolean).length
    const totalCount = Object.keys(connectivity).length
    
    // Determinar estado general
    const status = workingCount === 0 ? 'error' : 
                   workingCount === totalCount ? 'success' : 
                   'warning'
    
    return NextResponse.json({
      success: true,
      status,
      providers: connectivity,
      summary: {
        working: workingCount,
        total: totalCount,
        percentage: Math.round((workingCount / totalCount) * 100)
      },
      message: workingCount === 0 
        ? 'Ningún provider está funcionando. Verifica tu configuración.'
        : workingCount === totalCount
        ? '¡Todos los providers están funcionando!'
        : `${workingCount} de ${totalCount} providers funcionando.`
    })
    
  } catch (error: any) {
    console.error('[API] Error probando providers:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      providers: {},
      summary: {
        working: 0,
        total: 0,
        percentage: 0
      }
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Mensaje requerido'
      }, { status: 400 })
    }
    
    console.log('[API] Probando respuesta con multi-provider...')
    
    const testMessages = [
      {
        role: 'system' as const,
        content: 'Eres un asistente útil y amigable.'
      },
      {
        role: 'user' as const,
        content: message
      }
    ]
    
    const response = await AIMultiProvider.generateCompletion(testMessages, {
      temperature: 0.7,
      max_tokens: 200
    })
    
    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        provider: response.provider,
        model: response.model
      }
    })
    
  } catch (error: any) {
    console.error('[API] Error generando respuesta:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
