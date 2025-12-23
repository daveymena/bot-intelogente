/**
 * 🧪 TEST COMPLETO DE FLUJO DE VENTAS - USANDO SISTEMA REAL
 * 
 * Este test usa el SalesAgentSimple REAL del bot
 * para garantizar que las respuestas sean consistentes
 * 
 * Escenarios:
 * 1. Saludo inicial
 * 2. Búsqueda de productos (con typos)
 * 3. Preguntas sobre productos
 * 4. FAQ de productos digitales
 * 5. Objeciones de desconfianza
 * 6. Objeciones de precio
 * 7. Solicitud de métodos de pago
 * 8. Confirmación de compra
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

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
  response: string | null
  passed: boolean
  timeMs: number
  checks: { name: string; pass: boolean }[]
}

// Importar el SalesAgentSimple real
let SalesAgentSimple: any = null

async function loadSalesAgent() {
  try {
    const module = await import('../src/lib/sales-agent-simple')
    SalesAgentSimple = module.SalesAgentSimple
    log('✅ SalesAgentSimple cargado correctamente', 'green')
    return true
  } catch (error: any) {
    log(`❌ Error cargando SalesAgentSimple: ${error.message}`, 'red')
    return false
  }
}

// Obtener usuario de prueba
async function getTestUser() {
  try {
    const user = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    if (user) {
      log(`✅ Usuario de prueba: ${user.email}`, 'green')
      return user
    }
    log('⚠️ No se encontró usuario admin', 'yellow')
    return null
  } catch (error: any) {
    log(`⚠️ Error obteniendo usuario: ${error.message}`, 'yellow')
    return null
  }
}

/**
 * Evaluar respuesta del bot
 */
function evaluateResponse(
  response: string,
  expectedChecks: string[]
): { name: string; pass: boolean }[] {
  const checks: { name: string; pass: boolean }[] = []
  
  // Siempre verificar longitud
  checks.push({ 
    name: 'Tiene respuesta (>30 chars)', 
    pass: response.length > 30 
  })
  
  // Verificar que esté en español
  const isSpanish = /[áéíóúñ¿¡]/i.test(response) || /(hola|gracias|precio|producto|curso|pago)/i.test(response)
  checks.push({ 
    name: 'Responde en español', 
    pass: isSpanish 
  })
  
  // Verificaciones específicas
  for (const check of expectedChecks) {
    switch (check) {
      case 'saludo':
        checks.push({ 
          name: 'Incluye saludo/bienvenida', 
          pass: /(hola|bienvenid|buenos|buenas)/i.test(response) 
        })
        break
      case 'producto':
        checks.push({ 
          name: 'Menciona producto', 
          pass: /(curso|mega|pack|piano|idioma)/i.test(response) 
        })
        break
      case 'precio':
        checks.push({ 
          name: 'Menciona precio', 
          pass: /\d{1,3}([.,]\d{3})*\s*(cop|pesos)?/i.test(response) 
        })
        break
      case 'empatia':
        checks.push({ 
          name: 'Muestra empatía', 
          pass: /(entiendo|comprendo|normal|tranquil|preocup|claro)/i.test(response) 
        })
        break
      case 'garantia':
        checks.push({ 
          name: 'Ofrece garantía/seguridad', 
          pass: /(garant|devol|segur|confi|completo|todo el material)/i.test(response) 
        })
        break
      case 'pago':
        checks.push({ 
          name: 'Menciona método de pago', 
          pass: /(nequi|daviplata|mercadopago|paypal|pago|transferencia)/i.test(response) 
        })
        break
      case 'entrega':
        checks.push({ 
          name: 'Menciona entrega/Google Drive', 
          pass: /(google drive|entrega|inmediata|link|acceso)/i.test(response) 
        })
        break
      case 'pago_unico':
        checks.push({ 
          name: 'Menciona pago único', 
          pass: /(pago único|una sola vez|no pedimos más|sin pagos adicionales)/i.test(response) 
        })
        break
    }
  }
  
  return checks
}

/**
 * Ejecutar un paso del flujo usando el bot real
 */
