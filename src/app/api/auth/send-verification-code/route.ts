import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppVerificationService } from '@/lib/whatsapp-verification-service'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Obtener usuario
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        name: true,
        isPhoneVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.isPhoneVerified) {
      return NextResponse.json(
        { error: 'Teléfono ya verificado' },
        { status: 400 }
      )
    }

    if (!user.phone) {
      return NextResponse.json(
        { error: 'Usuario no tiene teléfono registrado' },
        { status: 400 }
      )
    }

    // Generar código
    const code = WhatsAppVerificationService.generateCode()

    // Guardar en BD
    await WhatsAppVerificationService.saveVerificationCode(userId, code)

    // Enviar por WhatsApp
    const sent = await WhatsAppVerificationService.sendVerificationCode(
      user.phone,
      code,
      user.name || undefined
    )

    if (!sent) {
      return NextResponse.json(
        { error: 'Error al enviar el código por WhatsApp' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Código enviado exitosamente'
    })
  } catch (error) {
    console.error('Error enviando código de verificación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
