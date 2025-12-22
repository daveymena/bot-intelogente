/**
 * API Endpoint para que n8n envíe mensajes a WhatsApp
 * 
 * POST /api/whatsapp/send-from-n8n
 * Headers: x-api-key: tu-api-key-secreta
 * Body: { to, message, imageUrl?, caption? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBaileysWebhookService } from '@/lib/baileys-webhook-service'

const N8N_API_KEY = process.env.N8N_API_KEY || 'change-this-secret-key'

export async function POST(req: NextRequest) {
  try {
    // Validar API key
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== N8N_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { to, message, imageUrl, caption } = body

    // Validar datos requeridos
    if (!to || (!message && !imageUrl)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message or imageUrl' },
        { status: 400 }
      )
    }

    const baileys = getBaileysWebhookService()

    // Verificar conexión
    const status = baileys.getStatus()
    if (status.status !== 'connected') {
      return NextResponse.json(
        { error: 'WhatsApp not connected', status: status.status },
        { status: 503 }
      )
    }

    // Enviar mensaje o imagen
    let success = false
    if (imageUrl) {
      success = await baileys.sendImage(to, imageUrl, caption || message)
    } else {
      success = await baileys.sendMessage(to, message)
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        to,
        timestamp: Date.now()
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Error en /api/whatsapp/send-from-n8n:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Endpoint para verificar estado
export async function GET(req: NextRequest) {
  try {
    // Validar API key
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== N8N_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const baileys = getBaileysWebhookService()
    const status = baileys.getStatus()

    return NextResponse.json({
      status: status.status,
      hasQR: !!status.qrCode,
      timestamp: Date.now()
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
