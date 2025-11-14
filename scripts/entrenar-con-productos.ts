/**
 * 🎓 Entrenamiento Automático con Productos de la Base de Datos
 * 
 * Este script genera automáticamente ejemplos de entrenamiento para cada producto,
 * enseñándole al bot cómo responder sobre cada uno.
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`)
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`)
}

interface TrainingExample {
  userMessage: string
  botResponse: string
  context: string
  intent: string
  productId: string
  productName: string
  category: string
}

/**
 * Cargar todos los productos de la base de datos
 */
async function loadProducts() {
  section('1. CARGANDO PRODUCTOS DE LA BASE DE DATOS')

  const products = await db.product.findMany({
    where: {
      status: 'AVAILABLE'
    },
    orderBy: {
      category: 'asc'
    }
  })

  log('📦', `Productos cargados: ${products.length}`, colors.cyan)

  // Agrupar por categoría
  const byCategory = products.reduce((acc, product) => {
    const category = product.category || 'Sin categoría'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, typeof products>)

  console.log()
  log('📊', 'Productos por categoría:', colors.yellow)
  Object.entries(byCategory).forEach(([category, prods]) => {
    console.log(`   ${category}: ${prods.length} productos`)
  })

  return products
}

/**
 * Generar ejemplos de entrenamiento para un producto
 */
function generateProductTrainingExamples(product: any): TrainingExample[] {
  const examples: TrainingExample[] = []
  
  const name = product.name
  const price = product.price
  const category = product.category || 'producto'
  const description = product.description || ''
  
  // Formatear precio
  const priceFormatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)

  // 1. Búsqueda directa por nombre
  examples.push({
    userMessage: `busco ${name}`,
    botResponse: `¡Perfecto! Tengo el ${name} disponible por ${priceFormatted}. ${description ? description.substring(0, 100) : 'Es una excelente opción.'} ¿Te gustaría más información?`,
    context: 'product_search',
    intent: 'search_by_name',
    productId: product.id,
    productName: name,
    category
  })

  // 2. Pregunta por precio
  examples.push({
    userMessage: `cuánto cuesta ${name}`,
    botResponse: `El ${name} tiene un precio de ${priceFormatted}. ¿Te interesa?`,
    context: 'price_inquiry',
    intent: 'ask_price',
    productId: product.id,
    productName: name,
    category
  })

  // 3. Pregunta por disponibilidad
  examples.push({
    userMessage: `tienes ${name}`,
    botResponse: `¡Sí! Tengo el ${name} disponible por ${priceFormatted}. ¿Quieres que te envíe más detalles?`,
    context: 'availability_check',
    intent: 'check_availability',
    productId: product.id,
    productName: name,
    category
  })

  // 4. Búsqueda por categoría
  if (category !== 'Sin categoría') {
    const categoryLower = category.toLowerCase()
    examples.push({
      userMessage: `busco ${categoryLower}`,
      botResponse: `Tengo varias opciones de ${categoryLower}. Una de ellas es el ${name} por ${priceFormatted}. ¿Te interesa conocer más?`,
      context: 'category_search',
      intent: 'search_by_category',
      productId: product.id,
      productName: name,
      category
    })
  }

  // 5. Pregunta por características (si hay descripción)
  if (description) {
    examples.push({
      userMessage: `qué características tiene ${name}`,
      botResponse: `El ${name} ${description.substring(0, 150)}... Cuesta ${priceFormatted}. ¿Te gustaría verlo?`,
      context: 'product_details',
      intent: 'ask_features',
      productId: product.id,
      productName: name,
      category
    })
  }

  // 6. Comparación de precio
  examples.push({
    userMessage: `${name} es muy caro`,
    botResponse: `Entiendo tu preocupación. El ${name} está en ${priceFormatted}, pero es una excelente inversión por su calidad. ¿Quieres que te muestre opciones más económicas en ${category}?`,
    context: 'price_objection',
    intent: 'handle_price_objection',
    productId: product.id,
    productName: name,
    category
  })

  // 7. Solicitud de fotos
  examples.push({
    userMessage: `me envías fotos de ${name}`,
    botResponse: `¡Claro! Te envío las fotos del ${name} ahora mismo. Cuesta ${priceFormatted}. 📸`,
    context: 'photo_request',
    intent: 'request_photos',
    productId: product.id,
    productName: name,
    category
  })

  // 8. Intención de compra
  examples.push({
    userMessage: `quiero comprar ${name}`,
    botResponse: `¡Excelente elección! El ${name} cuesta ${priceFormatted}. Te envío los métodos de pago disponibles. 💳`,
    context: 'purchase_intent',
    intent: 'buy_product',
    productId: product.id,
    productName: name,
    category
  })

  return examples
}

