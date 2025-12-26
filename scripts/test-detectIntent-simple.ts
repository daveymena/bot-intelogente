/**
 * Test simple de detectIntent
 */

// Copiar la función detectIntent directamente para probar
function detectIntent(message: string): string {
  const msg = message.toLowerCase().trim()

  // 🆕 DESPEDIDA CON INTERÉS FUTURO - Cliente dice que lo pensará o avisará después
  if (/(te\s*(aviso|confirmo|digo|escribo|contacto|cuento)|luego\s*te|después\s*te|despues\s*te|más\s*(tarde|luego)|mas\s*(tarde|luego)|lo\s*(pienso|pensaré|pensare)|voy\s*a\s*(pensarlo|verlo|revisarlo)|déjame\s*(pensarlo|verlo|revisarlo)|dejame\s*(pensarlo|verlo|revisarlo)|si\s*algo\s*te|cualquier\s*cosa\s*te|ya\s*te\s*(aviso|digo|confirmo)|cuando\s*(pueda|tenga|decida)|me\s*lo\s*(pienso|voy\s*a\s*pensar))/i.test(msg)) {
    return 'future_interest'
  }
  
  // Patrones combinados: "vale/ok/gracias + te aviso/luego/después"
  if (/^(vale|ok|bueno|listo|perfecto|gracias|muchas\s*gracias)[,.\s]*(te\s*aviso|luego|después|despues|gracias|si\s*algo)/i.test(msg)) {
    return 'future_interest'
  }

  // CONFIRMACIÓN DE COMPRA
  const confirmationPatterns = [
    /^(si|sí)\s*(lo quiero|lo compro|dale|va|me interesa|claro|por supuesto)$/i,
    /^me interesa$/i,
    /^(lo quiero|lo compro|quiero comprarlo|me lo llevo|si lo quiero|sí lo quiero|lo necesito|lo tomo)$/i,
  ]

  for (const pattern of confirmationPatterns) {
    if (pattern.test(msg)) {
      return 'confirmation'
    }
  }

  return 'general_inquiry'
}

// Tests
const tests = [
  { msg: 'Vale gracias te aviso', expected: 'future_interest' },
  { msg: 'Ok luego te confirmo', expected: 'future_interest' },
  { msg: 'Gracias, si algo te escribo', expected: 'future_interest' },
  { msg: 'Lo voy a pensar y te aviso', expected: 'future_interest' },
  { msg: 'Sí lo quiero', expected: 'confirmation' },
  { msg: 'Lo compro', expected: 'confirmation' },
]

console.log('🧪 TEST DIRECTO DE detectIntent')
console.log('='.repeat(50))

for (const test of tests) {
  const result = detectIntent(test.msg)
  const pass = result === test.expected
  console.log(`${pass ? '✅' : '❌'} "${test.msg}"`)
  console.log(`   Esperado: ${test.expected}, Obtenido: ${result}`)
}
