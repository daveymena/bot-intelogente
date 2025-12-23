/**
 * 🧪 Test del Sistema Multi-Servicio
 * 
 * Prueba los componentes del agente multi-servicio:
 * - BusinessContextDetector
 * - FlowEngine
 * - TemplateGenerator
 * - CategoryAutoGenerator
 */

import { BusinessContextDetector } from '../src/lib/business-context-detector'
import { FlowEngine } from '../src/lib/flow-engine'
import { TemplateGenerator } from '../src/lib/template-generator'
import { CategoryAutoGenerator } from '../src/lib/category-auto-generator'

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(name: string, passed: boolean, details?: string) {
  const icon = passed ? '✅' : '❌'
  const color = passed ? 'green' : 'red'
  log(`${icon} ${name}`, color)
  if (details) {
    console.log(`   ${details}`)
  }
}

async function testBusinessContextDetector() {
  log('\n📊 PROBANDO BusinessContextDetector', 'bold')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  
  // Test 1: Detectar tienda de electrónicos
  const electronicsItems = [
    { name: 'Laptop Asus Vivobook 15', description: 'Portátil con procesador AMD Ryzen', price: 1500000 },
    { name: 'Mouse Logitech G502', description: 'Mouse gaming inalámbrico', price: 250000 },
    { name: 'Teclado Mecánico RGB', description: 'Teclado para gaming', price: 180000 }
  ]
  
  const electronicsContext = await BusinessContextDetector.detectFromItems(electronicsItems)
  logTest(
    'Detectar tienda de electrónicos',
    electronicsContext.type === 'STORE' && electronicsContext.confidence > 0.5,
    `Tipo: ${electronicsContext.type}, Subtipo: ${electronicsContext.subType}, Confianza: ${(electronicsContext.confidence * 100).toFixed(0)}%`
  )
  
  // Test 2: Detectar servicio de consultoría
  const consultingItems = [
    { name: 'Consultoría de Marketing Digital', description: 'Asesoría para tu negocio online', price: 500000 },
    { name: 'Coaching Empresarial', description: 'Sesiones de mentoria para emprendedores', price: 300000 }
  ]
  
  const consultingContext = await BusinessContextDetector.detectFromItems(consultingItems)
  logTest(
    'Detectar servicio de consultoría',
    consultingContext.type === 'SERVICE',
    `Tipo: ${consultingContext.type}, Subtipo: ${consultingContext.subType}, Confianza: ${(consultingContext.confidence * 100).toFixed(0)}%`
  )
  
  // Test 3: Detectar restaurante
  const restaurantItems = [
    { name: 'Hamburguesa Doble', description: 'Con queso, lechuga y tomate', price: 25000 },
    { name: 'Pizza Pepperoni', description: 'Pizza grande con pepperoni', price: 35000 },
    { name: 'Papas Fritas', description: 'Porción grande', price: 8000 }
  ]
  
  const restaurantContext = await BusinessContextDetector.detectFromItems(restaurantItems)
  logTest(
    'Detectar restaurante',
    restaurantContext.type === 'RESTAURANT',
    `Tipo: ${restaurantContext.type}, Subtipo: ${restaurantContext.subType}, Confianza: ${(restaurantContext.confidence * 100).toFixed(0)}%`
  )
  
  // Test 4: Detectar negocio híbrido
  const hybridItems = [
    { name: 'Laptop Dell XPS', description: 'Portátil premium', price: 3500000 },
    { name: 'Reparación de Computadores', description: 'Servicio técnico especializado', price: 80000 },
    { name: 'Instalación de Software', description: 'Configuración de programas', price: 50000 }
  ]
  
  const hybridContext = await BusinessContextDetector.detectFromItems(hybridItems)
  logTest(
    'Detectar negocio híbrido (tienda + servicios)',
    hybridContext.type === 'HYBRID' || hybridContext.features.hasPhysicalProducts,
    `Tipo: ${hybridContext.type}, Features: Productos=${hybridContext.features.hasPhysicalProducts}, Servicios=${hybridContext.features.hasServices}`
  )
  
  // Test 5: Detectar cursos digitales
  const digitalItems = [
    { name: 'Curso de Excel Avanzado', description: 'Aprende Excel desde cero', price: 150000 },
    { name: 'MegaPack de Trading', description: 'Pack completo de cursos de trading', price: 99000 },
    { name: 'Curso de Inglés Online', description: 'Aprende inglés en 3 meses', price: 200000 }
  ]
  
  const digitalContext = await BusinessContextDetector.detectFromItems(digitalItems)
  logTest(
    'Detectar productos digitales/cursos',
    digitalContext.features.hasDigitalProducts || digitalContext.subType === 'courses',
    `Tipo: ${digitalContext.type}, Subtipo: ${digitalContext.subType}`
  )
  
  return { electronicsContext, consultingContext, restaurantContext }
}

