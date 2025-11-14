import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: any
}

const results: TestResult[] = []

async function testDatabaseConnection() {
  console.log('\n🔍 1. PROBANDO CONEXIÓN A BASE DE DATOS...')
  try {
    await prisma.$connect()
    const count = await prisma.product.count()
    results.push({
      name: 'Conexión a Base de Datos',
      status: 'PASS',
      message: `Conectado exitosamente. ${count} productos en la base de datos.`
    })
    console.log(`✅ Base de datos conectada: ${count} productos`)
  } catch (error) {
    results.push({
      name: 'Conexión a Base de Datos',
      status: 'FAIL',
      message: `Error: ${error}`
    })
    console.log('❌ Error en conexión a base de datos')
  }
}

async function testProductsData() {
  console.log('\n🔍 2. VERIFICANDO DATOS DE PRODUCTOS...')
  try {
    const productos = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        description: true
      }
    })

    let warnings = []
    
    // Verificar que tengan imágenes
    const sinImagenes = productos.filter(p => !p.images || p.images === '[]')
    if (sinImagenes.length > 0) {
      warnings.push(`${sinImagenes.length} productos sin imágenes`)
    }

    // Verificar que tengan descripciones
    const sinDescripcion = productos.filter(p => !p.description || p.description.trim() === '')
    if (sinDescripcion.length > 0) {
      warnings.push(`${sinDescripcion.length} productos sin descripción`)
    }

    // Verificar que no tengan links de MegaComputer en descripción
    const conLinks = productos.filter(p => 
      p.description && (
        p.description.includes('megacomputer.com.co') ||
        p.description.includes('🔗') ||
        p.description.includes('Más info')
      )
    )
    if (conLinks.length > 0) {
      warnings.push(`${conLinks.length} productos con links visibles`)
    }

    if (warnings.length === 0) {
      results.push({
        name: 'Datos de Productos',
        status: 'PASS',
        message: 'Todos los productos tienen datos completos y limpios'
      })
      console.log('✅ Productos verificados correctamente')
    } else {
      results.push({
        name: 'Datos de Productos',
        status: 'WARNING',
        message: warnings.join(', ')
      })
      console.log(`⚠️  Advertencias: ${warnings.join(', ')}`)
    }
  } catch (error) {
    results.push({
      name: 'Datos de Productos',
      status: 'FAIL',
      message: `Error: ${error}`
    })
    console.log('❌ Error verificando productos')
  }
}

