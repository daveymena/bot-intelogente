import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('COP'),
  category: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']).default('AVAILABLE'),
  images: z.string().optional(),
  tags: z.string().optional(),
  autoResponse: z.string().optional(),
  stock: z.number().positive().optional(),
  userId: z.string()
})

// Helper function to safely parse JSON fields
function safeJSONParse(value: string | null): any[] {
  if (!value) return []
  
  try {
    // Si ya es un array o objeto JSON, parsearlo
    if (value.startsWith('[') || value.startsWith('{')) {
      return JSON.parse(value)
    }
    // Si es una URL o string simple, retornarlo como array
    return [value]
  } catch (error) {
    console.error('Error parsing JSON:', error)
    // Si falla el parse, retornar como array con el valor original
    return [value]
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const products = await db.product.findMany({
      where: {
        ...(userId && { userId }),
        ...(category && { category: category as any }),
        ...(status && { status: status as any })
      },
      include: {
        user: {
          select: {
            name: true,
            businessName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse JSON fields
    const parsedProducts = products.map(product => ({
      ...product,
      images: safeJSONParse(product.images),
      tags: safeJSONParse(product.tags)
    }))

    return NextResponse.json(parsedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    const product = await db.product.create({
      data: {
        ...validatedData,
        images: validatedData.images || '[]',
        tags: validatedData.tags || '[]'
      },
      include: {
        user: {
          select: {
            name: true,
            businessName: true
          }
        }
      }
    })

    // Parse JSON fields for response
    const responseProduct = {
      ...product,
      images: safeJSONParse(product.images),
      tags: safeJSONParse(product.tags)
    }

    return NextResponse.json(responseProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}