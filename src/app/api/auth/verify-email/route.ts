import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const result = await AuthService.verifyEmail(token)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: result.user
    })
  } catch (error) {
    console.error('Email verification error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Email verification failed' },
      { status: 500 }
    )
  }
}
