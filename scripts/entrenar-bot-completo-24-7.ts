/**
 * Sistema de Entrenamiento Completo 24/7
 * 
 * Entrena el bot con TODOS los productos de la BD
 * Genera base de conocimientos completa para agentes sin IA
 * 
 * Flujos de venta cubiertos:
 * - Productos Digitales (Cursos, Megapacks)
 * - Productos Físicos (Tecnología, Hogar)
 * - Dropshipping (Envío a domicilio)
 * - Servicios (Reparación de computadores, celulares, consolas)
 * 
 * Uso: npx tsx scripts/entrenar-bot-completo-24-7.ts
 */

import { db } from '../src/lib/db'
import { AIService } from '../src/lib/ai-service'
import fs from 'fs'
import path from 'path'

interface TrainingScenario {
  category: string
  productType: 'DIGITAL' | 'PHYSICAL' | 'SERVICE'
  salesFlow: string[]
  closingTechniques: string[]
  commonQuestions: string[]
}

interface KnowledgeBase {
  productId: string
  productName: string
  category: string
  salesFlow: {
    greeting: string
    discovery: string
    presentation: string
    objectionHandling: string[]
    closing: string
  }
  trainedResponses: {
    question: string
    answer: string
    confidence: number
  }[]
  lastTrained: Date
}

/**
 * Flujos de venta por tipo de producto
 */
const SALES_FLOWS: Record<string, TrainingScenario> = {
  DIGITAL: {
    category: 'Productos Digitales',
    productType: 'DIGITAL',
    salesFlow: [
      '1. SALUDO: Amigable y profesional',
      '2. DESCUBRIMIENTO: ¿Qué buscas aprender/lograr?',
      '3. PRESENTACIÓN: Beneficios del curso/megapack',
      '4. VALOR: Acceso de por vida, actualizaciones',
      '5. URGENCIA: Precio especial, cupos limitados',
      '6. CIERRE: Link de pago directo'
    ],
    closingTechniques: [
      'Cierre directo: "¿Te lo envío ahora?"',
      'Cierre alternativo: "¿Prefieres pagar con tarjeta o PayPal?"',
      'Cierre de urgencia: "Hoy tenemos 20% de descuento"',
      'Cierre de valor: "Incluye certificado y soporte"'
    ],
    commonQuestions: [
      '¿Cuánto cuesta?',
      '¿Qué incluye?',
      '¿Cómo lo recibo?',
      '¿Tiene garantía?',
      '¿Puedo pagar en cuotas?'
    ]
  },
  PHYSICAL: {
    category: 'Productos Físicos',
    productType: 'PHYSICAL',
    salesFlow: [
      '1. SALUDO: Profesional y cercano',
      '2. DESCUBRIMIENTO: ¿Para qué lo necesitas?',
      '3. PRESENTACIÓN: Características técnicas',
      '4. DEMOSTRACIÓN: Fotos, videos si disponible',
      '5. LOGÍSTICA: Envío o recogida en tienda',
      '6. CIERRE: Confirmar dirección y método de pago'
    ],
    closingTechniques: [
      'Cierre con envío: "¿A qué dirección te lo envío?"',
      'Cierre en tienda: "¿Cuándo puedes venir a verlo?"',
      'Cierre de stock: "Solo quedan 2 unidades"',
      'Cierre de garantía: "Incluye 6 meses de garantía"'
    ],
    commonQuestions: [
      '¿Cuánto cuesta?',
      '¿Está nuevo o usado?',
      '¿Tiene garantía?',
      '¿Hacen envíos?',
      '¿Puedo verlo antes?'
    ]
  },
  SERVICE_REPAIR: {
    category: 'Servicios de Reparación',
    productType: 'SERVICE',
    salesFlow: [
      '1. SALUDO: Empático y profesional',
      '2. DIAGNÓSTICO: ¿Qué problema tiene?',
      '3. EVALUACIÓN: Posibles causas y soluciones',
      '4. COTIZACIÓN: Precio estimado de reparación',
      '5. AGENDA: Cuándo puede traerlo',
      '6. CIERRE: Confirmar cita y anticipo'
    ],
    closingTechniques: [
      'Cierre con cita: "¿Te viene bien mañana a las 3pm?"',
      'Cierre de urgencia: "Hoy tengo espacio a las 5pm"',
      'Cierre de garantía: "Reparación con 30 días de garantía"',
      'Cierre de diagnóstico: "Revisión gratis, solo pagas si reparas"'
    ],
    commonQuestions: [
      '¿Cuánto cuesta la reparación?',
      '¿Cuánto demora?',
      '¿Tiene garantía?',
      '¿Puedo llevar el equipo ahora?',
      '¿Hacen diagnóstico gratis?'
    ]
  }
}

