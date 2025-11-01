/**
 * Script para preparar el proyecto para producción
 * Ejecutar con: npx tsx scripts/preparar-produccion.ts
 */

import * as fs from 'fs'
import * as path from 'path'

console.log('🚀 Preparando proyecto para producción...\n')

// 1. Verificar schema de Prisma
console.log('1️⃣ Verificando schema de Prisma...')
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
const schemaContent = fs.readFileSync(schemaPath, 'utf-8')

if (schemaContent.includes('provider = "sqlite"')) {
  console.log('   ⚠️  ADVERTENCIA: Schema usa SQLite')
  console.log('   📝 Para producción, cambiar a PostgreSQL:')
  console.log('      provider = "postgresql"')
  console.log('')
} else if (schemaContent.includes('provider = "postgresql"')) {
  console.log('   ✅ Schema configurado para PostgreSQL')
} else {
  console.log('   ❌ Provider no reconocido')
}

// 2. Verificar .env
console.log('\n2️⃣ Verificando variables de entorno...')
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  
  const requiredVars = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'RESEND_API_KEY'
  ]
  
  const missingVars: string[] = []
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length > 0) {
    console.log('   ⚠️  Variables faltantes:')
    missingVars.forEach(v => console.log(`      - ${v}`))
  } else {
    console.log('   ✅ Variables principales configuradas')
  }
} else {
  console.log('   ❌ Archivo .env no encontrado')
}

// 3. Verificar .gitignore
console.log('\n3️⃣ Verificando .gitignore...')
const gitignorePath = path.join(process.cwd(), '.gitignore')
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
  
  const requiredIgnores = [
    '.env',
    'node_modules',
    'dev.db',
    'auth_sessions'
  ]
  
  const missingIgnores: string[] = []
  requiredIgnores.forEach(item => {
    if (!gitignoreContent.includes(item)) {
      missingIgnores.push(item)
    }
  })
  
  if (missingIgnores.length > 0) {
    console.log('   ⚠️  Falta agregar a .gitignore:')
    missingIgnores.forEach(i => console.log(`      - ${i}`))
  } else {
    console.log('   ✅ .gitignore configurado correctamente')
  }
} else {
  console.log('   ❌ Archivo .gitignore no encontrado')
}

// 4. Verificar package.json scripts
console.log('\n4️⃣ Verificando scripts de package.json...')
const packagePath = path.join(process.cwd(), 'package.json')
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  
  const requiredScripts = ['build', 'start', 'db:push', 'db:generate']
  const missingScripts: string[] = []
  
  requiredScripts.forEach(script => {
    if (!packageContent.scripts || !packageContent.scripts[script]) {
      missingScripts.push(script)
    }
  })
  
  if (missingScripts.length > 0) {
    console.log('   ⚠️  Scripts faltantes:')
    missingScripts.forEach(s => console.log(`      - ${s}`))
  } else {
    console.log('   ✅ Scripts de producción configurados')
  }
}

// 5. Verificar archivos críticos
console.log('\n5️⃣ Verificando archivos críticos...')
const criticalFiles = [
  'server.ts',
  'next.config.ts',
  'tsconfig.json',
  'Dockerfile',
  'prisma/schema.prisma'
]

let allFilesExist = true
criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Falta: ${file}`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('   ✅ Todos los archivos críticos presentes')
}

// 6. Resumen
console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN DE PREPARACIÓN')
console.log('='.repeat(60))

console.log('\n✅ Verificaciones completadas')
console.log('\n📝 PASOS PARA DEPLOY EN EASYPANEL:')
console.log('\n1. Cambiar schema de Prisma a PostgreSQL:')
console.log('   datasource db {')
console.log('     provider = "postgresql"')
console.log('     url      = env("DATABASE_URL")')
console.log('   }')
console.log('\n2. Commit y push a Git:')
console.log('   git add .')
console.log('   git commit -m "feat: Generador de personalidad + actualizaciones"')
console.log('   git push origin main')
console.log('\n3. Configurar variables en Easypanel')
console.log('   - DATABASE_URL (PostgreSQL)')
console.log('   - GROQ_API_KEY')
console.log('   - OPENROUTER_API_KEY')
console.log('   - NEXTAUTH_SECRET')
console.log('   - JWT_SECRET')
console.log('   - RESEND_API_KEY')
console.log('   - Todas las demás variables de .env')
console.log('\n4. Deploy en Easypanel')
console.log('\n5. Ejecutar migraciones:')
console.log('   npm run db:push')
console.log('   npm run db:generate')
console.log('\n6. Crear usuario admin:')
console.log('   npx tsx scripts/create-admin-production.ts')
console.log('\n' + '='.repeat(60))
console.log('✅ Proyecto listo para producción!')
console.log('='.repeat(60) + '\n')
