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

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('auth-token')?.value

  console.log('🔍 Middleware:', {
    pathname,
    hasToken: !!token
  })

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
  // The actual token verification will happen in the API routes
  console.log('✅ Token found, allowing access')
  return NextResponse.next()
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
