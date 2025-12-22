import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Verificar token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token || token !== process.env.EASYPANEL_TOKEN) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    console.log('📤 Actualizando tienda desde Easypanel...')
    console.log('Datos recibidos:', body)

    // Actualizar configuración de tienda en BD
    const tiendaActualizada = await db.settings.upsert({
      where: { key: 'tienda_config' },
      update: {
        value: JSON.stringify({
          ...body.tienda,
          actualizadoEn: new Date().toISOString()
        })
      },
      create: {
        key: 'tienda_config',
        value: JSON.stringify({
          ...body.tienda,
          actualizadoEn: new Date().toISOString()
        })
      }
    })

    console.log('✅ Tienda actualizada en BD')

    return NextResponse.json({
      success: true,
      mensaje: 'Tienda actualizada correctamente',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error actualizando tienda:', error)
    return NextResponse.json(
      { error: 'Error al actualizar tienda' },
      { status: 500 }
    )
  }
}
