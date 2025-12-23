/**
 * 🧪 Test de Conversaciones que Requieren Razonamiento
 * 
 * Prueba escenarios donde el bot necesita:
 * - Manejar objeciones de desconfianza
 * - Responder FAQ de productos digitales
 * - Dar información convincente
 * 
 * Usa Ollama primero (timeout largo) y Groq como fallback
 */

import 'dotenv/config'
import Groq from 'groq-sdk'

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Producto de prueba
const testProduct = {
  name: 'Mega Pack Curso de Piano Completo',
  price: 60000,
  description: '🎹 Aprende piano desde cero hasta nivel avanzado. 19 horas de video + 157 recursos. Estilos: Clásico, Jazz, Blues, Pop, Balada.'
}

// Escenarios de prueba
const testScenarios = [
  {
    name: '🔴 Desconfianza: "Es estafa, piden más plata"',
    message: 'pero si es todo ho enpiesan que son sesenta mil y des pues piden más plata y no mandan todo el material y es pura tomada de pelo',
    expectedIntent: 'distrust_objection',
    requiresReasoning: true
  },
  {
    name: '🔴 Desconfianza: "No confío, es mentira"',
    message: 'no confio en eso, seguro es mentira y despues no mandan nada',
    expectedIntent: 'distrust_objection',
    requiresReasoning: true
  },
  {
    name: '🟡 FAQ: "¿Es curso completo?"',
    message: 'es un curso completo o hay que pagar mas despues?',
    expectedIntent: 'digital_product_faq',
    requiresReasoning: false
  },
  {
    name: '🟡 FAQ: "¿Cómo lo recibo?"',
    message: 'como me llega el curso? por donde lo envian?',
    expectedIntent: 'digital_product_faq',
    requiresReasoning: false
  },
  {
    name: '🟡 FAQ: "¿Acceso de por vida?"',
    message: 'el acceso es para siempre o tiene fecha de vencimiento?',
    expectedIntent: 'digital_product_faq',
    requiresReasoning: false
  },
  {
    name: '🟢 Pregunta compleja: "¿Vale la pena?"',
    message: 'pero vale la pena? osea si aprendo de verdad o es puro relleno?',
    expectedIntent: 'general_inquiry',
    requiresReasoning: true
  },
  {
    name: '🟢 Objeción de precio',
    message: 'esta muy caro, no hay algo mas barato?',
    expectedIntent: 'rejection',
    requiresReasoning: true
  },
  {
    name: '🟢 Comparación',
    message: 'y que diferencia tiene con los cursos gratis de youtube?',
    expectedIntent: 'general_inquiry',
    requiresReasoning: true
  }
]

/**
 * Consulta a Ollama con timeout extendido para razonamiento
 */
