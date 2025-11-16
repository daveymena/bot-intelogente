#!/usr/bin/env node

/**
 * EJECUTAR TEST 24/7 COMPLETO
 * 1. Test de 24/7 con Groq (agotar tokens)
 * 2. Activar bot con IA local (Ollama)
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
// EJECUTAR SCRIPTS
// ============================================================================

header('TEST 24/7 COMPLETO - GROQ + IA LOCAL');

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
    // Paso 1: Test 24/7 con Groq
    await runScript('test-24-7-groq.js', 'Test 24/7 con Groq (agotar tokens)');

    // Paso 2: Activar bot con IA local
    await runScript('activar-bot-ia-local.js', 'Activar bot con IA local (Ollama)');

    // ============================================================================
    // RESUMEN FINAL
    // ============================================================================

    header('TEST 24/7 COMPLETADO');

    log(colors.bright + colors.green, '✓ Test de Groq completado');
    log(colors.bright + colors.green, '✓ Bot configurado con IA local');

    log(colors.yellow, '\nPróximos pasos:');
    log(colors.cyan, '1. Asegúrate que Ollama está ejecutándose:');
    log(colors.cyan, '   ollama serve');
    log(colors.cyan, '');
    log(colors.cyan, '2. Inicia el bot:');
    log(colors.cyan, '   npm run dev');
    log(colors.cyan, '');
    log(colors.cyan, '3. Prueba el bot en WhatsApp');

    log(colors.yellow, '\nArchivos generados:');
    log(colors.cyan, '  • test-24-7-reporte.json');
    log(colors.cyan, '  • config-ia-local.json');
    log(colors.cyan, '  • start-bot-local.sh');

    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    log(colors.red, `\n✗ Error: ${error.message}`);
    process.exit(1);
  }
})();
