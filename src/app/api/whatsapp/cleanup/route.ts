import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { BaileysStableService } from '@/lib/baileys-stable-service'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

/**
 * 🧹 API de Limpieza Robusta
 * Limpia completamente la sesión de WhatsApp:
 * - Memoria (sesiones activas)
 * - Archivos (auth_sessions)
 * - Base de datos (whatsAppConnection)
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

    console.log(`[API Cleanup] 🧹 Iniciando limpieza robusta para usuario: ${user.id}`)

    const cleanupResults = {
      memoryCleared: false,
      filesDeleted: false,
      databaseCleared: false,
      errors: [] as string[]
    }

    // 1. Limpiar memoria (desconectar sesión activa)
    try {
      console.log('[API Cleanup] 🧠 Limpiando memoria...')
      await BaileysStableService.disconnect(user.id)
      cleanupResults.memoryCleared = true
      console.log('[API Cleanup] ✅ Memoria limpiada')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[API Cleanup] ❌ Error limpiando memoria:', errorMsg)
      cleanupResults.errors.push(`Memoria: ${errorMsg}`)
    }

    // 2. Eliminar archivos de sesión
    try {
      console.log('[API Cleanup] 📁 Eliminando archivos de sesión...')
      const authDir = path.join(process.cwd(), 'auth_sessions', user.id)
      
      if (fs.existsSync(authDir)) {
        // Eliminar todos los archivos dentro del directorio
        const files = fs.readdirSync(authDir)
        for (const file of files) {
          const filePath = path.join(authDir, file)
          try {
            fs.unlinkSync(filePath)
            console.log(`[API Cleanup] 🗑️ Archivo eliminado: ${file}`)
          } catch (fileError) {
            console.error(`[API Cleanup] ⚠️ No se pudo eliminar ${file}:`, fileError)
          }
        }
        
        // Intentar eliminar el directorio
        try {
          fs.rmdirSync(authDir)
          console.log('[API Cleanup] 📁 Directorio eliminado')
        } catch (dirError) {
          console.log('[API Cleanup] ⚠️ Directorio no vacío o no se pudo eliminar')
        }
        
        cleanupResults.filesDeleted = true
        console.log('[API Cleanup] ✅ Archivos eliminados')
      } else {
        console.log('[API Cleanup] ℹ️ No hay archivos de sesión para eliminar')
        cleanupResults.filesDeleted = true // No hay nada que eliminar = éxito
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[API Cleanup] ❌ Error eliminando archivos:', errorMsg)
      cleanupResults.errors.push(`Archivos: ${errorMsg}`)
    }

    // 3. Limpiar base de datos
    try {
      console.log('[API Cleanup] 💾 Limpiando base de datos...')
      await db.whatsAppConnection.deleteMany({
        where: { userId: user.id }
      })
      cleanupResults.databaseCleared = true
      console.log('[API Cleanup] ✅ Base de datos limpiada')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[API Cleanup] ❌ Error limpiando base de datos:', errorMsg)
      cleanupResults.errors.push(`Base de datos: ${errorMsg}`)
    }

    // Determinar si la limpieza fue exitosa
    const success = cleanupResults.memoryCleared && 
                   cleanupResults.filesDeleted && 
                   cleanupResults.databaseCleared

    if (success) {
      console.log('[API Cleanup] ✅ Limpieza robusta completada exitosamente')
      return NextResponse.json({
        success: true,
        message: 'Sesión limpiada completamente',
        details: cleanupResults
      })
    } else {
      console.log('[API Cleanup] ⚠️ Limpieza parcial:', cleanupResults)
      return NextResponse.json({
        success: false,
        error: 'Limpieza parcial',
        details: cleanupResults
      }, { status: 207 }) // 207 Multi-Status
    }

  } catch (error) {
    console.error('[API Cleanup] ❌ Error general:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}
