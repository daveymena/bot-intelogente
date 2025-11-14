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

    // Obtener estado de suscripción
    const subscription = await AuthService.getSubscriptionStatus(user.id)

    // Return user data without sensitive information
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membershipType: user.membershipType,
        businessName: user.businessName,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLoginAt: user.lastLoginAt
      },
      subscription: {
        hasAccess: subscription.status === 'ACTIVE',
        type: subscription.type,
        status: subscription.status,
        endsAt: subscription.endsAt,
        daysLeft: subscription.daysLeft,
        isTrial: subscription.isTrial
      }
    })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}
