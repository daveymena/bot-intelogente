import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Obtener configuración de landing page
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId

    // Buscar configuración personalizada
    const landingConfig = await prisma.landingPage.findFirst({
      where: { productId }
    })

    if (landingConfig) {
      return NextResponse.json({ success: true, config: landingConfig })
    }

    // Si no existe, devolver null (usará valores por defecto)
    return NextResponse.json({ success: true, config: null })
  } catch (error: any) {
    console.error('Error obteniendo configuración de landing:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST: Guardar/actualizar configuración de landing page
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId
    const body = await request.json()

    const {
      template,
      variant,
      heroImage,
      headline,
      subheadline,
      ctaText,
      ctaColor,
      benefits,
      features,
      urgencyMessage,
      guarantee,
      metaTitle,
      metaDescription,
      ogImage
    } = body

    // Buscar si ya existe
    const existing = await prisma.landingPage.findFirst({
      where: { productId, variant: variant || null }
    })

    let landingConfig

    if (existing) {
      // Actualizar
      landingConfig = await prisma.landingPage.update({
        where: { id: existing.id },
        data: {
          template,
          heroImage,
          headline,
          subheadline,
          ctaText,
          ctaColor,
          benefits: benefits ? JSON.stringify(benefits) : null,
          features: features ? JSON.stringify(features) : null,
          urgencyMessage,
          guarantee,
          metaTitle,
          metaDescription,
          ogImage,
          updatedAt: new Date()
        }
      })
    } else {
      // Crear nuevo
      landingConfig = await prisma.landingPage.create({
        data: {
          productId,
          template: template || 'default',
          variant,
          heroImage,
          headline,
          subheadline,
          ctaText,
          ctaColor,
          benefits: benefits ? JSON.stringify(benefits) : null,
          features: features ? JSON.stringify(features) : null,
          urgencyMessage,
          guarantee,
          metaTitle,
          metaDescription,
          ogImage
        }
      })
    }

    return NextResponse.json({ success: true, config: landingConfig })
  } catch (error: any) {
    console.error('Error guardando configuración de landing:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar configuración personalizada (volver a default)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId
    const { searchParams } = new URL(request.url)
    const variant = searchParams.get('variant')

    await prisma.landingPage.deleteMany({
      where: {
        productId,
        variant: variant || null
      }
    })

    return NextResponse.json({ success: true, message: 'Configuración eliminada' })
  } catch (error: any) {
    console.error('Error eliminando configuración de landing:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