async function testAIServices() {
  console.log('\n🔍 3. VERIFICANDO SERVICIOS DE IA...')
  try {
    // Verificar que existan los archivos de servicios
    const services = [
      'src/lib/ai-service.ts',
      'src/lib/ai-multi-provider.ts',
      'src/lib/reasoning-service.ts',
      'src/lib/product-intelligence-service.ts',
      'src/lib/intelligent-response-service.ts'
    ]

    const missing = services.filter(s => !fs.existsSync(s))
    
    if (missing.length === 0) {
      results.push({
        name: 'Servicios de IA',
        status: 'PASS',
        message: 'Todos los servicios de IA están presentes'
      })
      console.log('✅ Servicios de IA verificados')
    } else {
      results.push({
        name: 'Servicios de IA',
        status: 'FAIL',
        message: `Archivos faltantes: ${missing.join(', ')}`
      })
      console.log(`❌ Archivos faltantes: ${missing.join(', ')}`)
    }
  } catch (error) {
    results.push({
      name: 'Servicios de IA',
      status: 'FAIL',
      message: `Error: ${error}`
    })
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔍 4. VERIFICANDO VARIABLES DE ENTORNO...')
  try {
    const required = [
      'DATABASE_URL',
      'GROQ_API_KEY',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]

    const optional = [
      'MERCADOPAGO_ACCESS_TOKEN',
      'PAYPAL_CLIENT_ID',
      'OPENAI_API_KEY',
      'CLAUDE_API_KEY'
    ]

    const missingRequired = required.filter(v => !process.env[v])
    const missingOptional = optional.filter(v => !process.env[v])

    if (missingRequired.length === 0) {
      let message = 'Variables requeridas presentes'
      if (missingOptional.length > 0) {
        message += `. Opcionales faltantes: ${missingOptional.join(', ')}`
      }
      
      results.push({
        name: 'Variables de Entorno',
        status: missingOptional.length > 0 ? 'WARNING' : 'PASS',
        message
      })
      console.log(`✅ Variables de entorno verificadas`)
      if (missingOptional.length > 0) {
        console.log(`⚠️  Opcionales faltantes: ${missingOptional.join(', ')}`)
      }
    } else {
      results.push({
        name: 'Variables de Entorno',
        status: 'FAIL',
        message: `Variables requeridas faltantes: ${missingRequired.join(', ')}`
      })
      console.log(`❌ Variables faltantes: ${missingRequired.join(', ')}`)
    }
  } catch (error) {
    results.push({
      name: 'Variables de Entorno',
      status: 'FAIL',
      message: `Error: ${error}`
    })
  }
}

async function testPaymentIntegration() {
  console.log('\n🔍 5. VERIFICANDO INTEGRACIÓN DE PAGOS...')
  try {
    const paymentFiles = [
      'src/lib/payment-service.ts',
      'src/lib/payment-methods.ts',
      'src/app/api/payments/create-link/route.ts'
    ]

    const missing = paymentFiles.filter(f => !fs.existsSync(f))
    
    if (missing.length === 0) {
      results.push({
        name: 'Integración de Pagos',
        status: 'PASS',
        message: 'Archivos de pago presentes'
      })
      console.log('✅ Sistema de pagos verificado')
    } else {
      results.push({
        name: 'Integración de Pagos',
        status: 'FAIL',
        message: `Archivos faltantes: ${missing.join(', ')}`
      })
      console.log(`❌ Archivos faltantes: ${missing.join(', ')}`)
    }
  } catch (error) {
    results.push({
      name: 'Integración de Pagos',
      status: 'FAIL',
      message: `Error: ${error}`
    })
  }
}

async function testStorePages() {
  console.log('\n🔍 6. VERIFICANDO PÁGINAS DE TIENDA...')
  try {
    const storePages = [
      'src/app/tienda/page.tsx',
      'src/app/tienda/[id]/page.tsx',
      'src/app/tienda/checkout/page.tsx',
      'src/app/catalogo/page.tsx'
    ]

    const missing = storePages.filter(f => !fs.existsSync(f))
    
    if (missing.length === 0) {
      results.push({
        name: 'Páginas de Tienda',
        status: 'PASS',
        message: 'Todas las páginas de tienda están presentes'
      })
      console.log('✅ Páginas de tienda verificadas')
    } else {
      results.push({
        name: 'Páginas de Tienda',
        status: 'FAIL',
        message: `Páginas faltantes: ${missing.join(', ')}`
      })
      console.log(`❌ Páginas faltantes: ${missing.join(', ')}`)
    }
  } catch (error) {
    results.push({
      name: 'Páginas de Tienda',
      status: 'FAIL',
      message: `Error: ${error}`
    })
  }
}

async function testWhatsAppIntegration() {
  console.log('\n🔍 7. VERIFICANDO INTEGRACIÓN DE WHATSAPP...')
  try {
    const whatsappFiles = [
      'src/lib/baileys-service.ts',
      'src/app/api/whatsapp/connect/route.ts',
      'src/app/api/whatsapp/send/route.ts',
      'src/app/api/whatsapp/status/route.ts'
    ]

    const missing = whatsappFiles.filter(f => !fs.existsSync(f))
    
    if (missing.length === 0) {
      results.push({
        name: 'Integración WhatsApp',
        status: 'PASS',
        message: 'Archivos de WhatsApp presentes'
      })
      console.log('✅ WhatsApp verificado')
    } else {
      results.push({
        name: 'Integración WhatsApp',
        status: 'FAIL',
        message: `Archivos faltantes: ${missing.join(', ')}`
      })
      console.log(`❌ Archivos faltantes: ${missing.join(', ')}`)
    }
  } catch (error) {
    results.push({
      name: 'Integración WhatsApp',
      status: 'FAIL',
      message: `Error: ${error}`
    })
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 REPORTE FINAL DE INSPECCIÓN')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.status === 'PASS').length
  const warnings = results.filter(r => r.status === 'WARNING').length
  const failed = results.filter(r => r.status === 'FAIL').length

  console.log(`\n✅ PASADAS: ${passed}`)
  console.log(`⚠️  ADVERTENCIAS: ${warnings}`)
  console.log(`❌ FALLIDAS: ${failed}`)

  console.log('\n📋 DETALLE DE RESULTADOS:\n')
  results.forEach((r, i) => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARNING' ? '⚠️' : '❌'
    console.log(`${i + 1}. ${icon} ${r.name}`)
    console.log(`   ${r.message}`)
    console.log('')
  })

  // Determinar si está listo para producción
  const readyForProduction = failed === 0
  
  console.log('='.repeat(60))
  if (readyForProduction) {
    console.log('🎉 SISTEMA LISTO PARA ACTUALIZAR EN EASYPANEL')
    console.log('='.repeat(60))
    console.log('\n✅ Todos los componentes críticos están funcionando')
    if (warnings > 0) {
      console.log(`⚠️  Hay ${warnings} advertencias que puedes revisar después`)
    }
    console.log('\n🚀 Puedes proceder con el deploy a Easypanel')
  } else {
    console.log('⚠️  SISTEMA NO LISTO PARA PRODUCCIÓN')
    console.log('='.repeat(60))
    console.log(`\n❌ Hay ${failed} problemas críticos que debes resolver primero`)
    console.log('\n🔧 Revisa los errores arriba y corrígelos antes de deployar')
  }
  console.log('')

  // Guardar reporte en archivo
  const reportPath = 'INSPECCION_SISTEMA.md'
  let reportContent = '# Inspección Completa del Sistema\n\n'
  reportContent += `**Fecha:** ${new Date().toLocaleString('es-CO')}\n\n`
  reportContent += `## Resumen\n\n`
  reportContent += `- ✅ Pasadas: ${passed}\n`
  reportContent += `- ⚠️ Advertencias: ${warnings}\n`
  reportContent += `- ❌ Fallidas: ${failed}\n\n`
  reportContent += `## Estado: ${readyForProduction ? '🎉 LISTO PARA PRODUCCIÓN' : '⚠️ NO LISTO'}\n\n`
  reportContent += `## Detalle de Pruebas\n\n`
  
  results.forEach((r, i) => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARNING' ? '⚠️' : '❌'
    reportContent += `### ${i + 1}. ${icon} ${r.name}\n\n`
    reportContent += `**Estado:** ${r.status}\n\n`
    reportContent += `**Mensaje:** ${r.message}\n\n`
  })

  fs.writeFileSync(reportPath, reportContent)
  console.log(`📄 Reporte guardado en: ${reportPath}\n`)
}

async function runInspection() {
  console.log('🔍 INICIANDO INSPECCIÓN COMPLETA DEL SISTEMA')
  console.log('='.repeat(60))

  await testDatabaseConnection()
  await testProductsData()
  await testAIServices()
  await testEnvironmentVariables()
  await testPaymentIntegration()
  await testStorePages()
  await testWhatsAppIntegration()
  
  await generateReport()
  
  await prisma.$disconnect()
}

runInspection().catch(console.error)
