import { NextResponse } from 'next/server'
import { DropiService } from '@/lib/dropi-service'

// POST /api/dropi/sync - Sincronizar productos de Dropi
export async function POST(request: Request) {
  try {
    console.log('🔄 Iniciando sincronización de productos Dropi...')
    
    const result = await DropiService.syncProducts()

    return NextResponse.json({
      success: result.success,
      message: 'Sincronización completada',
      stats: {
        imported: result.imported,
        updated: result.updated,
        errors: result.errors,
      },
    })
  } catch (error: any) {
    console.error('Error en /api/dropi/sync:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error sincronizando productos',
      },
      { status: 500 }
    )
  }
}

// GET /api/dropi/sync - Verificar conexión
export async function GET() {
  try {
    const connected = await DropiService.testConnection()

    return NextResponse.json({
      success: connected,
      message: connected ? 'Conexión exitosa con Dropi' : 'Error de conexión',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error verificando conexión',
      },
      { status: 500 }
    )
  }
}
