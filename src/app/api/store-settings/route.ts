import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

/**
 * GET - Obtener configuración de la tienda
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const settings = await db.storeSettings.findUnique({
      where: { userId: user.id }
    })

    // Si no existe, devolver valores por defecto
    if (!settings) {
      return NextResponse.json({
        settings: {
          storeName: 'Mi Tienda',
          storeSlogan: '',
          description: '',
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          logo: '',
          logoSquare: '',
          favicon: '',
          bannerImage: '',
          email: user.email,
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
    console.error('Error obteniendo configuración de tienda:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * POST - Guardar configuración de la tienda
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    // Generar slug único si no existe
    let storeSlug = settings.storeSlug
    if (!storeSlug) {
      // Generar slug desde el nombre de la tienda
      storeSlug = settings.storeName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
        .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio/final
      
      // Agregar ID del usuario para hacerlo único
      storeSlug = `${storeSlug}-${user.id.slice(0, 8)}`
    }

    // Actualizar o crear configuración
    const updatedSettings = await db.storeSettings.upsert({
      where: { userId: user.id },
      update: {
        storeName: settings.storeName || 'Mi Tienda',
        storeSlogan: settings.storeSlogan || null,
        description: settings.description || null,
        primaryColor: settings.primaryColor || '#10b981',
        secondaryColor: settings.secondaryColor || '#3b82f6',
        accentColor: settings.accentColor || '#f59e0b',
        backgroundColor: settings.backgroundColor || '#ffffff',
        textColor: settings.textColor || '#1f2937',
        logo: settings.logo || null,
        logoSquare: settings.logoSquare || null,
        favicon: settings.favicon || null,
        bannerImage: settings.bannerImage || null,
        email: settings.email || null,
        phone: settings.phone || null,
        whatsapp: settings.whatsapp || null,
        address: settings.address || null,
        city: settings.city || null,
        country: settings.country || 'Colombia',
        facebook: settings.facebook || null,
        instagram: settings.instagram || null,
        twitter: settings.twitter || null,
        tiktok: settings.tiktok || null
      },
      create: {
        userId: user.id,
        storeSlug,
        storeName: settings.storeName || 'Mi Tienda',
        storeSlogan: settings.storeSlogan || null,
        description: settings.description || null,
        primaryColor: settings.primaryColor || '#10b981',
        secondaryColor: settings.secondaryColor || '#3b82f6',
        accentColor: settings.accentColor || '#f59e0b',
        backgroundColor: settings.backgroundColor || '#ffffff',
        textColor: settings.textColor || '#1f2937',
        logo: settings.logo || null,
        logoSquare: settings.logoSquare || null,
        favicon: settings.favicon || null,
        bannerImage: settings.bannerImage || null,
        email: settings.email || null,
        phone: settings.phone || null,
        whatsapp: settings.whatsapp || null,
        address: settings.address || null,
        city: settings.city || null,
        country: settings.country || 'Colombia',
        facebook: settings.facebook || null,
        instagram: settings.instagram || null,
        twitter: settings.twitter || null,
        tiktok: settings.tiktok || null
      }
    })

    console.log(`[StoreSettings] ✅ Configuración actualizada para usuario ${user.id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Configuración de tienda actualizada correctamente',
      settings: updatedSettings
    })
  } catch (error: any) {
    console.error('Error guardando configuración de tienda:', error)
    
    // Error de slug duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('storeSlug')) {
      return NextResponse.json(
        { error: 'Este nombre de tienda ya está en uso. Por favor elige otro.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}
