import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const productImportSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.string().transform((val) => parseFloat(val.replace(/[^0-9.-]/g, ''))),
  currency: z.string().default('COP'),
  category: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']).transform((val) => {
    const normalized = val.toUpperCase()
    if (normalized.includes('FISIC') || normalized.includes('PHYSICAL')) return 'PHYSICAL'
    if (normalized.includes('DIGITAL') || normalized.includes('VIRTUAL')) return 'DIGITAL'
    return 'SERVICE'
  }),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED']).default('AVAILABLE'),
  images: z.string().optional(),
  tags: z.string().optional(),
  autoResponse: z.string().optional(),
  stock: z.string().transform((val) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''))
    return isNaN(num) ? undefined : num
  }).optional()
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
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain at least a header and one data row' },
        { status: 400 }
      )
    }

    // Parse CSV (simple implementation)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const products = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim())
        const productData: any = { userId }
        
        headers.forEach((header, index) => {
          if (values[index]) {
            productData[header] = values[index]
          }
        })

        const validatedProduct = productImportSchema.parse(productData)
        products.push(validatedProduct)
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error instanceof z.ZodError 
            ? error.errors.map(e => e.message).join(', ')
            : 'Invalid data format'
        })
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation errors', 
          errors,
          imported: 0,
          total: lines.length - 1
        },
        { status: 400 }
      )
    }

    // Import products to database
    const importResults = await Promise.allSettled(
      products.map(product => 
        db.product.create({
          data: {
            ...product,
            images: product.images || '[]',
            tags: product.tags || '[]'
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
        .filter((r, index) => r.status === 'rejected')
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