import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    // Parse features JSON
    const parsedPlans = plans.map(plan => ({
      ...plan,
      features: plan.features ? JSON.parse(plan.features) : []
    }))

    return NextResponse.json(parsedPlans)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const plan = await db.subscriptionPlan.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        currency: body.currency || 'USD',
        interval: body.interval,
        intervalCount: body.intervalCount || 1,
        features: JSON.stringify(body.features || []),
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder || 0
      }
    })

    // Parse features for response
    const responsePlan = {
      ...plan,
      features: plan.features ? JSON.parse(plan.features) : []
    }

    return NextResponse.json(responsePlan, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription plan' },
      { status: 500 }
    )
  }
}