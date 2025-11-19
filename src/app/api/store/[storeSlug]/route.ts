import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/store/[storeSlug] - Obtener configuración de tienda pública
export async function GET(
  request: NextRequest,
  { params }: { params: { storeSlug: string } }
) {
  try {
    const { storeSlug } = params

    const store = await db.storeSettings.findUnique({
      where: { 
        storeSlug,
        isPublic: true,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Incrementar contador de vistas
    await db.storeSettings.update({
      where: { id: store.id },
      data: {
        viewCount: { increment: 1 },
        lastViewAt: new Date()
      }
    })

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Error al cargar la tienda' },
      { status: 500 }
    )
  }
}
