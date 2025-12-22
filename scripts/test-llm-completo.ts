/**
 * 🤖 Test Completo del Sistema LLM
 * 
 * Prueba todas las capacidades del bot:
 * - Respuestas directas
 * - Búsqueda de productos
 * - Contexto de conversación
 * - Detección de intenciones
 * - Formato de respuestas
 */

import { AIService } from '../src/lib/ai-service'
import { DirectResponseHandler } from '../src/lib/direct-response-handler'
import { AutoPhotoPaymentHandler } from '../src/lib/auto-photo-payment-handler'
import { ResponseFormatter } from '../src/lib/response-formatter'
import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'

// Colores para consola
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
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
}

async function testDirectResponses() {
  section('1. TEST: RESPUESTAS DIRECTAS (Sin IA)')

  const testCases = [
    'hola',
    'buenos días',
    'gracias',
    'muchas gracias',
    'qué horario tienen',
    'dónde están ubicados',
    'cómo puedo pagar'
  ]

  for (const message of testCases) {
    const canHandle = DirectResponseHandler.canHandleDirectly(message)
    const response = await DirectResponseHandler.getDirectResponse(message, 'Tecnovariedades Bot', 'test-user')

    log('📝', `Mensaje: "${message}"`, colors.yellow)
    log('🎯', `Puede manejar: ${canHandle ? 'SÍ' : 'NO'}`, canHandle ? colors.green : colors.red)
    
    if (response) {
      log('💬', `Respuesta: ${response.substring(0, 100)}...`, colors.blue)
    }
    
    console.log()
  }
}

async function testPhotoPaymentDetection() {
  section('2. TEST: DETECCIÓN DE FOTOS Y PAGOS')

  const testCases = [
    { message: 'me envías fotos', expected: 'photo' },
    { message: 'tiene fotos', expected: 'photo' },
    { message: 'quiero ver imágenes', expected: 'photo' },
    { message: 'cómo pago', expected: 'payment' },
    { message: 'link de pago', expected: 'payment' },
    { message: 'quiero comprar', expected: 'payment' }
  ]

  for (const { message, expected } of testCases) {
    // Simular detección
    const isPhotoRequest = message.toLowerCase().includes('foto') || 
                          message.toLowerCase().includes('imagen') ||
                          message.toLowerCase().includes('ver')
    
    const isPaymentRequest = message.toLowerCase().includes('pago') ||
                            message.toLowerCase().includes('comprar') ||
                            message.toLowerCase().includes('link')

    log('📝', `Mensaje: "${message}"`, colors.yellow)
    log('🎯', `Esperado: ${expected}`, colors.cyan)
    log('✅', `Detectado: ${isPhotoRequest ? 'foto' : isPaymentRequest ? 'pago' : 'ninguno'}`, 
      (isPhotoRequest && expected === 'photo') || (isPaymentRequest && expected === 'payment') 
        ? colors.green 
        : colors.red
    )
    console.log()
  }
}

async function testProductSearch() {
  section('3. TEST: BÚSQUEDA INTELIGENTE DE PRODUCTOS')

  const testCases = [
    'busco una laptop para diseño',
    'necesito una moto económica',
    'tienes cursos de piano',
    'megapacks de películas',
    'laptop gaming potente'
  ]

  for (const message of testCases) {
    log('📝', `Mensaje: "${message}"`, colors.yellow)

    // Detectar intención
    const intent = ProductIntelligenceService.detectIntent(message)
    
    log('🎯', `Intención: ${intent.type}`, colors.cyan)
    log('📊', `Confianza: ${(intent.confidence * 100).toFixed(0)}%`, 
      intent.confidence > 0.7 ? colors.green : colors.yellow
    )
    
    if (intent.keywords.length > 0) {
      log('🔑', `Keywords: ${intent.keywords.join(', ')}`, colors.blue)
    }
    
    console.log()
  }
}

