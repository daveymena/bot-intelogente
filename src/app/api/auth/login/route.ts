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
    const validatedData = loginSchema.parse(body)

    const { user, token } = await AuthService.login(validatedData)

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    console.log('✅ Login successful for:', user.email)
    console.log('🍪 Cookie set with token')

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
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