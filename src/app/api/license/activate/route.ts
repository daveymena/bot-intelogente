import { NextRequest, NextResponse } from 'next/server';
import LicenseService from '@/lib/license-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, email, type = 'monthly' } = body;

    if (!key || !email) {
      return NextResponse.json(
        { error: 'Clave de licencia y email son requeridos' },
        { status: 400 }
      );
    }

    const licenseService = LicenseService.getInstance();
    const result = await licenseService.activateLicense(key, email, type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      license: result.license,
    });
  } catch (error) {
    console.error('Error activating license:', error);
    return NextResponse.json(
      { error: 'Error al activar licencia' },
      { status: 500 }
    );
  }
}
