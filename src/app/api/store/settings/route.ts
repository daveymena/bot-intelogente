import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

// GET /api/store/settings - Obtener configuración de tienda del usuario actual
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let storeSettings = await db.storeSettings.findUnique({
      where: { userId: user.id }
    })

    // Si no existe, crear configuración por defecto
    if (!storeSettings) {
      const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
      const baseSlug = username
      let storeSlug = baseSlug
      let counter = 1

      // Asegurar que el slug sea único
      while (await db.storeSettings.findUnique({ where: { storeSlug } })) {
        storeSlug = `${baseSlug}-${counter}`
        counter++
      }

      storeSettings = await db.storeSettings.create({
        data: {
          userId: user.id,
          storeSlug,
          storeName: user.businessName || user.name || 'Mi Tienda',
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsappNumber
        }
      })
    }

    return NextResponse.json({ storeSettings })
  } catch (error) {
    console.error('Error fetching store settings:', error)
    return NextResponse.json(
      { error: 'Error al cargar configuración' },
      { status: 500 }
    )
  }
}

// PUT /api/store/settings - Actualizar configuración de tienda
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Si se está cambiando el slug, verificar que sea único
    if (data.storeSlug) {
      const existing = await db.storeSettings.findUnique({
        where: { storeSlug: data.storeSlug }
      })

      if (existing && existing.userId !== user.id) {
        return NextResponse.json(
          { error: 'Este nombre de tienda ya está en uso' },
          { status: 400 }
        )
      }
    }

    const storeSettings = await db.storeSettings.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data
      }
    })

    return NextResponse.json({ storeSettings })
  } catch (error) {
    console.error('Error updating store settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
