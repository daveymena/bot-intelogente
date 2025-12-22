import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { EncryptionService } from '@/lib/encryption-service'
import { SecurityService } from '@/lib/security-service'

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

// Función para desencriptar y ofuscar datos sensibles
function decryptAndMask(encryptedValue: string | null | undefined): string {
  if (!encryptedValue) return ''
  
  try {
    // Si está encriptado, desencriptar primero
    if (EncryptionService.isEncrypted(encryptedValue)) {
      const decrypted = EncryptionService.decrypt(encryptedValue)
      return EncryptionService.mask(decrypted)
    }
    // Si no está encriptado (datos legacy), ofuscar directamente
    return EncryptionService.mask(encryptedValue)
  } catch (error) {
    console.error('[Payment API] Error desencriptando:', error)
    return '****'
  }
}

// GET - Obtener configuración (con datos sensibles ofuscados)
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = SecurityService.getClientIP(request)
    if (!SecurityService.checkRateLimit(ip, 20, 60000)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }

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

    // Desencriptar y ofuscar datos sensibles antes de enviar
    const safeConfig = {
      hotmart: {
        enabled: config.hotmartEnabled,
        apiKey: decryptAndMask(config.hotmartApiKey),
        productId: config.hotmartProductId,
        checkoutUrl: config.hotmartCheckoutUrl
      },
      mercadopago: {
        enabled: config.mercadopagoEnabled,
        accessToken: decryptAndMask(config.mercadopagoAccessToken),
        publicKey: decryptAndMask(config.mercadopagoPublicKey)
      },
      paypal: {
        enabled: config.paypalEnabled,
        clientId: decryptAndMask(config.paypalClientId),
        clientSecret: decryptAndMask(config.paypalClientSecret),
        email: config.paypalEmail
      },
      stripe: {
        enabled: config.stripeEnabled,
        secretKey: decryptAndMask(config.stripeSecretKey),
        publishableKey: decryptAndMask(config.stripePublishableKey)
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
    // Rate limiting más estricto para escritura
    const ip = SecurityService.getClientIP(request)
    if (!SecurityService.checkRateLimit(ip, 10, 60000)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.' },
        { status: 429 }
      )
    }

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

    // Encriptar datos sensibles antes de guardar
    const encryptedData = {
      // Hotmart
      hotmartEnabled: data.hotmart.enabled,
      hotmartApiKey: data.hotmart.apiKey ? EncryptionService.encrypt(data.hotmart.apiKey) : null,
      hotmartProductId: data.hotmart.productId,
      hotmartCheckoutUrl: data.hotmart.checkoutUrl,
      // MercadoPago
      mercadopagoEnabled: data.mercadopago.enabled,
      mercadopagoAccessToken: data.mercadopago.accessToken ? EncryptionService.encrypt(data.mercadopago.accessToken) : null,
      mercadopagoPublicKey: data.mercadopago.publicKey ? EncryptionService.encrypt(data.mercadopago.publicKey) : null,
      // PayPal
      paypalEnabled: data.paypal.enabled,
      paypalClientId: data.paypal.clientId ? EncryptionService.encrypt(data.paypal.clientId) : null,
      paypalClientSecret: data.paypal.clientSecret ? EncryptionService.encrypt(data.paypal.clientSecret) : null,
      paypalEmail: data.paypal.email,
      // Stripe
      stripeEnabled: data.stripe.enabled,
      stripeSecretKey: data.stripe.secretKey ? EncryptionService.encrypt(data.stripe.secretKey) : null,
      stripePublishableKey: data.stripe.publishableKey ? EncryptionService.encrypt(data.stripe.publishableKey) : null
    }

    // Log de seguridad (sin datos sensibles)
    console.log('[Payment API] 💾 Guardando configuración encriptada', {
      userId: user.id,
      providers: {
        hotmart: data.hotmart.enabled,
        mercadopago: data.mercadopago.enabled,
        paypal: data.paypal.enabled,
        stripe: data.stripe.enabled
      }
    })

    // Guardar o actualizar configuración
    const config = await db.paymentIntegration.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...encryptedData
      },
      update: encryptedData
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
