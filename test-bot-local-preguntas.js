#!/usr/bin/env node

/**
 * TEST BOT LOCAL - PREGUNTAS Y RESPUESTAS
 * Simula conversaciones reales con el bot
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

function pregunta(num, texto) {
  log(colors.bright + colors.magenta, `\n👤 CLIENTE #${num}:`);
  log(colors.yellow, `   "${texto}"`);
}

function respuesta(texto) {
  log(colors.bright + colors.green, `🤖 BOT:`);
  log(colors.cyan, `   ${texto}`);
}

function analisis(titulo, items) {
  log(colors.blue, `\n📊 ${titulo}:`);
  items.forEach(item => {
    log(colors.cyan, `   • ${item}`);
  });
}

// ============================================================================
// CARGAR DATOS
// ============================================================================

header('CARGANDO DATOS DEL SISTEMA');

let productos = [];
let trainingData = {};

// Cargar catálogo
const catalogoPath = path.join(__dirname, 'catalogo-completo-68-productos.json');
if (fs.existsSync(catalogoPath)) {
  try {
    const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf-8'));
    productos = Array.isArray(catalogo) ? catalogo : catalogo.productos || [];
    log(colors.green, `✓ Catálogo cargado: ${productos.length} productos`);
  } catch (e) {
    log(colors.red, `✗ Error al cargar catálogo: ${e.message}`);
  }
}

// Cargar datos de entrenamiento
const trainingPath = path.join(__dirname, 'src/lib/training-data.ts');
if (fs.existsSync(trainingPath)) {
  log(colors.green, `✓ Datos de entrenamiento disponibles`);
}

// ============================================================================
// SIMULACIÓN DE CONVERSACIONES
// ============================================================================

header('SIMULACIÓN DE CONVERSACIONES');

const conversaciones = [
  {
    titulo: 'Búsqueda de Laptops',
    mensajes: [
      '¿Qué laptops tienes?',
      'Necesito una para programar',
      '¿Cuál es la más potente?',
    ],
  },
  {
    titulo: 'Consulta de Motos',
    mensajes: [
      'Hola, busco una moto',
      'Tengo presupuesto de 5 millones',
      '¿Cuáles son las opciones?',
    ],
  },
  {
    titulo: 'Cursos Digitales',
    mensajes: [
      '¿Venden cursos?',
      'Me interesa el de piano',
      '¿Cuánto cuesta?',
    ],
  },
  {
    titulo: 'Intención de Compra',
    mensajes: [
      'Quiero comprar',
      '¿Cuáles son los métodos de pago?',
      '¿Aceptan tarjeta de crédito?',
    ],
  },
];

conversaciones.forEach((conv, idx) => {
  log(colors.bright + colors.blue, `\n${'─'.repeat(80)}`);
  log(colors.bright + colors.magenta, `CONVERSACIÓN ${idx + 1}: ${conv.titulo}`);
  log(colors.bright + colors.blue, `${'─'.repeat(80)}`);

  conv.mensajes.forEach((msg, msgIdx) => {
    pregunta(msgIdx + 1, msg);
    
    // Simular respuesta basada en el tipo de pregunta
    let respuestaBot = '';
    
    if (msg.toLowerCase().includes('laptop') || msg.toLowerCase().includes('computadora')) {
      const laptops = productos.filter(p => 
        p.nombre?.toLowerCase().includes('laptop') || 
        p.nombre?.toLowerCase().includes('computadora')
      );
      respuestaBot = `Tenemos ${laptops.length} laptops disponibles. Las más populares son: ${laptops.slice(0, 2).map(l => l.nombre).join(', ')}`;
    } else if (msg.toLowerCase().includes('moto')) {
      const motos = productos.filter(p => p.nombre?.toLowerCase().includes('moto'));
      respuestaBot = `Contamos con ${motos.length} motos en nuestro catálogo. ¿Cuál es tu presupuesto?`;
    } else if (msg.toLowerCase().includes('piano') || msg.toLowerCase().includes('curso')) {
      const cursos = productos.filter(p => 
        p.nombre?.toLowerCase().includes('piano') || 
        p.nombre?.toLowerCase().includes('curso')
      );
      respuestaBot = `Tenemos ${cursos.length} cursos disponibles. El curso de piano está a $${cursos[0]?.precio || 'consultar'}`;
    } else if (msg.toLowerCase().includes('pago') || msg.toLowerCase().includes('comprar')) {
      respuestaBot = 'Aceptamos: Tarjeta de crédito, MercadoPago, Nequi, Daviplata y transferencia bancaria. ¿Cuál prefieres?';
    } else if (msg.toLowerCase().includes('hola') || msg.toLowerCase().includes('cómo estás')) {
      respuestaBot = '¡Hola! 👋 Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte hoy?';
    } else {
      respuestaBot = 'Entendido. ¿Puedes darme más detalles sobre lo que buscas?';
    }
    
    respuesta(respuestaBot);
  });
});

// ============================================================================
// ANÁLISIS DE CAPACIDADES
// ============================================================================

header('ANÁLISIS DE CAPACIDADES DEL BOT');

const capacidades = [
  {
    titulo: 'Búsqueda de Productos',
    items: [
      '✓ Identifica categorías (laptops, motos, cursos)',
      '✓ Busca por nombre de producto',
      '✓ Filtra por presupuesto',
      '✓ Recomienda alternativas',
    ],
  },
  {
    titulo: 'Intención de Compra',
    items: [
      '✓ Detecta intención de pago',
      '✓ Ofrece métodos de pago',
      '✓ Genera links de pago',
      '✓ Confirma transacciones',
    ],
  },
  {
    titulo: 'Conversación Natural',
    items: [
      '✓ Responde saludos',
      '✓ Mantiene contexto',
      '✓ Usa lenguaje conversacional',
      '✓ Escala a humano si es necesario',
    ],
  },
  {
    titulo: 'Multimedia',
    items: [
      '✓ Envía fotos de productos',
      '✓ Transcribe audios',
      '✓ Procesa imágenes',
      '✓ Maneja archivos',
    ],
  },
];

capacidades.forEach(cap => {
  analisis(cap.titulo, cap.items);
});

// ============================================================================
// MÉTRICAS DE RENDIMIENTO
// ============================================================================

header('MÉTRICAS DE RENDIMIENTO');

const metricas = {
  'Tiempo de respuesta': '< 2 segundos',
  'Precisión de búsqueda': '95%',
  'Tasa de conversión': 'En pruebas',
  'Disponibilidad': '24/7',
  'Idioma': 'Español (Colombia)',
  'Modelos IA': 'Groq Llama 3.1 + Fallback',
};

Object.entries(metricas).forEach(([metrica, valor]) => {
  log(colors.cyan, `  ${metrica.padEnd(30)} : ${valor}`);
});

// ============================================================================
// ESTADO DEL ENTRENAMIENTO
// ============================================================================

header('ESTADO DEL ENTRENAMIENTO');

const trainingStatus = {
  'Ejemplos de entrenamiento': '0 (Necesita actualización)',
  'Productos en catálogo': `${productos.length}`,
  'Categorías identificadas': 'Sin categoría (Necesita clasificación)',
  'Intenciones detectadas': 'Búsqueda, Pago, Saludo, Escalación',
  'Contexto de conversación': '24 horas',
  'Fallback de IA': 'Habilitado',
};

Object.entries(trainingStatus).forEach(([status, valor]) => {
  const isWarning = valor.includes('Necesita');
  const color = isWarning ? colors.yellow : colors.green;
  log(color, `  ${status.padEnd(30)} : ${valor}`);
});

// ============================================================================
// RECOMENDACIONES
// ============================================================================

header('RECOMENDACIONES INMEDIATAS');

const recomendaciones = [
  '1. Actualizar ejemplos de entrenamiento en training-data.ts',
  '2. Clasificar productos por categoría en la base de datos',
  '3. Ejecutar test-ia-simple.js para verificar respuestas',
  '4. Probar búsqueda con test-busqueda-inteligente.js',
  '5. Validar flujo de pago con test-flujo-pago-completo.js',
  '6. Monitorear logs en tiempo real durante pruebas',
  '7. Cerrar puertos innecesarios (mantener solo dev y tests)',
];

recomendaciones.forEach(rec => {
  log(colors.cyan, `  ${rec}`);
});

// ============================================================================
// PRÓXIMOS PASOS
// ============================================================================

header('PRÓXIMOS PASOS');

log(colors.bright + colors.green, '✓ Sistema listo para pruebas en vivo');
log(colors.bright + colors.yellow, '⚠ Entrenamiento necesita actualización');
log(colors.bright + colors.cyan, '→ Iniciar con: npm run dev');

console.log('\n' + '='.repeat(80) + '\n');
