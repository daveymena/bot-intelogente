/**
 * 🧪 TEST COMPLETO DE FLUJO DE VENTAS
 * 
 * Simula conversaciones reales desde el saludo hasta el cierre de venta
 * Prueba con productos REALES de la base de datos
 * 
 * Escenarios:
 * 1. Saludo inicial → Presentación del negocio
 * 2. Búsqueda de productos (con typos, ambigüedades)
 * 3. Preguntas sobre productos específicos
 * 4. FAQ de productos digitales
 * 5. Objeciones de desconfianza
 * 6. Objeciones de precio
 * 7. Comparaciones
 * 8. Solicitud de métodos de pago
 * 9. Confirmación de compra
 * 10. Cierre de venta
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import Groq from 'groq-sdk'

const prisma = new PrismaClient()

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('\n' + colors.blue + '═'.repeat(70) + colors.reset)
  console.log(colors.bold + colors.cyan + `  ${title}` + colors.reset)
  console.log(colors.blue + '═'.repeat(70) + colors.reset)
}

// Interfaz para resultados
interface TestResult {
  scenario: string
  step: string
  message: string
  expectedBehavior: string
  response: string | null
  passed: boolean
  provider: string
  timeMs: number
  checks: { name: string; pass: boolean }[]
}

// Productos de prueba (se cargarán de la BD)
let realProducts: any[] = []

/**
 * Cargar productos reales de la base de datos
 */
async function loadRealProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 20,
      orderBy: { createdAt: 'desc' }
    })
    
    realProducts = products
    log(`\n✅ Cargados ${products.length} productos reales de la BD`, 'green')
    
    // Mostrar algunos productos
    log('\n📦 Productos disponibles para test:', 'cyan')
    products.slice(0, 5).forEach(p => {
      log(`   • ${p.name} - ${p.price?.toLocaleString('es-CO')} COP`, 'dim')
    })
    
    return products
  } catch (error: any) {
    log(`⚠️ Error cargando productos: ${error.message}`, 'yellow')
    return []
  }
}

/**
 * Consulta a Ollama (Easypanel)
 */
