/**
 * 🧪 API de Testing de Credenciales de Pago
 * 
 * Permite probar credenciales antes de guardarlas
 * POST /api/integrations/payment/test
 */

import { NextRequest, NextResponse } from 'next/server'
import { PaymentValidator } from '@/lib/payment-validator'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const user = await AuthService.validateSession(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Sesión inválida' },
        { status: 401 }
      )
    }
    
    // Obtener datos del request
    const body = await request.json()
    const { provider, credentials } = body
    
    if (!provider || !credentials) {
      return NextResponse.json(
        { error: 'Faltan parámetros: provider y credentials son requeridos' },
        { status: 400 }
      )
    }
    
    console.log(`[Payment Test] Usuario ${user.id} probando ${provider}`)
    
    // Validar credenciales según el proveedor
    const result = await PaymentValidator.validateProvider(provider, credentials)
    
    // Log del resultado
    if (result.isValid) {
      console.log(`[Payment Test] ✅ ${provider} validado exitosamente`)
    } else {
      console.log(`[Payment Test] ❌ ${provider} falló: ${result.message}`)
    }
    
    return NextResponse.json(result)
    
  } catch (error: any) {
    console.error('[Payment Test] Error:', error)
    return NextResponse.json(
      {
        isValid: false,
        message: `Error al probar conexión: ${error.message}`,
        details: error
      },
      { status: 500 }
    )
  }
}

// GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Endpoint de testing de pagos activo',
    supportedProviders: [
      'mercadopago',
      'paypal',
      'hotmart',
      'nequi',
      'daviplata',
      'bank'
    ]
  })
}