async function testFlowEngine(contexts: any) {
  log('\n🔄 PROBANDO FlowEngine', 'bold')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  
  // Test 1: Detectar saludo
  const greetingFlow = FlowEngine.detectFlow('Hola, buenos días', contexts.electronicsContext)
  logTest(
    'Detectar saludo → greeting',
    greetingFlow === 'greeting',
    `Flujo detectado: ${greetingFlow}`
  )
  
  // Test 2: Detectar consulta de producto
  const productFlow = FlowEngine.detectFlow('Tienes laptops?', contexts.electronicsContext)
  logTest(
    'Detectar consulta de producto → product_inquiry',
    productFlow === 'product_inquiry',
    `Flujo detectado: ${productFlow}`
  )
  
  // Test 3: Detectar intención de compra
  const purchaseFlow = FlowEngine.detectFlow('Sí, lo quiero comprar', contexts.electronicsContext)
  logTest(
    'Detectar intención de compra → product_purchase',
    purchaseFlow === 'product_purchase',
    `Flujo detectado: ${purchaseFlow}`
  )
  
  // Test 4: Detectar "más opciones"
  const moreFlow = FlowEngine.detectFlow('Tienes más referencias?', contexts.electronicsContext)
  logTest(
    'Detectar "más opciones" → more_options',
    moreFlow === 'more_options',
    `Flujo detectado: ${moreFlow}`
  )
  
  // Test 5: Detectar reserva de servicio
  const bookingFlow = FlowEngine.detectFlow('Quiero agendar una cita', contexts.consultingContext)
  logTest(
    'Detectar reserva de servicio → service_booking',
    bookingFlow === 'service_booking',
    `Flujo detectado: ${bookingFlow}`
  )
  
  // Test 6: Detectar menú de restaurante
  const menuFlow = FlowEngine.detectFlow('Quiero ver el menú', contexts.restaurantContext)
  logTest(
    'Detectar menú de restaurante → menu_display',
    menuFlow === 'menu_display',
    `Flujo detectado: ${menuFlow}`
  )
  
  // Test 7: Detectar soporte
  const supportFlow = FlowEngine.detectFlow('Tengo un problema con mi pedido', contexts.electronicsContext)
  logTest(
    'Detectar soporte → support',
    supportFlow === 'support',
    `Flujo detectado: ${supportFlow}`
  )
}

async function testTemplateGenerator(contexts: any) {
  log('\n📝 PROBANDO TemplateGenerator', 'bold')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  
  // Test 1: Generar tarjeta de producto
  const productGenerator = new TemplateGenerator(contexts.electronicsContext, {
    businessName: 'TecnoStore',
    tone: 'friendly'
  })
  
  const productCard = productGenerator.generateItemCard({
    id: '1',
    name: 'Laptop Asus Vivobook 15',
    description: 'Portátil con procesador AMD Ryzen 5, 8GB RAM, 512GB SSD',
    price: 1500000,
    stock: 5
  })
  
  logTest(
    'Generar tarjeta de producto',
    productCard.includes('Laptop Asus') && productCard.includes('1.500.000'),
    `Longitud: ${productCard.length} caracteres`
  )
  console.log('\n' + productCard.substring(0, 300) + '...\n')
  
  // Test 2: Generar tarjeta de servicio
  const serviceGenerator = new TemplateGenerator(contexts.consultingContext, {
    businessName: 'ConsultPro',
    tone: 'professional'
  })
  
  const serviceCard = serviceGenerator.generateItemCard({
    id: '2',
    name: 'Consultoría de Marketing',
    description: 'Asesoría personalizada para tu estrategia digital',
    price: 500000,
    duration: 60,
    requiresBooking: true
  })
  
  logTest(
    'Generar tarjeta de servicio',
    serviceCard.includes('Consultoría') && serviceCard.includes('500.000'),
    `Incluye duración: ${serviceCard.includes('60')}`
  )
  
  // Test 3: Generar saludo personalizado
  const greeting = productGenerator.generateGreeting()
  logTest(
    'Generar saludo con nombre de negocio',
    greeting.includes('TecnoStore'),
    `Saludo: "${greeting.substring(0, 50)}..."`
  )
  
  // Test 4: Generar lista de categoría
  const categoryList = productGenerator.generateCategoryList([
    { id: '1', name: 'Laptop Asus', price: 1500000 },
    { id: '2', name: 'Mouse Logitech', price: 250000 },
    { id: '3', name: 'Teclado RGB', price: 180000 }
  ], 'Computadores')
  
  logTest(
    'Generar lista de categoría',
    categoryList.includes('COMPUTADORES') && categoryList.includes('1️⃣'),
    `Items listados: 3`
  )
}