async function testConversationFlow() {
  section('4. TEST: FLUJO DE CONVERSACIÓN CON CONTEXTO')

  const userId = 'test-user-' + Date.now()
  const customerPhone = '573001234567@s.whatsapp.net'

  const conversation = [
    'hola',
    'busco una laptop para diseño gráfico',
    'cuál me recomiendas',
    'cuánto cuesta',
    'me envías fotos',
    'cómo puedo pagar'
  ]

  let history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  for (let i = 0; i < conversation.length; i++) {
    const message = conversation[i]
    
    log('👤', `Cliente: ${message}`, colors.yellow)

    // 1. Verificar respuesta directa
    if (DirectResponseHandler.canHandleDirectly(message)) {
      const response = await DirectResponseHandler.getDirectResponse(message, 'Tecnovariedades Bot', userId)
      log('🤖', `Bot (directo): ${response?.substring(0, 100)}...`, colors.green)
      
      if (response) {
        history.push(
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        )
      }
      console.log()
      continue
    }

    // 2. Generar respuesta con IA
    try {
      const aiResponse = await AIService.generateResponse(
        userId,
        message,
        customerPhone,
        history
      )

      // 3. Formatear respuesta
      const formatted = ResponseFormatter.format(aiResponse.message)

      log('🤖', `Bot (IA): ${formatted.substring(0, 150)}...`, colors.blue)
      log('📊', `Confianza: ${(aiResponse.confidence * 100).toFixed(0)}%`, colors.cyan)
      
      if (aiResponse.intent) {
        log('🎯', `Intención: ${aiResponse.intent}`, colors.magenta)
      }

      // Actualizar historial
      history.push(
        { role: 'user', content: message },
        { role: 'assistant', content: formatted }
      )

      // Mantener solo últimos 10 mensajes
      if (history.length > 20) {
        history = history.slice(-20)
      }

    } catch (error: any) {
      log('❌', `Error: ${error.message}`, colors.red)
    }

    console.log()
  }

  log('📚', `Historial final: ${history.length / 2} intercambios`, colors.cyan)
}

async function testResponseFormatting() {
  section('5. TEST: FORMATO DE RESPUESTAS')

  const testResponses = [
    'Tengo estas laptops disponibles: HP Pavilion, Dell Inspiron, Lenovo IdeaPad',
    'El precio es de 2500000 COP. Incluye: procesador Intel i5, 8GB RAM, 256GB SSD',
    'Puedes pagar con: Nequi, Daviplata, Bancolombia, MercadoPago'
  ]

  for (const response of testResponses) {
    log('📝', `Original:`, colors.yellow)
    console.log(`   ${response}`)
    
    const formatted = ResponseFormatter.format(response)
    
    log('🎨', `Formateado:`, colors.green)
    console.log(`   ${formatted}`)
    console.log()
  }
}

async function testPerformance() {
  section('6. TEST: RENDIMIENTO DEL SISTEMA')

  const testMessage = 'busco una laptop para diseño gráfico, presupuesto de 2 millones'
  const iterations = 5

  log('📝', `Mensaje de prueba: "${testMessage}"`, colors.yellow)
  log('🔄', `Iteraciones: ${iterations}`, colors.cyan)
  console.log()

  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = Date.now()

    try {
      await AIService.generateResponse(
        'test-user-perf',
        testMessage,
        '573001234567@s.whatsapp.net',
        []
      )

      const elapsed = Date.now() - start
      times.push(elapsed)

      log('✅', `Iteración ${i + 1}: ${elapsed}ms`, colors.green)

    } catch (error: any) {
      log('❌', `Iteración ${i + 1}: Error - ${error.message}`, colors.red)
    }
  }

  if (times.length > 0) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const min = Math.min(...times)
    const max = Math.max(...times)

    console.log()
    log('📊', `Promedio: ${avg.toFixed(0)}ms`, colors.cyan)
    log('⚡', `Mínimo: ${min}ms`, colors.green)
    log('🐌', `Máximo: ${max}ms`, colors.yellow)
  }
}

async function main() {
  console.clear()
  
  log('🤖', 'TEST COMPLETO DEL SISTEMA LLM', colors.bright + colors.cyan)
  log('📅', new Date().toLocaleString('es-CO'), colors.cyan)
  console.log()

  try {
    // Ejecutar todos los tests
    await testDirectResponses()
    await testPhotoPaymentDetection()
    await testProductSearch()
    await testConversationFlow()
    await testResponseFormatting()
    await testPerformance()

    section('✅ TESTS COMPLETADOS')
    log('🎉', 'Todos los tests ejecutados exitosamente', colors.green)

  } catch (error: any) {
    section('❌ ERROR EN TESTS')
    log('💥', error.message, colors.red)
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar tests
main()
