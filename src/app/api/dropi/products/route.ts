import { NextResponse } from 'next/server'
import { DropiService } from '@/lib/dropi-service'

// GET /api/dropi/products - Obtener todos los productos de Dropi
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    let products
    if (query) {
      products = await DropiService.searchProducts(query)
    } else {
      products = await DropiService.getProducts()
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error: any) {
    console.error('Error en /api/dropi/products:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error obteniendo productos de Dropi',
      },
      { status: 500 }
    )
  }
}
