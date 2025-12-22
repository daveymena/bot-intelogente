/**
 * Script interactivo para probar el Bot Local
 * Permite enviar mensajes y ver respuestas en tiempo real
 */

import * as readline from 'readline';
import { EnhancedLocalBot } from '../src/lib/enhanced-local-bot';

const bot = new EnhancedLocalBot();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 BOT LOCAL - MODO INTERACTIVO\n');
console.log('='.repeat(60));
console.log('\nEscribe mensajes para probar el bot local');
console.log('Comandos especiales:');
console.log('  /stats  - Ver estadísticas');
console.log('  /reset  - Reiniciar métricas');
console.log('  /exit   - Salir\n');
console.log('='.repeat(60));
console.log('');

function mostrarRespuesta(mensaje: string, resultado: any) {
  console.log('\n' + '-'.repeat(60));
  console.log(`📨 TÚ: ${mensaje}`);
  console.log('-'.repeat(60));
  
  if (resultado.wasLocal) {
    console.log(`⚡ BOT LOCAL (${resultado.category})`);
    console.log(`Confianza: ${(resultado.confidence * 100).toFixed(0)}%`);
    console.log(`\n🤖 RESPUESTA:\n`);
    console.log(resultado.response);
  } else {
    console.log(`🤖 IA REQUERIDA`);
    console.log(`(Este mensaje necesita razonamiento profundo con Groq)`);
  }
  
  console.log('-'.repeat(60));
  console.log('');
}

function mostrarStats() {
  console.log('\n' + '='.repeat(60));
  console.log(bot.getFormattedStats());
  console.log('='.repeat(60));
  console.log('');
}

function preguntarMensaje() {
  rl.question('💬 Escribe un mensaje: ', async (input) => {
    const mensaje = input.trim();
    
    if (!mensaje) {
      preguntarMensaje();
      return;
    }
    
    // Comandos especiales
    if (mensaje === '/exit') {
      console.log('\n👋 ¡Hasta pronto!\n');
      mostrarStats();
      rl.close();
      process.exit(0);
      return;
    }
    
    if (mensaje === '/stats') {
      mostrarStats();
      preguntarMensaje();
      return;
    }
    
    if (mensaje === '/reset') {
      bot.resetMetrics();
      console.log('\n✅ Métricas reiniciadas\n');
      preguntarMensaje();
      return;
    }
    
    // Procesar mensaje
    try {
      const resultado = await bot.processMessage(mensaje);
      mostrarRespuesta(mensaje, resultado);
    } catch (error) {
      console.error('\n❌ Error:', error);
    }
    
    preguntarMensaje();
  });
}

// Iniciar
preguntarMensaje();
