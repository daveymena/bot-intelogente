import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Buscar el código de verificación
    const verificationCode = await db.verificationCode.findFirst({
      where: {
        code: code,
        type: 'email',
        expiresAt: {
          gt: new Date() // No expirado
        },
        user: {
          email: email
        }
      },
      include: {
        user: true
      }
    })

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Código inválido o expirado' },
        { status: 400 }
      )
    }

    // Verificar y activar usuario
    const updatedUser = await db.user.update({
      where: { id: verificationCode.userId },
      data: {
        isEmailVerified: true,
        isActive: true
      }
    })

    // Eliminar el código usado
    await db.verificationCode.delete({
      where: { id: verificationCode.id }
    })

    // Enviar email de bienvenida (opcional)
    try {
      const { EmailService } = await import('@/lib/email-service')
      await EmailService.sendWelcomeEmail(updatedUser.email, updatedUser.name || undefined)
    } catch (error) {
      console.log('⚠️ No se pudo enviar email de bienvenida:', error)
    }

    console.log(`✅ Usuario verificado: ${updatedUser.email}`)

    return NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isEmailVerified: updatedUser.isEmailVerified,
        isActive: updatedUser.isActive
      }
    })
  } catch (error) {
    console.error('❌ Error verificando código:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al verificar código' },
      { status: 500 }
    )
  }
}
