import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

// GET - Obtener configuración del flujo
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let config = await db.salesFlowConfig.findUnique({
      where: { userId: user.id }
    })

    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await db.salesFlowConfig.create({
        data: {
          userId: user.id,
          businessType: 'ECOMMERCE'
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error obteniendo configuración:', error)
    return NextResponse.json(
      { error: 'Error obteniendo configuración' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración del flujo
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Actualizar o crear configuración
    const config = await db.salesFlowConfig.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data
      }
    })

    // Limpiar cache del flujo
    const { UniversalSalesFlow } = await import('@/lib/universal-sales-flow')
    UniversalSalesFlow.clearConfigCache(user.id)

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error actualizando configuración:', error)
    return NextResponse.json(
      { error: 'Error actualizando configuración' },
      { status: 500 }
    )
  }
}
