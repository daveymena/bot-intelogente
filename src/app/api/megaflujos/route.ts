import { NextRequest, NextResponse } from 'next/server'
import { MegaflujoService } from '@/lib/megaflujos-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = MegaflujoService.obtenerEstadísticas()
      return NextResponse.json(stats)
    }

    if (action === 'search' && query) {
      const similares = MegaflujoService.buscarSimilares(query, 3)
      return NextResponse.json({
        query,
        resultados: similares,
        total: similares.length
      })
    }

    if (action === 'intencion' && query) {
      const intencion = MegaflujoService.detectarIntención(query)
      const acciones = MegaflujoService.obtenerAcciones(query)
      return NextResponse.json({
        query,
        intencion,
        acciones
      })
    }

    return NextResponse.json({
      error: 'Acción no válida',
      acciones_disponibles: ['stats', 'search', 'intencion']
    })
  } catch (error) {
    console.error('Error en megaflujos API:', error)
    return NextResponse.json(
      { error: 'Error procesando megaflujos' },
      { status: 500 }
    )
  }
}
