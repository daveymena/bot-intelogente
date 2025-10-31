import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    await AuthService.resetPassword(validatedData.token, validatedData.password)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    
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
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}