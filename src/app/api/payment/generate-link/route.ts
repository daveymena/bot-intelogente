import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createMercadoPagoLink } from '@/lib/mercadopago-service'
import { createPayPalLink } from '@/lib/paypal-service'

/**
 * 💳 CONFIGURACIÓN DE LINKS DE PAGO ESTÁTICOS
 * Estos son los links reales configurados manualmente para productos especiales
 */
const PAYMENT_LINKS = {
  piano: {
    info: 'https://landein-page-pian2.vercel.app/',
    payment: 'https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205',
    platform: 'Hotmart'
  },
  megapack_complete: {
    info: 'https://mpago.li/32cJgK3',
    payment: 'https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG',
    platform: 'PayPal'
  },
  megapack_individual: {
    mobile: '3136174267', // Nequi/Daviplata/Davivienda
    card: 'https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf',
    platform: 'Payco'
  }
}

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
 * Sistema híbrido: links configurados + generación dinámica
 */
async function generateMercadoPagoLink(product: any): Promise<string> {
  try {
    console.log('[MercadoPago] Generando link para:', product.name)

    // 1. Prioridad: Link manual del producto en BD
    if (product.paymentLinkMercadoPago) {
      console.log('[MercadoPago] ✅ Usando link manual de BD:', product.paymentLinkMercadoPago)
      return product.paymentLinkMercadoPago
    }

    // 2. Detectar tipo de producto y usar link configurado
    const productName = product.name.toLowerCase()

    // Piano
    if (productName.includes('piano')) {
      console.log('[MercadoPago] ✅ Detectado Piano, usando link info')
      return PAYMENT_LINKS.piano.info
    }

    // Megapack Completo (40 productos)
    if ((productName.includes('mega pack completo') ||
      productName.includes('megapack completo') ||
      (productName.includes('40') && productName.includes('producto')))) {
      console.log('[MercadoPago] ✅ Detectado Megapack Completo')
      return PAYMENT_LINKS.megapack_complete.info
    }

    // Megapack Individual
    if (productName.includes('mega pack') || productName.includes('megapack')) {
      console.log('[MercadoPago] ✅ Detectado Megapack Individual, usando Payco')
      return PAYMENT_LINKS.megapack_individual.card
    }

    // 3. Generar link dinámico con API real de MercadoPago
    console.log('[MercadoPago] 🔄 Generando link dinámico con API...')
    const dynamicLink = await createMercadoPagoLink(product)
    console.log('[MercadoPago] ✅ Link dinámico generado:', dynamicLink)

    return dynamicLink

  } catch (error) {
    console.error('[MercadoPago] Error:', error)
    // Fallback a WhatsApp solo en caso de error
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573042748687'
    const message = `Hola! Quiero comprar: ${product.name}`
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }
}

/**
 * Generar link de PayPal
 * Sistema híbrido: links configurados + generación dinámica
 */
async function generatePayPalLink(product: any): Promise<string> {
  try {
    console.log('[PayPal] Generando link para:', product.name)

    // 1. Prioridad: Link manual del producto en BD
    if (product.paymentLinkPayPal) {
      console.log('[PayPal] ✅ Usando link manual de BD:', product.paymentLinkPayPal)
      return product.paymentLinkPayPal
    }

    // 2. Detectar tipo de producto y usar link configurado
    const productName = product.name.toLowerCase()

    // Piano - usar link de Hotmart (no PayPal)
    if (productName.includes('piano')) {
      console.log('[PayPal] ✅ Detectado Piano, usando link de pago Hotmart')
      return PAYMENT_LINKS.piano.payment
    }

    // Megapack Completo (40 productos) - usar PayPal
    if ((productName.includes('mega pack completo') ||
      productName.includes('megapack completo') ||
      (productName.includes('40') && productName.includes('producto')))) {
      console.log('[PayPal] ✅ Detectado Megapack Completo, usando PayPal')
      return PAYMENT_LINKS.megapack_complete.payment
    }

    // Megapack Individual - usar Payco
    if (productName.includes('mega pack') || productName.includes('megapack')) {
      console.log('[PayPal] ✅ Detectado Megapack Individual, usando Payco')
      return PAYMENT_LINKS.megapack_individual.card
    }

    // 3. Generar link dinámico con API real de PayPal
    console.log('[PayPal] 🔄 Generando link dinámico con API...')
    const dynamicLink = await createPayPalLink(product)
    console.log('[PayPal] ✅ Link dinámico generado:', dynamicLink)

    return dynamicLink

  } catch (error) {
    console.error('[PayPal] Error:', error)
    // Fallback a WhatsApp solo en caso de error
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573042748687'
    const message = `Hola! Quiero comprar: ${product.name}`
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }
}

/**
 * GET - Obtener links de pago de un producto
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    console.log('[Payment API] GET Request - productId:', productId)

    if (!productId) {
      console.log('[Payment API] ❌ Missing productId')
      return NextResponse.json({
        success: false,
        error: 'Falta productId'
      }, { status: 400 })
    }

    console.log('[Payment API] 🔍 Searching for product:', productId)

    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.log('[Payment API] ❌ Product not found:', productId)
      return NextResponse.json({
        success: false,
        error: 'Producto no encontrado'
      }, { status: 404 })
    }

    console.log('[Payment API] ✅ Product found:', product.name)

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
