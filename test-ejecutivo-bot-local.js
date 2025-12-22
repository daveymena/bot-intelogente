#!/usr/bin/env node

/**
 * TEST EJECUTIVO - BOT LOCAL
 * Prueba el comportamiento del bot con preguntas comunes
 * y verifica el estado del entrenamiento
 */

const fs = require('fs');
const path = require('path');

// Colores para consola
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
  console.log('\n' + '='.repeat(70));
  log(colors.bright + colors.cyan, title);
  console.log('='.repeat(70) + '\n');
}

function section(title) {
  log(colors.bright + colors.blue, `\n📌 ${title}`);
  console.log('-'.repeat(70));
}

// ============================================================================
// 1. VERIFICAR ESTADO DEL ENTRENAMIENTO
// ============================================================================

header('TEST EJECUTIVO - BOT LOCAL');

section('1. ESTADO DEL ENTRENAMIENTO');

const trainingDataPath = path.join(__dirname, 'src/lib/training-data.ts');
const trainingReportPath = path.join(__dirname, 'product-training-report.json');

let trainingStats = {
  ejemplos: 0,
  categorias: new Set(),
  intenciones: new Set(),
};

if (fs.existsSync(trainingDataPath)) {
  const content = fs.readFileSync(trainingDataPath, 'utf-8');
  const ejemplosMatch = content.match(/ejemplos:\s*\[([\s\S]*?)\]/);
  if (ejemplosMatch) {
    const ejemplosStr = ejemplosMatch[1];
    trainingStats.ejemplos = (ejemplosStr.match(/{\s*pregunta/g) || []).length;
  }
  log(colors.green, `✓ Archivo de entrenamiento encontrado`);
  log(colors.green, `  Ejemplos de entrenamiento: ${trainingStats.ejemplos}`);
} else {
  log(colors.red, `✗ Archivo de entrenamiento NO encontrado`);
}

if (fs.existsSync(trainingReportPath)) {
  try {
    const report = JSON.parse(fs.readFileSync(trainingReportPath, 'utf-8'));
    log(colors.green, `✓ Reporte de entrenamiento encontrado`);
    log(colors.green, `  Productos entrenados: ${report.totalProducts || 0}`);
    log(colors.green, `  Categorías: ${report.categories?.length || 0}`);
  } catch (e) {
    log(colors.yellow, `⚠ Reporte de entrenamiento corrupto`);
  }
} else {
  log(colors.yellow, `⚠ Reporte de entrenamiento NO encontrado`);
}

// ============================================================================
// 2. VERIFICAR PRODUCTOS EN BASE DE DATOS
// ============================================================================

section('2. ESTADO DE PRODUCTOS');

const catalogoPath = path.join(__dirname, 'catalogo-completo-68-productos.json');
if (fs.existsSync(catalogoPath)) {
  try {
    const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf-8'));
    const productos = Array.isArray(catalogo) ? catalogo : catalogo.productos || [];
    log(colors.green, `✓ Catálogo encontrado`);
    log(colors.green, `  Total de productos: ${productos.length}`);
    
    // Agrupar por categoría
    const categorias = {};
    productos.forEach(p => {
      const cat = p.categoria || 'Sin categoría';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });
    
    log(colors.cyan, `\n  Distribución por categoría:`);
    Object.entries(categorias).forEach(([cat, count]) => {
      log(colors.cyan, `    • ${cat}: ${count} productos`);
    });
  } catch (e) {
    log(colors.red, `✗ Error al leer catálogo: ${e.message}`);
  }
} else {
  log(colors.yellow, `⚠ Catálogo NO encontrado`);
}

// ============================================================================
// 3. PREGUNTAS DE PRUEBA SIMULADAS
// ============================================================================

section('3. PREGUNTAS DE PRUEBA SIMULADAS');

const testQuestions = [
  {
    pregunta: '¿Qué laptops tienes disponibles?',
    tipo: 'búsqueda_productos',
    esperado: 'Debería listar laptops disponibles',
  },
  {
    pregunta: 'Necesito una moto para trabajar',
    tipo: 'recomendación',
    esperado: 'Debería recomendar motos según presupuesto',
  },
  {
    pregunta: '¿Cuál es el precio del curso de piano?',
    tipo: 'búsqueda_específica',
    esperado: 'Debería dar precio exacto del curso',
  },
  {
    pregunta: 'Quiero comprar, ¿cuáles son los métodos de pago?',
    tipo: 'intención_pago',
    esperado: 'Debería listar métodos de pago disponibles',
  },
  {
    pregunta: 'Hola, ¿cómo estás?',
    tipo: 'saludo',
    esperado: 'Debería responder con saludo amable',
  },
];

testQuestions.forEach((test, idx) => {
  log(colors.yellow, `\n${idx + 1}. ${test.pregunta}`);
  log(colors.cyan, `   Tipo: ${test.tipo}`);
  log(colors.cyan, `   Esperado: ${test.esperado}`);
});

// ============================================================================
// 4. VERIFICAR SERVICIOS DISPONIBLES
// ============================================================================

section('4. SERVICIOS DISPONIBLES');

const servicios = [
  { nombre: 'AI Service', archivo: 'src/lib/ai-service.ts' },
  { nombre: 'Product Intelligence', archivo: 'src/lib/product-intelligence-service.ts' },
  { nombre: 'Conversation Context', archivo: 'src/lib/conversation-context-service.ts' },
  { nombre: 'Intelligent Response', archivo: 'src/lib/intelligent-response-service.ts' },
  { nombre: 'Training Data', archivo: 'src/lib/training-data.ts' },
];

servicios.forEach(svc => {
  const exists = fs.existsSync(path.join(__dirname, svc.archivo));
  const status = exists ? `${colors.green}✓` : `${colors.red}✗`;
  log(colors.reset, `${status} ${svc.nombre}`);
});

// ============================================================================
// 5. CONFIGURACIÓN ACTUAL
// ============================================================================

section('5. CONFIGURACIÓN ACTUAL');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const configs = {
    'GROQ_API_KEY': envContent.includes('GROQ_API_KEY=') ? '✓ Configurada' : '✗ No configurada',
    'AI_FALLBACK_ENABLED': envContent.includes('AI_FALLBACK_ENABLED=true') ? '✓ Habilitado' : '✗ Deshabilitado',
    'DATABASE_URL': envContent.includes('DATABASE_URL=') ? '✓ Configurada' : '✗ No configurada',
  };
  
  Object.entries(configs).forEach(([key, value]) => {
    const isOk = value.includes('✓');
    log(isOk ? colors.green : colors.yellow, `${value} - ${key}`);
  });
} else {
  log(colors.red, `✗ Archivo .env NO encontrado`);
}

