import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { BaileysStableService } from '@/lib/baileys-stable-service'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

/**
 * 🔄 API para RESETEO COMPLETO de WhatsApp
 * Limpia TODAS las sesiones y archivos para empezar desde cero
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    console.log(`[API Reset] 🔄 Iniciando reseteo completo para usuario: ${user.id}`)

    try {
      // 1. Desconectar sesión activa
      await BaileysStableService.disconnect(user.id)
      console.log('[API Reset] ✅ Sesión desconectada')
      
      // 2. Limpiar archivos de sesión
      const sessionDir = path.join(process.cwd(), 'auth_sessions', user.id)
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true })
        console.log('[API Reset] ✅ Archivos de sesión eliminados')
      }
      
      // 3. Limpiar base de datos
      await db.whatsAppConnection.deleteMany({
        where: { userId: user.id }
      })
      console.log('[API Reset] ✅ Conexión eliminada de BD')
      
      console.log(`[API Reset] ✅ Reseteo exitoso`)
      return NextResponse.json({
        success: true,
        message: 'Sesión limpiada exitosamente. Ahora puedes conectar desde cero.'
      })
    } catch (error) {
      console.error('[API Reset] ❌ Error en reseteo:', error)
      return NextResponse.json(
        { success: false, error: 'Error al limpiar sesión: ' + (error as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API Reset] ❌ Error en reseteo:', error)
    return NextResponse.json(
      { success: false, error: 'Error ejecutando reseteo completo' },
        { status: 500 }
    )
  }
}
