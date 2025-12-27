import { db } from '../src/lib/db'

/**
 * Script para organizar productos por categorías
 * Analiza todos los productos y los categoriza correctamente
 */

interface CategoryMapping {
  keywords: string[]
  mainCategory: string
  category: 'DIGITAL' | 'PHYSICAL' | 'SERVICE'
}

const categoryMappings: CategoryMapping[] = [
  {
    keywords: ['piano', 'música', 'music', 'guitarra', 'batería', 'canto', 'producción musical'],
    mainCategory: 'Música',
    category: 'DIGITAL'
  },
  {
    keywords: ['idioma', 'inglés', 'english', 'francés', 'alemán', 'italiano', 'portugués', 'chino', 'japonés'],
    mainCategory: 'Idiomas',
    category: 'DIGITAL'
  },
  {
    keywords: ['programación', 'python', 'javascript', 'java', 'web', 'desarrollo', 'coding', 'software'],
    mainCategory: 'Programación',
    category: 'DIGITAL'
  },
  {
    keywords: ['diseño', 'photoshop', 'illustrator', 'figma', 'ui', 'ux', 'gráfico'],
    mainCategory: 'Diseño',
    category: 'DIGITAL'
  },
  {
    keywords: ['excel', 'office', 'word', 'powerpoint', 'google sheets'],
    mainCategory: 'Ofimática',
    category: 'DIGITAL'
  },
  {
    keywords: ['marketing', 'ventas', 'publicidad', 'redes sociales', 'seo', 'ads'],
    mainCategory: 'Marketing Digital',
    category: 'DIGITAL'
  },
  {
    keywords: ['finanzas', 'contabilidad', 'inversión', 'trading', 'bolsa'],
    mainCategory: 'Finanzas',
    category: 'DIGITAL'
  },
  {
    keywords: ['fotografía', 'video', 'edición', 'premiere', 'after effects'],
    mainCategory: 'Fotografía y Video',
    category: 'DIGITAL'
  },
  {
    keywords: ['cocina', 'repostería', 'chef', 'gastronomía'],
    mainCategory: 'Cocina',
    category: 'DIGITAL'
  },
  {
    keywords: ['fitness', 'yoga', 'ejercicio', 'gym', 'entrenamiento'],
    mainCategory: 'Fitness y Salud',
    category: 'DIGITAL'
  },
  {
    keywords: ['pack', 'mega', 'bundle', 'colección'],
    mainCategory: 'Packs y Bundles',
    category: 'DIGITAL'
  }
]

function categorizeProduct(name: string, description: string = ''): { mainCategory: string; category: 'DIGITAL' | 'PHYSICAL' | 'SERVICE' } {
  const searchText = `${name} ${description}`.toLowerCase()
  
  for (const mapping of categoryMappings) {
    for (const keyword of mapping.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return {
          mainCategory: mapping.mainCategory,
          category: mapping.category
        }
      }
    }
  }
  
  // Default category
  return {
    mainCategory: 'Otros',
    category: 'DIGITAL'
  }
}

async function organizeProducts() {
  try {
    console.log('📦 Organizando productos por categorías...\n')

    // Obtener todos los productos
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        mainCategory: true,
        category: true
      }
    })

    console.log(`📊 Total de productos: ${products.length}\n`)

    const categoryCounts: Record<string, number> = {}
    let updated = 0

    // Categorizar cada producto
    for (const product of products) {
      const { mainCategory, category } = categorizeProduct(product.name, product.description || '')
      
      // Contar por categoría
      categoryCounts[mainCategory] = (categoryCounts[mainCategory] || 0) + 1

      // Actualizar si es diferente
      if (product.mainCategory !== mainCategory || product.category !== category) {
        await db.product.update({
          where: { id: product.id },
          data: {
            mainCategory,
            category
          }
        })
        updated++
        console.log(`✅ ${product.name} → ${mainCategory}`)
      }
    }

    console.log(`\n✅ ${updated} productos actualizados\n`)
    console.log('📊 Distribución por categorías:')
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} productos`)
      })

  } catch (error) {
    console.error('❌ Error organizando productos:', error)
  } finally {
    await db.$disconnect()
  }
}

organizeProducts()
