import { NextResponse } from 'next/server'
import { DropiService } from '@/lib/dropi-service'

// GET /api/dropi/products/[id] - Obtener un producto específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: 'ID de producto inválido' },
        { status: 400 }
      )
    }

    const product = await DropiService.getProduct(productId)

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error: any) {
    console.error(`Error en /api/dropi/products/${params.id}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error obteniendo producto',
      },
      { status: 500 }
    )
  }
}
