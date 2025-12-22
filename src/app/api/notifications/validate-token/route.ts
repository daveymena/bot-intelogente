/**
 * API Route: Validar token de notificación
 * POST /api/notifications/validate-token
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    const result = await NotificationService.validateToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      token: result.token
    });

  } catch (error: any) {
    console.error('[ValidateToken] Error:', error);
    return NextResponse.json(
      { error: 'Error al validar token' },
      { status: 500 }
    );
  }
}
