#!/usr/bin/env node

/**
 * PREPARAR DATOS PARA OLLAMA
 * Convierte el entrenamiento de Groq a formato para Ollama
 * Genera embeddings y contexto para búsqueda semántica
 */

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
// CARGAR DATOS DE GROQ
// ============================================================================

header('PREPARAR DATOS PARA OLLAMA');

section('1. CARGANDO DATOS DE GROQ');

const trainingPath = path.join(__dirname, 'training-data-groq.json');
let trainingData = null;

if (fs.existsSync(trainingPath)) {
  try {
    trainingData = JSON.parse(fs.readFileSync(trainingPath, 'utf-8'));
    log(colors.green, `✓ Datos de Groq cargados: ${trainingData.products.length} productos`);
  } catch (e) {
    log(colors.red, `✗ Error al cargar datos: ${e.message}`);
    process.exit(1);
  }
} else {
  log(colors.red, `✗ Archivo no encontrado: ${trainingPath}`);
  log(colors.yellow, `\nEjecuta primero: node entrenamiento-rapido-groq.js`);
  process.exit(1);
}

// ============================================================================
// PREPARAR DATOS PARA OLLAMA
// ============================================================================

section('2. PREPARANDO DATOS PARA OLLAMA');

const ollamaData = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  source: 'Groq Training',
  documents: [],
  metadata: {
    totalProducts: trainingData.products.length,
    categories: trainingData.categories,
    keywords: trainingData.keywords,
  },
};

// Convertir cada producto a documento para Ollama
trainingData.products.forEach((product, idx) => {
  const document = {
    id: product.id || idx,
    title: product.nombre,
    category: product.categoria,
    price: product.precio,
    content: `
Producto: ${product.nombre}
Categoría: ${product.categoria}
Precio: $${product.precio}
Descripción: ${product.descripcion}
Palabras clave: ${product.keywords.join(', ')}
Tipo: ${product.intent}
    `.trim(),
    metadata: {
      keywords: product.keywords,
      intent: product.intent,
      ejemplos: product.ejemplos,
    },
  };

  ollamaData.documents.push(document);
});

// ============================================================================
// GENERAR CONTEXTO PARA BÚSQUEDA
// ============================================================================

section('3. GENERANDO CONTEXTO PARA BÚSQUEDA');

const searchContext = {
  categories: {},
  keywords: {},
  intents: {},
};

// Agrupar por categoría
trainingData.products.forEach(product => {
  const cat = product.categoria;
  if (!searchContext.categories[cat]) {
    searchContext.categories[cat] = [];
  }
  searchContext.categories[cat].push({
    nombre: product.nombre,
    precio: product.precio,
    keywords: product.keywords,
  });
});

// Agrupar por intención
trainingData.products.forEach(product => {
  const intent = product.intent;
  if (!searchContext.intents[intent]) {
    searchContext.intents[intent] = [];
  }
  searchContext.intents[intent].push(product.nombre);
});

// Contar palabras clave
trainingData.products.forEach(product => {
  product.keywords.forEach(keyword => {
    if (!searchContext.keywords[keyword]) {
      searchContext.keywords[keyword] = [];
    }
    searchContext.keywords[keyword].push(product.nombre);
  });
});

log(colors.green, `✓ Contexto generado`);
log(colors.cyan, `  • Categorías: ${Object.keys(searchContext.categories).length}`);
log(colors.cyan, `  • Palabras clave: ${Object.keys(searchContext.keywords).length}`);
log(colors.cyan, `  • Intenciones: ${Object.keys(searchContext.intents).length}`);

// ============================================================================
// GENERAR EJEMPLOS DE ENTRENAMIENTO
// ============================================================================

section('4. GENERANDO EJEMPLOS DE ENTRENAMIENTO');

const trainingExamples = {
  search: [],
  recommendation: [],
  price_inquiry: [],
  purchase_intent: [],
};

trainingData.products.forEach(product => {
  const intent = product.intent;

  // Ejemplos de búsqueda
  trainingExamples.search.push({
    query: `¿Tienes ${product.nombre}?`,
    response: `Sí, tenemos ${product.nombre} a $${product.precio}`,
    product: product.nombre,
  });

  trainingExamples.search.push({
    query: `Busco ${product.categoria.toLowerCase()}`,
    response: `Tenemos varios ${product.categoria.toLowerCase()}s disponibles, incluyendo ${product.nombre}`,
    product: product.nombre,
  });

  // Ejemplos de recomendación
  if (intent === 'recommendation') {
    trainingExamples.recommendation.push({
      query: `¿Qué ${product.categoria.toLowerCase()} me recomiendas?`,
      response: `Te recomiendo ${product.nombre}. ${product.descripcion}`,
      product: product.nombre,
    });
  }

  // Ejemplos de precio
  trainingExamples.price_inquiry.push({
    query: `¿Cuál es el precio de ${product.nombre}?`,
    response: `${product.nombre} cuesta $${product.precio}`,
    product: product.nombre,
  });

  // Ejemplos de intención de compra
  trainingExamples.purchase_intent.push({
    query: `Quiero comprar ${product.nombre}`,
    response: `Excelente, ${product.nombre} está disponible. ¿Cuál es tu método de pago preferido?`,
    product: product.nombre,
  });
});

