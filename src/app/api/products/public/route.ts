import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper function to safely parse JSON fields
function safeJSONParse(value: string | null): any[] {
  if (!value) return []
  
  try {
    if (value.startsWith('[') || value.startsWith('{')) {
      return JSON.parse(value)
    }
    return [value]
  } catch (error) {
    return [value]
  }
}

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: {
        status: 'AVAILABLE' // Solo productos disponibles
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
        // ❌ NO incluir tags (son internos para el bot)
        // ❌ NO incluir autoResponse (es interno)
        // ❌ NO incluir userId (privado)
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parsear imágenes pero NO tags
    const parsedProducts = products.map(product => ({
      ...product,
      images: safeJSONParse(product.images)
      // tags NO se incluyen en la respuesta pública
    }))

    return NextResponse.json({
      success: true,
      products: parsedProducts,
      total: parsedProducts.length
    })
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products',
        products: []
      },
      { status: 500 }
    )
  }
}
