import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth-utils'

// GET - Obtener configuración de la tienda
export async function GET(request: NextRequest) {
  try {
    const userId = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Buscar configuración existente
    let settings = await db.storeSettings.findUnique({
      where: { userId }
    })

    // Si no existe, crear una por defecto
    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          userId,
          storeName: 'Mi Tienda',
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          currency: 'COP',
          language: 'es',
          timezone: 'America/Bogota'
        }
      })
    }

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error: any) {
    console.error('[Store Settings] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración
export async function PUT(request: NextRequest) {
  try {
    const userId = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Actualizar o crear configuración
    const settings = await db.storeSettings.upsert({
      where: { userId },
      update: {
        ...body,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...body
      }
    })

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error: any) {
    console.error('[Store Settings] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