async function askOllamaWithReasoning(
  message: string, 
  product: any,
  timeoutMs: number = 60000
): Promise<{ response: string | null; timeMs: number }> {
  const startTime = Date.now()
  
  try {
    // Usar OLLAMA_BASE_URL de Easypanel o fallback a localhost
    const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://localhost:11434'
    const model = process.env.OLLAMA_MODEL || 'gemma2:2b'
    
    log(`\n🦙 Consultando Ollama en Easypanel...`, 'cyan')
    log(`   URL: ${ollamaUrl}`, 'cyan')
    log(`   Modelo: ${model}`, 'cyan')
    log(`   Timeout: ${timeoutMs/1000}s`, 'cyan')
    
    const systemPrompt = `Eres un agente de ventas profesional y empático de Tecnovariedades D&S en Colombia.

PRODUCTO EN CONTEXTO:
- Nombre: ${product.name}
- Precio: ${product.price.toLocaleString('es-CO')} COP
- Descripción: ${product.description}

REGLAS CRÍTICAS:
1. NUNCA inventes información - usa solo los datos del producto
2. Responde en español colombiano natural y amigable
3. Si el cliente tiene dudas o desconfianza, sé empático y da garantías reales
4. Destaca: pago único, entrega inmediata por Google Drive, acceso de por vida
5. Máximo 5-6 líneas de respuesta
6. Usa emojis con moderación (2-3 máximo)

CÓMO MANEJAR OBJECIONES DE DESCONFIANZA:
- Reconoce que es normal tener dudas
- Explica el proceso: pago → comprobante → link inmediato
- Ofrece garantía de devolución si no recibe el material
- Menciona que llevas años vendiendo y tienes clientes satisfechos
- NO te pongas a la defensiva`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\nCliente dice: "${message}"\n\nResponde de forma empática y convincente:`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 400 // Más tokens para respuestas elaboradas
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
    if (error.name === 'AbortError') {
      log(`⏱️ Ollama timeout después de ${timeMs}ms`, 'yellow')
    } else {
      log(`⚠️ Error Ollama: ${error.message}`, 'yellow')
    }
    return { response: null, timeMs }
  }
}

/**
 * Consulta a Groq como fallback
 */
async function askGroqFallback(
  message: string,
  product: any
): Promise<{ response: string | null; timeMs: number }> {
  const startTime = Date.now()
  
  try {
    if (!process.env.GROQ_API_KEY) {
      log('⚠️ GROQ_API_KEY no configurada', 'yellow')
      return { response: null, timeMs: 0 }
    }

    log(`\n🧠 Fallback a Groq (llama-3.1-8b-instant)...`, 'magenta')
    
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const systemPrompt = `Eres un agente de ventas profesional y empático de Tecnovariedades D&S en Colombia.

PRODUCTO EN CONTEXTO:
- Nombre: ${product.name}
- Precio: ${product.price.toLocaleString('es-CO')} COP
- Descripción: ${product.description}

REGLAS:
1. NUNCA inventes información
2. Responde en español colombiano natural
3. Si hay desconfianza, sé empático y ofrece garantías
4. Destaca: pago único, entrega inmediata, acceso de por vida
5. Máximo 5-6 líneas
6. Usa 2-3 emojis máximo`

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.5,
      max_tokens: 300
    })

    const answer = completion.choices[0]?.message?.content?.trim()
    const timeMs = Date.now() - startTime
    
    return { response: answer || null, timeMs }
  } catch (error: any) {
    const timeMs = Date.now() - startTime
    log(`⚠️ Error Groq: ${error.message}`, 'red')
    return { response: null, timeMs }
  }
}

/**
 * Detecta intención del mensaje (simplificado para test)
 */
function detectIntent(message: string): string {
  const msg = message.toLowerCase()
  
  // Desconfianza
  if (/(estafa|enga[ñn]o|fraude|mentira|falso|tomad[ao]\s*de\s*pelo|piden\s*(más|mas)\s*plata|no\s*(mandan|envían)|no\s*confío|no\s*confio|no\s*creo)/i.test(msg)) {
    return 'distrust_objection'
  }
  
  // FAQ digital - mejorado para capturar más variantes
  if (/(curso\s*completo|pagar\s*(algo\s*)?(más|mas)|cómo\s*(lo\s*)?(recibo|llega)|como\s*(me\s*)?(llega|recibo|envian)|acceso\s*(de\s*por\s*vida|permanente|para\s*siempre)|expira|vencimiento|google\s*drive|por\s*donde\s*(lo\s*)?(envian|mandan))/i.test(msg)) {
    return 'digital_product_faq'
  }
  
  // Rechazo
  if (/(muy\s*caro|no\s*tengo|no\s*puedo|está\s*caro|es\s*mucho)/i.test(msg)) {
    return 'rejection'
  }
  
  return 'general_inquiry'
}

/**
 * Ejecuta un test individual
 */
async function runTest(scenario: typeof testScenarios[0], index: number) {
  log(`\n${'═'.repeat(60)}`, 'blue')
  log(`TEST ${index + 1}: ${scenario.name}`, 'bold')
  log(`${'═'.repeat(60)}`, 'blue')
  
  log(`\n💬 Cliente: "${scenario.message}"`, 'cyan')
  
  // Detectar intención
  const detectedIntent = detectIntent(scenario.message)
  const intentMatch = detectedIntent === scenario.expectedIntent
  log(`\n🎯 Intención detectada: ${detectedIntent} ${intentMatch ? '✅' : '❌ (esperado: ' + scenario.expectedIntent + ')'}`, intentMatch ? 'green' : 'red')
  
  let finalResponse: string | null = null
  let provider = ''
  let totalTime = 0
  
  if (scenario.requiresReasoning) {
    // Usar Ollama primero con timeout largo (60s para Easypanel)
    const ollamaResult = await askOllamaWithReasoning(scenario.message, testProduct, 60000)
    totalTime += ollamaResult.timeMs
    
    if (ollamaResult.response) {
      finalResponse = ollamaResult.response
      provider = 'Ollama'
      log(`✅ Ollama respondió en ${ollamaResult.timeMs}ms`, 'green')
    } else {
      // Fallback a Groq
      const groqResult = await askGroqFallback(scenario.message, testProduct)
      totalTime += groqResult.timeMs
      
      if (groqResult.response) {
        finalResponse = groqResult.response
        provider = 'Groq (fallback)'
        log(`✅ Groq respondió en ${groqResult.timeMs}ms`, 'green')
      }
    }
  } else {
    // Para FAQ simples, usar respuesta predefinida
    finalResponse = getPresetResponse(detectedIntent, testProduct)
    provider = 'Preset'
    log(`✅ Usando respuesta predefinida`, 'green')
  }
  
  // Mostrar respuesta
  log(`\n🤖 Respuesta (${provider}):`, 'magenta')
  if (finalResponse) {
    console.log(`\n${finalResponse}\n`)
  } else {
    log('❌ No se obtuvo respuesta', 'red')
  }
  
  // Evaluar calidad
  if (finalResponse) {
    evaluateResponse(finalResponse, scenario)
  }
  
  log(`\n⏱️ Tiempo total: ${totalTime}ms`, 'yellow')
  
  return {
    scenario: scenario.name,
    intentMatch,
    hasResponse: !!finalResponse,
    provider,
    timeMs: totalTime
  }
}

/**
 * Respuestas predefinidas para FAQ
 */
function getPresetResponse(intent: string, product: any): string {
  const price = product.price.toLocaleString('es-CO')
  
  if (intent === 'digital_product_faq') {
    return `¡Buena pregunta! 😊

Sobre el *${product.name}*:

✅ Es un curso COMPLETO - sin módulos ocultos
✅ Pago único de *${price} COP* - no pedimos más después
✅ Acceso de por vida - no expira nunca
✅ Entrega inmediata por Google Drive
✅ Puedes descargarlo o verlo online

¿Te paso los datos de pago? 💳`
  }
  
  return `Claro, te cuento sobre el *${product.name}* 😊

${product.description}

💰 Precio: ${price} COP
📦 Entrega inmediata por Google Drive

¿Te interesa? 🎯`
}

/**
 * Evalúa la calidad de la respuesta
 */
function evaluateResponse(response: string, scenario: typeof testScenarios[0]) {
  const checks: { name: string; pass: boolean }[] = []
  
  // Verificar que no sea muy corta
  if (response.length > 50) {
    checks.push({ name: 'Longitud adecuada', pass: true })
  } else {
    checks.push({ name: 'Longitud adecuada', pass: false })
  }
  
  // Verificar que mencione el producto o precio
  if (response.toLowerCase().includes('piano') || response.includes('60.000') || response.includes('60000')) {
    checks.push({ name: 'Menciona producto/precio', pass: true })
  } else {
    checks.push({ name: 'Menciona producto/precio', pass: false })
  }
  
  // Para objeciones de desconfianza, verificar empatía
  if (scenario.expectedIntent === 'distrust_objection') {
    const hasEmpathy = /(entiendo|comprendo|normal|tranquil|preocup)/i.test(response)
    checks.push({ name: 'Muestra empatía', pass: hasEmpathy })
    
    const hasGuarantee = /(garant|devol|segur|confi)/i.test(response)
    checks.push({ name: 'Ofrece garantía', pass: hasGuarantee })
  }
  
  // Verificar que no sea agresivo
  const isAggressive = /(mentiroso|tonto|estúpido|idiota)/i.test(response)
  checks.push({ name: 'No es agresivo', pass: !isAggressive })
  
  log('\n📊 Evaluación de respuesta:', 'yellow')
  for (const check of checks) {
    log(`   ${check.pass ? '✅' : '❌'} ${check.name}`, check.pass ? 'green' : 'red')
  }
}

/**
 * Ejecuta todos los tests
 */
async function runAllTests() {
  log('\n🚀 INICIANDO TESTS DE CONVERSACIONES CON RAZONAMIENTO', 'bold')
  log('═'.repeat(60), 'blue')
  log('Usando: Ollama Easypanel (primario, 60s timeout) → Groq (fallback)', 'cyan')
  log(`URL Ollama: ${process.env.OLLAMA_BASE_URL || 'No configurada'}`, 'cyan')
  log('═'.repeat(60), 'blue')
  
  const results: { scenario: string; intentMatch: boolean; hasResponse: boolean; provider: string; timeMs: number }[] = []
  
  for (let i = 0; i < testScenarios.length; i++) {
    const result = await runTest(testScenarios[i], i)
    results.push(result)
    
    // Pausa entre tests
    await new Promise(r => setTimeout(r, 1000))
  }
  
  // Resumen final
  log('\n' + '═'.repeat(60), 'blue')
  log('📊 RESUMEN DE RESULTADOS', 'bold')
  log('═'.repeat(60), 'blue')
  
  const passed = results.filter(r => r.hasResponse && r.intentMatch).length
  const total = results.length
  
  for (const r of results) {
    const status = r.hasResponse && r.intentMatch ? '✅' : '❌'
    log(`${status} ${r.scenario} - ${r.provider} (${r.timeMs}ms)`, r.hasResponse ? 'green' : 'red')
  }
  
  log(`\n📈 Resultado: ${passed}/${total} tests pasaron`, passed === total ? 'green' : 'yellow')
  
  // Estadísticas de proveedores
  const ollamaCount = results.filter(r => r.provider === 'Ollama').length
  const groqCount = results.filter(r => r.provider === 'Groq (fallback)').length
  const presetCount = results.filter(r => r.provider === 'Preset').length
  
  log(`\n🔧 Proveedores usados:`, 'cyan')
  log(`   🦙 Ollama: ${ollamaCount}`, 'cyan')
  log(`   🧠 Groq: ${groqCount}`, 'cyan')
  log(`   📝 Preset: ${presetCount}`, 'cyan')
}

// Ejecutar
runAllTests().catch(console.error)
