#!/usr/bin/env node

/**
 * TEST 24/7 CON GROQ
 * Agota todos los tokens y modelos disponibles
 * Luego activa el bot con IA local (Ollama)
 */

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(80));
  log(colors.bright + colors.cyan, title);
  console.log('='.repeat(80) + '\n');
}

function section(title) {
  log(colors.bright + colors.blue, `\n📌 ${title}`);
  console.log('-'.repeat(80));
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

header('TEST 24/7 CON GROQ - AGOTAR TOKENS');

const apiKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_6,
].filter(Boolean);

if (apiKeys.length === 0) {
  log(colors.red, '✗ Error: No hay API keys configuradas');
  process.exit(1);
}

log(colors.green, `✓ ${apiKeys.length} API keys detectadas`);

const modelos = [
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'gemma2-9b-it',
];

const preguntas = [
  '¿Qué laptops tienes disponibles?',
  'Necesito una moto para trabajar',
  '¿Cuál es el precio del curso de piano?',
  'Quiero comprar, ¿cuáles son los métodos de pago?',
  'Hola, ¿cómo estás?',
  '¿Tienes productos en oferta?',
  'Busco algo de tecnología',
  '¿Cuál es tu nombre?',
  '¿Qué categorías de productos tienes?',
  '¿Puedo pagar con tarjeta de crédito?',
];

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

const stats = {
  startTime: new Date(),
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokens: 0,
  totalCost: 0,
  requestsByModel: {},
  requestsByApiKey: {},
  errors: [],
};

// ============================================================================
// FUNCIÓN PARA HACER REQUESTS
// ============================================================================

