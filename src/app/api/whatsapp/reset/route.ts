import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('[WhatsApp Reset] 🔄 Limpiando sesión...')

    // Ruta de la carpeta de sesiones
    const sessionsPath = path.join(process.cwd(), 'auth_sessions')
    
    try {
      // Intentar eliminar toda la carpeta de sesiones
      await fs.rm(sessionsPath, { recursive: true, force: true })
      console.log('[WhatsApp Reset] ✅ Carpeta de sesiones eliminada')
    } catch (error) {
      console.log('[WhatsApp Reset] ⚠️ No se pudo eliminar carpeta:', error)
    }

    // Recrear la carpeta vacía
    try {
      await fs.mkdir(sessionsPath, { recursive: true })
      console.log('[WhatsApp Reset] ✅ Carpeta de sesiones recreada')
    } catch (error) {
      console.log('[WhatsApp Reset] ⚠️ Error recreando carpeta:', error)
    }

    // Notificar al sistema que debe reiniciar la conexión
    console.log('[WhatsApp Reset] ✅ Sesión limpiada exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Sesión limpiada. Por favor, reconecta para generar un nuevo QR.'
    })
  } catch (error) {
    console.error('[WhatsApp Reset] ❌ Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al limpiar la sesión'
      },
      { status: 500 }
    )
  }
}
