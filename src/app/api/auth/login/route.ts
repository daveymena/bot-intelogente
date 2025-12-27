import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔐 Login attempt:', { email: body.email, passwordLength: body.password?.length })
    
    const validatedData = loginSchema.parse(body)

    const { user, token } = await AuthService.login(validatedData)

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    })

    // Set HTTP-only cookie con configuración mejorada para persistencia
    response.cookies.set('auth-token', token, {
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax', // Protección CSRF pero permite navegación normal
      path: '/', // Disponible en toda la app
      maxAge: 30 * 24 * 60 * 60 // 30 días en segundos (aumentado para mayor persistencia)
    })

    // Cookie adicional para verificación rápida del lado del cliente (no sensible)
    response.cookies.set('auth-status', 'authenticated', {
      httpOnly: false, // Accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    })

    // Cookie con ID de usuario para persistencia (no sensible)
    response.cookies.set('user-id', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    })

    console.log('✅ Login successful for:', user.email)
    console.log('🍪 Cookies set with 30-day expiration')

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}