/**
 * Generar ejemplos generales por categoría
 */
function generateCategoryExamples(products: any[]): TrainingExample[] {
  const examples: TrainingExample[] = []
  
  // Agrupar por categoría
  const byCategory = products.reduce((acc, product) => {
    const category = product.category || 'Sin categoría'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, typeof products>)

  // Generar ejemplos para cada categoría
  for (const [category, prods] of Object.entries(byCategory)) {
    if (category === 'Sin categoría') continue

    const categoryLower = category.toLowerCase()
    const productList = prods.slice(0, 3).map(p => p.name).join(', ')

    // Búsqueda general de categoría
    examples.push({
      userMessage: `qué ${categoryLower} tienes`,
      botResponse: `Tengo varias opciones de ${categoryLower}: ${productList}${prods.length > 3 ? ` y ${prods.length - 3} más` : ''}. ¿Cuál te interesa?`,
      context: 'category_browse',
      intent: 'browse_category',
      productId: 'general',
      productName: 'general',
      category
    })

    // Recomendación de categoría
    examples.push({
      userMessage: `recomiéndame ${categoryLower}`,
      botResponse: `Te recomiendo el ${prods[0].name} por ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(prods[0].price)}. Es una excelente opción. ¿Te gustaría más información?`,
      context: 'category_recommendation',
      intent: 'recommend_from_category',
      productId: prods[0].id,
      productName: prods[0].name,
      category
    })

    // Rango de precios
    const prices = prods.map(p => p.price).sort((a, b) => a - b)
    const minPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(prices[0])
    const maxPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(prices[prices.length - 1])

    examples.push({
      userMessage: `cuánto cuestan ${categoryLower}`,
      botResponse: `Los precios de ${categoryLower} van desde ${minPrice} hasta ${maxPrice}. ¿Tienes un presupuesto en mente?`,
      context: 'category_price_range',
      intent: 'ask_category_prices',
      productId: 'general',
      productName: 'general',
      category
    })
  }

  return examples
}

/**
 * Generar archivo de entrenamiento
 */
async function generateTrainingFile(examples: TrainingExample[]) {
  section('3. GENERANDO ARCHIVO DE ENTRENAMIENTO')

  // Agrupar por categoría
  const byCategory = examples.reduce((acc, ex) => {
    if (!acc[ex.category]) {
      acc[ex.category] = []
    }
    acc[ex.category].push(ex)
    return acc
  }, {} as Record<string, TrainingExample[]>)

  // Generar contenido del archivo
  let content = `/**
 * 🎓 Ejemplos de Entrenamiento Generados Automáticamente
 * 
 * Este archivo fue generado automáticamente basándose en los productos
 * de la base de datos.
 * 
 * Generado: ${new Date().toLocaleString('es-CO')}
 * Total de ejemplos: ${examples.length}
 * Categorías: ${Object.keys(byCategory).length}
 */

export const PRODUCT_TRAINING_EXAMPLES = [\n`

  // Agregar ejemplos por categoría
  for (const [category, categoryExamples] of Object.entries(byCategory)) {
    content += `  // ========================================\n`
    content += `  // ${category.toUpperCase()} (${categoryExamples.length} ejemplos)\n`
    content += `  // ========================================\n\n`

    for (const example of categoryExamples) {
      content += `  {\n`
      content += `    userMessage: "${example.userMessage}",\n`
      content += `    botResponse: "${example.botResponse.replace(/"/g, '\\"')}",\n`
      content += `    context: "${example.context}",\n`
      content += `    intent: "${example.intent}",\n`
      content += `    productId: "${example.productId}",\n`
      content += `    category: "${example.category}"\n`
      content += `  },\n\n`
    }
  }

  content += `]\n\n`

  // Agregar metadata
  content += `export const PRODUCT_TRAINING_METADATA = {\n`
  content += `  totalExamples: ${examples.length},\n`
  content += `  generatedAt: "${new Date().toISOString()}",\n`
  content += `  categories: ${JSON.stringify(Object.keys(byCategory))},\n`
  content += `  examplesByCategory: ${JSON.stringify(
    Object.entries(byCategory).reduce((acc, [cat, exs]) => {
      acc[cat] = exs.length
      return acc
    }, {} as Record<string, number>)
  )}\n`
  content += `}\n`

  // Guardar archivo
  const filePath = path.join(process.cwd(), 'src/lib/product-training-examples.ts')
  fs.writeFileSync(filePath, content, 'utf-8')

  log('✅', `Archivo generado: product-training-examples.ts`, colors.green)
  log('📊', `Total de ejemplos: ${examples.length}`, colors.blue)
  log('📁', `Categorías: ${Object.keys(byCategory).length}`, colors.blue)
}

/**
 * Generar reporte de entrenamiento
 */
function generateReport(products: any[], examples: TrainingExample[]) {
  section('4. REPORTE DE ENTRENAMIENTO')

  const byCategory = examples.reduce((acc, ex) => {
    if (!acc[ex.category]) {
      acc[ex.category] = { count: 0, intents: new Set() }
    }
    acc[ex.category].count++
    acc[ex.category].intents.add(ex.intent)
    return acc
  }, {} as Record<string, { count: number; intents: Set<string> }>)

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalProducts: products.length,
      totalExamples: examples.length,
      examplesPerProduct: (examples.length / products.length).toFixed(1),
      categories: Object.keys(byCategory).length
    },
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      examples: data.count,
      intents: Array.from(data.intents)
    })),
    intents: {
      search_by_name: examples.filter(e => e.intent === 'search_by_name').length,
      ask_price: examples.filter(e => e.intent === 'ask_price').length,
      check_availability: examples.filter(e => e.intent === 'check_availability').length,
      search_by_category: examples.filter(e => e.intent === 'search_by_category').length,
      ask_features: examples.filter(e => e.intent === 'ask_features').length,
      handle_price_objection: examples.filter(e => e.intent === 'handle_price_objection').length,
      request_photos: examples.filter(e => e.intent === 'request_photos').length,
      buy_product: examples.filter(e => e.intent === 'buy_product').length
    }
  }

  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'product-training-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')

  // Mostrar resumen
  log('📊', 'Resumen del Entrenamiento:', colors.cyan)
  console.log(`   Total de productos: ${report.summary.totalProducts}`)
  console.log(`   Total de ejemplos: ${report.summary.totalExamples}`)
  console.log(`   Ejemplos por producto: ${report.summary.examplesPerProduct}`)
  console.log(`   Categorías: ${report.summary.categories}`)

  console.log()
  log('🎯', 'Ejemplos por Intención:', colors.yellow)
  Object.entries(report.intents).forEach(([intent, count]) => {
    console.log(`   ${intent}: ${count}`)
  })

  console.log()
  log('📁', 'Ejemplos por Categoría:', colors.yellow)
  report.byCategory.slice(0, 10).forEach(cat => {
    console.log(`   ${cat.category}: ${cat.examples} ejemplos`)
  })

  log('💾', `Reporte guardado: product-training-report.json`, colors.blue)
}

