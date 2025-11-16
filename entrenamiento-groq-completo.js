#!/usr/bin/env node

/**
 * ENTRENAMIENTO COMPLETO CON GROQ
 * Genera embeddings y descripciones para cada producto
 * Continúa hasta agotar tokens disponibles
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

// Colores para consola
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
// INICIALIZAR GROQ
// ============================================================================

header('ENTRENAMIENTO COMPLETO CON GROQ');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  log(colors.red, '✗ Error: GROQ_API_KEY no configurada');
  log(colors.yellow, 'Asegúrate de que .env esté en el directorio raíz');
  process.exit(1);
}

log(colors.green, `✓ API Key cargada: ${apiKey.substring(0, 10)}...`);

const groq = new Groq({ apiKey });

// ============================================================================
// CARGAR PRODUCTOS
// ============================================================================

section('1. CARGANDO PRODUCTOS');

const catalogoPath = path.join(__dirname, 'catalogo-completo-68-productos.json');
let productos = [];

if (fs.existsSync(catalogoPath)) {
  try {
    const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf-8'));
    productos = Array.isArray(catalogo) ? catalogo : catalogo.productos || [];
    log(colors.green, `✓ Catálogo cargado: ${productos.length} productos`);
  } catch (e) {
    log(colors.red, `✗ Error al cargar catálogo: ${e.message}`);
    process.exit(1);
  }
} else {
  log(colors.red, `✗ Catálogo no encontrado en: ${catalogoPath}`);
  process.exit(1);
}

// ============================================================================
// ESTADÍSTICAS DE TOKENS
// ============================================================================

let tokenStats = {
  totalTokensUsed: 0,
  requestsCompleted: 0,
  requestsFailed: 0,
  startTime: Date.now(),
  estimatedTokensPerProduct: 150, // Aproximado
};

// ============================================================================
// GENERAR ENTRENAMIENTO COMPLETO
// ============================================================================

section('2. INICIANDO ENTRENAMIENTO');

const trainingData = {
  generatedAt: new Date().toISOString(),
  totalProducts: productos.length,
  products: [],
  categories: new Set(),
  keywords: new Set(),
  intents: {
    search: [],
    recommendation: [],
    price_inquiry: [],
    purchase_intent: [],
  },
};

// Procesar productos
(async () => {
  let processed = 0;
  let errors = 0;
  let stopped = false;

  log(colors.yellow, `\n⏱️  El entrenamiento continuará hasta agotar los tokens disponibles`);
  log(colors.yellow, `📊 Estimado: ~${(productos.length * tokenStats.estimatedTokensPerProduct).toLocaleString()} tokens totales\n`);

  for (const producto of productos) {
    if (stopped) break;

    try {
      // Normalizar nombres de propiedades
      const nombre = producto.nombre || producto.name || 'Sin nombre';
      const descripcion = producto.descripcion || producto.description || 'Sin descripción';
      const precio = producto.precio || producto.price || 0;
      const categoria = producto.categoria || producto.category || 'Sin categoría';

      const progressPercent = ((processed + 1) / productos.length * 100).toFixed(1);
      log(colors.cyan, `[${processed + 1}/${productos.length}] (${progressPercent}%) ${nombre}`);

      // 1. Generar descripción mejorada
      const descriptionPrompt = `
Genera una descripción corta y atractiva para este producto (máximo 100 palabras):
Nombre: ${nombre}
Precio: ${precio}
Descripción actual: ${descripcion}

Responde solo con la descripción mejorada, sin explicaciones adicionales.
      `.trim();

      const descriptionResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: descriptionPrompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const improvedDescription = descriptionResponse.choices[0]?.message?.content || descripcion;
      tokenStats.totalTokensUsed += descriptionResponse.usage?.total_tokens || 0;
      tokenStats.requestsCompleted++;

      // 2. Generar categoría
      let categoriaFinal = categoria;
      if (categoriaFinal === 'Sin categoría' || !categoriaFinal) {
        const categoryPrompt = `
Clasifica este producto en UNA sola categoría (máximo 2 palabras):
${nombre}

Categorías posibles: Tablet, Impresora, Laptop, Moto, Curso, Megapack, Accesorio, Electrónica, Otro

Responde solo con la categoría, sin explicaciones.
        `.trim();

        const categoryResponse = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: categoryPrompt }],
          max_tokens: 20,
          temperature: 0.3,
        });

        categoriaFinal = categoryResponse.choices[0]?.message?.content?.trim() || 'Otro';
        tokenStats.totalTokensUsed += categoryResponse.usage?.total_tokens || 0;
        tokenStats.requestsCompleted++;
      }

      // 3. Generar palabras clave
      const keywordsPrompt = `
Genera 5 palabras clave para este producto (separadas por comas):
${nombre}
${improvedDescription}

Responde solo con las palabras clave, sin explicaciones.
      `.trim();

      const keywordsResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: keywordsPrompt }],
        max_tokens: 50,
        temperature: 0.5,
      });

      const keywords = keywordsResponse.choices[0]?.message?.content
        ?.split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0) || [];
      tokenStats.totalTokensUsed += keywordsResponse.usage?.total_tokens || 0;
      tokenStats.requestsCompleted++;

      // 4. Generar ejemplos de preguntas
      const examplesPrompt = `
Genera 3 ejemplos de preguntas que un cliente podría hacer sobre este producto:
${nombre}
${improvedDescription}

Responde solo con las preguntas, una por línea, sin numeración.
      `.trim();

      const examplesResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: examplesPrompt }],
        max_tokens: 100,
        temperature: 0.6,
      });

      const ejemplos = examplesResponse.choices[0]?.message?.content
        ?.split('\n')
        .map(e => e.trim())
        .filter(e => e.length > 0) || [];
      tokenStats.totalTokensUsed += examplesResponse.usage?.total_tokens || 0;
      tokenStats.requestsCompleted++;

      // 5. Detectar intención
      let intent = 'search';
      const nombre_lower = nombre.toLowerCase();
      if (nombre_lower.includes('curso') || nombre_lower.includes('capacitación')) {
        intent = 'recommendation';
      } else if (nombre_lower.includes('moto') || nombre_lower.includes('laptop')) {
        intent = 'recommendation';
      }

      // Guardar datos de entrenamiento
      const productTraining = {
        id: producto.id || processed,
        nombre: nombre,
        categoria: categoriaFinal,
        precio: precio,
        descripcion: improvedDescription,
        keywords,
        intent,
        ejemplos,
      };

      trainingData.products.push(productTraining);
      trainingData.categories.add(categoriaFinal);
      keywords.forEach(k => trainingData.keywords.add(k));
      trainingData.intents[intent].push(nombre);

      log(colors.green, `  ✓ Categoría: ${categoriaFinal} | Keywords: ${keywords.slice(0, 2).join(', ')}...`);
      log(colors.cyan, `  📊 Tokens usados: ${tokenStats.totalTokensUsed.toLocaleString()} | Requests: ${tokenStats.requestsCompleted}`);

      processed++;

      // Pausa adaptativa para no saturar
      if (processed % 3 === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      if (error.message.includes('rate_limit') || error.message.includes('quota')) {
        log(colors.red, `\n⚠️  LÍMITE DE TOKENS ALCANZADO`);
        log(colors.yellow, `Error: ${error.message}`);
        stopped = true;
        break;
      } else {
        log(colors.red, `  ✗ Error: ${error.message}`);
        errors++;
      }
    }
  }

  // ============================================================================
  // GUARDAR RESULTADOS
  // ============================================================================

  section('3. GUARDANDO RESULTADOS');

  // Convertir Sets a Arrays
  const trainingDataFinal = {
    ...trainingData,
    categories: Array.from(trainingData.categories),
    keywords: Array.from(trainingData.keywords),
    stats: {
      totalProducts: trainingData.products.length,
      totalCategories: trainingData.categories.size,
      totalKeywords: trainingData.keywords.size,
      processed,
      errors,
      successRate: `${((processed / productos.length) * 100).toFixed(2)}%`,
      tokenStats: {
        totalTokensUsed: tokenStats.totalTokensUsed,
        requestsCompleted: tokenStats.requestsCompleted,
        requestsFailed: tokenStats.requestsFailed,
        averageTokensPerRequest: Math.round(tokenStats.totalTokensUsed / tokenStats.requestsCompleted),
        executionTime: `${((Date.now() - tokenStats.startTime) / 1000).toFixed(2)}s`,
      },
    },
  };

  // Guardar archivo de entrenamiento
  const trainingPath = path.join(__dirname, 'training-data-groq-completo.json');
  fs.writeFileSync(trainingPath, JSON.stringify(trainingDataFinal, null, 2));
  log(colors.green, `✓ Entrenamiento guardado: ${trainingPath}`);

  // Guardar reporte detallado
  const reportPath = path.join(__dirname, 'training-report-groq-completo.json');
  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: trainingData.products.length,
    categories: trainingDataFinal.categories,
    keywords: trainingDataFinal.keywords.slice(0, 100), // Top 100
    intents: trainingData.intents,
    stats: trainingDataFinal.stats,
    stoppedEarly: stopped,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(colors.green, `✓ Reporte guardado: ${reportPath}`);

  // ============================================================================
  // MOSTRAR ESTADÍSTICAS FINALES
  // ============================================================================

  section('4. ESTADÍSTICAS FINALES');

  log(colors.cyan, `Productos procesados: ${processed}/${productos.length}`);
  log(colors.cyan, `Tasa de éxito: ${trainingDataFinal.stats.successRate}`);
  log(colors.cyan, `Categorías identificadas: ${trainingDataFinal.categories.length}`);
  log(colors.cyan, `Palabras clave únicas: ${trainingDataFinal.keywords.length}`);
  log(colors.cyan, `\n📊 TOKENS UTILIZADOS:`);
  log(colors.cyan, `  • Total: ${tokenStats.totalTokensUsed.toLocaleString()}`);
  log(colors.cyan, `  • Requests: ${tokenStats.requestsCompleted}`);
  log(colors.cyan, `  • Promedio por request: ${Math.round(tokenStats.totalTokensUsed / tokenStats.requestsCompleted)}`);
  log(colors.cyan, `  • Tiempo de ejecución: ${trainingDataFinal.stats.tokenStats.executionTime}`);

  if (stopped) {
    log(colors.yellow, `\n⚠️  ENTRENAMIENTO DETENIDO: Se alcanzó el límite de tokens`);
  }

  section('5. CATEGORÍAS IDENTIFICADAS');
  trainingDataFinal.categories.forEach(cat => {
    const count = trainingData.products.filter(p => p.categoria === cat).length;
    log(colors.cyan, `  • ${cat}: ${count} productos`);
  });

  section('6. INTENCIONES DETECTADAS');
  Object.entries(trainingData.intents).forEach(([intent, items]) => {
    log(colors.cyan, `  • ${intent}: ${items.length} productos`);
  });

  section('7. TOP 30 PALABRAS CLAVE');
  const keywordFreq = {};
  trainingData.products.forEach(p => {
    p.keywords.forEach(k => {
      keywordFreq[k] = (keywordFreq[k] || 0) + 1;
    });
  });
  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
  topKeywords.forEach(([keyword, freq]) => {
    log(colors.cyan, `  • ${keyword}: ${freq} veces`);
  });

  section('8. EJEMPLOS DE PRODUCTOS ENTRENADOS');

  trainingData.products.slice(0, 3).forEach((p, idx) => {
    log(colors.magenta, `\nProducto ${idx + 1}: ${p.nombre}`);
    log(colors.cyan, `  Categoría: ${p.categoria}`);
    log(colors.cyan, `  Precio: ${p.precio}`);
    log(colors.cyan, `  Descripción: ${p.descripcion.substring(0, 80)}...`);
    log(colors.cyan, `  Keywords: ${p.keywords.join(', ')}`);
    log(colors.cyan, `  Intent: ${p.intent}`);
    log(colors.cyan, `  Ejemplos:`);
    p.ejemplos.slice(0, 2).forEach(ej => {
      log(colors.cyan, `    - ${ej}`);
    });
  });

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================

  header('ENTRENAMIENTO COMPLETADO');

  log(colors.bright + colors.green, `✓ ${processed} productos entrenados`);
  log(colors.bright + colors.green, `✓ ${trainingDataFinal.categories.length} categorías identificadas`);
  log(colors.bright + colors.green, `✓ ${trainingDataFinal.keywords.length} palabras clave extraídas`);
  log(colors.bright + colors.green, `✓ ${tokenStats.totalTokensUsed.toLocaleString()} tokens utilizados`);
  log(colors.bright + colors.green, `✓ Base de entrenamiento lista para usar`);

  if (stopped) {
    log(colors.bright + colors.yellow, `⚠️  Entrenamiento detenido por límite de tokens`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
})().catch(error => {
  log(colors.red, `✗ Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
