/**
 * 🎯 DEMOSTRACIÓN: SISTEMA INTELIGENTE BAJO COSTO
 *
 * Usa IA solo para análisis (bajo costo) + Plantillas locales (cero costo)
 */

import { SmartResponseEngine } from './src/lib/plantillas-respuestas-bot'

async function demoSistemaInteligente() {
  console.log('🎯 DEMO: SISTEMA INTELIGENTE BAJO COSTO\n')
  console.log('=' .repeat(60))

  // Simular consultas del usuario
  const consultas = [
    'curso de piano',
    'megapack de diseño',
    'quiero pagar',
    'envíame fotos',
    'hola, que cursos tienes?',
    'precio del curso de excel'
  ]

  for (const consulta of consultas) {
    console.log(`\n👤 Usuario: "${consulta}"`)

    try {
      // 📊 ANALIZAR CON IA (BAJO COSTO)
      const analysis = await SmartResponseEngine.analyzeIntent(
        consulta,
        [], // historial vacío para demo
        { product: { name: 'Curso de Piano', price: 50000 } } // contexto simulado
      )

      console.log(`🎯 Intención detectada: ${analysis.intent} (${analysis.confidence}%)`)
      console.log(`📝 Plantilla: ${analysis.responseTemplate}`)
      console.log(`📸 Necesita foto: ${analysis.needsPhoto}`)
      console.log(`💰 Necesita pago: ${analysis.needsPayment}`)

      // 📝 GENERAR RESPUESTA DESDE PLANTILLA (SIN COSTO)
      const respuesta = SmartResponseEngine.generateResponse(analysis, {
        product_name: 'Curso de Piano Básico',
        price: '50.000 COP',
        courses_count: '5'
      })

      console.log(`🤖 Respuesta generada:\n${respuesta}`)

    } catch (error) {
      console.error('❌ Error:', error)
    }

    console.log('-'.repeat(40))
  }

  console.log('\n✅ DEMO COMPLETADA')
  console.log('💡 BENEFICIOS:')
  console.log('• IA solo para análisis (prompt corto = bajo costo)')
  console.log('• Respuestas desde plantillas (cero costo adicional)')
  console.log('• Sistema inteligente pero económico')
  console.log('• Mantiene calidad de respuestas')
}

// Ejecutar demo
demoSistemaInteligente()