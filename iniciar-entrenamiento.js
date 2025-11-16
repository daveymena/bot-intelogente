#!/usr/bin/env node

/**
 * INICIAR ENTRENAMIENTO COMPLETO
 * Ejecuta Groq + Preparación para Ollama
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(80));
  log(colors.bright + colors.cyan, title);
  console.log('='.repeat(80) + '\n');
}

// ============================================================================
// VERIFICAR CONFIGURACIÓN
// ============================================================================

header('VERIFICAR CONFIGURACIÓN');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  log(colors.red, '✗ Error: GROQ_API_KEY no configurada');
  log(colors.yellow, '\nConfigura la variable de entorno:');
  log(colors.cyan, '  set GROQ_API_KEY=tu_clave_aqui');
  process.exit(1);
}

log(colors.green, '✓ GROQ_API_KEY detectada');

// ============================================================================
// EJECUTAR ENTRENAMIENTO
// ============================================================================

header('INICIANDO ENTRENAMIENTO');

let step = 1;

function runScript(scriptName, description) {
  return new Promise((resolve, reject) => {
    log(colors.bright + colors.blue, `\n[${step}] ${description}`);
    console.log('-'.repeat(80));
    step++;

    const script = spawn('node', [scriptName], {
      cwd: __dirname,
      stdio: 'inherit',
    });

    script.on('close', (code) => {
      if (code === 0) {
        log(colors.green, `✓ ${description} completado`);
        resolve();
      } else {
        log(colors.red, `✗ Error en ${description}`);
        reject(new Error(`Script ${scriptName} falló con código ${code}`));
      }
    });

    script.on('error', (error) => {
      log(colors.red, `✗ Error ejecutando ${scriptName}: ${error.message}`);
      reject(error);
    });
  });
}

(async () => {
  try {
    // Paso 1: Entrenamiento con Groq
    await runScript('entrenamiento-rapido-groq.js', 'Entrenamiento con Groq');

    // Paso 2: Preparar para Ollama
    await runScript('preparar-datos-ollama.js', 'Preparación para Ollama');

    // ============================================================================
    // RESUMEN FINAL
    // ============================================================================

    header('ENTRENAMIENTO COMPLETADO');

    log(colors.bright + colors.green, '✓ Entrenamiento completado exitosamente');

    log(colors.yellow, '\nArchivos generados:');
    log(colors.cyan, '  • training-data-groq.json');
    log(colors.cyan, '  • training-report-groq.json');
    log(colors.cyan, '  • ollama-training-data.json');
    log(colors.cyan, '  • search-context.json');
    log(colors.cyan, '  • training-examples.json');
    log(colors.cyan, '  • ollama-training-report.json');

    log(colors.yellow, '\nPróximos pasos:');
    log(colors.cyan, '  1. Revisar archivos generados');
    log(colors.cyan, '  2. Usar con Ollama para mejorar embeddings');
    log(colors.cyan, '  3. Integrar en el bot');

    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    log(colors.red, `\n✗ Error: ${error.message}`);
    process.exit(1);
  }
})();
