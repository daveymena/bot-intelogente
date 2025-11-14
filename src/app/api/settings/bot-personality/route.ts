import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const settings = await db.botSettings.findUnique({
      where: { userId: user.id },
      select: { botPersonality: true }
    })

    return NextResponse.json({
      botPersonality: settings?.botPersonality || null
    })
  } catch (error) {
    console.error('Error obteniendo personalidad del bot:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { botPersonality } = await request.json()

    if (!botPersonality || typeof botPersonality !== 'string') {
      return NextResponse.json(
        { error: 'Personalidad del bot inválida' },
        { status: 400 }
      )
    }

    // Actualizar o crear configuración
    await db.botSettings.upsert({
      where: { userId: user.id },
      update: { botPersonality },
      create: {
        userId: user.id,
        businessPhone: '+57 304 274 8687', // Default
        botPersonality
      }
    })

    console.log(`[BotPersonality] ✅ Personalidad actualizada para usuario ${user.id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error guardando personalidad del bot:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}
