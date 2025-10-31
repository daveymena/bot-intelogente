import 'dotenv/config'

console.log('\n🔍 VERIFICANDO PREPARACIÓN PARA PRODUCCIÓN\n')
console.log('═'.repeat(80))

let errors = 0
let warnings = 0

// Verificar archivos críticos
const criticalFiles = [
    'render.yaml',
    'Dockerfile',
    '.dockerignore',
    'DEPLOY_RENDER.md',
    'DEPLOY_RAILWAY.md',
    'scripts/start-production.sh',
    'scripts/create-admin-production.ts'
]

console.log('\n📁 Archivos de Configuración:')
for (const file of criticalFiles) {
    try {
        require('fs').accessSync(file)
        console.log(`   ✅ ${file}`)
    } catch {
        console.log(`   ❌ ${file} - FALTA`)
        errors++
    }
}

// Verificar package.json
console.log('\n📦 Scripts en package.json:')
const pkg = require('../package.json')
const requiredScripts = ['build', 'start', 'postinstall', 'db:migrate:deploy']
for (const script of requiredScripts) {
    if (pkg.scripts[script]) {
        console.log(`   ✅ ${script}: ${pkg.scripts[script]}`)
    } else {
        console.log(`   ❌ ${script} - FALTA`)
        errors++
    }
}

// Verificar dependencias críticas
console.log('\n📚 Dependencias Críticas:')
const criticalDeps = [
    '@prisma/client',
    '@whiskeysockets/baileys',
    'next',
    'express',
    'bcryptjs'
]
for (const dep of criticalDeps) {
    if (pkg.dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${pkg.dependencies[dep]}`)
    } else {
        console.log(`   ❌ ${dep} - FALTA`)
        errors++
    }
}

// Verificar variables de entorno locales
console.log('\n🔐 Variables de Entorno (Local):')
const requiredEnvVars = [
    'DATABASE_PROVIDER',
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
]

for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}`)
    } else {
        console.log(`   ⚠️  ${envVar} - No configurada (necesaria en producción)`)
        warnings++
    }
}

// Verificar API Keys
console.log('\n🤖 API Keys de IA:')
const aiKeys = [
    { name: 'GROQ_API_KEY', provider: 'Groq' },
    { name: 'OPENROUTER_API_KEY', provider: 'OpenRouter' },
    { name: 'OPENAI_API_KEY', provider: 'OpenAI' }
]

let hasAnyAI = false
for (const { name, provider } of aiKeys) {
    if (process.env[name]) {
        console.log(`   ✅ ${provider} configurado`)
        hasAnyAI = true
    } else {
        console.log(`   ⚠️  ${provider} no configurado`)
    }
}

if (!hasAnyAI) {
    console.log(`   ❌ CRÍTICO: Necesitas al menos una API de IA`)
    errors++
}

// Verificar Prisma Schema
console.log('\n🗄️  Prisma Schema:')
try {
    const schema = require('fs').readFileSync('prisma/schema.prisma', 'utf-8')
    if (schema.includes('DATABASE_PROVIDER')) {
        console.log('   ✅ Schema soporta múltiples bases de datos')
    } else {
        console.log('   ❌ Schema no tiene DATABASE_PROVIDER')
        errors++
    }
} catch {
    console.log('   ❌ No se pudo leer schema.prisma')
    errors++
}

// Resumen
console.log('\n' + '═'.repeat(80))
console.log('\n📊 RESUMEN:\n')

if (errors === 0 && warnings === 0) {
    console.log('   🎉 ¡TODO PERFECTO! El proyecto está listo para producción')
    console.log('\n   Próximos pasos:')
    console.log('   1. Sube el código a GitHub')
    console.log('   2. Sigue la guía en DEPLOY_RENDER.md o DEPLOY_RAILWAY.md')
    console.log('   3. Configura las variables de entorno en el hosting')
    console.log('   4. ¡Deploy!')
} else {
    if (errors > 0) {
        console.log(`   ❌ ${errors} error(es) crítico(s) encontrado(s)`)
        console.log('   Debes corregirlos antes de desplegar')
    }
    if (warnings > 0) {
        console.log(`   ⚠️  ${warnings} advertencia(s)`)
        console.log('   Configura estas variables en producción')
    }
}

console.log('\n' + '═'.repeat(80) + '\n')

process.exit(errors > 0 ? 1 : 0)
