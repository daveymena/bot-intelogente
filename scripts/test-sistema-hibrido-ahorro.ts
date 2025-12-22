/**
 * Script de prueba del sistema híbrido con ahorro de tokens
 * Demuestra cuándo se usa respuesta local vs IA
 */

import { procesarMensaje, obtenerEstadisticas, reiniciarEstadisticas } from '../src/conversational-module';

const userId = 'test-user-123';

const mensajesPrueba = [
  // Respuestas locales (sin IA)
  { mensaje: 'Hola', esperado: 'local' },
  { mensaje: 'Buenos días', esperado: 'local' },
  { mensaje: 'Gracias', esperado: 'local' },
  { mensaje: 'Adiós', esperado: 'local' },
  { mensaje: 'Ok', esperado: 'local' },
  { mensaje: 'Sí', esperado: 'local' },
  
  // Respuestas con IA (complejas)
  { mensaje: 'Necesito un computador para diseño gráfico', esperado: 'ia' },
  { mensaje: 'Cuál es la diferencia entre estos dos productos', esperado: 'ia' },
  { mensaje: 'Puedo pagar en cuotas?', esperado: 'ia' },
];

async function probarSistemaHibrido() {
  console.log('🧪 PRUEBA DE SISTEMA HÍBRIDO - AHORRO DE TOKENS\n');
  console.log('='.repeat(60));
  
  // Reiniciar estadísticas
  reiniciarEstadisticas();

  for (const prueba of mensajesPrueba) {
    console.log(`\n📨 Mensaje: "${prueba.mensaje}"`);
    console.log(`   Esperado: ${prueba.esperado.toUpperCase()}`);
    
    try {
      const inicio = Date.now();
      const respuesta = await procesarMensaje(userId, prueba.mensaje);
      const tiempo = Date.now() - inicio;
      
      console.log(`   ⏱️  Tiempo: ${tiempo}ms`);
      console.log(`   💬 Respuesta: ${respuesta.substring(0, 80)}...`);
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Mostrar estadísticas finales
  console.log('\n' + '='.repeat(60));
  console.log('📊 ESTADÍSTICAS DE AHORRO\n');
  
  const stats = obtenerEstadisticas();
  console.log(`Respuestas locales: ${stats.local} (${stats.localPercentage})`);
  console.log(`Respuestas con IA: ${stats.ai}`);
  console.log(`Total: ${stats.total}`);
  console.log(`\n💰 Tokens estimados ahorrados: ${stats.estimatedTokensSaved.toLocaleString()}`);
  console.log(`   (Estimado: 500 tokens por respuesta local)`);
  
  // Calcular ahorro en dinero (Groq: ~$0.10 por 1M tokens)
  const costoEvitado = (stats.estimatedTokensSaved / 1000000) * 0.10;
  console.log(`\n💵 Costo evitado: $${costoEvitado.toFixed(4)} USD`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Prueba completada\n');
}

// Ejecutar
probarSistemaHibrido().catch(console.error);
