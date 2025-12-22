import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const productImportSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').catch('Producto sin nombre'),
  description: z.string().catch(''),
  price: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''))
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }).catch(0),
  currency: z.string().catch('COP'),
  category: z.union([
    z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']),
    z.string()
  ]).transform((val) => {
    if (!val) return 'PHYSICAL'
    const normalized = val.toString().toUpperCase()
    if (normalized.includes('FISIC') || normalized.includes('PHYSICAL')) return 'PHYSICAL'
    if (normalized.includes('DIGITAL') || normalized.includes('VIRTUAL')) return 'DIGITAL'
    if (normalized.includes('SERVICE') || normalized.includes('SERVICIO')) return 'SERVICE'
    return 'PHYSICAL'
  }).catch('PHYSICAL'),
  status: z.union([
    z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']),
    z.string()
  ]).catch('AVAILABLE'),
  images: z.union([
    z.string(),
    z.array(z.string())
  ]).transform((val) => {
    if (Array.isArray(val)) return JSON.stringify(val)
    if (typeof val === 'string') {
      // Si ya es un string JSON válido, devolverlo
      try {
        JSON.parse(val)
        return val
      } catch {
        // Si no es JSON, intentar convertirlo en array
        return JSON.stringify([val].filter(Boolean))
      }
    }
    return '[]'
  }).catch('[]'),
  tags: z.union([
    z.string(),
    z.array(z.string())
  ]).transform((val) => {
    if (Array.isArray(val)) return JSON.stringify(val)
    if (typeof val === 'string') {
      try {
        JSON.parse(val)
        return val
      } catch {
        return JSON.stringify([val].filter(Boolean))
      }
    }
    return '[]'
  }).catch('[]'),
  autoResponse: z.string().catch(''),
  stock: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (!val) return undefined
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const num = parseInt(val.replace(/[^0-9]/g, ''))
      return isNaN(num) ? undefined : num
    }
    return undefined
  }).catch(undefined)
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const products: any[] = []
    const errors: any[] = []
    let totalRows = 0

    // Detectar formato del archivo
    const isJSON = file.name.endsWith('.json')

    if (isJSON) {
      // Procesar JSON
      try {
        const jsonData = JSON.parse(text)
        const productsArray = Array.isArray(jsonData) ? jsonData : [jsonData]
        totalRows = productsArray.length

        for (let i = 0; i < productsArray.length; i++) {
          try {
            const productData = productsArray[i]
            const validatedProduct = productImportSchema.parse(productData)
            products.push({ ...validatedProduct, userId })
          } catch (error) {
            errors.push({
              row: i + 1,
              error: error instanceof z.ZodError 
                ? error.issues.map((e: any) => e.message).join(', ')
                : 'Invalid data format'
            })
          }
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      }
    } else {
      // Procesar CSV
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        return NextResponse.json(
          { error: 'CSV file must contain at least a header and one data row' },
          { status: 400 }
        )
      }

      totalRows = lines.length - 1
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          const productData: any = { userId }
          
          headers.forEach((header, index) => {
            if (values[index]) {
              productData[header] = values[index]
            }
          })

          const validatedProduct = productImportSchema.parse(productData)
          products.push({ ...validatedProduct, userId })
        } catch (error) {
          errors.push({
            row: i + 1,
            error: error instanceof z.ZodError 
              ? error.issues.map((e: any) => e.message).join(', ')
              : 'Invalid data format'
          })
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation errors', 
          errors,
          imported: 0,
          total: totalRows
        },
        { status: 400 }
      )
    }

    // Import products to database
    const importResults = await Promise.allSettled(
      products.map((product: any) => 
        db.product.create({
          data: {
            userId: product.userId,
            name: product.name,
            description: product.description,
            price: product.price,
            currency: product.currency,
            category: product.category,
            status: product.status,
            images: product.images, // Ya viene como string JSON del schema
            tags: product.tags, // Ya viene como string JSON del schema
            autoResponse: product.autoResponse,
            stock: product.stock
          }
        })
      )
    )

    const successful = importResults.filter(r => r.status === 'fulfilled').length
    const failed = importResults.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      message: 'Import completed',
      imported: successful,
      failed,
      total: products.length,
      errors: failed > 0 ? importResults
        .filter(r => r.status === 'rejected')
        .map((r, index) => ({
          row: index + 2,
          error: r.status === 'rejected' ? r.reason.message : 'Unknown error'
        })) : undefined
    })

  } catch (error) {
    console.error('Error importing products:', error)
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const format = searchParams.get('format') || 'csv'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const products = await db.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'name', 'description', 'price', 'currency', 'category', 
        'status', 'images', 'tags', 'autoResponse', 'stock'
      ]
      
      const csvRows = [
        headers.join(','),
        ...products.map(product => [
          `"${product.name.replace(/"/g, '""')}"`,
          `"${(product.description || '').replace(/"/g, '""')}"`,
          product.price,
          product.currency,
          product.category,
          product.status,
          `"${(product.images || '').replace(/"/g, '""')}"`,
          `"${(product.tags || '').replace(/"/g, '""')}"`,
          `"${(product.autoResponse || '').replace(/"/g, '""')}"`,
          product.stock || ''
        ].join(','))
      ]

      const csvContent = csvRows.join('\n')
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'json') {
      // Generate JSON
      const jsonData = products.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : []
      }))

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid format. Use csv or json' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error exporting products:', error)
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    )
  }
}