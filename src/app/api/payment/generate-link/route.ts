import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Generar link de pago dinámico para Mercado Pago o PayPal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, method } = body // method: 'mercadopago' | 'paypal'

    if (!productId || !method) {
      return NextResponse.json({
        success: false,
        error: 'Faltan parámetros'
      }, { status: 400 })
    }

    // Obtener producto
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Producto no encontrado'
      }, { status: 404 })
    }

    let paymentLink = ''

    if (method === 'mercadopago') {
      // Generar link de Mercado Pago
      paymentLink = await generateMercadoPagoLink(product)
    } else if (method === 'paypal') {
      // Generar link de PayPal
      paymentLink = await generatePayPalLink(product)
    }

    return NextResponse.json({
      success: true,
      paymentLink,
      product: {
        id: product.id,
        name: product.name,
        price: product.price
      }
    })

  } catch (error) {
    console.error('[Payment API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

/**
 * Generar link de Mercado Pago
 */
async function generateMercadoPagoLink(product: any): Promise<string> {
  try {
    // TODO: Integrar con SDK de Mercado Pago
    // Por ahora, generar link con formato estándar
    
    const productSlug = product.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Formato: https://mpago.li/[slug]-[id]
    const link = `https://mpago.li/${productSlug}-${product.id.slice(-8)}`

    console.log('[MercadoPago] Link generado:', link)
    
    return link

  } catch (error) {
    console.error('[MercadoPago] Error generando link:', error)
    throw error
  }
}

/**
 * Generar link de PayPal
 */
async function generatePayPalLink(product: any): Promise<string> {
  try {
    // TODO: Integrar con SDK de PayPal
    // Por ahora, generar link con formato estándar
    
    const invoiceId = `INV-${product.id.slice(-8).toUpperCase()}`
    
    // Formato: https://www.paypal.com/invoice/p/#[invoice-id]
    const link = `https://www.paypal.com/invoice/p/#${invoiceId}`

    console.log('[PayPal] Link generado:', link)
    
    return link

  } catch (error) {
    console.error('[PayPal] Error generando link:', error)
    throw error
  }
}

/**
 * GET - Obtener links de pago de un producto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Falta productId'
      }, { status: 400 })
    }

    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Producto no encontrado'
      }, { status: 404 })
    }

    // Generar ambos links
    const mercadopagoLink = await generateMercadoPagoLink(product)
    const paypalLink = await generatePayPalLink(product)

    // Verificar si es curso de piano para incluir Hotmart
    const isPiano = product.name.toLowerCase().includes('piano')
    const hotmartLink = isPiano 
      ? 'https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205'
      : null

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price
      },
      paymentLinks: {
        mercadopago: mercadopagoLink,
        paypal: paypalLink,
        ...(hotmartLink && { hotmart: hotmartLink })
      }
    })

  } catch (error) {
    console.error('[Payment API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
