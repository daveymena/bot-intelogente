import { execSync } from 'child_process'
import * as fs from 'fs'

console.log('\n🔍 VERIFICACIÓN ANTES DE SUBIR A GITHUB\n')
console.log('═'.repeat(80))

let errors = 0
let warnings = 0

// 1. Verificar que .env NO se subirá
console.log('\n🔒 Verificando seguridad...')
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8')
    if (gitignore.includes('.env')) {
        console.log('   ✅ .env está en .gitignore (no se subirá)')
    } else {
        console.log('   ❌ PELIGRO: .env NO está en .gitignore')
        errors++
    }
} catch {
    console.log('   ⚠️  No se encontró .gitignore')
    warnings++
}

// 2. Verificar que .env existe localmente
console.log('\n📄 Verificando archivos locales...')
if (fs.existsSync('.env')) {
    console.log('   ✅ .env existe (para desarrollo local)')
    
    // Verificar que tenga las variables críticas
    const env = fs.readFileSync('.env', 'utf-8')
    const criticalVars = ['DATABASE_PROVIDER', 'GROQ_API_KEY', 'OPENROUTER_API_KEY']
    let hasVars = 0
    for (const v of criticalVars) {
        if (env.includes(v)) hasVars++
    }
    console.log(`   ✅ Variables configuradas: ${hasVars}/${criticalVars.length}`)
} else {
    console.log('   ⚠️  .env no existe')
    warnings++
}

// 3. Verificar archivos de producción
console.log('\n📦 Verificando archivos de producción...')
const prodFiles = [
    'render.yaml',
    'Dockerfile',
    '.env.production.example',
    'DEPLOY_RAILWAY.md',
    'DEPLOY_RENDER.md'
]

for (const file of prodFiles) {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`)
    } else {
        console.log(`   ❌ ${file} falta`)
        errors++
    }
}

// 4. Verificar que node_modules no se subirá
console.log('\n📚 Verificando exclusiones...')
const excludes = ['node_modules', '.next', 'dev.db', 'whatsapp-sessions']
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8')
    for (const exc of excludes) {
        if (gitignore.includes(exc)) {
            console.log(`   ✅ ${exc} excluido`)
        } else {
            console.log(`   ⚠️  ${exc} no está en .gitignore`)
            warnings++
        }
    }
} catch {
    console.log('   ❌ Error leyendo .gitignore')
    errors++
}

// 5. Verificar Git
console.log('\n🔧 Verificando Git...')
try {
    execSync('git --version', { stdio: 'ignore' })
    console.log('   ✅ Git instalado')
    
    try {
        execSync('git status', { stdio: 'ignore' })
        console.log('   ✅ Repositorio Git inicializado')
    } catch {
        console.log('   ⚠️  Git no inicializado (ejecuta: git init)')
        warnings++
    }
} catch {
    console.log('   ❌ Git no instalado')
    errors++
}

// 6. Verificar tamaño del proyecto
console.log('\n📊 Información del proyecto...')
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    console.log(`   ✅ Nombre: ${packageJson.name}`)
    console.log(`   ✅ Versión: ${packageJson.version}`)
    
    const depCount = Object.keys(packageJson.dependencies || {}).length
    console.log(`   ✅ Dependencias: ${depCount}`)
} catch {
    console.log('   ❌ Error leyendo package.json')
    errors++
}

// 7. Simular git status
console.log('\n📋 Archivos que se subirán (muestra)...')
try {
    const files = fs.readdirSync('.')
    const gitignore = fs.readFileSync('.gitignore', 'utf-8')
    
    let count = 0
    for (const file of files.slice(0, 10)) {
        if (!gitignore.includes(file) && !file.startsWith('.')) {
            console.log(`   📄 ${file}`)
            count++
        }
    }
    console.log(`   ... y ${files.length - count} archivos más`)
} catch {
    console.log('   ⚠️  No se pudo listar archivos')
}

// Resumen
console.log('\n' + '═'.repeat(80))
console.log('\n📊 RESUMEN:\n')

if (errors === 0 && warnings === 0) {
    console.log('   🎉 ¡TODO PERFECTO! Puedes subir a GitHub de forma segura')
    console.log('\n   Comandos para subir:')
    console.log('   ─────────────────────────────────────────────────────')
    console.log('   git init                    # Si no lo has hecho')
    console.log('   git add .')
    console.log('   git commit -m "Bot listo para producción"')
    console.log('   git branch -M main')
    console.log('   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git')
    console.log('   git push -u origin main')
    console.log('   ─────────────────────────────────────────────────────')
    console.log('\n   📚 Guía completa: SUBIR_A_GITHUB.md')
} else {
    if (errors > 0) {
        console.log(`   ❌ ${errors} error(es) crítico(s)`)
        console.log('   ⚠️  NO subas hasta corregirlos')
    }
    if (warnings > 0) {
        console.log(`   ⚠️  ${warnings} advertencia(s)`)
        console.log('   Puedes continuar pero revisa las advertencias')
    }
}

console.log('\n' + '═'.repeat(80) + '\n')

process.exit(errors > 0 ? 1 : 0)
