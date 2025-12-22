import { NextRequest, NextResponse } from 'next/server'
import { BaileysStableService } from '@/lib/baileys-stable-service'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('[API Baileys] 📥 Solicitud de conexión recibida')

    // Obtener usuario de la sesión
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { id: sessionCookie.value },
      include: { user: true }
    })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`[API Baileys] 👤 Usuario: ${userId}`)

    // Inicializar conexión
    const result = await BaileysStableService.initializeConnection(userId)

    if (result.success) {
      console.log('[API Baileys] ✅ Conexión iniciada exitosamente')
      return NextResponse.json({
        success: true,
        message: 'Conexión iniciada. Escanea el QR cuando aparezca.'
      })
    } else {
      console.log('[API Baileys] ❌ Error iniciando conexión:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[API Baileys] ❌ Error en endpoint:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
