#!/usr/bin/env node

/**
 * ENTRENAMIENTO SIMPLE CON GROQ
 * Versión simplificada que funciona correctamente
 */

const fs = require('fs');
const path = require('path');
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
// INICIALIZAR
// ============================================================================

header('ENTRENAMIENTO SIMPLE CON GROQ');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  log(colors.red, '✗ Error: GROQ_API_KEY no configurada');
  process.exit(1);
}

const groq = new Groq({ apiKey });

// ============================================================================
// CARGAR PRODUCTOS
// ============================================================================

log(colors.cyan, 'Cargando productos...');

const catalogoPath = path.join(__dirname, 'catalogo-completo-68-productos.json');
let productos = [];

if (fs.existsSync(catalogoPath)) {
  try {
    const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf-8'));
    productos = Array.isArray(catalogo) ? catalogo : catalogo.productos || [];
    log(colors.green, `✓ ${productos.length} productos cargados`);
  } catch (e) {
    log(colors.red, `✗ Error: ${e.message}`);
    process.exit(1);
  }
} else {
  log(colors.red, `✗ Catálogo no encontrado`);
  process.exit(1);
}

// ============================================================================
// PROCESAR PRODUCTOS
// ============================================================================

log(colors.cyan, '\nProcesando productos...\n');

const trainingData = {
  generatedAt: new Date().toISOString(),
  totalProducts: productos.length,
  products: [],
  categories: new Set(),
  keywords: new Set(),
};

(async () => {
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    const nombre = producto.nombre || `Producto ${i + 1}`;
    const precio = producto.precio || 0;
    const descripcion = producto.descripcion || 'Sin descripción';

    process.stdout.write(`[${i + 1}/${productos.length}] ${nombre.substring(0, 40)}... `);

    try {
      // Generar categoría
      let categoria = producto.categoria || 'Otro';

      if (categoria === 'Otro' || !categoria) {
        try {
          const catResponse = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'user',
                content: `Clasifica en UNA categoría (máximo 2 palabras): ${nombre}\nCategorías: Laptop, Moto, Curso, Megapack, Accesorio, Otro\nResponde solo la categoría.`,
              },
            ],
            max_tokens: 20,
            temperature: 0.3,
          });
          categoria = catResponse.choices[0]?.message?.content?.trim() || 'Otro';
        } catch (e) {
          categoria = 'Otro';
        }
      }

      // Generar palabras clave
      let keywords = [];
      try {
        const kwResponse = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'user',
              content: `Genera 5 palabras clave para: ${nombre}\nResponde solo las palabras separadas por comas.`,
            },
          ],
          max_tokens: 50,
          temperature: 0.5,
        });
        keywords = kwResponse.choices[0]?.message?.content
          ?.split(',')
          .map(k => k.trim().toLowerCase())
          .filter(k => k.length > 0) || [];
      } catch (e) {
        keywords = [nombre.toLowerCase()];
      }

      // Guardar datos
      const productData = {
        id: i + 1,
        nombre,
        categoria,
        precio,
        descripcion,
        keywords,
      };

      trainingData.products.push(productData);
      trainingData.categories.add(categoria);
      keywords.forEach(k => trainingData.keywords.add(k));

      log(colors.green, `✓ ${categoria}`);
      processed++;
    } catch (error) {
      log(colors.red, `✗ Error`);
      errors++;
    }
  }

  // ============================================================================
  // GUARDAR RESULTADOS
  // ============================================================================

  header('GUARDANDO RESULTADOS');

  const trainingDataFinal = {
    ...trainingData,
    categories: Array.from(trainingData.categories),
    keywords: Array.from(trainingData.keywords),
    stats: {
      totalProducts: trainingData.products.length,
      processed,
      errors,
      successRate: `${((processed / productos.length) * 100).toFixed(2)}%`,
    },
  };

  const trainingPath = path.join(__dirname, 'training-data-groq.json');
  fs.writeFileSync(trainingPath, JSON.stringify(trainingDataFinal, null, 2));
  log(colors.green, `✓ Guardado: ${trainingPath}`);

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  header('ESTADÍSTICAS');

  log(colors.cyan, `Productos procesados: ${processed}/${productos.length}`);
  log(colors.cyan, `Tasa de éxito: ${trainingDataFinal.stats.successRate}`);
  log(colors.cyan, `Categorías: ${trainingDataFinal.categories.length}`);
  log(colors.cyan, `Palabras clave: ${trainingDataFinal.keywords.length}`);

  log(colors.yellow, '\nCategorías identificadas:');
  trainingDataFinal.categories.forEach(cat => {
    const count = trainingData.products.filter(p => p.categoria === cat).length;
    log(colors.cyan, `  • ${cat}: ${count} productos`);
  });

  header('ENTRENAMIENTO COMPLETADO');

  log(colors.bright + colors.green, `✓ ${processed} productos entrenados`);
  log(colors.bright + colors.green, `✓ Base de datos lista`);

  console.log('\n' + '='.repeat(80) + '\n');
})().catch(error => {
  log(colors.red, `✗ Error: ${error.message}`);
  process.exit(1);
});
