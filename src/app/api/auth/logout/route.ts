import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario y limpia todas las cookies
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Eliminar TODAS las cookies de autenticación
    response.cookies.delete('auth-token')
    response.cookies.delete('auth-status')
    response.cookies.delete('user-id')

    console.log('✅ User logged out, cookies cleared')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
