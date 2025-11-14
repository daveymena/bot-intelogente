import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

// Modelo para configuración de integraciones de pago
interface PaymentIntegration {
  hotmart: {
    enabled: boolean
    apiKey?: string
    productId?: string
    checkoutUrl?: string
  }
  mercadopago: {
    enabled: boolean
    accessToken?: string
    publicKey?: string
  }
  paypal: {
    enabled: boolean
    clientId?: string
    clientSecret?: string
    email?: string
  }
  stripe: {
    enabled: boolean
    secretKey?: string
    publishableKey?: string
  }
}

// Función para ofuscar información sensible
function maskSensitiveData(value: string | undefined): string {
  if (!value) return ''
  if (value.length <= 4) return '****'
  return '****' + value.slice(-4)
}

// GET - Obtener configuración (con datos sensibles ofuscados)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener configuración desde la base de datos
    const config = await db.paymentIntegration.findUnique({
      where: { userId: user.id }
    })

    if (!config) {
      // Retornar configuración vacía si no existe
      return NextResponse.json({
        hotmart: { enabled: false },
        mercadopago: { enabled: false },
        paypal: { enabled: false },
        stripe: { enabled: false }
      })
    }

    // Ofuscar datos sensibles antes de enviar
    const safeConfig = {
      hotmart: {
        enabled: config.hotmartEnabled,
        apiKey: config.hotmartApiKey ? maskSensitiveData(config.hotmartApiKey) : '',
        productId: config.hotmartProductId,
        checkoutUrl: config.hotmartCheckoutUrl
      },
      mercadopago: {
        enabled: config.mercadopagoEnabled,
        accessToken: config.mercadopagoAccessToken ? maskSensitiveData(config.mercadopagoAccessToken) : '',
        publicKey: config.mercadopagoPublicKey ? maskSensitiveData(config.mercadopagoPublicKey) : ''
      },
      paypal: {
        enabled: config.paypalEnabled,
        clientId: config.paypalClientId ? maskSensitiveData(config.paypalClientId) : '',
        clientSecret: config.paypalClientSecret ? maskSensitiveData(config.paypalClientSecret) : '',
        email: config.paypalEmail
      },
      stripe: {
        enabled: config.stripeEnabled,
        secretKey: config.stripeSecretKey ? maskSensitiveData(config.stripeSecretKey) : '',
        publishableKey: config.stripePublishableKey ? maskSensitiveData(config.stripePublishableKey) : ''
      }
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('[API] Error obteniendo configuración:', error)
    return NextResponse.json(
      { error: 'Error obteniendo configuración' },
      { status: 500 }
    )
  }
}

// POST - Guardar configuración
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const data: PaymentIntegration = await request.json()

    // Guardar o actualizar configuración
    const config = await db.paymentIntegration.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        // Hotmart
        hotmartEnabled: data.hotmart.enabled,
        hotmartApiKey: data.hotmart.apiKey,
        hotmartProductId: data.hotmart.productId,
        hotmartCheckoutUrl: data.hotmart.checkoutUrl,
        // MercadoPago
        mercadopagoEnabled: data.mercadopago.enabled,
        mercadopagoAccessToken: data.mercadopago.accessToken,
        mercadopagoPublicKey: data.mercadopago.publicKey,
        // PayPal
        paypalEnabled: data.paypal.enabled,
        paypalClientId: data.paypal.clientId,
        paypalClientSecret: data.paypal.clientSecret,
        paypalEmail: data.paypal.email,
        // Stripe
        stripeEnabled: data.stripe.enabled,
        stripeSecretKey: data.stripe.secretKey,
        stripePublishableKey: data.stripe.publishableKey
      },
      update: {
        // Hotmart
        hotmartEnabled: data.hotmart.enabled,
        hotmartApiKey: data.hotmart.apiKey,
        hotmartProductId: data.hotmart.productId,
        hotmartCheckoutUrl: data.hotmart.checkoutUrl,
        // MercadoPago
        mercadopagoEnabled: data.mercadopago.enabled,
        mercadopagoAccessToken: data.mercadopago.accessToken,
        mercadopagoPublicKey: data.mercadopago.publicKey,
        // PayPal
        paypalEnabled: data.paypal.enabled,
        paypalClientId: data.paypal.clientId,
        paypalClientSecret: data.paypal.clientSecret,
        paypalEmail: data.paypal.email,
        // Stripe
        stripeEnabled: data.stripe.enabled,
        stripeSecretKey: data.stripe.secretKey,
        stripePublishableKey: data.stripe.publishableKey
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Configuración guardada exitosamente'
    })
  } catch (error) {
    console.error('[API] Error guardando configuración:', error)
    return NextResponse.json(
      { error: 'Error guardando configuración' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar productos con links generados
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { productId, links } = await request.json()

    // Actualizar producto con los links
    await db.product.update({
      where: { id: productId },
      data: {
        hotmartLink: links.hotmart,
        mercadoPagoLink: links.mercadopago,
        paypalLink: links.paypal,
        stripeLink: links.stripe,
        paymentMethods: links.methods
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Links de pago actualizados'
    })
  } catch (error) {
    console.error('[API] Error actualizando links:', error)
    return NextResponse.json(
      { error: 'Error actualizando links' },
      { status: 500 }
    )
  }
}
