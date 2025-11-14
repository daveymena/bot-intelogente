import { NextResponse } from 'next/server'
import { DropiService } from '@/lib/dropi-service'

// GET /api/dropi/orders/[id] - Obtener estado de una orden
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: 'ID de orden inválido' },
        { status: 400 }
      )
    }

    const order = await DropiService.getOrder(orderId)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error(`Error en /api/dropi/orders/${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error obteniendo orden',
      },
      { status: 500 }
    )
  }
}
