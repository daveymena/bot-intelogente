/**
 * API: Solicitar recuperación de contraseña
 * Envía un código de verificación por WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BaileysService } from '@/lib/baileys-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Correo electrónico es requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Por seguridad, siempre retornar éxito aunque el usuario no exista
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe, recibirás un código de verificación',
        requiresCode: true
      })
    }

    // Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetCodeExpiry = new Date(Date.now() + 600000) // 10 minutos

    // Guardar código en la base de datos
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetCode,
        passwordResetExpires: resetCodeExpiry
      }
    })

    // Enviar código por EMAIL
    try {
      const { EmailVerificationService } = await import('@/lib/email-verification-service')
      
      // Enviar por email
      const emailSent = await EmailVerificationService.sendVerificationCode(
        user.email,
        resetCode,
        user.name || undefined,
        'password-reset'
      )

      if (emailSent) {
        console.log(`[Forgot Password] ✅ Código enviado por email a: ${user.email}`)
      } else {
        console.log(`[Forgot Password] ⚠️ Error enviando email, código: ${resetCode}`)
      }
    } catch (error) {
      console.error('[Forgot Password] ❌ Error:', error)
      console.log(`[Forgot Password] Código generado (usar manualmente): ${resetCode}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Si el correo existe, recibirás un código de verificación por email',
      requiresCode: true
    })

  } catch (error) {
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json(
      { error: 'Error procesando solicitud' },
      { status: 500 }
    )
  }
}
