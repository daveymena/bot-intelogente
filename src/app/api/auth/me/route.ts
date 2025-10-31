import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get subscription status
    const subscriptionStatus = await AuthService.getSubscriptionStatus(user.id)

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      subscription: subscriptionStatus
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}