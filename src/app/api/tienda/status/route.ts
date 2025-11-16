import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verificar token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token || token !== process.env.EASYPANEL_TOKEN) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener configuración de tienda
    const tiendaConfig = await db.settings.findUnique({
      where: { key: 'tienda_config' }
    })

    const config = tiendaConfig ? JSON.parse(tiendaConfig.value) : {}

    return NextResponse.json({
      success: true,
      ultimaActualizacion: config.actualizadoEn || 'Nunca',
      version: config.version || '1.0.0',
      archivos: config.archivos || {},
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error obteniendo estado:', error)
    return NextResponse.json(
      { error: 'Error obteniendo estado' },
      { status: 500 }
    )
  }
}
