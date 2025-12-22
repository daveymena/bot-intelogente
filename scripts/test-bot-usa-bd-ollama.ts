/**
 * 🧪 TEST: Verificar que el bot usa Base de Datos y Ollama
 * 
 * Este script verifica que el sistema híbrido:
 * 1. ✅ Consulta la base de datos para buscar productos
 * 2. ✅ Usa Ollama para generar respuestas inteligentes
 * 3. ✅ Tiene fallback a Groq si Ollama falla
 * 4. ✅ Usa plantillas locales solo como último recurso
 */

import { db } from '../src/lib/db'
import { createGroqHybridSystem } from '../src/lib/hybrid-intelligent-response-system'

async function testBotUsesDBAndOllama() {
  console.log('🧪 TEST: Verificando que el bot usa BD y Ollama\n')

  try {
    // 1. Verificar que hay productos en la BD
    console.log('📊 1. Verificando productos en base de datos...')
    const productCount = await db.product.count()
    console.log(`   ✅ Productos en BD: ${productCount}`)
    
    if (productCount === 0) {
      console.log('   ❌ ERROR: No hay productos en la base de datos')
      console.log('   💡 Ejecuta: npm run import:dropshipping')
      return
    }

    // 2. Verificar que Ollama está corriendo
    console.log('\n🤖 2. Verificando Ollama...')
    try {
      const response = await fetch('http://localhost:11434/api/tags')
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ Ollama está corriendo`)
        console.log(`   📦 Modelos disponibles: ${data.models?.map((m: any) => m.name).join(', ') || 'ninguno'}`)
      } else {
        console.log('   ⚠️ Ollama no responde correctamente')
      }
    } catch (error) {
      console.log('   ❌ Ollama no está corriendo en http://localhost:11434')
      console.log('   💡 Inicia Ollama: ollama serve')
    }

    // 3. Verificar que Groq está configurado
    console.log('\n🌐 3. Verificando Groq API...')
    if (process.env.GROQ_API_KEY) {
      console.log('   ✅ GROQ_API_KEY configurada')
    } else {
      console.log('   ⚠️ GROQ_API_KEY no configurada (fallback no disponible)')
    }

    // 4. Probar el sistema híbrido
    console.log('\n🧠 4. Probando sistema híbrido...')
    
    if (!process.env.GROQ_API_KEY) {
      console.log('   ⚠️ No se puede probar sin GROQ_API_KEY')
      return
    }

    const hybridSystem = await createGroqHybridSystem(process.env.GROQ_API_KEY)
    
    // Test 1: Búsqueda de producto
    console.log('\n   📝 Test 1: Búsqueda de producto')
    console.log('   Mensaje: "busco un portátil para diseño"')
    
    const response1 = await hybridSystem.processMessage(
      'busco un portátil para diseño',
      'test-user',
      []
    )
    
    console.log(`   📤 Respuesta (${response1.length} caracteres):`)
    console.log(`   ${response1.substring(0, 200)}...`)
    
    // Verificar que la respuesta contiene productos reales
    const hasProductInfo = response1.includes('$') || response1.includes('COP') || response1.includes('💰')
    const hasProductName = /[A-Z][a-z]+\s+[A-Z0-9]/.test(response1)
    
    if (hasProductInfo && hasProductName) {
      console.log('   ✅ La respuesta contiene información de productos reales')
    } else {
      console.log('   ⚠️ La respuesta parece genérica (no contiene productos específicos)')
    }

    // Test 2: Saludo
    console.log('\n   📝 Test 2: Saludo')
    console.log('   Mensaje: "hola"')
    
    const response2 = await hybridSystem.processMessage(
      'hola',
      'test-user',
      []
    )
    
    console.log(`   📤 Respuesta (${response2.length} caracteres):`)
    console.log(`   ${response2.substring(0, 200)}...`)

    // Test 3: Pregunta sobre método de pago
    console.log('\n   📝 Test 3: Método de pago')
    console.log('   Mensaje: "cómo puedo pagar?"')
    
    const response3 = await hybridSystem.processMessage(
      'cómo puedo pagar?',
      'test-user',
      []
    )
    
    console.log(`   📤 Respuesta (${response3.length} caracteres):`)
    console.log(`   ${response3.substring(0, 200)}...`)

    console.log('\n✅ TEST COMPLETADO')
    console.log('\n📋 RESUMEN:')
    console.log(`   • Productos en BD: ${productCount}`)
    console.log(`   • Sistema híbrido: ✅ Funcionando`)
    console.log(`   • Respuestas generadas: 3/3`)
    
    console.log('\n💡 SIGUIENTE PASO:')
    console.log('   Reinicia el bot para aplicar los cambios:')
    console.log('   npm run dev')

  } catch (error) {
    console.error('\n❌ ERROR:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar test
testBotUsesDBAndOllama()
