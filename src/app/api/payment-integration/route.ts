import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener configuración de pagos del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    let integration = await db.paymentIntegration.findUnique({
      where: { userId }
    })

    // Si no existe, crear una por defecto
    if (!integration) {
      integration = await db.paymentIntegration.create({
        data: {
          userId,
          mercadopagoEnabled: false,
          paypalEnabled: false,
          nequiEnabled: false,
          daviplataEnabled: false
        }
      })
    }

    return NextResponse.json({ integration })
  } catch (error) {
    console.error('[Payment Integration API] Error:', error)
    return NextResponse.json({ error: 'Error obteniendo configuración' }, { status: 500 })
  }
}

// POST - Guardar configuración de pagos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...data } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    // Actualizar o crear
    const integration = await db.paymentIntegration.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      }
    })

    return NextResponse.json({
      success: true,
      integration,
      message: 'Configuración guardada correctamente'
    })
  } catch (error) {
    console.error('[Payment Integration API] Error:', error)
    return NextResponse.json({ error: 'Error guardando configuración' }, { status: 500 })
  }
}
