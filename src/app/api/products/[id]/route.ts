import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function safeJSONParse(value: string | null): any[] {
  if (!value) return []
  try {
    if (value.startsWith('[') || value.startsWith('{')) {
      return JSON.parse(value)
    }
    return [value]
  } catch (error) {
    return [value]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        stock: true,
        userId: true,
        paymentLinkMercadoPago: true,
        paymentLinkPayPal: true,
        paymentLinkCustom: true,
        status: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const parsedProduct = {
      ...product,
      images: safeJSONParse(product.images),
      // Si stock es null (productos digitales), mostrar como disponible (999)
      stock: product.stock ?? 999,
      paymentMethods: {
        mercadopago: {
          enabled: !!product.paymentLinkMercadoPago,
          link: product.paymentLinkMercadoPago
        },
        paypal: {
          enabled: !!product.paymentLinkPayPal,
          email: product.paymentLinkPayPal
        },
        custom: {
          enabled: !!product.paymentLinkCustom,
          link: product.paymentLinkCustom
        }
      }
    }

    return NextResponse.json({ product: parsedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`[API] Eliminando producto: ${id}`)

    // Verificar que el producto existe
    const product = await db.product.findUnique({
      where: { id }
    })

    if (!product) {
      console.log(`[API] Producto no encontrado: ${id}`)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Eliminar el producto
    await db.product.delete({
      where: { id }
    })

    console.log(`[API] ✅ Producto eliminado: ${product.name}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully',
      productName: product.name
    })
  } catch (error) {
    console.error('[API] Error deleting product:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log(`[API] Actualizando producto: ${id}`)

    // Verificar que el producto existe
    const existingProduct = await db.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Preparar datos para actualizar
    const updateData: any = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      currency: body.currency || 'COP',
      category: body.category,
      status: body.status,
      stock: body.stock ? parseInt(body.stock) : null,
    }

    // Manejar imágenes
    if (body.images) {
      if (typeof body.images === 'string') {
        // Si viene como string separado por comas
        const imagesArray = body.images.split(',').map((img: string) => img.trim()).filter(Boolean)
        updateData.images = JSON.stringify(imagesArray)
      } else if (Array.isArray(body.images)) {
        updateData.images = JSON.stringify(body.images)
      }
    }

    // Manejar tags
    if (body.tags) {
      if (typeof body.tags === 'string') {
        const tagsArray = body.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        updateData.tags = JSON.stringify(tagsArray)
      } else if (Array.isArray(body.tags)) {
        updateData.tags = JSON.stringify(body.tags)
      }
    }

    // Campos opcionales
    if (body.autoResponse !== undefined) updateData.autoResponse = body.autoResponse
    if (body.paymentLinkMercadoPago !== undefined) updateData.paymentLinkMercadoPago = body.paymentLinkMercadoPago
    if (body.paymentLinkPayPal !== undefined) updateData.paymentLinkPayPal = body.paymentLinkPayPal
    if (body.paymentLinkCustom !== undefined) updateData.paymentLinkCustom = body.paymentLinkCustom

    // Actualizar producto
    const updatedProduct = await db.product.update({
      where: { id },
      data: updateData
    })

    console.log(`[API] ✅ Producto actualizado: ${updatedProduct.name}`)

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct 
    })
  } catch (error) {
    console.error('[API] Error updating product:', error)
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
