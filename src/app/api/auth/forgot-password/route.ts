import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    const resetToken = await AuthService.requestPasswordReset(validatedData.email)

    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token (in production, don't do this!)
    
    return NextResponse.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      // In production, remove this token from response
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}