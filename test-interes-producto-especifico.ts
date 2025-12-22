/**
 * 🧪 TEST: Interés en Producto Específico
 * 
 * Verifica que el bot responda con información específica del producto
 * cuando el cliente expresa interés.
 */

import { SmartResponseEngine } from './src/lib/plantillas-respuestas-bot'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testInteresProducto() {
  console.log('🧪 INICIANDO TEST: Interés en Producto Específico\n')
  console.log('='.repeat(60))

  // Obtener un userId real de la BD
  const user = await prisma.user.findFirst()
  const userId = user?.id || 'default-user'
  
  console.log(`\n👤 Usando userId: ${userId}`)

  // Test 1: "Me interesa el megapack de idiomas"
  console.log('\n📋 TEST 1: Me interesa el megapack de idiomas')
  console.log('-'.repeat(60))
  
  const test1 = await SmartResponseEngine.analyzeIntent(
    'Me interesa el megapack de idiomas',
    [],
    undefined,
    userId
  )
  
  console.log('Intent:', test1.intent)
  console.log('Confidence:', test1.confidence)
  console.log('Product:', test1.entities?.product)
  console.log('Template:', test1.responseTemplate)
  
  if (test1.responseTemplate === 'custom_product_template') {
    console.log('\n✅ CORRECTO: Responde con información específica del producto')
    console.log('\n📝 Respuesta:')
    console.log(test1.templateData?.customTemplate || 'No template')
  } else {
    console.log('\n❌ ERROR: Responde con plantilla genérica')
    console.log('Template usado:', test1.responseTemplate)
  }

  // Test 2: "Quiero el curso de piano"
  console.log('\n\n📋 TEST 2: Quiero el curso de piano')
  console.log('-'.repeat(60))
  
  const test2 = await SmartResponseEngine.analyzeIntent(
    'Quiero el curso de piano',
    [],
    undefined,
    userId
  )
  
  console.log('Intent:', test2.intent)
  console.log('Confidence:', test2.confidence)
  console.log('Product:', test2.entities?.product)
  console.log('Template:', test2.responseTemplate)
  
  if (test2.responseTemplate === 'custom_product_template') {
    console.log('\n✅ CORRECTO: Responde con información específica del producto')
    console.log('\n📝 Respuesta:')
    console.log(test2.templateData?.customTemplate || 'No template')
  } else {
    console.log('\n❌ ERROR: Responde con plantilla genérica')
    console.log('Template usado:', test2.responseTemplate)
  }

  // Test 3: "Necesito el portátil ASUS"
  console.log('\n\n📋 TEST 3: Necesito el portátil ASUS')
  console.log('-'.repeat(60))
  
  const test3 = await SmartResponseEngine.analyzeIntent(
    'Necesito el portátil ASUS',
    [],
    undefined,
    userId
  )
  
  console.log('Intent:', test3.intent)
  console.log('Confidence:', test3.confidence)
  console.log('Product:', test3.entities?.product)
  console.log('Template:', test3.responseTemplate)
  
  if (test3.responseTemplate === 'custom_product_template') {
    console.log('\n✅ CORRECTO: Responde con información específica del producto')
    console.log('\n📝 Respuesta:')
    console.log(test3.templateData?.customTemplate || 'No template')
  } else {
    console.log('\n❌ ERROR: Responde con plantilla genérica')
    console.log('Template usado:', test3.responseTemplate)
  }

  // Test 4: "Hola" (debe seguir respondiendo con saludo)
  console.log('\n\n📋 TEST 4: Hola (saludo simple)')
  console.log('-'.repeat(60))
  
  const test4 = await SmartResponseEngine.analyzeIntent(
    'Hola',
    [],
    undefined,
    userId
  )
  
  console.log('Intent:', test4.intent)
  console.log('Confidence:', test4.confidence)
  console.log('Template:', test4.responseTemplate)
  
  if (test4.intent === 'greeting') {
    console.log('\n✅ CORRECTO: Responde con saludo')
  } else {
    console.log('\n❌ ERROR: No detectó saludo')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ TEST COMPLETADO')
  
  await prisma.$disconnect()
}

// Ejecutar test
testInteresProducto().catch(console.error)
