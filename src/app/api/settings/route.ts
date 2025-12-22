import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    let settings = await db.botSettings.findUnique({
      where: { userId: user.id }
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await db.botSettings.create({
        data: {
          userId: user.id,
          businessName: user.businessName || 'Mi Negocio',
          businessPhone: user.phone || '+57 300 000 0000',
          responseDelay: 2,
          autoResponseEnabled: true,
          smartWaitingEnabled: true,
          maxTokens: 500,
          temperature: 0.7
        }
      })
    }

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Preparar datos de actualización (solo campos que vienen en el body)
    const updateData: any = {}
    if (body.businessName !== undefined) updateData.businessName = body.businessName
    if (body.businessPhone !== undefined) updateData.businessPhone = body.businessPhone
    if (body.botPersonality !== undefined) updateData.botPersonality = body.botPersonality
    if (body.responseDelay !== undefined) updateData.responseDelay = body.responseDelay
    if (body.autoResponseEnabled !== undefined) updateData.autoResponseEnabled = body.autoResponseEnabled
    if (body.smartWaitingEnabled !== undefined) updateData.smartWaitingEnabled = body.smartWaitingEnabled
    if (body.maxTokens !== undefined) updateData.maxTokens = body.maxTokens
    if (body.temperature !== undefined) updateData.temperature = body.temperature

    const settings = await db.botSettings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        businessName: body.businessName || 'Mi Negocio',
        businessPhone: body.businessPhone || '+57 300 000 0000',
        botPersonality: body.botPersonality || null,
        responseDelay: body.responseDelay || 2,
        autoResponseEnabled: body.autoResponseEnabled !== false,
        smartWaitingEnabled: body.smartWaitingEnabled !== false,
        maxTokens: body.maxTokens || 500,
        temperature: body.temperature || 0.7
      }
    })

    console.log('[Settings] ✅ Configuración actualizada:', {
      userId: user.id,
      hasPersonality: !!settings.botPersonality,
      personalityLength: settings.botPersonality?.length || 0
    })

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
