import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

/**
 * GET - Obtener configuración de notificaciones
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

    // Obtener del User ya que BotSettings no tiene notificationSettings
    const userData = await db.user.findUnique({
      where: { id: user.id }
    }) as any

    // Parsear configuración de notificaciones si existe
    const notificationSettings = userData?.notificationSettings 
      ? JSON.parse(userData.notificationSettings as string)
      : {
          email: userData?.email || '',
          newMessages: true,
          newOrders: true,
          lowStock: false
        }

    return NextResponse.json({ notifications: notificationSettings })
  } catch (error) {
    console.error('Error obteniendo configuración de notificaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * POST - Guardar configuración de notificaciones
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
    const { notifications } = body

    // Actualizar en User (usando any porque Prisma client no está actualizado)
    await (db.user.update as any)({
      where: { id: user.id },
      data: {
        notificationSettings: JSON.stringify(notifications)
      }
    })

    console.log(`[Notifications] ✅ Notificaciones actualizadas para usuario ${user.id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Configuración de notificaciones actualizada correctamente'
    })
  } catch (error) {
    console.error('Error guardando configuración de notificaciones:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}
