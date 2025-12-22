import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET - Obtener configuración pública de la tienda
 * Puede ser por userId o por storeSlug
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const storeSlug = searchParams.get('slug')

    let settings
    
    if (storeSlug) {
      settings = await db.storeSettings.findUnique({
        where: { storeSlug }
      })
    } else if (userId && userId !== 'default') {
      settings = await db.storeSettings.findUnique({
        where: { userId }
      })
    } else {
      // Si no hay userId específico o es 'default', buscar el primer usuario con configuración
      settings = await db.storeSettings.findFirst({
        orderBy: { updatedAt: 'desc' }
      })
    }

    // Si no existe, devolver valores por defecto
    if (!settings) {
      return NextResponse.json({
        settings: {
          storeName: 'Smart Sales Bot',
          storeSlogan: 'Tu tienda inteligente',
          description: 'Encuentra los mejores productos',
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          logo: '/smart-sales-bot-logo.png',
          logoSquare: '/smart-sales-bot-logo.png',
          favicon: '/favicon.ico',
          bannerImage: '',
          email: '',
          phone: '',
          whatsapp: '',
          address: '',
          city: '',
          country: 'Colombia',
          facebook: '',
          instagram: '',
          twitter: '',
          tiktok: ''
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error obteniendo configuración pública de tienda:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}