/**
 * Main
 */
async function main() {
  console.clear()

  log('🎓', 'ENTRENAMIENTO CON PRODUCTOS DE LA BASE DE DATOS', colors.bright + colors.cyan)
  log('📅', new Date().toLocaleString('es-CO'), colors.cyan)
  console.log()

  try {
    // 1. Cargar productos
    const products = await loadProducts()

    if (products.length === 0) {
      log('⚠️', 'No hay productos en la base de datos', colors.yellow)
      log('💡', 'Agrega productos primero y vuelve a ejecutar', colors.cyan)
      return
    }

    // 2. Generar ejemplos
    section('2. GENERANDO EJEMPLOS DE ENTRENAMIENTO')
    
    const allExamples: TrainingExample[] = []

    log('🔄', 'Generando ejemplos para cada producto...', colors.cyan)
    
    for (const product of products) {
      const examples = generateProductTrainingExamples(product)
      allExamples.push(...examples)
    }

    log('✅', `Ejemplos de productos generados: ${allExamples.length}`, colors.green)

    // Generar ejemplos generales por categoría
    log('🔄', 'Generando ejemplos generales por categoría...', colors.cyan)
    const categoryExamples = generateCategoryExamples(products)
    allExamples.push(...categoryExamples)

    log('✅', `Ejemplos de categorías generados: ${categoryExamples.length}`, colors.green)
    log('📊', `Total de ejemplos: ${allExamples.length}`, colors.blue)

    // 3. Generar archivo
    await generateTrainingFile(allExamples)

    // 4. Generar reporte
    generateReport(products, allExamples)

    section('✅ ENTRENAMIENTO COMPLETADO')
    log('🎉', 'El bot ha sido entrenado con todos los productos', colors.green)
    log('📁', 'Archivos generados:', colors.cyan)
    console.log('   - src/lib/product-training-examples.ts')
    console.log('   - product-training-report.json')
    console.log()
    log('🔄', 'Próximo paso: Reinicia el bot para aplicar el entrenamiento', colors.yellow)
    console.log('   npm run dev')

  } catch (error: any) {
    section('❌ ERROR')
    log('💥', error.message, colors.red)
    console.error(error)
    process.exit(1)
  }
}

main()
