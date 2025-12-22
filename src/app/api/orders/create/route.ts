import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      notes,
      items,
      total,
      paymentMethod,
      status = 'pending'
    } = body

    // Validar campos requeridos
    if (!customerName || !customerEmail || !customerPhone || !items || !total) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Crear la orden en la base de datos
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress: customerAddress || '',
        customerCity: customerCity || '',
        notes: notes || '',
        items: JSON.stringify(items),
        total,
        paymentMethod,
        status,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order
    })

  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
