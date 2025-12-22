import { NextResponse } from 'next/server'
import { DropiService } from '@/lib/dropi-service'

// GET /api/dropi/orders - Obtener órdenes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    const orders = await DropiService.getOrders({ status, limit, offset })

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error: any) {
    console.error('Error en /api/dropi/orders GET:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error obteniendo órdenes',
      },
      { status: 500 }
    )
  }
}

// POST /api/dropi/orders - Crear una orden
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos requeridos
    if (!body.customer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de orden incompletos. Se requiere customer e items.',
        },
        { status: 400 }
      )
    }

    const order = await DropiService.createOrder(body)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('Error en /api/dropi/orders POST:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error creando orden',
      },
      { status: 500 }
    )
  }
}
