import { NextResponse } from 'next/server';
import LicenseService from '@/lib/license-service';

export async function POST() {
  try {
    const licenseService = LicenseService.getInstance();
    const result = await licenseService.startTrial();

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, expiresAt: result.expiresAt },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: 'Error al iniciar período de prueba' },
      { status: 500 }
    );
  }
}
