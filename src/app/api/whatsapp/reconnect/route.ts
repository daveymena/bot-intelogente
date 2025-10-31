import { NextRequest, NextResponse } from 'next/server'
import { BaileysService } from '@/lib/baileys-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'cmhc22zw20000kmhgvx5ubazy'

    console.log('[API Reconnect] 🔄 Iniciando reconexión para:', userId)

    // Actualizar estado en DB
    await db.whatsAppConnection.update({
      where: { userId },
      data: {
        status: 'CONNECTING',
        lastError: null,
        lastErrorAt: null
      }
    }).catch(() => {
      // Si no existe, crear
      return db.whatsAppConnection.create({
        data: {
          userId,
          phoneNumber: 'pending',
          status: 'CONNECTING'
        }
      })
    })

    // Intentar reconectar con Baileys
    console.log('[API Reconnect] 🔄 Llamando a BaileysService.initializeConnection...')
    const result = await BaileysService.initializeConnection(userId)

    if (result.success) {
      console.log('[API Reconnect] ✅ Reconexión exitosa')
      
      // Esperar un poco para que se establezca completamente
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Verificar estado final
      const connection = await db.whatsAppConnection.findUnique({
        where: { userId }
      })

      return NextResponse.json({
        success: true,
        status: connection?.status || 'CONNECTED',
        message: 'Reconexión exitosa'
      })
    } else {
      console.log('[API Reconnect] ❌ Error en reconexión:', result.error)
      
      return NextResponse.json({
        success: false,
        error: result.error || 'Error al reconectar'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[API Reconnect] ❌ Error en reconexión:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
