import { NextRequest, NextResponse } from 'next/server';
import LicenseService from '@/lib/license-service';

// Esta ruta debe estar protegida - solo para administradores
export async function POST(request: NextRequest) {
  try {
    // Verificar que sea admin (agregar tu lógica de autenticación)
    const adminKey = request.headers.get('X-Admin-Key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, type = 'monthly', machineId } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const licenseKey = LicenseService.generateLicenseKey(email, type, machineId);

    return NextResponse.json({
      success: true,
      licenseKey,
      email,
      type,
      machineId: machineId || 'ANY',
      message: 'Clave de licencia generada exitosamente',
    });
  } catch (error) {
    console.error('Error generating license:', error);
    return NextResponse.json(
      { error: 'Error al generar licencia' },
      { status: 500 }
    );
  }
}
