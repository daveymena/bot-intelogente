import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

// GET /api/store/[storeSlug]/products - Obtener productos de una tienda específica
export async function GET(
  request: NextRequest,
  { params }: { params: { storeSlug: string } }
) {
  try {
    const { storeSlug } = params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Buscar la tienda
    const store = await db.storeSettings.findUnique({
      where: { 
        storeSlug,
        isPublic: true,
        isActive: true
      },
      select: {
        userId: true
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Construir filtros
    const where: any = {
      userId: store.userId,
      status: 'AVAILABLE'
    }

    if (category && category !== 'Todos') {
      if (category === 'Físicos') where.category = 'PHYSICAL'
      else if (category === 'Digitales') where.category = 'DIGITAL'
      else if (category === 'Servicios') where.category = 'SERVICE'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Obtener productos
    const products = await db.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        images: true,
        category: true,
        subcategory: true,
        stock: true,
        tags: true,
        paymentLinkMercadoPago: true,
        paymentLinkPayPal: true,
        paymentLinkCustom: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const parsedProducts = products.map(product => ({
      ...product,
      images: safeJSONParse(product.images),
      tags: safeJSONParse(product.tags),
      stock: product.stock ?? 999,
      paymentMethods: {
        mercadopago: {
          enabled: !!product.paymentLinkMercadoPago,
          link: product.paymentLinkMercadoPago
        },
        paypal: {
          enabled: !!product.paymentLinkPayPal,
          email: product.paymentLinkPayPal
        },
        custom: {
          enabled: !!product.paymentLinkCustom,
          link: product.paymentLinkCustom
        }
      }
    }))

    return NextResponse.json({ products: parsedProducts })
  } catch (error) {
    console.error('Error fetching store products:', error)
    return NextResponse.json(
      { error: 'Error al cargar productos' },
      { status: 500 }
    )
  }
}
