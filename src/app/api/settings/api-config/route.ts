import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener configuración del usuario desde BotSettings
    const botSettings = await db.botSettings.findUnique({
      where: { userId: authResult.user.id },
      select: {
        groqApiKey: true,
        openaiApiKey: true,
        claudeApiKey: true,
        geminiApiKey: true,
        mistralApiKey: true,
        anthropicApiKey: true,
        openrouterApiKey: true,
        ollamaBaseUrl: true,
        ollamaModel: true,
      }
    })

    // Obtener configuración de pagos desde PaymentIntegration
    const paymentIntegration = await db.paymentIntegration.findUnique({
      where: { userId: authResult.user.id },
      select: {
        mercadopagoAccessToken: true,
        mercadopagoPublicKey: true,
        paypalClientId: true,
        paypalClientSecret: true,
      }
    })

    // Combinar configuración guardada con variables de entorno como fallback
    const config = {
      // IA APIs
      groqApiKey: botSettings?.groqApiKey || process.env.GROQ_API_KEY || '',
      openaiApiKey: botSettings?.openaiApiKey || process.env.OPENAI_API_KEY || '',
      claudeApiKey: botSettings?.claudeApiKey || process.env.CLAUDE_API_KEY || '',
      geminiApiKey: botSettings?.geminiApiKey || process.env.GEMINI_API_KEY || '',
      mistralApiKey: botSettings?.mistralApiKey || process.env.MISTRAL_API_KEY || '',
      anthropicApiKey: botSettings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY || '',
      openrouterApiKey: botSettings?.openrouterApiKey || process.env.OPENROUTER_API_KEY || '',
      deepseekApiKey: process.env.DEEPSEEK_API_KEY || '', // No está en schema aún
      ollamaBaseUrl: botSettings?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || '',
      
      // Payment APIs
      mercadopagoAccessToken: paymentIntegration?.mercadopagoAccessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
      mercadopagoPublicKey: paymentIntegration?.mercadopagoPublicKey || process.env.MERCADO_PAGO_PUBLIC_KEY || '',
      paypalClientId: paymentIntegration?.paypalClientId || process.env.PAYPAL_CLIENT_ID || '',
      paypalClientSecret: paymentIntegration?.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET || '',
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
    const userId = authResult.user.id

    console.log('[API Config] Guardando configuración para usuario:', userId)

    // Separar configuración de IA y pagos
    const iaConfig = {
      groqApiKey: body.groqApiKey || null,
      openaiApiKey: body.openaiApiKey || null,
      claudeApiKey: body.claudeApiKey || null,
      geminiApiKey: body.geminiApiKey || null,
      mistralApiKey: body.mistralApiKey || null,
      anthropicApiKey: body.claudeApiKey || null, // Claude usa anthropicApiKey en schema
      openrouterApiKey: body.openrouterApiKey || null,
      ollamaBaseUrl: body.ollamaBaseUrl || null,
    }

    const paymentConfig = {
      mercadopagoAccessToken: body.mercadopagoAccessToken || null,
      mercadopagoPublicKey: body.mercadopagoPublicKey || null,
      paypalClientId: body.paypalClientId || null,
      paypalClientSecret: body.paypalClientSecret || null,
    }

    // Guardar configuración de IA en BotSettings
    await db.botSettings.upsert({
      where: { userId },
      create: {
        userId,
        businessPhone: authResult.user.phone || '',
        ...iaConfig,
      },
      update: iaConfig,
    })

    // Guardar configuración de pagos en PaymentIntegration
    await db.paymentIntegration.upsert({
      where: { userId },
      create: {
        userId,
        mercadopagoEnabled: !!paymentConfig.mercadopagoAccessToken,
        paypalEnabled: !!paymentConfig.paypalClientId,
        ...paymentConfig,
      },
      update: {
        mercadopagoEnabled: !!paymentConfig.mercadopagoAccessToken,
        paypalEnabled: !!paymentConfig.paypalClientId,
        ...paymentConfig,
      },
    })

    console.log('[API Config] ✅ Configuración guardada exitosamente')

    return NextResponse.json({ 
      success: true,
      message: 'Configuración guardada correctamente en la base de datos'
    })
  } catch (error) {
    console.error('[API Config] Error saving:', error)
    return NextResponse.json({ 
      error: 'Failed to save config',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