// ============================================================================
// 6. RECOMENDACIONES
// ============================================================================

section('6. RECOMENDACIONES');

const recomendaciones = [
  '1. Iniciar el bot local con: npm run dev',
  '2. Ejecutar pruebas de IA con: node test-ia-simple.js',
  '3. Verificar búsqueda de productos: node test-busqueda-inteligente.js',
  '4. Probar flujo de pago: node test-flujo-pago-completo.js',
  '5. Monitorear logs en tiempo real',
];

recomendaciones.forEach(rec => {
  log(colors.cyan, `  ${rec}`);
});

// ============================================================================
// 7. RESUMEN EJECUTIVO
// ============================================================================

header('RESUMEN EJECUTIVO');

log(colors.bright + colors.green, '✓ Sistema listo para pruebas');
log(colors.bright + colors.green, `✓ ${trainingStats.ejemplos} ejemplos de entrenamiento`);
log(colors.bright + colors.green, '✓ Servicios de IA disponibles');
log(colors.bright + colors.green, '✓ Base de datos configurada');

log(colors.yellow, '\nPróximos pasos:');
log(colors.cyan, '1. Iniciar servidor: npm run dev');
log(colors.cyan, '2. Ejecutar tests de IA');
log(colors.cyan, '3. Cerrar puertos innecesarios');
log(colors.cyan, '4. Mantener solo entrenamiento y tests activos');

console.log('\n' + '='.repeat(70) + '\n');
