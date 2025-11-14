import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

/**
 * GET /api/auth/session
 * Verifica y renueva la sesión del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No session' },
        { status: 401 }
      )
    }

    // Verificar token
    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      // Token inválido, limpiar cookies
      const response = NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )

      response.cookies.delete('auth-token')
      response.cookies.delete('auth-status')
      response.cookies.delete('user-id')

      return response
    }

    // Token válido, renovar cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membershipType
      }
    })

    // Renovar cookies con nueva expiración
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    })

    response.cookies.set('auth-status', 'authenticated', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    })

    response.cookies.set('user-id', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    })

    return response
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { success: false, error: 'Session check failed' },
      { status: 500 }
    )
  }
}