log(colors.green, `✓ Ejemplos generados`);
log(colors.cyan, `  • Búsqueda: ${trainingExamples.search.length}`);
log(colors.cyan, `  • Recomendación: ${trainingExamples.recommendation.length}`);
log(colors.cyan, `  • Precio: ${trainingExamples.price_inquiry.length}`);
log(colors.cyan, `  • Compra: ${trainingExamples.purchase_intent.length}`);

// ============================================================================
// GUARDAR ARCHIVOS
// ============================================================================

section('5. GUARDANDO ARCHIVOS');

// Guardar datos para Ollama
const ollamaPath = path.join(__dirname, 'ollama-training-data.json');
fs.writeFileSync(ollamaPath, JSON.stringify(ollamaData, null, 2));
log(colors.green, `✓ Datos para Ollama: ${ollamaPath}`);

// Guardar contexto de búsqueda
const contextPath = path.join(__dirname, 'search-context.json');
fs.writeFileSync(contextPath, JSON.stringify(searchContext, null, 2));
log(colors.green, `✓ Contexto de búsqueda: ${contextPath}`);

// Guardar ejemplos de entrenamiento
const examplesPath = path.join(__dirname, 'training-examples.json');
fs.writeFileSync(examplesPath, JSON.stringify(trainingExamples, null, 2));
log(colors.green, `✓ Ejemplos de entrenamiento: ${examplesPath}`);

// ============================================================================
// GENERAR REPORTE
// ============================================================================

section('6. GENERANDO REPORTE');

const report = {
  generatedAt: new Date().toISOString(),
  source: 'Groq Training',
  statistics: {
    totalProducts: trainingData.products.length,
    totalCategories: Object.keys(searchContext.categories).length,
    totalKeywords: Object.keys(searchContext.keywords).length,
    totalIntents: Object.keys(searchContext.intents).length,
    totalExamples: Object.values(trainingExamples).reduce((sum, arr) => sum + arr.length, 0),
  },
  categories: Object.keys(searchContext.categories).map(cat => ({
    name: cat,
    count: searchContext.categories[cat].length,
    products: searchContext.categories[cat].map(p => p.nombre),
  })),
  topKeywords: Object.entries(searchContext.keywords)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20)
    .map(([keyword, products]) => ({
      keyword,
      count: products.length,
      products,
    })),
  intents: Object.entries(searchContext.intents).map(([intent, products]) => ({
    intent,
    count: products.length,
    examples: products.slice(0, 3),
  })),
};

const reportPath = path.join(__dirname, 'ollama-training-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
log(colors.green, `✓ Reporte: ${reportPath}`);

// ============================================================================
// MOSTRAR RESUMEN
// ============================================================================

section('7. RESUMEN DE PREPARACIÓN');

log(colors.cyan, `Productos procesados: ${report.statistics.totalProducts}`);
log(colors.cyan, `Categorías: ${report.statistics.totalCategories}`);
log(colors.cyan, `Palabras clave: ${report.statistics.totalKeywords}`);
log(colors.cyan, `Intenciones: ${report.statistics.totalIntents}`);
log(colors.cyan, `Ejemplos de entrenamiento: ${report.statistics.totalExamples}`);

section('8. CATEGORÍAS');
report.categories.forEach(cat => {
  log(colors.cyan, `  • ${cat.name}: ${cat.count} productos`);
});

section('9. TOP 10 PALABRAS CLAVE');
report.topKeywords.slice(0, 10).forEach(kw => {
  log(colors.cyan, `  • ${kw.keyword}: ${kw.count} productos`);
});

section('10. INTENCIONES');
report.intents.forEach(intent => {
  log(colors.cyan, `  • ${intent.intent}: ${intent.count} productos`);
});

// ============================================================================
// PRÓXIMOS PASOS
// ============================================================================

section('11. PRÓXIMOS PASOS');

log(colors.yellow, '1. Archivos generados:');
log(colors.cyan, `   • ${ollamaPath}`);
log(colors.cyan, `   • ${contextPath}`);
log(colors.cyan, `   • ${examplesPath}`);
log(colors.cyan, `   • ${reportPath}`);

log(colors.yellow, '\n2. Usar con Ollama:');
log(colors.cyan, '   • Cargar ollama-training-data.json');
log(colors.cyan, '   • Generar embeddings');
log(colors.cyan, '   • Mejorar descripciones');

log(colors.yellow, '\n3. Integrar en el bot:');
log(colors.cyan, '   • Usar search-context.json para búsqueda');
log(colors.cyan, '   • Usar training-examples.json para respuestas');
log(colors.cyan, '   • Actualizar training-data.ts');

// ============================================================================
// RESUMEN FINAL
// ============================================================================

header('PREPARACIÓN COMPLETADA');

log(colors.bright + colors.green, `✓ Datos preparados para Ollama`);
log(colors.bright + colors.green, `✓ ${report.statistics.totalExamples} ejemplos de entrenamiento`);
log(colors.bright + colors.green, `✓ Contexto de búsqueda generado`);
log(colors.bright + colors.green, `✓ Listo para mejorar con Ollama`);

console.log('\n' + '='.repeat(80) + '\n');