async function runStep(
  agent: any,
  scenario: string,
  step: string,
  message: string,
  expectedChecks: string[],
  phoneNumber: string = '573001234567'
): Promise<TestResult> {
  log(`\n💬 Cliente: "${message}"`, 'cyan')
  
  const startTime = Date.now()
  let response: string | null = null
  
  try {
    const result = await agent.processMessage(message, phoneNumber)
    const timeMs = Date.now() - startTime
    
    // Extraer el texto de la respuesta (puede ser objeto o string)
    if (result) {
      if (typeof result === 'string') {
        response = result
      } else if (result.text) {
        response = result.text
      } else if (result.response) {
        response = result.response
      }
    }
    
    if (response) {
      log(`\n🤖 Bot (${timeMs}ms):`, 'magenta')
      console.log(`${colors.white}${response}${colors.reset}\n`)
    } else {
      log(`\n❌ Sin respuesta (resultado: ${JSON.stringify(result)?.substring(0, 100)})`, 'red')
    }
    
    const checks = response ? evaluateResponse(response, expectedChecks) : []
    const failedChecks = checks.filter(c => !c.pass)
    const passed = response !== null && failedChecks.length === 0
    
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
      response,
      passed,
      timeMs,
      checks
    }
  } catch (error: any) {
    log(`\n❌ Error: ${error.message}`, 'red')
    return {
      scenario,
      step,
      message,
      response: null,
      passed: false,
      timeMs: Date.now() - startTime,
      checks: []
    }
  }
}

/**
 * Test de flujo completo de venta digital
 */
async function testFlujoVentaDigital(agent: any): Promise<TestResult[]> {
  logSection('🎓 FLUJO COMPLETO: VENTA DE PRODUCTO DIGITAL')
  
  const results: TestResult[] = []
  const phone = '573001234567'
  
  const steps = [
    {
      step: '1. Saludo inicial',
      message: 'hola buenas tardes',
      checks: ['saludo']
    },
    {
      step: '2. Consulta de cursos',
      message: 'que cursos tienen?',
      checks: ['producto']
    },
    {
      step: '3. Interés en piano (con typo)',
      message: 'tienen algo de pano?',
      checks: ['producto', 'precio']
    },
    {
      step: '4. Pregunta sobre contenido',
      message: 'que incluye el curso de piano?',
      checks: ['producto']
    },
    {
      step: '5. FAQ - Pagos adicionales',
      message: 'despues hay que pagar algo mas?',
      checks: ['pago_unico', 'garantia']
    },
    {
      step: '6. Objeción de desconfianza',
      message: 'pero como se que no es estafa? muchos venden y no mandan nada',
      checks: ['empatia', 'garantia', 'entrega']
    },
    {
      step: '7. Objeción de precio',
      message: 'esta caro, no hay descuento?',
      checks: ['empatia', 'producto']
    },
    {
      step: '8. Solicitud de pago',
      message: 'ok me interesa, como pago?',
      checks: ['pago']
    },
    {
      step: '9. Confirmación Nequi',
      message: 'voy a pagar por nequi',
      checks: ['pago']
    }
  ]
  
  for (const s of steps) {
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 ${s.step}`, 'bold')
    
    const result = await runStep(agent, 'Venta Digital', s.step, s.message, s.checks, phone)
    results.push(result)
    
    // Pausa entre pasos para simular conversación real
    await new Promise(r => setTimeout(r, 1000))
  }
  
  return results
}

/**
 * Test de búsquedas con errores ortográficos
 */
async function testBusquedasTypos(agent: any): Promise<TestResult[]> {
  logSection('🔍 TEST: BÚSQUEDAS CON ERRORES ORTOGRÁFICOS')
  
  const results: TestResult[] = []
  const phone = '573009876543'
  
  const searches = [
    { message: 'tienen cursos de pano?', checks: ['producto'] },
    { message: 'quiero un megapak', checks: ['producto'] },
    { message: 'cursos de ingles', checks: ['producto'] },
    { message: 'el golden pack', checks: ['producto', 'precio'] },
    { message: 'mega pack completo', checks: ['producto', 'precio'] }
  ]
  
  for (let i = 0; i < searches.length; i++) {
    const s = searches[i]
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 Búsqueda ${i + 1}/${searches.length}`, 'bold')
    
    const result = await runStep(agent, 'Búsquedas', `Búsqueda ${i + 1}`, s.message, s.checks, phone)
    results.push(result)
    
    await new Promise(r => setTimeout(r, 1000))
  }
  
  return results
}

/**
 * Test de manejo de objeciones
 */
