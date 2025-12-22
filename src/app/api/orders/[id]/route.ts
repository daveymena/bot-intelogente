import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: params.id
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Parsear items de JSON string a array
    const orderWithParsedItems = {
      ...order,
      items: JSON.parse(order.items)
    }

    return NextResponse.json(orderWithParsedItems)

  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Error al obtener la orden', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