async function askOllama(
  message: string,
  context: string,
  timeoutMs: number = 60000
): Promise<{ response: string | null; timeMs: number }> {
  const startTime = Date.now()
  
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'https://ollama-ollama.ginee6.easypanel.host'
    const model = process.env.OLLAMA_MODEL || 'gemma2:2b'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${context}\n\nCliente: "${message}"\n\nResponde como agente de ventas:`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    const answer = data.response?.trim()
    const timeMs = Date.now() - startTime
    
    if (answer && answer.length > 20) {
      return { response: answer, timeMs }
    }
    
    return { response: null, timeMs }
  } catch (error: any) {
    const timeMs = Date.now() - startTime
    return { response: null, timeMs }
  }
}

/**
 * Consulta a Groq (fallback)
 */
async function askGroq(
  message: string,
  context: string
): Promise<{ response: string | null; timeMs: number }> {
  const startTime = Date.now()
  
  try {
    if (!process.env.GROQ_API_KEY) {
      return { response: null, timeMs: 0 }
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: message }
      ],
      temperature: 0.5,
      max_tokens: 400
    })

    const answer = completion.choices[0]?.message?.content?.trim()
    const timeMs = Date.now() - startTime
    
    return { response: answer || null, timeMs }
  } catch (error: any) {
    const timeMs = Date.now() - startTime
    return { response: null, timeMs }
  }
}

/**
 * Obtener respuesta de IA (Ollama primero, Groq fallback)
 */
async function getAIResponse(
  message: string,
  context: string
): Promise<{ response: string | null; provider: string; timeMs: number }> {
  // Intentar Ollama primero
  log(`   🦙 Consultando Ollama...`, 'dim')
  const ollamaResult = await askOllama(message, context)
  
  if (ollamaResult.response) {
    return { response: ollamaResult.response, provider: 'Ollama', timeMs: ollamaResult.timeMs }
  }
  
  // Fallback a Groq
  log(`   🧠 Fallback a Groq...`, 'dim')
  const groqResult = await askGroq(message, context)
  
  if (groqResult.response) {
    return { response: groqResult.response, provider: 'Groq', timeMs: groqResult.timeMs }
  }
  
  return { response: null, provider: 'None', timeMs: ollamaResult.timeMs + groqResult.timeMs }
}

/**
 * Generar contexto del sistema
 */
function generateSystemContext(products: any[]): string {
  const productList = products.slice(0, 10).map(p => 
    `- ${p.name}: ${p.price?.toLocaleString('es-CO')} COP - ${p.description?.substring(0, 100) || 'Sin descripción'}`
  ).join('\n')

  return `Eres un agente de ventas profesional de Tecnovariedades D&S en Colombia.

CATÁLOGO DE PRODUCTOS:
${productList}

REGLAS CRÍTICAS:
1. NUNCA inventes productos, precios o información que no esté en el catálogo
2. Responde en español colombiano natural y amigable
3. Si el cliente pregunta por algo que no tienes, dilo honestamente
4. Para productos digitales: pago único, entrega inmediata por Google Drive, acceso de por vida
5. Métodos de pago: Nequi, Daviplata, MercadoPago, PayPal
6. Máximo 5-6 líneas de respuesta
7. Usa emojis con moderación (2-3 máximo)

PROCESO DE VENTA:
1. Saludo → Presentar el negocio brevemente
2. Identificar necesidad → Mostrar productos relevantes
3. Resolver dudas → Dar información precisa
4. Manejar objeciones → Ser empático y ofrecer garantías
5. Cerrar venta → Dar datos de pago cuando el cliente confirme`
}

/**
 * Evaluar respuesta
 */
function evaluateResponse(
  response: string,
  expectedBehavior: string,
  products: any[]
): { name: string; pass: boolean }[] {
  const checks: { name: string; pass: boolean }[] = []
  
  // Longitud adecuada
  checks.push({ 
    name: 'Longitud adecuada (>50 chars)', 
    pass: response.length > 50 
  })
  
  // No es agresivo
  const isAggressive = /(mentiroso|tonto|estúpido|idiota|imbécil)/i.test(response)
  checks.push({ 
    name: 'No es agresivo', 
    pass: !isAggressive 
  })
  
  // Está en español
  const isSpanish = /[áéíóúñ¿¡]/i.test(response) || /(hola|gracias|precio|producto|curso)/i.test(response)
  checks.push({ 
    name: 'Responde en español', 
    pass: isSpanish 
  })
  
  // Verificaciones específicas según el comportamiento esperado
  if (expectedBehavior.includes('saludo')) {
    const hasGreeting = /(hola|bienvenid|buenos|buenas|qué tal)/i.test(response)
    checks.push({ name: 'Incluye saludo', pass: hasGreeting })
  }
  
  if (expectedBehavior.includes('producto')) {
    const mentionsProduct = products.some(p => 
      response.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
    )
    checks.push({ name: 'Menciona producto del catálogo', pass: mentionsProduct })
  }
  
  if (expectedBehavior.includes('precio')) {
    const hasPrice = /\d{1,3}([.,]\d{3})*\s*(cop|pesos)?/i.test(response)
    checks.push({ name: 'Menciona precio', pass: hasPrice })
  }
  
  if (expectedBehavior.includes('empatía')) {
    const hasEmpathy = /(entiendo|comprendo|normal|tranquil|preocup)/i.test(response)
    checks.push({ name: 'Muestra empatía', pass: hasEmpathy })
  }
  
  if (expectedBehavior.includes('garantía')) {
    const hasGuarantee = /(garant|devol|segur|confi)/i.test(response)
    checks.push({ name: 'Ofrece garantía', pass: hasGuarantee })
  }
  
  if (expectedBehavior.includes('pago')) {
    const hasPayment = /(nequi|daviplata|mercadopago|paypal|pago|transferencia)/i.test(response)
    checks.push({ name: 'Menciona método de pago', pass: hasPayment })
  }
  
  return checks
}

/**
 * Ejecutar un paso del flujo
 */
async function runStep(
  scenario: string,
  step: string,
  message: string,
  expectedBehavior: string,
  context: string
): Promise<TestResult> {
  log(`\n💬 Cliente: "${message}"`, 'cyan')
  
  const { response, provider, timeMs } = await getAIResponse(message, context)
  
  if (response) {
    log(`\n🤖 Bot (${provider} - ${timeMs}ms):`, 'magenta')
    console.log(`${colors.white}${response}${colors.reset}\n`)
  } else {
    log(`\n❌ Sin respuesta`, 'red')
  }
  
  const checks = response ? evaluateResponse(response, expectedBehavior, realProducts) : []
  const passed = response !== null && checks.filter(c => !c.pass).length === 0
  
  // Mostrar evaluación
  if (checks.length > 0) {
    log('📊 Evaluación:', 'yellow')
    checks.forEach(c => {
      log(`   ${c.pass ? '✅' : '❌'} ${c.name}`, c.pass ? 'green' : 'red')
    })
  }
  
  return {
    scenario,
    step,
    message,
    expectedBehavior,
    response,
    passed,
    provider,
    timeMs,
    checks
  }
}

/**
 * Flujo de venta completo - Producto Digital
 */
async function testFlujoProductoDigital(): Promise<TestResult[]> {
  logSection('🎓 FLUJO COMPLETO: VENTA DE PRODUCTO DIGITAL')
  
  const context = generateSystemContext(realProducts)
  const results: TestResult[] = []
  
  // Buscar un producto digital real
  const digitalProduct = realProducts.find(p => 
    p.name.toLowerCase().includes('curso') || 
    p.name.toLowerCase().includes('mega') ||
    p.name.toLowerCase().includes('pack')
  ) || realProducts[0]
  
  log(`\n📦 Producto objetivo: ${digitalProduct?.name || 'Ninguno'}`, 'cyan')
  
  const steps = [
    {
      step: '1. Saludo inicial',
      message: 'hola buenas tardes',
      expected: 'saludo, presentación'
    },
    {
      step: '2. Consulta general',
      message: 'que cursos tienen disponibles?',
      expected: 'producto, catálogo'
    },
    {
      step: '3. Interés específico (con typo)',
      message: 'tienen algo de pano o musica?',
      expected: 'producto, precio'
    },
    {
      step: '4. Pregunta sobre contenido',
      message: 'que incluye el curso? es completo?',
      expected: 'producto, descripción'
    },
    {
      step: '5. FAQ - Pagos adicionales',
      message: 'y despues hay que pagar algo mas o es todo?',
      expected: 'garantía, pago único'
    },
    {
      step: '6. Objeción de desconfianza',
      message: 'pero como se que no es estafa? muchos venden y no mandan nada',
      expected: 'empatía, garantía'
    },
    {
      step: '7. Objeción de precio',
      message: 'esta un poco caro, no hay descuento?',
      expected: 'empatía, valor'
    },
    {
      step: '8. Comparación',
      message: 'y que diferencia tiene con los cursos gratis de youtube?',
      expected: 'producto, valor'
    },
    {
      step: '9. Solicitud de pago',
      message: 'ok me interesa, como puedo pagar?',
      expected: 'pago, métodos'
    },
    {
      step: '10. Confirmación de compra',
      message: 'listo, voy a pagar por nequi',
      expected: 'pago, instrucciones'
    }
  ]
  
  for (const s of steps) {
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 ${s.step}`, 'bold')
    
    const result = await runStep(
      'Producto Digital',
      s.step,
      s.message,
      s.expected,
      context
    )
    results.push(result)
    
    // Pausa entre pasos
    await new Promise(r => setTimeout(r, 2000))
  }
  
  return results
}

