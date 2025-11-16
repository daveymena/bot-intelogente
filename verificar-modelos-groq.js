#!/usr/bin/env node

/**
 * VERIFICAR MODELOS DISPONIBLES EN GROQ
 * Prueba cada modelo para ver cuál funciona
 */

const Groq = require('groq-sdk');

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
// VERIFICAR API KEY
// ============================================================================

header('VERIFICAR MODELOS DISPONIBLES EN GROQ');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  log(colors.red, '✗ Error: GROQ_API_KEY no configurada');
  process.exit(1);
}

log(colors.green, '✓ GROQ_API_KEY detectada');

const groq = new Groq({ apiKey });

// ============================================================================
// LISTA DE MODELOS A PROBAR
// ============================================================================

const modelos = [
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'llama-3.2-1b-preview',
  'llama-3.2-11b-vision-preview',
  'gemma-7b-it',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
  'mixtral-8x7b-32768-v0-1',
];

// ============================================================================
// PROBAR CADA MODELO
// ============================================================================

header('PROBANDO MODELOS');

(async () => {
  const resultados = [];

  for (const modelo of modelos) {
    process.stdout.write(`Probando ${modelo}... `);

    try {
      const response = await groq.chat.completions.create({
        model: modelo,
        messages: [
          {
            role: 'user',
            content: 'Hola, ¿cuál es tu nombre?',
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      });

      const tiempo = response.usage?.total_time || 'N/A';
      log(colors.green, `✓ FUNCIONA (${tiempo}ms)`);
      resultados.push({
        modelo,
        estado: 'FUNCIONA',
        tiempo,
      });
    } catch (error) {
      const mensaje = error.message || error.toString();
      if (mensaje.includes('decommissioned')) {
        log(colors.yellow, `⚠ DESCONTINUADO`);
        resultados.push({
          modelo,
          estado: 'DESCONTINUADO',
          error: 'Modelo descontinuado',
        });
      } else if (mensaje.includes('not found')) {
        log(colors.red, `✗ NO EXISTE`);
        resultados.push({
          modelo,
          estado: 'NO EXISTE',
          error: 'Modelo no encontrado',
        });
      } else {
        log(colors.red, `✗ ERROR: ${mensaje.substring(0, 50)}`);
        resultados.push({
          modelo,
          estado: 'ERROR',
          error: mensaje.substring(0, 100),
        });
      }
    }
  }

  // ============================================================================
  // RESUMEN
  // ============================================================================

  header('RESUMEN DE RESULTADOS');

  const funcionan = resultados.filter(r => r.estado === 'FUNCIONA');
  const descontinuados = resultados.filter(r => r.estado === 'DESCONTINUADO');
  const noExisten = resultados.filter(r => r.estado === 'NO EXISTE');
  const errores = resultados.filter(r => r.estado === 'ERROR');

  log(colors.green, `✓ Funcionan: ${funcionan.length}`);
  funcionan.forEach(r => {
    log(colors.cyan, `  • ${r.modelo}`);
  });

  if (descontinuados.length > 0) {
    log(colors.yellow, `\n⚠ Descontinuados: ${descontinuados.length}`);
    descontinuados.forEach(r => {
      log(colors.cyan, `  • ${r.modelo}`);
    });
  }

  if (noExisten.length > 0) {
    log(colors.red, `\n✗ No existen: ${noExisten.length}`);
    noExisten.forEach(r => {
      log(colors.cyan, `  • ${r.modelo}`);
    });
  }

  if (errores.length > 0) {
    log(colors.red, `\n✗ Errores: ${errores.length}`);
    errores.forEach(r => {
      log(colors.cyan, `  • ${r.modelo}: ${r.error}`);
    });
  }

  // ============================================================================
  // RECOMENDACIÓN
  // ============================================================================

  header('RECOMENDACIÓN');

  if (funcionan.length > 0) {
    log(colors.bright + colors.green, `✓ Usa este modelo:`);
    log(colors.cyan, `  ${funcionan[0].modelo}`);

    log(colors.yellow, `\nPara actualizar el script:`);
    log(colors.cyan, `  Reemplaza 'mixtral-8x7b-32768' con '${funcionan[0].modelo}'`);
  } else {
    log(colors.red, `✗ Ningún modelo funciona`);
    log(colors.yellow, `\nVerifica:`);
    log(colors.cyan, `  • Tu API key de Groq`);
    log(colors.cyan, `  • Tu conexión a internet`);
    log(colors.cyan, `  • Los límites de tu cuenta`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
})().catch(error => {
  log(colors.red, `✗ Error: ${error.message}`);
  process.exit(1);
});
