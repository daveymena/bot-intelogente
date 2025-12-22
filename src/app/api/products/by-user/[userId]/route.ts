import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        businessName: true,
        whatsappNumber: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener productos del usuario
    const products = await db.product.findMany({
      where: {
        userId: userId,
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      products,
      userInfo: {
        businessName: user.businessName || user.name || 'Tienda',
        whatsappNumber: user.whatsappNumber,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error al obtener productos del usuario:', error)
    return NextResponse.json(
      { error: 'Error al cargar productos' },
      { status: 500 }
    )
  }
}
