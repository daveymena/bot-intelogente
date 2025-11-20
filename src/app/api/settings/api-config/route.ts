import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener configuración del usuario
    const user = await db.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        apiKey: true,
        // Agregar campos de configuración según el schema
      }
    })

    // Por ahora retornar configuración desde variables de entorno
    // TODO: Guardar en BD cuando se implemente el modelo
    const config = {
      groqApiKey: process.env.GROQ_API_KEY || '',
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      claudeApiKey: process.env.CLAUDE_API_KEY || '',
      mercadopagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
      mercadopagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || '',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
      paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mercadolibreAccessToken: '',
      mercadolibreClientId: '',
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error loading API config:', error)
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // TODO: Guardar en BD cuando se implemente el modelo
    // Por ahora solo retornar success
    console.log('[API Config] Configuración recibida para usuario:', authResult.user.id)
    console.log('[API Config] ⚠️ Nota: Configuración no se guarda en BD aún')

    return NextResponse.json({ 
      success: true,
      message: 'Configuración guardada (temporal - usar variables de entorno)'
    })
  } catch (error) {
    console.error('Error saving API config:', error)
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}