/**
 * Flujo de venta - Producto Físico
 */
async function testFlujoProductoFisico(): Promise<TestResult[]> {
  logSection('💻 FLUJO COMPLETO: VENTA DE PRODUCTO FÍSICO')
  
  const context = generateSystemContext(realProducts)
  const results: TestResult[] = []
  
  // Buscar un producto físico real
  const physicalProduct = realProducts.find(p => 
    p.name.toLowerCase().includes('laptop') || 
    p.name.toLowerCase().includes('computador') ||
    p.name.toLowerCase().includes('portatil') ||
    p.name.toLowerCase().includes('moto')
  ) || realProducts[0]
  
  log(`\n📦 Producto objetivo: ${physicalProduct?.name || 'Ninguno'}`, 'cyan')
  
  const steps = [
    {
      step: '1. Saludo con consulta',
      message: 'buenas, tienen computadores?',
      expected: 'saludo, producto'
    },
    {
      step: '2. Especificación de necesidad',
      message: 'necesito uno para trabajar y estudiar, que me recomiendas?',
      expected: 'producto, recomendación'
    },
    {
      step: '3. Consulta de precio',
      message: 'cuanto cuesta ese?',
      expected: 'precio'
    },
    {
      step: '4. Pregunta técnica',
      message: 'tiene garantia? y si se daña?',
      expected: 'garantía'
    },
    {
      step: '5. Consulta de envío',
      message: 'hacen envios? estoy en medellin',
      expected: 'envío, logística'
    },
    {
      step: '6. Decisión de compra',
      message: 'me lo llevo, como pago?',
      expected: 'pago, métodos'
    }
  ]
  
  for (const s of steps) {
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 ${s.step}`, 'bold')
    
    const result = await runStep(
      'Producto Físico',
      s.step,
      s.message,
      s.expected,
      context
    )
    results.push(result)
    
    await new Promise(r => setTimeout(r, 2000))
  }
  
  return results
}

/**
 * Test de búsquedas con errores ortográficos
 */
async function testBusquedasConTypos(): Promise<TestResult[]> {
  logSection('🔍 TEST: BÚSQUEDAS CON ERRORES ORTOGRÁFICOS')
  
  const context = generateSystemContext(realProducts)
  const results: TestResult[] = []
  
  const searches = [
    { message: 'tienen cursos de pano?', expected: 'producto' },
    { message: 'quiero un megapak de idiomas', expected: 'producto' },
    { message: 'busco portatil gamer', expected: 'producto' },
    { message: 'hay motos disponibles?', expected: 'producto' },
    { message: 'cursos de ingles o idiomas', expected: 'producto' },
    { message: 'algo para aprender guitara', expected: 'producto' },
    { message: 'tienen el golden pack?', expected: 'producto' },
    { message: 'quiero el mega pack completo', expected: 'producto, precio' }
  ]
  
  for (let i = 0; i < searches.length; i++) {
    const s = searches[i]
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 Búsqueda ${i + 1}/${searches.length}`, 'bold')
    
    const result = await runStep(
      'Búsqueda con typos',
      `Búsqueda ${i + 1}`,
      s.message,
      s.expected,
      context
    )
    results.push(result)
    
    await new Promise(r => setTimeout(r, 2000))
  }
  
  return results
}

