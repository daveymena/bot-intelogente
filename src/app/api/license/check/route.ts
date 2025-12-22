import { NextResponse } from 'next/server';
import LicenseService from '@/lib/license-service';

export async function GET() {
  try {
    const licenseService = LicenseService.getInstance();
    const licenseCheck = await licenseService.checkLicense();
    const licenseInfo = licenseService.getLicenseInfo();

    return NextResponse.json({
      ...licenseCheck,
      license: licenseInfo ? {
        type: licenseInfo.type,
        email: licenseInfo.email,
        expiresAt: licenseInfo.expiresAt,
        features: licenseInfo.features,
        activatedAt: licenseInfo.activatedAt,
      } : null,
      machineId: LicenseService.getMachineId(),
    });
  } catch (error) {
    console.error('Error checking license:', error);
    return NextResponse.json(
      { error: 'Error al verificar licencia' },
      { status: 500 }
    );
  }
}
