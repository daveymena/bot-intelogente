import { NextRequest, NextResponse } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/landing',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-phone',
  '/verification-pending',
  '/catalogo',
  '/tienda',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/verify-phone',
  '/api/auth/send-verification-code',
  '/api/auth/resend-verification-code',
  '/api/auth/resend-verification',
  '/api/auth/session',
  '/api/health',
  '/api/products/public',
  '/api/payments/create',
  '/api/payments/webhook',
  '/api/assistant/chat',
  '/api/dropi'
]

// Routes that require subscription
const premiumRoutes = [
  '/dashboard',
  '/products',
  '/prompts',
  '/simulator',
  '/conversations',
  '/metrics',
  '/settings',
  '/api/products',
  '/api/prompts',
  '/api/ai',
  '/api/import-export',
  '/api/whatsapp'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for authentication token
  const token = request.cookies.get('auth-token')?.value
  const authStatus = request.cookies.get('auth-status')?.value

  console.log('🔍 Middleware:', {
    pathname,
    hasToken: !!token,
    authStatus
  })

  // 🔄 Si está autenticado y va a la raíz o landing, redirigir al dashboard
  if (token && authStatus === 'authenticated' && (pathname === '/' || pathname === '/landing')) {
    console.log('✅ Usuario autenticado, redirigiendo a dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (!token) {
    // Redirect to login for protected routes
    if (premiumRoutes.some(route => pathname.startsWith(route))) {
      console.log('❌ No token, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Token exists - allow access
  // La verificación real del token ocurre en las rutas API
  console.log('✅ Token found, allowing access')
  
  // Crear respuesta y renovar cookies para mantener la sesión activa
  const response = NextResponse.next()
  
  // Renovar TODAS las cookies de autenticación en cada request
  // Esto mantiene la sesión activa mientras el usuario usa la app
  if (token) {
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    })
  }
  
  if (authStatus === 'authenticated') {
    response.cookies.set('auth-status', 'authenticated', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    })
  }
  
  // Renovar cookie de user-id si existe
  const userId = request.cookies.get('user-id')?.value
  if (userId) {
    response.cookies.set('user-id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