/**
 * Test de manejo de objeciones
 */
async function testManejoObjeciones(): Promise<TestResult[]> {
  logSection('🛡️ TEST: MANEJO DE OBJECIONES')
  
  const context = generateSystemContext(realProducts)
  const results: TestResult[] = []
  
  const objections = [
    { 
      message: 'no confio, seguro es estafa', 
      expected: 'empatía, garantía' 
    },
    { 
      message: 'esta muy caro, no vale eso', 
      expected: 'empatía, valor' 
    },
    { 
      message: 'despues piden mas plata y no mandan nada', 
      expected: 'empatía, garantía' 
    },
    { 
      message: 'mejor busco en youtube gratis', 
      expected: 'valor, diferenciación' 
    },
    { 
      message: 'no tengo plata ahorita', 
      expected: 'empatía, opciones' 
    },
    { 
      message: 'tengo que pensarlo', 
      expected: 'empatía, seguimiento' 
    }
  ]
  
  for (let i = 0; i < objections.length; i++) {
    const o = objections[i]
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 Objeción ${i + 1}/${objections.length}`, 'bold')
    
    const result = await runStep(
      'Manejo de objeciones',
      `Objeción ${i + 1}`,
      o.message,
      o.expected,
      context
    )
    results.push(result)
    
    await new Promise(r => setTimeout(r, 2000))
  }
  
  return results
}

/**
 * Generar resumen final
 */
function generateSummary(allResults: TestResult[]) {
  logSection('📊 RESUMEN FINAL DE TESTS')
  
  const total = allResults.length
  const passed = allResults.filter(r => r.passed).length
  const failed = total - passed
  
  // Por escenario
  const byScenario = allResults.reduce((acc, r) => {
    if (!acc[r.scenario]) acc[r.scenario] = { total: 0, passed: 0 }
    acc[r.scenario].total++
    if (r.passed) acc[r.scenario].passed++
    return acc
  }, {} as Record<string, { total: number; passed: number }>)
  
  // Por proveedor
  const byProvider = allResults.reduce((acc, r) => {
    if (!acc[r.provider]) acc[r.provider] = 0
    acc[r.provider]++
    return acc
  }, {} as Record<string, number>)
  
  // Tiempo promedio
  const avgTime = Math.round(allResults.reduce((sum, r) => sum + r.timeMs, 0) / total)
  
  log(`\n📈 RESULTADOS GENERALES:`, 'bold')
  log(`   ✅ Pasaron: ${passed}/${total} (${Math.round(passed/total*100)}%)`, 'green')
  log(`   ❌ Fallaron: ${failed}/${total}`, failed > 0 ? 'red' : 'green')
  log(`   ⏱️ Tiempo promedio: ${avgTime}ms`, 'yellow')
  
  log(`\n📋 POR ESCENARIO:`, 'bold')
  Object.entries(byScenario).forEach(([scenario, stats]) => {
    const pct = Math.round(stats.passed / stats.total * 100)
    const color = pct === 100 ? 'green' : pct >= 70 ? 'yellow' : 'red'
    log(`   ${pct === 100 ? '✅' : '⚠️'} ${scenario}: ${stats.passed}/${stats.total} (${pct}%)`, color)
  })
  
  log(`\n🔧 PROVEEDORES USADOS:`, 'bold')
  Object.entries(byProvider).forEach(([provider, count]) => {
    log(`   ${provider === 'Ollama' ? '🦙' : provider === 'Groq' ? '🧠' : '❓'} ${provider}: ${count} respuestas`, 'cyan')
  })
  
  // Tests fallidos
  const failedTests = allResults.filter(r => !r.passed)
  if (failedTests.length > 0) {
    log(`\n❌ TESTS FALLIDOS:`, 'red')
    failedTests.forEach(t => {
      log(`   • ${t.scenario} - ${t.step}`, 'red')
      log(`     Mensaje: "${t.message}"`, 'dim')
      t.checks.filter(c => !c.pass).forEach(c => {
        log(`     ❌ ${c.name}`, 'red')
      })
    })
  }
  
  return { total, passed, failed, avgTime }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  log('\n' + '🚀'.repeat(35), 'blue')
  log(colors.bold + '\n   TEST COMPLETO DE FLUJO DE VENTAS - SMART SALES BOT PRO\n' + colors.reset)
  log('🚀'.repeat(35) + '\n', 'blue')
  
  log(`📅 Fecha: ${new Date().toLocaleString('es-CO')}`, 'dim')
  log(`🌐 Ollama URL: ${process.env.OLLAMA_BASE_URL || 'No configurada'}`, 'dim')
  log(`🤖 Modelo: ${process.env.OLLAMA_MODEL || 'gemma2:2b'}`, 'dim')
  
  // Cargar productos reales
  await loadRealProducts()
  
  if (realProducts.length === 0) {
    log('\n⚠️ No hay productos en la BD. Usando productos de ejemplo.', 'yellow')
    realProducts = [
      { name: 'Mega Pack Curso de Piano Completo', price: 60000, description: 'Aprende piano desde cero' },
      { name: 'MegaPack Golden 60000', price: 60000, description: 'Pack completo de cursos' },
      { name: 'Curso de Idiomas Completo', price: 45000, description: 'Aprende 5 idiomas' }
    ]
  }
  
  const allResults: TestResult[] = []
  
  // Ejecutar todos los flujos
  try {
    const digitalResults = await testFlujoProductoDigital()
    allResults.push(...digitalResults)
    
    const physicalResults = await testFlujoProductoFisico()
    allResults.push(...physicalResults)
    
    const typoResults = await testBusquedasConTypos()
    allResults.push(...typoResults)
    
    const objectionResults = await testManejoObjeciones()
    allResults.push(...objectionResults)
  } catch (error: any) {
    log(`\n❌ Error durante los tests: ${error.message}`, 'red')
  }
  
  // Generar resumen
  const summary = generateSummary(allResults)
  
  // Resultado final
  log('\n' + '═'.repeat(70), 'blue')
  if (summary.passed === summary.total) {
    log('🎉 ¡TODOS LOS TESTS PASARON! El bot está listo para producción.', 'green')
  } else if (summary.passed / summary.total >= 0.8) {
    log('✅ La mayoría de tests pasaron. Revisar los fallidos.', 'yellow')
  } else {
    log('⚠️ Varios tests fallaron. Se requiere revisión.', 'red')
  }
  log('═'.repeat(70) + '\n', 'blue')
  
  await prisma.$disconnect()
}

// Ejecutar
runAllTests().catch(console.error)