async function hacerRequest(apiKey, modelo, pregunta) {
  try {
    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      model: modelo,
      messages: [
        {
          role: 'user',
          content: pregunta,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const tokens = response.usage?.total_tokens || 0;
    const respuesta = response.choices[0]?.message?.content || '';

    stats.totalRequests++;
    stats.successfulRequests++;
    stats.totalTokens += tokens;

    // Estimar costo (aproximado)
    const costoPorMillon = 0.05; // $0.05 por millón de tokens
    stats.totalCost += (tokens / 1000000) * costoPorMillon;

    // Actualizar estadísticas por modelo
    if (!stats.requestsByModel[modelo]) {
      stats.requestsByModel[modelo] = { count: 0, tokens: 0 };
    }
    stats.requestsByModel[modelo].count++;
    stats.requestsByModel[modelo].tokens += tokens;

    // Actualizar estadísticas por API key
    const keyIndex = apiKeys.indexOf(apiKey);
    if (!stats.requestsByApiKey[keyIndex]) {
      stats.requestsByApiKey[keyIndex] = { count: 0, tokens: 0 };
    }
    stats.requestsByApiKey[keyIndex].count++;
    stats.requestsByApiKey[keyIndex].tokens += tokens;

    return {
      success: true,
      tokens,
      respuesta: respuesta.substring(0, 100),
    };
  } catch (error) {
    stats.totalRequests++;
    stats.failedRequests++;

    const errorMsg = error.message || error.toString();
    stats.errors.push({
      modelo,
      pregunta: pregunta.substring(0, 50),
      error: errorMsg.substring(0, 100),
    });

    return {
      success: false,
      error: errorMsg.substring(0, 100),
    };
  }
}

// ============================================================================
// EJECUTAR TEST
// ============================================================================

(async () => {
  section('INICIANDO TEST 24/7');

  let requestCount = 0;
  const maxRequests = 1000; // Máximo de requests para agotar tokens

  log(colors.cyan, `API Keys: ${apiKeys.length}`);
  log(colors.cyan, `Modelos: ${modelos.length}`);
  log(colors.cyan, `Preguntas: ${preguntas.length}`);
  log(colors.cyan, `Max requests: ${maxRequests}`);

  section('EJECUTANDO REQUESTS');

  for (let i = 0; i < maxRequests; i++) {
    const apiKey = apiKeys[i % apiKeys.length];
    const modelo = modelos[i % modelos.length];
    const pregunta = preguntas[i % preguntas.length];

    process.stdout.write(`[${i + 1}/${maxRequests}] ${modelo.substring(0, 20)}... `);

    const resultado = await hacerRequest(apiKey, modelo, pregunta);

    if (resultado.success) {
      log(colors.green, `✓ ${resultado.tokens} tokens`);
    } else {
      log(colors.red, `✗ ${resultado.error.substring(0, 40)}`);

      // Si agotamos tokens, salir
      if (resultado.error.includes('rate_limit') || resultado.error.includes('quota')) {
        log(colors.yellow, '\n⚠ Tokens agotados o límite de rate alcanzado');
        break;
      }
    }

    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // ============================================================================
  // MOSTRAR ESTADÍSTICAS
  // ============================================================================

  section('ESTADÍSTICAS DEL TEST');

  const duracion = Math.round((new Date() - stats.startTime) / 1000);
  const requestsPorSegundo = (stats.totalRequests / duracion).toFixed(2);

  log(colors.cyan, `Total de requests: ${stats.totalRequests}`);
  log(colors.cyan, `Exitosos: ${stats.successfulRequests}`);
  log(colors.cyan, `Fallidos: ${stats.failedRequests}`);
  log(colors.cyan, `Tasa de éxito: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%`);
  log(colors.cyan, `Total de tokens: ${stats.totalTokens}`);
  log(colors.cyan, `Costo estimado: $${stats.totalCost.toFixed(4)}`);
  log(colors.cyan, `Duración: ${duracion} segundos`);
  log(colors.cyan, `Requests/segundo: ${requestsPorSegundo}`);

  section('ESTADÍSTICAS POR MODELO');

  Object.entries(stats.requestsByModel).forEach(([modelo, data]) => {
    log(colors.cyan, `${modelo}: ${data.count} requests, ${data.tokens} tokens`);
  });

  section('ESTADÍSTICAS POR API KEY');

  apiKeys.forEach((key, idx) => {
    const data = stats.requestsByApiKey[idx] || { count: 0, tokens: 0 };
    const keyShort = key.substring(0, 10) + '...';
    log(colors.cyan, `Key ${idx + 1} (${keyShort}): ${data.count} requests, ${data.tokens} tokens`);
  });

  if (stats.errors.length > 0) {
    section('ERRORES ENCONTRADOS');

    stats.errors.slice(0, 10).forEach(err => {
      log(colors.red, `${err.modelo}: ${err.error}`);
    });

    if (stats.errors.length > 10) {
      log(colors.yellow, `... y ${stats.errors.length - 10} errores más`);
    }
  }

  // ============================================================================
  // GUARDAR REPORTE
  // ============================================================================

  section('GUARDANDO REPORTE');

  const reporte = {
    timestamp: new Date().toISOString(),
    duracion: `${duracion} segundos`,
    stats,
  };

  const reportePath = path.join(__dirname, 'test-24-7-reporte.json');
  fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));
  log(colors.green, `✓ Reporte guardado: ${reportePath}`);

  // ============================================================================
  // CONCLUSIÓN
  // ============================================================================

  header('TEST COMPLETADO');

  log(colors.bright + colors.green, `✓ ${stats.totalRequests} requests ejecutados`);
  log(colors.bright + colors.green, `✓ ${stats.totalTokens} tokens consumidos`);
  log(colors.bright + colors.green, `✓ Costo: $${stats.totalCost.toFixed(4)}`);

  if (stats.failedRequests > 0) {
    log(colors.yellow, `⚠ ${stats.failedRequests} requests fallidos`);
  }

  log(colors.yellow, '\nPróximos pasos:');
  log(colors.cyan, '1. Revisar reporte: test-24-7-reporte.json');
  log(colors.cyan, '2. Activar bot con IA local (Ollama)');
  log(colors.cyan, '3. Ejecutar: npm run dev');

  console.log('\n' + '='.repeat(80) + '\n');
})().catch(error => {
  log(colors.red, `✗ Error: ${error.message}`);
  process.exit(1);
});