async function testObjeciones(agent: any): Promise<TestResult[]> {
  logSection('🛡️ TEST: MANEJO DE OBJECIONES')
  
  const results: TestResult[] = []
  const phone = '573005555555'
  
  // Primero establecer contexto con un producto
  await agent.processMessage('quiero el curso de piano', phone)
  await new Promise(r => setTimeout(r, 500))
  
  const objections = [
    { 
      message: 'no confio, seguro es estafa', 
      checks: ['empatia', 'garantia'] 
    },
    { 
      message: 'despues piden mas plata', 
      checks: ['empatia', 'pago_unico'] 
    },
    { 
      message: 'esta muy caro', 
      checks: ['empatia'] 
    },
    { 
      message: 'no tengo plata ahorita', 
      checks: ['empatia'] 
    }
  ]
  
  for (let i = 0; i < objections.length; i++) {
    const o = objections[i]
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 Objeción ${i + 1}/${objections.length}`, 'bold')
    
    const result = await runStep(agent, 'Objeciones', `Objeción ${i + 1}`, o.message, o.checks, phone)
    results.push(result)
    
    await new Promise(r => setTimeout(r, 1000))
  }
  
  return results
}

/**
 * Test de FAQ de productos digitales
 */
async function testFAQDigitales(agent: any): Promise<TestResult[]> {
  logSection('❓ TEST: FAQ DE PRODUCTOS DIGITALES')
  
  const results: TestResult[] = []
  const phone = '573007777777'
  
  // Establecer contexto
  await agent.processMessage('me interesa el mega pack golden', phone)
  await new Promise(r => setTimeout(r, 500))
  
  const faqs = [
    { 
      message: 'es curso completo o hay que pagar mas?', 
      checks: ['pago_unico', 'garantia'] 
    },
    { 
      message: 'como me llega el curso?', 
      checks: ['entrega'] 
    },
    { 
      message: 'el acceso es para siempre?', 
      checks: ['garantia'] 
    },
    { 
      message: 'puedo descargarlo?', 
      checks: ['entrega'] 
    }
  ]
  
  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i]
    log(`\n${'─'.repeat(50)}`, 'dim')
    log(`📍 FAQ ${i + 1}/${faqs.length}`, 'bold')
    
    const result = await runStep(agent, 'FAQ Digitales', `FAQ ${i + 1}`, f.message, f.checks, phone)
    results.push(result)
    
    await new Promise(r => setTimeout(r, 1000))
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
  
  // Tiempo promedio
  const avgTime = Math.round(allResults.filter(r => r.timeMs > 0).reduce((sum, r) => sum + r.timeMs, 0) / total)
  
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
  log(colors.bold + '\n   TEST DE FLUJO DE VENTAS - SISTEMA REAL\n' + colors.reset)
  log('🚀'.repeat(35) + '\n', 'blue')
  
  log(`📅 Fecha: ${new Date().toLocaleString('es-CO')}`, 'dim')
  
  // Cargar el módulo del bot
  const loaded = await loadSalesAgent()
  if (!loaded) {
    log('\n❌ No se pudo cargar el sistema del bot. Abortando.', 'red')
    await prisma.$disconnect()
    return
  }
  
  // Obtener usuario de prueba
  const user = await getTestUser()
  if (!user) {
    log('\n⚠️ Continuando sin usuario específico...', 'yellow')
  }
  
  // Crear instancia del agente
  const agent = new SalesAgentSimple()
  
  // Establecer userId si existe (multi-tenant)
  if (user?.id) {
    agent.setUserId(user.id)
  }
  
  log('✅ Agente de ventas inicializado', 'green')
  
  const allResults: TestResult[] = []
  
  try {
    // Ejecutar todos los flujos
    const digitalResults = await testFlujoVentaDigital(agent)
    allResults.push(...digitalResults)
    
    const typoResults = await testBusquedasTypos(agent)
    allResults.push(...typoResults)
    
    const objectionResults = await testObjeciones(agent)
    allResults.push(...objectionResults)
    
    const faqResults = await testFAQDigitales(agent)
    allResults.push(...faqResults)
    
  } catch (error: any) {
    log(`\n❌ Error durante los tests: ${error.message}`, 'red')
    console.error(error)
  }
  
  // Generar resumen
  const summary = generateSummary(allResults)
  
  // Resultado final
  log('\n' + '═'.repeat(70), 'blue')
  if (summary.passed === summary.total) {
    log('🎉 ¡TODOS LOS TESTS PASARON! El bot está listo.', 'green')
  } else if (summary.passed / summary.total >= 0.9) {
    log('✅ Excelente! 90%+ de tests pasaron.', 'green')
  } else if (summary.passed / summary.total >= 0.8) {
    log('⚠️ La mayoría de tests pasaron. Revisar los fallidos.', 'yellow')
  } else {
    log('❌ Varios tests fallaron. Se requiere revisión.', 'red')
  }
  log('═'.repeat(70) + '\n', 'blue')
  
  await prisma.$disconnect()
}

// Ejecutar
runAllTests().catch(console.error)
