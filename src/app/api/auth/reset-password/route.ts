/**
 * API: Resetear contraseña con código de verificación
 * Valida el código y actualiza la contraseña
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json()

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: 'Email, código y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuario con el código
    const user = await db.user.findFirst({
      where: {
        email: email.toLowerCase(),
        passwordResetToken: code,
        passwordResetExpires: {
          gt: new Date() // Código no expirado
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Código inválido o expirado' },
        { status: 400 }
      )
    }

    // Hash de la nueva contraseña
    const hashedPassword = await AuthService.hashPassword(password)

    // Actualizar contraseña y limpiar código
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    console.log(`[Reset Password] Contraseña actualizada para: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (error) {
    console.error('[Reset Password] Error:', error)
    return NextResponse.json(
      { error: 'Error procesando solicitud' },
      { status: 500 }
    )
  }
}
