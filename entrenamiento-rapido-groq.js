#!/usr/bin/env node

/**
 * ENTRENAMIENTO RÁPIDO CON GROQ
 * Genera embeddings y descripciones para cada producto
 * Base para entrenamiento posterior con Ollama
 */

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

header('ENTRENAMIENTO RÁPIDO CON GROQ');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  log(colors.red, '✗ Error: GROQ_API_KEY no configurada');
  process.exit(1);
}

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
  log(colors.red, `✗ Catálogo no encontrado`);
  process.exit(1);
}

// ============================================================================
// GENERAR ENTRENAMIENTO RÁPIDO
// ============================================================================

section('2. GENERANDO ENTRENAMIENTO RÁPIDO');

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

  for (const producto of productos) {
    try {
      log(colors.cyan, `[${processed + 1}/${productos.length}] Procesando: ${producto.nombre}`);

      // Generar descripción mejorada con Groq
      const descriptionPrompt = `
Genera una descripción corta y atractiva para este producto (máximo 100 palabras):
Nombre: ${producto.nombre}
Precio: ${producto.precio}
Descripción actual: ${producto.descripcion || 'Sin descripción'}

Responde solo con la descripción mejorada, sin explicaciones adicionales.
      `.trim();

      const descriptionResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: descriptionPrompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const improvedDescription = descriptionResponse.choices[0]?.message?.content || producto.descripcion;

      // Generar categoría si no existe
      let categoria = producto.categoria || 'Sin categoría';
      if (categoria === 'Sin categoría') {
        const categoryPrompt = `
Clasifica este producto en UNA sola categoría (máximo 2 palabras):
${producto.nombre}

Categorías posibles: Laptop, Moto, Curso, Megapack, Accesorio, Otro

Responde solo con la categoría, sin explicaciones.
        `.trim();

        const categoryResponse = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: categoryPrompt }],
          max_tokens: 20,
          temperature: 0.3,
        });

        categoria = categoryResponse.choices[0]?.message?.content?.trim() || 'Otro';
      }

      // Generar palabras clave
      const keywordsPrompt = `
Genera 5 palabras clave para este producto (separadas por comas):
${producto.nombre}
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

      // Detectar intención
      let intent = 'search';
      const nombre_lower = producto.nombre.toLowerCase();
      if (nombre_lower.includes('curso') || nombre_lower.includes('capacitación')) {
        intent = 'recommendation';
      } else if (nombre_lower.includes('moto') || nombre_lower.includes('laptop')) {
        intent = 'recommendation';
      }

      // Guardar datos de entrenamiento
      const productTraining = {
        id: producto.id || processed,
        nombre: producto.nombre,
        categoria,
        precio: producto.precio,
        descripcion: improvedDescription,
        keywords,
        intent,
        ejemplos: [
          `¿Tienes ${producto.nombre}?`,
          `Busco ${categoria.toLowerCase()}`,
          `¿Cuál es el precio de ${producto.nombre}?`,
          `Me interesa ${producto.nombre}`,
        ],
      };

      trainingData.products.push(productTraining);
      trainingData.categories.add(categoria);
      keywords.forEach(k => trainingData.keywords.add(k));
      trainingData.intents[intent].push(producto.nombre);

      log(colors.green, `  ✓ Categoría: ${categoria}`);
      log(colors.green, `  ✓ Keywords: ${keywords.join(', ')}`);

      processed++;

      // Pequeña pausa para no saturar la API
      if (processed % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      log(colors.red, `  ✗ Error: ${error.message}`);
      errors++;
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
    },
  };

  // Guardar archivo de entrenamiento
  const trainingPath = path.join(__dirname, 'training-data-groq.json');
  fs.writeFileSync(trainingPath, JSON.stringify(trainingDataFinal, null, 2));
  log(colors.green, `✓ Entrenamiento guardado: ${trainingPath}`);

  // Guardar reporte
  const reportPath = path.join(__dirname, 'training-report-groq.json');
  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: trainingData.products.length,
    categories: trainingDataFinal.categories,
    keywords: trainingDataFinal.keywords.slice(0, 50), // Top 50
    intents: trainingData.intents,
    stats: trainingDataFinal.stats,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(colors.green, `✓ Reporte guardado: ${reportPath}`);

  // ============================================================================
  // MOSTRAR ESTADÍSTICAS
  // ============================================================================

  section('4. ESTADÍSTICAS DE ENTRENAMIENTO');

  log(colors.cyan, `Productos procesados: ${processed}/${productos.length}`);
  log(colors.cyan, `Tasa de éxito: ${trainingDataFinal.stats.successRate}`);
  log(colors.cyan, `Categorías identificadas: ${trainingDataFinal.categories.length}`);
  log(colors.cyan, `Palabras clave únicas: ${trainingDataFinal.keywords.length}`);

  section('5. CATEGORÍAS IDENTIFICADAS');
  trainingDataFinal.categories.forEach(cat => {
    const count = trainingData.products.filter(p => p.categoria === cat).length;
    log(colors.cyan, `  • ${cat}: ${count} productos`);
  });

  section('6. INTENCIONES DETECTADAS');
  Object.entries(trainingData.intents).forEach(([intent, items]) => {
    log(colors.cyan, `  • ${intent}: ${items.length} productos`);
  });

  section('7. TOP 20 PALABRAS CLAVE');
  const keywordFreq = {};
  trainingData.products.forEach(p => {
    p.keywords.forEach(k => {
      keywordFreq[k] = (keywordFreq[k] || 0) + 1;
    });
  });
  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  topKeywords.forEach(([keyword, freq]) => {
    log(colors.cyan, `  • ${keyword}: ${freq} veces`);
  });

  // ============================================================================
  // EJEMPLOS DE PRODUCTOS ENTRENADOS
  // ============================================================================

  section('8. EJEMPLOS DE PRODUCTOS ENTRENADOS');

  trainingData.products.slice(0, 3).forEach((p, idx) => {
    log(colors.magenta, `\nProducto ${idx + 1}: ${p.nombre}`);
    log(colors.cyan, `  Categoría: ${p.categoria}`);
    log(colors.cyan, `  Precio: $${p.precio}`);
    log(colors.cyan, `  Descripción: ${p.descripcion.substring(0, 80)}...`);
    log(colors.cyan, `  Keywords: ${p.keywords.join(', ')}`);
    log(colors.cyan, `  Intent: ${p.intent}`);
  });

  // ============================================================================
  // PRÓXIMOS PASOS
  // ============================================================================

  section('9. PRÓXIMOS PASOS');

  log(colors.yellow, '1. Revisar archivos generados:');
  log(colors.cyan, `   • ${trainingPath}`);
  log(colors.cyan, `   • ${reportPath}`);

  log(colors.yellow, '\n2. Usar para entrenamiento con Ollama:');
  log(colors.cyan, '   • Cargar datos en memoria');
  log(colors.cyan, '   • Generar embeddings con Ollama');
  log(colors.cyan, '   • Mejorar descripciones');

  log(colors.yellow, '\n3. Integrar en el bot:');
  log(colors.cyan, '   • Actualizar training-data.ts');
  log(colors.cyan, '   • Usar para búsqueda semántica');
  log(colors.cyan, '   • Mejorar recomendaciones');

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================

  header('ENTRENAMIENTO COMPLETADO');

  log(colors.bright + colors.green, `✓ ${processed} productos entrenados`);
  log(colors.bright + colors.green, `✓ ${trainingDataFinal.categories.length} categorías identificadas`);
  log(colors.bright + colors.green, `✓ ${trainingDataFinal.keywords.length} palabras clave extraídas`);
  log(colors.bright + colors.green, `✓ Base de entrenamiento lista para Ollama`);

  console.log('\n' + '='.repeat(80) + '\n');
})().catch(error => {
  log(colors.red, `✗ Error fatal: ${error.message}`);
  process.exit(1);
});
