import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId } = body

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

    // Create subscription (in a real app, this would integrate with Stripe)
    const currentPeriodStart = new Date()
    const currentPeriodEnd = new Date()

    // Calculate end date based on interval
    switch (plan.interval) {
      case 'WEEK':
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7 * plan.intervalCount)
        break
      case 'MONTH':
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.intervalCount)
        break
      case 'YEAR':
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + plan.intervalCount)
        break
      default:
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
    }

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false
      },
      include: {
        plan: true
      }
    })

    // Update user membership
    await db.user.update({
      where: { id: userId },
      data: {
        membershipType: plan.interval === 'WEEK' ? 'WEEKLY' : 
                      plan.interval === 'MONTH' && plan.intervalCount === 6 ? 'SEMESTRAL' : 
                      plan.interval === 'YEAR' ? 'ANNUAL' : 'MONTHLY',
        membershipEnds: currentPeriodEnd,
        trialUsed: true
      }
    })

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}