async function testCategoryAutoGenerator() {
  log('\n📁 PROBANDO CategoryAutoGenerator', 'bold')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  
  // Test 1: Detectar categoría de laptop
  const laptopSuggestion = await CategoryAutoGenerator.detectCategory(
    { name: 'Laptop Asus Vivobook 15', description: 'Portátil gaming', price: 1500000 },
    []
  )
  
  logTest(
    'Detectar categoría de laptop → Computadores',
    laptopSuggestion.category === 'Computadores',
    `Categoría: ${laptopSuggestion.category}, Confianza: ${(laptopSuggestion.confidence * 100).toFixed(0)}%`
  )
  
  // Test 2: Detectar categoría de curso
  const courseSuggestion = await CategoryAutoGenerator.detectCategory(
    { name: 'Curso de Excel Avanzado', description: 'Aprende Excel', price: 150000 },
    []
  )
  
  logTest(
    'Detectar categoría de curso → Cursos Online',
    courseSuggestion.category === 'Cursos Online',
    `Categoría: ${courseSuggestion.category}, Confianza: ${(courseSuggestion.confidence * 100).toFixed(0)}%`
  )
  
  // Test 3: Detectar categoría de comida
  const foodSuggestion = await CategoryAutoGenerator.detectCategory(
    { name: 'Hamburguesa Doble Queso', description: 'Con papas', price: 25000 },
    []
  )
  
  logTest(
    'Detectar categoría de comida → Comida Rápida',
    foodSuggestion.category === 'Comida Rápida',
    `Categoría: ${foodSuggestion.category}, Confianza: ${(foodSuggestion.confidence * 100).toFixed(0)}%`
  )
  
  // Test 4: Generar categorías automáticamente
  const items = [
    { name: 'Laptop Dell', description: 'Portátil', price: 2000000 },
    { name: 'Mouse Gamer', description: 'Mouse RGB', price: 150000 },
    { name: 'Curso de Python', description: 'Programación', price: 100000 },
    { name: 'MegaPack Trading', description: 'Cursos de trading', price: 99000 }
  ]
  
  const categories = await CategoryAutoGenerator.generateCategories(items)
  
  logTest(
    'Generar categorías automáticamente',
    categories.length >= 2,
    `Categorías generadas: ${categories.map(c => c.name).join(', ')}`
  )
}

async function runAllTests() {
  log('\n🚀 INICIANDO PRUEBAS DEL SISTEMA MULTI-SERVICIO', 'bold')
  log('═══════════════════════════════════════════════════\n', 'blue')
  
  try {
    // 1. Probar BusinessContextDetector
    const contexts = await testBusinessContextDetector()
    
    // 2. Probar FlowEngine
    await testFlowEngine(contexts)
    
    // 3. Probar TemplateGenerator
    await testTemplateGenerator(contexts)
    
    // 4. Probar CategoryAutoGenerator
    await testCategoryAutoGenerator()
    
    log('\n═══════════════════════════════════════════════════', 'blue')
    log('✅ TODAS LAS PRUEBAS COMPLETADAS', 'green')
    log('═══════════════════════════════════════════════════\n', 'blue')
    
  } catch (error) {
    log(`\n❌ ERROR EN PRUEBAS: ${error}`, 'red')
    console.error(error)
  }
}

// Ejecutar
runAllTests()
