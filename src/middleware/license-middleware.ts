import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import LicenseService from '@/lib/license-service';

// Rutas que no requieren licencia
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/license/check',
  '/api/license/activate',
  '/api/license/trial',
  '/verify-email',
  '/login',
  '/register',
];

/**
 * Middleware para verificar licencia en cada request
 */
export async function licenseMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const licenseService = LicenseService.getInstance();
    const licenseCheck = await licenseService.checkLicense();

    if (!licenseCheck.valid) {
      // Redirigir a página de activación
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          {
            error: 'Licencia inválida o expirada',
            message: licenseCheck.message,
            requiresActivation: true,
          },
          { status: 403 }
        );
      }

      const url = request.nextUrl.clone();
      url.pathname = '/activate-license';
      return NextResponse.redirect(url);
    }

    // Agregar información de licencia a headers
    const response = NextResponse.next();
    response.headers.set('X-License-Valid', 'true');
    response.headers.set('X-License-Type', licenseCheck.type || 'unknown');
    response.headers.set('X-License-Days-Remaining', String(licenseCheck.daysRemaining || 0));

    return response;
  } catch (error) {
    console.error('Error en license middleware:', error);
    return NextResponse.next();
  }
}
