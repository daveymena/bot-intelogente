import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppVerificationService } from '@/lib/whatsapp-verification-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'userId y code son requeridos' },
        { status: 400 }
      )
    }

    // Verificar código
    const result = await WhatsAppVerificationService.verifyCode(userId, code)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    console.error('Error verificando código:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
