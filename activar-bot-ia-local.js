#!/usr/bin/env node

/**
 * ACTIVAR BOT CON IA LOCAL
 * Configura el bot para usar Ollama en lugar de Groq
 * Después de agotar los tokens de Groq
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
// VERIFICAR OLLAMA
// ============================================================================

header('ACTIVAR BOT CON IA LOCAL (OLLAMA)');

section('1. VERIFICAR OLLAMA');

const http = require('http');

function verificarOllama() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/tags',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const modelos = JSON.parse(data);
          resolve({
            disponible: true,
            modelos: modelos.models || [],
          });
        } catch (e) {
          resolve({ disponible: false });
        }
      });
    });

    req.on('error', () => {
      resolve({ disponible: false });
    });

    req.end();
  });
}

(async () => {
  const ollamaStatus = await verificarOllama();

  if (!ollamaStatus.disponible) {
    log(colors.red, '✗ Ollama no está disponible');
    log(colors.yellow, '\nPara instalar Ollama:');
    log(colors.cyan, '  1. Descarga desde: https://ollama.ai');
    log(colors.cyan, '  2. Instala y ejecuta: ollama serve');
    log(colors.cyan, '  3. Descarga un modelo: ollama pull llama2');
    process.exit(1);
  }

  log(colors.green, '✓ Ollama disponible');
  log(colors.cyan, `  Modelos: ${ollamaStatus.modelos.length}`);

  if (ollamaStatus.modelos.length === 0) {
    log(colors.yellow, '\n⚠ No hay modelos descargados');
    log(colors.cyan, '  Descarga uno: ollama pull llama2');
    process.exit(1);
  }

  ollamaStatus.modelos.forEach(m => {
    log(colors.cyan, `  • ${m.name}`);
  });

  // ============================================================================
  // ACTUALIZAR .env
  // ============================================================================

  section('2. ACTUALIZAR CONFIGURACIÓN');

  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    log(colors.red, '✗ Archivo .env no encontrado');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Cambiar proveedor de IA a Ollama
  envContent = envContent.replace(
    /AI_PROVIDER=.*/,
    'AI_PROVIDER=ollama'
  );

  envContent = envContent.replace(
    /DEFAULT_AI_PROVIDER=.*/,
    'DEFAULT_AI_PROVIDER=ollama'
  );

  envContent = envContent.replace(
    /OLLAMA_ENABLED=.*/,
    'OLLAMA_ENABLED=true'
  );

  // Deshabilitar Groq como fallback
  envContent = envContent.replace(
    /AI_FALLBACK_ENABLED=.*/,
    'AI_FALLBACK_ENABLED=false'
  );

  fs.writeFileSync(envPath, envContent);
  log(colors.green, '✓ .env actualizado');
  log(colors.cyan, '  AI_PROVIDER=ollama');
  log(colors.cyan, '  OLLAMA_ENABLED=true');
  log(colors.cyan, '  AI_FALLBACK_ENABLED=false');

  // ============================================================================
  // CREAR ARCHIVO DE CONFIGURACIÓN
  // ============================================================================

  section('3. CREAR CONFIGURACIÓN DE IA LOCAL');

  const configIA = {
    timestamp: new Date().toISOString(),
    provider: 'ollama',
    settings: {
      baseUrl: 'http://localhost:11434',
      model: ollamaStatus.modelos[0].name,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      repeatPenalty: 1.1,
      numPredict: 500,
    },
    modelos: ollamaStatus.modelos.map(m => m.name),
    fallback: {
      enabled: false,
      providers: [],
    },
  };

  const configPath = path.join(__dirname, 'config-ia-local.json');
  fs.writeFileSync(configPath, JSON.stringify(configIA, null, 2));
  log(colors.green, `✓ Configuración guardada: ${configPath}`);

  // ============================================================================
  // CREAR SCRIPT DE INICIO
  // ============================================================================

  section('4. CREAR SCRIPT DE INICIO');

  const startScript = `#!/bin/bash
# Script para iniciar el bot con IA local

echo "=================================="
echo "INICIANDO BOT CON IA LOCAL"
echo "=================================="
echo ""

# Verificar Ollama
echo "Verificando Ollama..."
curl -s http://localhost:11434/api/tags > /dev/null
if [ $? -ne 0 ]; then
  echo "✗ Ollama no está disponible"
  echo "Ejecuta: ollama serve"
  exit 1
fi
echo "✓ Ollama disponible"
echo ""

# Iniciar bot
echo "Iniciando bot..."
npm run dev

echo ""
echo "Bot iniciado con IA local (Ollama)"
`;

  const scriptPath = path.join(__dirname, 'start-bot-local.sh');
  fs.writeFileSync(scriptPath, startScript);
  log(colors.green, `✓ Script de inicio creado: ${scriptPath}`);

  // ============================================================================
  // MOSTRAR RESUMEN
  // ============================================================================

  header('CONFIGURACIÓN COMPLETADA');

  log(colors.bright + colors.green, '✓ Bot configurado para usar IA local');

  log(colors.yellow, '\nPróximos pasos:');
  log(colors.cyan, '1. Asegúrate que Ollama está ejecutándose:');
  log(colors.cyan, '   ollama serve');
  log(colors.cyan, '');
  log(colors.cyan, '2. Inicia el bot:');
  log(colors.cyan, '   npm run dev');
  log(colors.cyan, '');
  log(colors.cyan, '3. Prueba el bot en WhatsApp');

  log(colors.yellow, '\nConfiguraciones aplicadas:');
  log(colors.cyan, `  • Proveedor: Ollama`);
  log(colors.cyan, `  • Modelo: ${configIA.settings.model}`);
  log(colors.cyan, `  • URL: ${configIA.settings.baseUrl}`);
  log(colors.cyan, `  • Fallback: Deshabilitado`);

  log(colors.yellow, '\nArchivos generados:');
  log(colors.cyan, `  • ${configPath}`);
  log(colors.cyan, `  • ${scriptPath}`);

  console.log('\n' + '='.repeat(80) + '\n');
})().catch(error => {
  log(colors.red, `✗ Error: ${error.message}`);
  process.exit(1);
});
