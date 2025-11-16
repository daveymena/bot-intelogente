#!/usr/bin/env tsx
/**
 * 🎓 Entrenamiento Continuo 24/7
 * Genera respuestas automáticamente usando Ollama
 */

import { autoTrainingSystem } from '../src/lib/auto-training-system';

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🎓 SISTEMA DE ENTRENAMIENTO AUTOMÁTICO 24/7           ║
║                                                            ║
║  Genera base de conocimiento local usando Ollama          ║
║  Funciona como fallback cuando Groq se queda sin tokens   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Señal de interrupción recibida...');
  autoTrainingSystem.stopTraining();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Señal de terminación recibida...');
  autoTrainingSystem.stopTraining();
  process.exit(0);
});

// Iniciar entrenamiento
autoTrainingSystem.startContinuousTraining().catch((error) => {
  console.error('❌ Error fatal en entrenamiento:', error);
  process.exit(1);
});
