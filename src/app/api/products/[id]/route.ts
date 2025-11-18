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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: {
        id: params.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        stock: true,
        paymentLinkMercadoPago: true,
        paymentLinkPayPal: true,
        paymentLinkCustom: true,
        status: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const parsedProduct = {
      ...product,
      images: safeJSONParse(product.images),
      // Si stock es null (productos digitales), mostrar como disponible (999)
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
    }

    return NextResponse.json({ product: parsedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
