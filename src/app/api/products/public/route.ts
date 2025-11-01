import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      products
    })
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar productos' },
      { status: 500 }
    )
  }
}
