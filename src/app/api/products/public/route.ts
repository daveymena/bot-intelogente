import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: {
        status: 'AVAILABLE'
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
        paymentLinkCustom: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const parsedProducts = products.map(product => ({
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
    }))

    return NextResponse.json({ products: parsedProducts })
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}
