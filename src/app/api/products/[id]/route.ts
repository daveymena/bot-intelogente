import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  category: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']).optional(),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']).optional(),
  images: z.string().optional(),
  tags: z.string().optional(),
  autoResponse: z.string().optional(),
  stock: z.number().positive().optional()
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            businessName: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields for response
    const responseProduct = {
      ...product,
      images: safeJSONParse(product.images),
      tags: safeJSONParse(product.tags)
    }

    return NextResponse.json(responseProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    const product = await db.product.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json(responseProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}