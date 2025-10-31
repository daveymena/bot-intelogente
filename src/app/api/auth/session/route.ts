import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Return user data without sensitive information
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membershipType,
        businessName: user.businessName,
        isEmailVerified: user.isEmailVerified
      }
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }
}
