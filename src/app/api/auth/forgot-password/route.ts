/**
 * API Route: Solicitar recuperación de contraseña
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { EmailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    let user: any = null
    try {
      user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      })
    } catch (dbError) {
      console.error('[ForgotPassword] Error de base de datos:', dbError)
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe, recibirás un enlace de recuperación'
      })
    }

    // Por seguridad, siempre devolver éxito (no revelar si el email existe)
    if (!user) {
      console.log('[ForgotPassword] Email no encontrado:', email);
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe, recibirás un enlace de recuperación'
      });
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Expiración: 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Guardar token en la base de datos
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt
      }
    });

    // Construir URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('[ForgotPassword] Token generado para:', email);
    console.log('[ForgotPassword] URL de reset:', resetUrl);

    // Enviar email
    try {
      await EmailService.sendPasswordResetEmail({
        to: user.email,
        userName: user.name || 'Usuario',
        resetUrl
      });

      console.log('[ForgotPassword] Email enviado exitosamente');
    } catch (emailError) {
      console.error('[ForgotPassword] Error enviando email:', emailError);
      
      // Limpiar token si falla el envío
      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null
        }
      });

      return NextResponse.json(
        { error: 'Error al enviar el correo de recuperación' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Si el correo existe, recibirás un enlace de recuperación'
    });

  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
