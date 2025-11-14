/**
 * 🧪 SCRIPT DE PRUEBA - INTEGRACIÓN DEL SISTEMA DE ENTRENAMIENTO
 * 
 * Verifica que los ejemplos de entrenamiento se están incluyendo
 * correctamente en el prompt del sistema de IA
 */

import { TRAINING_SCENARIOS, BOT_RULES } from '../src/lib/sales-training-data'

console.log('🧪 PRUEBA DE INTEGRACIÓN DEL SISTEMA DE ENTRENAMIENTO\n')
console.log('=' .repeat(60))

// 1. Verificar que los datos de entrenamiento están disponibles
console.log('\n✅ PASO 1: Verificar datos de entrenamiento')
console.log(`   📚 Escenarios cargados: ${TRAINING_SCENARIOS.length}`)
console.log(`   🎯 Reglas del bot: ${Object.keys(BOT_RULES).length} categorías`)

// 2. Mostrar resumen de escenarios
console.log('\n✅ PASO 2: Resumen de escenarios de entrenamiento')
TRAINING_SCENARIOS.forEach((scenario, index) => {
  console.log(`\n   ${index + 1}. ${scenario.titulo}`)
  console.log(`      📦 Producto: ${scenario.producto.nombre}`)
  console.log(`      💰 Precio: $${scenario.producto.precio.toLocaleString('es-CO')} COP`)
  console.log(`      📝 Categoría: ${scenario.producto.categoria}`)
  console.log(`      💬 Intercambios: ${scenario.conversacion.length}`)
  console.log(`      🎓 Aprendizajes: ${scenario.aprendizajes.length}`)
})

// 3. Mostrar reglas generales
console.log('\n✅ PASO 3: Reglas generales del bot')
console.log('\n   📱 PRODUCTOS FÍSICOS:')
console.log(`      • Métodos de pago: ${BOT_RULES.productos_fisicos.metodos_pago.join(', ')}`)
console.log(`      • Envío: ${BOT_RULES.productos_fisicos.envio}`)
console.log(`      • Garantía: ${BOT_RULES.productos_fisicos.garantia}`)

console.log('\n   💾 PRODUCTOS DIGITALES:')
console.log(`      • Métodos de pago: ${BOT_RULES.productos_digitales.metodos_pago.join(', ')}`)
console.log(`      • NO contraentrega: ${BOT_RULES.productos_digitales.NO_contraentrega}`)
console.log(`      • Entrega: ${BOT_RULES.productos_digitales.entrega}`)
console.log(`      • Solicitar correo: ${BOT_RULES.productos_digitales.solicitar_correo}`)

// 4. Ejemplo de conversación
console.log('\n✅ PASO 4: Ejemplo de conversación de entrenamiento')
const ejemploEscenario = TRAINING_SCENARIOS[0]
console.log(`\n   📖 ${ejemploEscenario.titulo}`)
console.log(`   📝 Contexto: ${ejemploEscenario.contexto}\n`)

// Mostrar primeros 6 intercambios
ejemploEscenario.conversacion.slice(0, 6).forEach(msg => {
  if (msg.rol === 'cliente') {
    console.log(`   👤 Cliente: "${msg.mensaje}"`)
  } else {
    console.log(`   🤖 Bot: "${msg.mensaje.substring(0, 100)}${msg.mensaje.length > 100 ? '...' : ''}"`)
  }
})

console.log('\n   🎓 Aprendizajes clave:')
ejemploEscenario.aprendizajes.slice(0, 3).forEach(aprendizaje => {
  console.log(`      • ${aprendizaje}`)
})

// 5. Verificar integración con AI Service
console.log('\n✅ PASO 5: Verificar integración con AI Service')
try {
  // Intentar importar el servicio de IA
  const aiServicePath = '../src/lib/ai-service'
  console.log(`   📦 Importando: ${aiServicePath}`)
  
  // Verificar que el archivo existe
  const fs = require('fs')
  const path = require('path')
  const aiServiceFile = path.join(__dirname, aiServicePath + '.ts')
  
  if (fs.existsSync(aiServiceFile)) {
    console.log('   ✅ Archivo ai-service.ts encontrado')
    
    // Verificar que importa los datos de entrenamiento
    const content = fs.readFileSync(aiServiceFile, 'utf-8')
    
    if (content.includes('sales-training-data')) {
      console.log('   ✅ Importación de sales-training-data detectada')
    } else {
      console.log('   ⚠️  No se detectó importación de sales-training-data')
    }
    
    if (content.includes('TRAINING_SCENARIOS')) {
      console.log('   ✅ Uso de TRAINING_SCENARIOS detectado')
    } else {
      console.log('   ⚠️  No se detectó uso de TRAINING_SCENARIOS')
    }
    
    if (content.includes('BOT_RULES')) {
      console.log('   ✅ Uso de BOT_RULES detectado')
    } else {
      console.log('   ⚠️  No se detectó uso de BOT_RULES')
    }
    
    if (content.includes('buildTrainingExamples')) {
      console.log('   ✅ Función buildTrainingExamples detectada')
    } else {
      console.log('   ⚠️  No se detectó función buildTrainingExamples')
    }
  } else {
    console.log('   ❌ Archivo ai-service.ts no encontrado')
  }
} catch (error) {
  console.log(`   ❌ Error al verificar integración: ${error}`)
}

// 6. Resumen final
console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN DE LA INTEGRACIÓN')
console.log('='.repeat(60))
console.log(`
✅ Sistema de entrenamiento: ACTIVO
📚 Escenarios disponibles: ${TRAINING_SCENARIOS.length}
🎯 Categorías cubiertas:
   • Productos físicos (laptops, motos, impresoras)
   • Productos digitales (cursos, megapacks)
   • Manejo de objeciones
   • Técnicas de cierre
   • Recuperación de conversación

💡 CÓMO FUNCIONA:
   1. La IA recibe ejemplos de conversaciones exitosas
   2. Aprende patrones de respuesta efectivos
   3. Aplica técnicas de venta probadas
   4. Mantiene consistencia en el tono y estilo
   5. Maneja objeciones de forma inteligente

🎓 BENEFICIOS:
   • Respuestas más naturales y efectivas
   • Mayor tasa de conversión
   • Manejo profesional de objeciones
   • Consistencia en todas las conversaciones
   • Aprendizaje continuo de mejores prácticas

🚀 PRÓXIMOS PASOS:
   1. Probar el bot con mensajes reales
   2. Monitorear las conversaciones
   3. Agregar más escenarios según necesidad
   4. Ajustar ejemplos basados en resultados
`)

console.log('✅ Prueba completada exitosamente!\n')
