import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

// GET - Obtener configuración de pagos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { paymentConfig: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Si no existe configuración, crear una por defecto
    if (!user.paymentConfig) {
      const defaultConfig = await db.paymentConfig.create({
        data: {
          userId: user.id,
          // Valores por defecto ya están en el schema
        }
      })
      
      return NextResponse.json(defaultConfig)
    }

    return NextResponse.json(user.paymentConfig)
  } catch (error) {
    console.error('Error obteniendo configuración de pagos:', error)
    return NextResponse.json(
      { error: 'Error obteniendo configuración' },
      { status: 500 }
    )
  }
}

// POST/PUT - Actualizar configuración de pagos
export async function POST(req: NextRequest) {
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

    const data = await req.json()

    // Actualizar o crear configuración
    const config = await db.paymentConfig.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error actualizando configuración de pagos:', error)
    return NextResponse.json(
      { error: 'Error actualizando configuración' },
      { status: 500 }
    )
  }
}
