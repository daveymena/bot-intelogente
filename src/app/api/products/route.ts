import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { CategoryAutoGenerator } from '@/lib/category-auto-generator'
import { BusinessContextDetector } from '@/lib/business-context-detector'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default('COP'),
  category: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']).default('AVAILABLE'),
  images: z.union([z.string(), z.array(z.string())]).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
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

    // Convertir images y tags a JSON string si vienen como array
    let imagesJson = '[]'
    if (validatedData.images) {
      if (Array.isArray(validatedData.images)) {
        imagesJson = JSON.stringify(validatedData.images)
      } else if (typeof validatedData.images === 'string') {
        // Si es string, intentar parsearlo o usarlo como está
        try {
          JSON.parse(validatedData.images)
          imagesJson = validatedData.images
        } catch {
          // Si no es JSON válido, convertir a array
          imagesJson = JSON.stringify([validatedData.images])
        }
      }
    }

    let tagsJson = '[]'
    if (validatedData.tags) {
      if (Array.isArray(validatedData.tags)) {
        tagsJson = JSON.stringify(validatedData.tags)
      } else if (typeof validatedData.tags === 'string') {
        try {
          JSON.parse(validatedData.tags)
          tagsJson = validatedData.tags
        } catch {
          tagsJson = JSON.stringify([validatedData.tags])
        }
      }
    }

    const product = await db.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        currency: validatedData.currency,
        category: validatedData.category,
        status: validatedData.status,
        autoResponse: validatedData.autoResponse,
        stock: validatedData.stock,
        userId: validatedData.userId,
        images: imagesJson,
        tags: tagsJson
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

    // 🆕 Auto-categorización en background (no bloquea la respuesta)
    setImmediate(async () => {
      try {
        // 1. Auto-detectar categoría del producto (sin categorías existentes por ahora)
        const categoryResult = await CategoryAutoGenerator.detectCategory(
          { name: validatedData.name, description: validatedData.description, price: validatedData.price },
          [] // Categorías existentes - se puede expandir después
        )
        
        // 2. Actualizar producto con categoría detectada
        if (categoryResult.category) {
          await db.product.update({
            where: { id: product.id },
            data: {
              mainCategory: categoryResult.category,
              categorizedAt: new Date(),
              categorizedBy: 'AI',
              categorizationConfidence: categoryResult.confidence
            }
          })
          console.log(`✅ Producto "${product.name}" categorizado como: ${categoryResult.category}`)
        }
        
        // 3. Actualizar contexto del negocio (cada 5 productos)
        const productCount = await db.product.count({ where: { userId: validatedData.userId } })
        if (productCount % 5 === 0) {
          await BusinessContextDetector.detectAndSave(validatedData.userId)
          console.log(`🏢 Contexto de negocio actualizado para usuario ${validatedData.userId}`)
        }
      } catch (error) {
        console.error('Error en auto-categorización:', error)
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