import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, amount, quantity, method, userId } = body

    console.log('[Payment API] Generando link de pago:', { productId, productName, amount, quantity, method, userId })

    // Si no viene userId, usar 'default'
    const finalUserId = userId || 'default'

    if (method === 'mercadopago') {
      return await generateMercadoPagoLink(productId, productName, amount, quantity, finalUserId)
    } else if (method === 'paypal') {
      return await generatePayPalLink(productId, productName, amount, quantity, finalUserId)
    }

    return NextResponse.json({ success: false, error: 'Método no soportado' }, { status: 400 })
  } catch (error) {
    console.error('[Payment API] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error generando link' 
    }, { status: 500 })
  }
}

async function generateMercadoPagoLink(productId: string, productName: string, amount: number, quantity: number, userId: string) {
  try {
    console.log('[MercadoPago] Usando servicio dinámico para producto:', productId)
    
    // Usar el servicio existente que ya maneja toda la lógica
    const { MercadoPagoDynamicService } = await import('@/lib/mercadopago-dynamic-service')
    const result = await MercadoPagoDynamicService.generatePaymentLink(productId, userId)
    
    if (result.success && result.paymentUrl) {
      console.log('[MercadoPago] ✅ Link generado exitosamente')
      return NextResponse.json({
        success: true,
        paymentUrl: result.paymentUrl
      })
    }
    
    console.error('[MercadoPago] ❌ Error:', result.error)
    return NextResponse.json({ 
      success: false, 
      error: result.error || 'Error generando link de MercadoPago'
    }, { status: 400 })
  } catch (error) {
    console.error('[MercadoPago] ❌ Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error con MercadoPago'
    }, { status: 500 })
  }
}

async function generatePayPalLink(productId: string, productName: string, amount: number, quantity: number, userId: string) {
  try {
    console.log('[PayPal] Usando servicio existente para producto:', productId)
    
    // Usar el servicio existente que ya maneja toda la lógica
    const { getOrCreatePayPalLink } = await import('@/lib/paypal-service')
    const paymentUrl = await getOrCreatePayPalLink(productId, true) // true = forzar nuevo link
    
    if (paymentUrl) {
      console.log('[PayPal] ✅ Link generado exitosamente')
      return NextResponse.json({
        success: true,
        paymentUrl
      })
    }
    
    console.error('[PayPal] ❌ No se pudo generar el link')
    return NextResponse.json({ 
      success: false, 
      error: 'PayPal no configurado. Por favor configura tus credenciales en el dashboard.' 
    }, { status: 400 })
  } catch (error) {
    console.error('[PayPal] ❌ Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error con PayPal'
    }, { status: 500 })
  }
}
