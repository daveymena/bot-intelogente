import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/products/public
 * Endpoint público para mostrar productos en el catálogo
 * No requiere autenticación
 */
export async function GET() {
  try {
    // Obtener solo productos disponibles
    const products = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        category: true,
        status: true,
        images: true,
        tags: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      products,
      count: products.length
    })
  } catch (error) {
    console.error('Error al obtener productos públicos:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cargar productos'
      },
      { status: 500 }
    )
  }
}
