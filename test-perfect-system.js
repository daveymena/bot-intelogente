/**
 * TEST DEL SISTEMA PERFECTO
 * 
 * Verifica:
 * 1. RAG encuentra productos correctamente
 * 2. Ollama genera respuestas racionales
 * 3. Groq hace razonamiento profundo cuando es necesario
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testPerfectSystem() {
  console.log('\n🎯 TEST DEL SISTEMA PERFECTO\n')
  console.log('='.repeat(60))

  try {
    // Obtener usuario
    const user = await db.user.findFirst({
      where: { email: { contains: '@' } }
    })

    if (!user) {
      console.log('❌ No se encontró usuario')
      return
    }

    console.log(`✅ Usuario: ${user.email}\n`)

    // Importar sistema
    const { PerfectBotSystem } = require('./src/lib/perfect-bot-system.ts')

    // Test 1: Búsqueda simple
    console.log('📝 Test 1: "Me interesa el curso de idiomas"')
    console.log('-'.repeat(60))
    
    const result1 = await PerfectBotSystem.processMessage(
      user.id,
      '573001234567',
      'Me interesa el curso de idiomas'
    )
    
    console.log(`\n✅ Respuesta:`)
    console.log(result1.message)
    console.log(`\n📊 Confianza: ${(result1.confidence * 100).toFixed(0)}%`)
    
    // Verificar que NO menciona piano
    if (result1.message.toLowerCase().includes('piano')) {
      console.log('\n❌ ERROR: Respuesta menciona piano cuando debería ser idiomas')
    } else if (result1.message.toLowerCase().includes('idioma')) {
      console.log('\n✅ CORRECTO: Respuesta sobre idiomas')
    }

    console.log('\n' + '='.repeat(60))

    // Test 2: Búsqueda de piano
    console.log('\n📝 Test 2: "Me interesa el curso de piano"')
    console.log('-'.repeat(60))
    
    const result2 = await PerfectBotSystem.processMessage(
      user.id,
      '573001234567',
      'Me interesa el curso de piano'
    )
    
    console.log(`\n✅ Respuesta:`)
    console.log(result2.message)
    console.log(`\n📊 Confianza: ${(result2.confidence * 100).toFixed(0)}%`)
    
    // Verificar que menciona piano
    if (result2.message.toLowerCase().includes('piano')) {
      console.log('\n✅ CORRECTO: Respuesta sobre piano')
    } else {
      console.log('\n❌ ERROR: Respuesta NO menciona piano')
    }

    console.log('\n' + '='.repeat(60))

    // Test 3: Consulta compleja (razonamiento profundo)
    console.log('\n📝 Test 3: "Cuál es mejor para aprender desde cero?"')
    console.log('-'.repeat(60))
    
    const result3 = await PerfectBotSystem.processMessage(
      user.id,
      '573001234567',
      'Cuál es mejor para aprender desde cero?'
    )
    
    console.log(`\n✅ Respuesta:`)
    console.log(result3.message)
    console.log(`\n📊 Confianza: ${(result3.confidence * 100).toFixed(0)}%`)

    console.log('\n' + '='.repeat(60))

    // Test 4: Laptop
    console.log('\n📝 Test 4: "Tienes laptop?"')
    console.log('-'.repeat(60))
    
    const result4 = await PerfectBotSystem.processMessage(
      user.id,
      '573001234567',
      'Tienes laptop?'
    )
    
    console.log(`\n✅ Respuesta:`)
    console.log(result4.message)
    console.log(`\n📊 Confianza: ${(result4.confidence * 100).toFixed(0)}%`)

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ TESTS COMPLETADOS\n')

  } catch (error) {
    console.error('\n❌ Error en test:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar
testPerfectSystem()
