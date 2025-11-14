/**
 * Script de prueba del Sistema de Razonamiento Profundo
 * Demuestra cómo interpreta mensajes confusos o ambiguos
 */

import { analizarConRazonamientoProfundo, necesitaRazonamientoProfundo } from '../src/conversational-module';

const mensajesPrueba = [
  // Mensajes ambiguos
  { mensaje: 'ese que sirve para diseñar', esperado: 'computador diseño' },
  { mensaje: 'la que va rápido', esperado: 'moto velocidad' },
  { mensaje: 'lo del piano ese', esperado: 'curso piano' },
  
  // Jerga colombiana
  { mensaje: 'cuanto pa la moto', esperado: 'precio moto' },
  { mensaje: 'el q sirve pa jugar', esperado: 'computador gaming' },
  { mensaje: 'la mas barata', esperado: 'producto económico' },
  
  // Referencias indirectas
  { mensaje: 'el que me mostraste ayer', esperado: 'producto anterior' },
  { mensaje: 'algo parecido pero más barato', esperado: 'alternativa económica' },
  { mensaje: 'lo mismo pero en otro color', esperado: 'variante color' },
  
  // Muy cortos
  { mensaje: 'ese', esperado: 'producto mencionado' },
  { mensaje: 'la otra', esperado: 'alternativa' },
  { mensaje: 'mejor', esperado: 'mejor opción' },
];

async function probarRazonamientoProfundo() {
  console.log('🧠 PRUEBA DE RAZONAMIENTO PROFUNDO\n');
  console.log('='.repeat(80));
  
  for (const prueba of mensajesPrueba) {
    console.log(`\n📨 Mensaje: "${prueba.mensaje}"`);
    console.log(`   Esperado: ${prueba.esperado}`);
    
    // Verificar si necesita razonamiento profundo
    const necesita = necesitaRazonamientoProfundo(prueba.mensaje);
    console.log(`   ¿Necesita razonamiento? ${necesita ? '✅ SÍ' : '❌ NO'}`);
    
    if (necesita) {
      try {
        const inicio = Date.now();
        const resultado = await analizarConRazonamientoProfundo(prueba.mensaje);
        const tiempo = Date.now() - inicio;
        
        console.log(`\n   💡 INTERPRETACIÓN:`);
        console.log(`      ${resultado.interpretacion}`);
        console.log(`\n   🎯 INTENCIÓN REAL: ${resultado.intencionReal}`);
        console.log(`   🔍 BÚSQUEDA SUGERIDA: "${resultado.busquedaSugerida}"`);
        console.log(`   📊 CONFIANZA: ${(resultado.confianza * 100).toFixed(0)}%`);
        console.log(`\n   🤔 RAZONAMIENTO:`);
        console.log(`      ${resultado.razonamiento}`);
        console.log(`\n   ⏱️  Tiempo: ${tiempo}ms`);
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '-'.repeat(80));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Prueba completada\n');
}

// Ejecutar
probarRazonamientoProfundo().catch(console.error);
