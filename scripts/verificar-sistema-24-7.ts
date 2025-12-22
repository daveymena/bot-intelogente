#!/usr/bin/env tsx
/**
 * ✅ VERIFICACIÓN DEL SISTEMA 24/7
 * 
 * Verifica que todo esté configurado correctamente
 */

import fs from 'fs'
import path from 'path'
import { db } from '../src/lib/db'

interface CheckResult {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
}

const checks: CheckResult[] = []

async function checkEnvironmentVariables() {
  console.log('🔍 Verificando variables de entorno...')

  const required = ['GROQ_API_KEY', 'DATABASE_URL']
  const optional = ['OLLAMA_ENABLED', 'OLLAMA_BASE_URL', 'ENABLE_PHOTO_SENDING']

  for (const varName of required) {
    if (process.env[varName]) {
      checks.push({
        name: `Variable ${varName}`,
        status: 'ok',
        message: 'Configurada'
      })
    } else {
      checks.push({
        name: `Variable ${varName}`,
        status: 'error',
        message: 'NO configurada (requerida)'
      })
    }
  }

  for (const varName of optional) {
    if (process.env[varName]) {
      checks.push({
        name: `Variable ${varName}`,
        status: 'ok',
        message: `Configurada: ${process.env[varName]}`
      })
    } else {
      checks.push({
        name: `Variable ${varName}`,
        status: 'warning',
        message: 'No configurada (opcional)'
      })
    }
  }
}

async function checkTrainingFiles() {
  console.log('📚 Verificando archivos de entrenamiento...')

  const files = [
    'data/entrenamiento-24-7-completo.json',
    'data/entrenamiento-completo-todos-productos.json',
    'data/entrenamiento-flujo-completo-conversacional.json'
  ]

  for (const file of files) {
    const fullPath = path.join(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
      checks.push({
        name: `Archivo ${path.basename(file)}`,
        status: 'ok',
        message: `Existe (${sizeMB} MB)`
      })
    } else {
      checks.push({
        name: `Archivo ${path.basename(file)}`,
        status: 'warning',
        message: 'No existe (ejecuta entrenamiento)'
      })
    }
  }
}

async function checkDatabase() {
  console.log('🗄️ Verificando base de datos...')

  try {
    const userCount = await db.user.count()
    checks.push({
      name: 'Conexión a base de datos',
      status: 'ok',
      message: `Conectada (${userCount} usuarios)`
    })

    const productCount = await db.product.count()
    checks.push({
      name: 'Productos en base de datos',
      status: productCount > 0 ? 'ok' : 'warning',
      message: `${productCount} productos`
    })

    const productsWithImages = await db.product.count({
      where: {
        images: {
          some: {}
        }
      }
    })
    checks.push({
      name: 'Productos con imágenes',
      status: productsWithImages > 0 ? 'ok' : 'warning',
      message: `${productsWithImages} de ${productCount} productos`
    })

  } catch (error) {
    checks.push({
      name: 'Conexión a base de datos',
      status: 'error',
      message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`
    })
  }
}

async function checkServices() {
  console.log('🔧 Verificando servicios...')

  // Verificar Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = (await import('groq-sdk')).default
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
      
      await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })

      checks.push({
        name: 'Servicio Groq',
        status: 'ok',
        message: 'Funcionando correctamente'
      })
    } catch (error) {
      checks.push({
        name: 'Servicio Groq',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`
      })
    }
  }

  // Verificar Ollama
  if (process.env.OLLAMA_ENABLED === 'true') {
    try {
      const response = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/tags`)
      if (response.ok) {
        checks.push({
          name: 'Servicio Ollama',
          status: 'ok',
          message: 'Funcionando correctamente'
        })
      } else {
        checks.push({
          name: 'Servicio Ollama',
          status: 'warning',
          message: 'No responde (opcional)'
        })
      }
    } catch (error) {
      checks.push({
        name: 'Servicio Ollama',
        status: 'warning',
        message: 'No disponible (opcional)'
      })
    }
  }
}

async function checkDirectories() {
  console.log('📁 Verificando directorios...')

  const dirs = [
    'public/uploads/products',
    'auth_sessions',
    'data',
    'temp-audio',
    'temp-images'
  ]

  for (const dir of dirs) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      checks.push({
        name: `Directorio ${dir}`,
        status: 'ok',
        message: 'Existe'
      })
    } else {
      checks.push({
        name: `Directorio ${dir}`,
        status: 'warning',
        message: 'No existe (se creará automáticamente)'
      })
    }
  }
}

function printResults() {
  console.log('\n' + '═'.repeat(70))
  console.log('📊 RESULTADOS DE LA VERIFICACIÓN')
  console.log('═'.repeat(70) + '\n')

  const byStatus = {
    ok: checks.filter(c => c.status === 'ok'),
    warning: checks.filter(c => c.status === 'warning'),
    error: checks.filter(c => c.status === 'error')
  }

  // Mostrar errores primero
  if (byStatus.error.length > 0) {
    console.log('❌ ERRORES CRÍTICOS:\n')
    for (const check of byStatus.error) {
      console.log(`   ❌ ${check.name}`)
      console.log(`      ${check.message}\n`)
    }
  }

  // Mostrar advertencias
  if (byStatus.warning.length > 0) {
    console.log('⚠️  ADVERTENCIAS:\n')
    for (const check of byStatus.warning) {
      console.log(`   ⚠️  ${check.name}`)
      console.log(`      ${check.message}\n`)
    }
  }

  // Mostrar éxitos
  if (byStatus.ok.length > 0) {
    console.log('✅ VERIFICACIONES EXITOSAS:\n')
    for (const check of byStatus.ok) {
      console.log(`   ✅ ${check.name}: ${check.message}`)
    }
    console.log()
  }

  // Resumen
  console.log('═'.repeat(70))
  console.log(`Total: ${checks.length} verificaciones`)
  console.log(`✅ Exitosas: ${byStatus.ok.length}`)
  console.log(`⚠️  Advertencias: ${byStatus.warning.length}`)
  console.log(`❌ Errores: ${byStatus.error.length}`)
  console.log('═'.repeat(70) + '\n')

  // Recomendaciones
  if (byStatus.error.length > 0) {
    console.log('🔧 ACCIONES REQUERIDAS:\n')
    console.log('1. Configura las variables de entorno faltantes en .env')
    console.log('2. Verifica la conexión a la base de datos')
    console.log('3. Ejecuta: npm run db:push\n')
  }

  if (byStatus.warning.length > 0 && byStatus.error.length === 0) {
    console.log('💡 RECOMENDACIONES:\n')
    console.log('1. Ejecuta el entrenamiento: npx tsx scripts/entrenar-bot-24-7-completo.ts')
    console.log('2. Agrega productos con imágenes')
    console.log('3. Considera activar Ollama para razonamiento profundo\n')
  }

  if (byStatus.error.length === 0 && byStatus.warning.length === 0) {
    console.log('🎉 ¡SISTEMA COMPLETAMENTE CONFIGURADO!\n')
    console.log('✅ Todo está listo para iniciar el bot')
    console.log('🚀 Ejecuta: npm run dev\n')
  }
}

async function main() {
  console.log('🔍 VERIFICACIÓN DEL SISTEMA BOT 24/7\n')

  try {
    await checkEnvironmentVariables()
    await checkTrainingFiles()
    await checkDatabase()
    await checkServices()
    await checkDirectories()

    printResults()

  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
    process.exit(1)
  }
}

main()
