/**
 * Preparar Deploy a Easypanel
 * Verifica y prepara el proyecto para subir a Git
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando deploy a Easypanel...\n');

// 1. Verificar archivos críticos
console.log('📋 Verificando archivos críticos:\n');

const criticalFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  '.env.example',
  'src/lib/ai-multi-provider.ts',
  'src/lib/ai-model-selector.ts',
  'src/lib/deep-reasoning-ai-service.ts',
  'src/lib/product-documentation-service.ts'
];

let allFilesExist = true;

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos críticos. Verifica el proyecto.');
  process.exit(1);
}

console.log('\n✅ Todos los archivos críticos presentes\n');

// 2. Verificar .gitignore
console.log('📋 Verificando .gitignore:\n');

const gitignorePath = path.join(__dirname, '.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  console.log('   ✅ .gitignore existe');
} else {
  console.log('   ⚠️ .gitignore no existe, creando...');
}

// Asegurar que .env está en .gitignore
const requiredIgnores = [
  '.env',
  '.env.local',
  'node_modules',
  '.next',
  'out',
  'dist',
  '.wwebjs_auth',
  '.wwebjs_cache',
  'whatsapp-sessions',
  'temp-audio',
  '*.log',
  '.DS_Store',
  'dev.db',
  'dev.db-journal'
];

let gitignoreUpdated = false;

requiredIgnores.forEach(ignore => {
  if (!gitignoreContent.includes(ignore)) {
    gitignoreContent += `\n${ignore}`;
    gitignoreUpdated = true;
  }
});

if (gitignoreUpdated) {
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('   ✅ .gitignore actualizado');
} else {
  console.log('   ✅ .gitignore está completo');
}

// 3. Verificar .env.example está actualizado
console.log('\n📋 Verificando .env.example:\n');

const envExamplePath = path.join(__dirname, '.env.example');
const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

const requiredEnvVars = [
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
  'OLLAMA_BASE_URL',
  'AI_FALLBACK_ORDER',
  'AI_AUTO_MODEL_DETECTION'
];

let allEnvVarsPresent = true;

requiredEnvVars.forEach(envVar => {
  const present = envExampleContent.includes(envVar);
  console.log(`   ${present ? '✅' : '❌'} ${envVar}`);
  if (!present) allEnvVarsPresent = false;
});

if (!allEnvVarsPresent) {
  console.log('\n   ⚠️ Algunas variables faltan en .env.example');
} else {
  console.log('\n   ✅ .env.example está completo');
}

// 4. Crear archivo de instrucciones para Easypanel
console.log('\n📋 Creando instrucciones para Easypanel:\n');

const easypanelInstructions = `# 🚀 Deploy en Easypanel

## Variables de Entorno Requeridas

Configura estas variables en Easypanel:

### IA - Groq (Principal)
\`\`\`
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=400
GROQ_TIMEOUT=15000
\`\`\`

### IA - OpenRouter (Respaldo)
\`\`\`
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
\`\`\`

### IA - Ollama (Local en Easypanel)
\`\`\`
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=gemma:2b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=60000
\`\`\`

### Sistema de IA
\`\`\`
AI_FALLBACK_ORDER=groq,openrouter,ollama
AI_AUTO_MODEL_DETECTION=true
DEFAULT_AI_PROVIDER=groq
\`\`\`

### Next.js
\`\`\`
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
\`\`\`

### WhatsApp
\`\`\`
WHATSAPP_PROVIDER=baileys
SESSION_PATH=/data/whatsapp-sessions
\`\`\`

### Base de Datos
\`\`\`
DATABASE_URL=file:/data/dev.db
\`\`\`

### Autenticación
\`\`\`
NEXTAUTH_SECRET=genera-un-secret-aleatorio-aqui
NEXTAUTH_URL=https://tu-dominio.com
JWT_SECRET=genera-otro-secret-aleatorio-aqui
\`\`\`

## Servicios Necesarios en Easypanel

### 1. Ollama (Servicio separado)
- Imagen: \`ollama/ollama:latest\`
- Puerto: 11434
- Volumen: \`/root/.ollama\`
- Comando inicial: \`ollama pull gemma:2b\`

### 2. Bot (Aplicación principal)
- Build: Next.js
- Puerto: 3000
- Volúmenes:
  - \`/data\` para persistencia
  - \`/app/.wwebjs_auth\` para WhatsApp

## Comandos de Build

\`\`\`bash
npm install
npm run build
\`\`\`

## Comando de Start

\`\`\`bash
npm start
\`\`\`

## Healthcheck

\`\`\`bash
curl -f http://localhost:3000/api/health || exit 1
\`\`\`

## Notas Importantes

1. **Ollama debe estar corriendo** antes de iniciar el bot
2. **Volúmenes persistentes** son críticos para WhatsApp
3. **Variables de entorno** deben estar todas configuradas
4. **Puerto 3000** debe estar expuesto

## Orden de Deploy

1. Crear servicio Ollama
2. Esperar a que Ollama descargue el modelo
3. Crear aplicación del bot
4. Configurar variables de entorno
5. Conectar servicios (bot → ollama)
6. Deploy!
`;

fs.writeFileSync(path.join(__dirname, 'DEPLOY_EASYPANEL.md'), easypanelInstructions);
console.log('   ✅ DEPLOY_EASYPANEL.md creado');

// 5. Crear docker-compose para referencia
console.log('\n📋 Creando docker-compose.yml de referencia:\n');

const dockerCompose = `version: '3.8'

services:
  # Ollama - IA Local
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    command: >
      sh -c "ollama serve & sleep 10 && ollama pull gemma:2b && wait"

  # Bot Principal
  bot:
    build: .
    container_name: smart-sales-bot
    ports:
      - "3000:3000"
    environment:
      # IA
      - GROQ_API_KEY=\${GROQ_API_KEY}
      - OPENROUTER_API_KEY=\${OPENROUTER_API_KEY}
      - OLLAMA_BASE_URL=http://ollama:11434
      - AI_FALLBACK_ORDER=groq,openrouter,ollama
      - AI_AUTO_MODEL_DETECTION=true
      
      # Next.js
      - NODE_ENV=production
      - PORT=3000
      
      # WhatsApp
      - WHATSAPP_PROVIDER=baileys
      
      # Database
      - DATABASE_URL=file:/data/dev.db
    volumes:
      - bot_data:/data
      - whatsapp_sessions:/app/.wwebjs_auth
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
  bot_data:
  whatsapp_sessions:
`;

fs.writeFileSync(path.join(__dirname, 'docker-compose.yml'), dockerCompose);
console.log('   ✅ docker-compose.yml creado');

// 6. Resumen final
console.log('\n═══════════════════════════════════════\n');
console.log('✅ Proyecto listo para deploy!\n');
console.log('📋 Archivos creados:');
console.log('   - DEPLOY_EASYPANEL.md (instrucciones)');
console.log('   - docker-compose.yml (referencia)');
console.log('   - .gitignore (actualizado)');
console.log('\n📝 Próximos pasos:\n');
console.log('1. Revisar cambios:');
console.log('   git status\n');
console.log('2. Agregar archivos:');
console.log('   git add .\n');
console.log('3. Commit:');
console.log('   git commit -m "feat: Sistema triple respaldo IA (Groq + OpenRouter + Ollama)"\n');
console.log('4. Push:');
console.log('   git push origin main\n');
console.log('5. En Easypanel:');
console.log('   - Crear servicio Ollama primero');
console.log('   - Luego crear aplicación del bot');
console.log('   - Configurar variables de entorno');
console.log('   - Deploy!\n');
console.log('═══════════════════════════════════════\n');
