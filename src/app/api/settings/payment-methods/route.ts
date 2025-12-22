import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

/**
 * GET - Obtener métodos de pago configurados
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener del User ya que BotSettings no tiene paymentMethods
    const userData = await db.user.findUnique({
      where: { id: user.id }
    }) as any

    // Parsear métodos de pago si existen
    const paymentMethods = userData?.paymentMethods 
      ? JSON.parse(userData.paymentMethods as string)
      : []

    return NextResponse.json({ paymentMethods })
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * POST - Guardar métodos de pago
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentMethods } = body

    // Actualizar en User (usando any porque Prisma client no está actualizado)
    await (db.user.update as any)({
      where: { id: user.id },
      data: {
        paymentMethods: JSON.stringify(paymentMethods)
      }
    })

    console.log(`[PaymentMethods] ✅ Métodos de pago actualizados para usuario ${user.id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Métodos de pago actualizados correctamente'
    })
  } catch (error) {
    console.error('Error guardando métodos de pago:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}
