/**
 * TEST DEL SISTEMA DE INTELIGENCIA DE VENTAS PROFESIONAL
 */

// Simulación del sistema (versión JavaScript)
class SalesIntelligence {
  analyzeIntent(message) {
    const msg = message.toLowerCase()
    
    if (msg.includes('quiero') || msg.includes('comprar') || msg.includes('precio')) {
      return { type: 'ready_to_buy', urgency: 'high', confidence: 0.9 }
    }
    
    if (msg.includes('caro') || msg.includes('descuento') || msg.includes('más barato')) {
      return { type: 'objection', urgency: 'medium', confidence: 0.8 }
    }
    
    if (msg.includes('comparar') || msg.includes('diferencia') || msg.includes('mejor')) {
      return { type: 'comparing', urgency: 'medium', confidence: 0.7 }
    }
    
    return { type: 'browsing', urgency: 'low', confidence: 0.6 }
  }
  
  getStrategy(intent) {
    const strategies = {
      ready_to_buy: {
        approach: 'FACILITADOR',
        tone: 'Directo y profesional',
        focus: 'Beneficios inmediatos + Proceso de compra',
        closing: 'Cierre directo'
      },
      objection: {
        approach: 'VALOR',
        tone: 'Empático pero firme',
        focus: 'ROI + Calidad-Precio',
        closing: 'Cierre por valor'
      },
      comparing: {
        approach: 'CONSULTIVO',
        tone: 'Experto confiable',
        focus: 'Diferenciadores + Valor agregado',
        closing: 'Cierre alternativo'
      },
      browsing: {
        approach: 'EDUCATIVO',
        tone: 'Amigable y profesional',
        focus: 'Categorías + Productos destacados',
        closing: 'Cierre suave'
      }
    }
    
    return strategies[intent.type] || strategies.browsing
  }
  
  generateResponse(message, intent, strategy) {
    const responses = {
      ready_to_buy: `✅ Perfecto, el producto está disponible. Te ofrece [beneficio clave] y [garantía]. Aceptamos todos los métodos de pago y el envío es inmediato. ¿Procedo con tu pedido?`,
      
      objection: `Entiendo tu punto. Muchos clientes inicialmente pensaron lo mismo, pero encontraron que la calidad y durabilidad justifican la inversión. Además, incluye garantía de 1 año. ¿Te gustaría conocer las opciones de pago?`,
      
      comparing: `Excelente pregunta. El [Producto A] destaca por su rendimiento superior, ideal si buscas durabilidad. El [Producto B] ofrece mejor relación calidad-precio. Según lo que me comentas, te recomendaría [opción] porque se ajusta mejor a tus necesidades.`,
      
      browsing: `¡Hola! Tenemos monitores, teclados, mouse y parlantes. Nuestro Monitor LG 27" es muy popular por su calidad de imagen y precio competitivo. ¿Qué tipo de producto te interesa?`
    }
    
    return responses[intent.type] || responses.browsing
  }
}

// CASOS DE PRUEBA
console.log('🧪 TEST DE INTELIGENCIA DE VENTAS PROFESIONAL\n')
console.log('='.repeat(70))

const sales = new SalesIntelligence()

const testCases = [
  {
    scenario: 'Cliente listo para comprar',
    message: 'Quiero comprar el monitor LG, cuánto cuesta?'
  },
  {
    scenario: 'Cliente con objeción de precio',
    message: 'Me parece muy caro, tienen descuento?'
  },
  {
    scenario: 'Cliente comparando opciones',
    message: 'Cuál es la diferencia entre el monitor LG y el Dahua?'
  },
  {
    scenario: 'Cliente navegando',
    message: 'Hola, qué productos tienen?'
  }
]

testCases.forEach((test, index) => {
  console.log(`\n📋 CASO ${index + 1}: ${test.scenario}`)
  console.log('-'.repeat(70))
  console.log(`💬 Cliente: "${test.message}"`)
  
  const intent = sales.analyzeIntent(test.message)
  console.log(`\n🎯 ANÁLISIS:`)
  console.log(`   Intención: ${intent.type.toUpperCase()}`)
  console.log(`   Urgencia: ${intent.urgency.toUpperCase()}`)
  console.log(`   Confianza: ${(intent.confidence * 100).toFixed(0)}%`)
  
  const strategy = sales.getStrategy(intent)
  console.log(`\n📊 ESTRATEGIA:`)
  console.log(`   Enfoque: ${strategy.approach}`)
  console.log(`   Tono: ${strategy.tone}`)
  console.log(`   Focus: ${strategy.focus}`)
  console.log(`   Cierre: ${strategy.closing}`)
  
  const response = sales.generateResponse(test.message, intent, strategy)
  console.log(`\n💼 RESPUESTA PROFESIONAL:`)
  console.log(`   ${response}`)
  
  console.log('\n' + '='.repeat(70))
})

console.log('\n✅ Test completado!')
console.log('\n📝 PRINCIPIOS DEL SISTEMA:')
console.log('   1. Respuestas naturales pero orientadas a venta')
console.log('   2. Sin mostrar necesidad, siempre profesional')
console.log('   3. Adaptación según intención del cliente')
console.log('   4. Máximo 4 líneas, directo al punto')
console.log('   5. Técnicas de cierre apropiadas')