/**
 * Generar escenarios de entrenamiento para un producto
 */
function generateTrainingScenarios(product: any): string[] {
  const scenarios: string[] = []
  const productNameLower = product.name.toLowerCase()
  
  // Determinar tipo de producto
  let flowType: keyof typeof SALES_FLOWS = 'PHYSICAL'
  
  if (product.category === 'DIGITAL') {
    flowType = 'DIGITAL'
  } else if (productNameLower.includes('reparación') || 
             productNameLower.includes('reparacion') ||
             productNameLower.includes('servicio')) {
    flowType = 'SERVICE_REPAIR'
  }
  
  const flow = SALES_FLOWS[flowType]
  
  // Escenario 1: Pregunta de precio
  scenarios.push(`Cuánto cuesta ${productNameLower}?`)
  
  // Escenario 2: Pregunta de disponibilidad
  scenarios.push(`Tienes ${productNameLower}?`)
  
  // Escenario 3: Solicitud de información
  scenarios.push(`Cuéntame sobre ${productNameLower}`)
  
  // Escenario 4: Pregunta de características
  scenarios.push(`Qué incluye ${productNameLower}?`)
  
  // Escenario 5: Intención de compra
  scenarios.push(`Quiero comprar ${productNameLower}`)
  
  // Escenario 6: Pregunta de garantía
  scenarios.push(`${productNameLower} tiene garantía?`)
  
  // Escenarios específicos por tipo
  if (flowType === 'DIGITAL') {
    scenarios.push(`Cómo recibo ${productNameLower}?`)
    scenarios.push(`${productNameLower} tiene certificado?`)
  } else if (flowType === 'PHYSICAL') {
    scenarios.push(`${productNameLower} es nuevo o usado?`)
    scenarios.push(`Hacen envíos de ${productNameLower}?`)
  } else if (flowType === 'SERVICE_REPAIR') {
    scenarios.push(`Cuánto demora reparar ${productNameLower}?`)
    scenarios.push(`Hacen diagnóstico de ${productNameLower}?`)
  }
  
  return scenarios
}

/**
 * Entrenar bot con un producto específico
 */
