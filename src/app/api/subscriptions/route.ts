import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await AuthService.validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            membershipType: true,
            membershipEnds: true,
            trialEnds: true
          }
        }
      }
    })

    const subscriptionStatus = await AuthService.getSubscriptionStatus(user.id)

    return NextResponse.json({
      subscription,
      status: subscriptionStatus
    })
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await AuthService.validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, paymentMethodId } = body

    // Get plan details
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Calculate subscription dates
    const now = new Date()
    let currentPeriodEnd: Date

    switch (plan.interval) {
      case 'MONTH':
        currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + plan.intervalCount, now.getDate())
        break
      case 'YEAR':
        currentPeriodEnd = new Date(now.getFullYear() + plan.intervalCount, now.getMonth(), now.getDate())
        break
      case 'WEEK':
        currentPeriodEnd = new Date(now.getTime() + (plan.intervalCount * 7 * 24 * 60 * 60 * 1000))
        break
      default:
        currentPeriodEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    }

    // Create or update subscription
    const subscription = await db.subscription.upsert({
      where: { userId: user.id },
      update: {
        status: 'ACTIVE',
        stripePriceId: plan.id,
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEnd: null // End trial when subscribing to paid plan
      },
      create: {
        userId: user.id,
        status: 'ACTIVE',
        stripePriceId: plan.id,
        currentPeriodStart: now,
        currentPeriodEnd
      }
    })

    // Update user membership
    await db.user.update({
      where: { id: user.id },
      data: {
        membershipType: plan.interval === 'YEAR' ? 'ANNUAL' : 'PROFESSIONAL',
        membershipEnds: currentPeriodEnd,
        trialEnds: null
      }
    })

    // Create payment record
    await db.payment.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: plan.currency,
        status: 'COMPLETED',
        paymentMethod: paymentMethodId,
        description: `${plan.name} subscription`
      }
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription activated successfully'
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}