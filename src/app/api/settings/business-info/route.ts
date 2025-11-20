import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuthService } from '@/lib/auth'

/**
 * GET - Obtener información del negocio
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

    const settings = await db.botSettings.findUnique({
      where: { userId: user.id },
      select: {
        businessName: true,
        businessPhone: true,
        businessAddress: true,
        businessHours: true,
        whatsappNumber: true
      }
    })

    // Formatear respuesta para el frontend
    const businessInfo = {
      name: settings?.businessName || '',
      phone: settings?.businessPhone || '',
      email: '', // No existe en schema, dejar vacío
      address: settings?.businessAddress || '',
      schedule: settings?.businessHours || '',
      deliveryZones: '' // No existe en schema, dejar vacío
    }

    return NextResponse.json({ businessInfo })
  } catch (error) {
    console.error('Error obteniendo información del negocio:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

/**
 * POST - Guardar información del negocio
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
    const { businessInfo } = body

    // Actualizar o crear configuración
    await db.botSettings.upsert({
      where: { userId: user.id },
      update: {
        businessName: businessInfo.name || 'Tecnovariedades D&S',
        businessPhone: businessInfo.phone || '+57 304 274 8687',
        businessAddress: businessInfo.address || null,
        businessHours: businessInfo.schedule || null,
        whatsappNumber: businessInfo.phone || null
      },
      create: {
        userId: user.id,
        businessName: businessInfo.name || 'Tecnovariedades D&S',
        businessPhone: businessInfo.phone || '+57 304 274 8687',
        businessAddress: businessInfo.address || null,
        businessHours: businessInfo.schedule || null,
        whatsappNumber: businessInfo.phone || null
      }
    })

    console.log(`[BusinessInfo] ✅ Información actualizada para usuario ${user.id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Información del negocio actualizada correctamente'
    })
  } catch (error) {
    console.error('Error guardando información del negocio:', error)
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}