async function trainProductScenarios(
  userId: string,
  product: any,
  phoneNumber: string
): Promise<KnowledgeBase> {
  console.log(`\n🎓 Entrenando: ${product.name}`)
  console.log(`   Categoría: ${product.category}`)
  console.log(`   Precio: $${product.price.toLocaleString('es-CO')} COP`)
  
  const scenarios = generateTrainingScenarios(product)
  const trainedResponses: any[] = []
  
  for (const scenario of scenarios) {
    try {
      console.log(`   📝 Escenario: "${scenario}"`)
      
      const response = await AIService.generateResponse(
        userId,
        scenario,
        phoneNumber,
        []
      )
      
      trainedResponses.push({
        question: scenario,
        answer: response.message,
        confidence: response.confidence || 0.9
      })
      
      console.log(`   ✅ Respuesta generada (${response.message.length} caracteres)`)
      
      // Pausa para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
      
      // Si es rate limit, esperar más tiempo
      if (error.message.includes('rate limit')) {
        console.log(`   ⏳ Esperando 30 segundos...`)
        await new Promise(resolve => setTimeout(resolve, 30000))
      }
    }
  }
  
  // Determinar flujo de ventas
  let salesFlow: any = {
    greeting: 'Hola, bienvenido a Tecnovariedades D&S',
    discovery: '¿Qué estás buscando?',
    presentation: `Te presento ${product.name}`,
    objectionHandling: ['Entiendo tu preocupación', 'Déjame explicarte'],
    closing: '¿Te lo envío ahora?'
  }
  
  if (product.category === 'DIGITAL') {
    salesFlow = {
      greeting: '¡Hola! 😊 Bienvenido a Tecnovariedades D&S',
      discovery: '¿Qué te gustaría aprender?',
      presentation: `${product.name} incluye acceso de por vida y certificado`,
      objectionHandling: [
        'Es una inversión en tu futuro',
        'Incluye actualizaciones gratis',
        'Soporte personalizado incluido'
      ],
      closing: '¿Te envío el link de pago?'
    }
  }
  
  const knowledgeBase: KnowledgeBase = {
    productId: product.id,
    productName: product.name,
    category: product.category,
    salesFlow,
    trainedResponses,
    lastTrained: new Date()
  }
  
  return knowledgeBase
}

/**
 * Entrenar TODOS los productos
 */
async function trainAllProducts() {
  console.log('🚀 ========================================')
  console.log('🎓 ENTRENAMIENTO COMPLETO 24/7')
  console.log('🚀 ========================================\n')
  
  const user = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!user) {
    console.error('❌ No se encontró usuario admin')
    process.exit(1)
  }
  
  console.log(`👤 Usuario: ${user.email}`)
  console.log(`🆔 ID: ${user.id}\n`)
  
  // Obtener TODOS los productos
  const products = await db.product.findMany({
    where: {
      userId: user.id,
      status: 'AVAILABLE'
    },
    orderBy: {
      category: 'asc'
    }
  })
  
  console.log(`📦 Productos encontrados: ${products.length}\n`)
  
  if (products.length === 0) {
    console.error('❌ No hay productos para entrenar')
    process.exit(1)
  }
  
  const knowledgeBases: KnowledgeBase[] = []
  const phoneNumber = `training_${Date.now()}`
  
  let trained = 0
  let failed = 0
  
  for (const product of products) {
    try {
      const kb = await trainProductScenarios(user.id, product, phoneNumber)
      knowledgeBases.push(kb)
      trained++
      
      console.log(`   ✅ Entrenamiento completado\n`)
      
    } catch (error: any) {
      console.log(`   ❌ Error en entrenamiento: ${error.message}\n`)
      failed++
    }
  }
  
  // Guardar base de conocimientos
  const outputDir = path.join(process.cwd(), 'knowledge-base')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const outputFile = path.join(outputDir, `training-${Date.now()}.json`)
  fs.writeFileSync(outputFile, JSON.stringify(knowledgeBases, null, 2))
  
  console.log('\n🚀 ========================================')
  console.log('📊 RESULTADOS DEL ENTRENAMIENTO')
  console.log('🚀 ========================================\n')
  
  console.log(`✅ Productos entrenados: ${trained}/${products.length}`)
  console.log(`❌ Productos fallidos: ${failed}/${products.length}`)
  console.log(`🎯 Tasa de éxito: ${((trained / products.length) * 100).toFixed(1)}%\n`)
  
  console.log(`💾 Base de conocimientos guardada en:`)
  console.log(`   ${outputFile}\n`)
  
  // Generar resumen por categoría
  const byCategory: Record<string, number> = {}
  knowledgeBases.forEach(kb => {
    byCategory[kb.category] = (byCategory[kb.category] || 0) + 1
  })
  
  console.log('📊 Productos entrenados por categoría:')
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} productos`)
  })
  
  console.log('\n✅ Entrenamiento completo finalizado')
  console.log('💡 El bot ahora tiene conocimiento de todos los productos\n')
  
  await db.$disconnect()
}

trainAllProducts().catch(console.error)
