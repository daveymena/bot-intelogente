/**
 * TEST AUTOMATIZADO CON GROQ
 * Preguntas fáciles y complejas sobre productos reales
 */

const { PrismaClient } = require('@prisma/client')
const Groq = require('groq-sdk')

const prisma = new PrismaClient()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Casos de prueba: fáciles y complejos
const testCases = [
  // FÁCILES
  { 
    nivel: 'FÁCIL',
    pregunta: 'Hola, qué productos tienen?',
    esperado: 'Debe listar categorías principales'
  },
  { 
    nivel: 'FÁCIL',
    pregunta: 'Tienen monitores?',
    esperado: 'Debe mencionar monitores disponibles'
  },
  { 
    nivel: 'FÁCIL',
    pregunta: 'Cuánto cuesta el monitor LG?',
    esperado: 'Debe dar precio específico'
  },
  
  // MEDIAS
  { 
    nivel: 'MEDIA',
    pregunta: 'Qué portátiles tienen para juegos?',
    esperado: 'Debe filtrar portátiles gaming'
  },
  { 
    nivel: 'MEDIA',
    pregunta: 'Cuál es la diferencia entre el monitor LG y el Dahua?',
    esperado: 'Debe comparar características'
  },
  { 
    nivel: 'MEDIA',
    pregunta: 'Tienen teclados inalámbricos?',
    esperado: 'Debe filtrar por característica'
  },
  
  // COMPLEJAS
  { 
    nivel: 'COMPLEJA',
    pregunta: 'Necesito un setup completo para trabajar desde casa, qué me recomiendas?',
    esperado: 'Debe recomendar combo de productos'
  },
  { 
    nivel: 'COMPLEJA',
    pregunta: 'Tengo presupuesto de 2 millones, qué portátil me conviene para diseño gráfico?',
    esperado: 'Debe filtrar por precio y uso'
  },
  { 
    nivel: 'COMPLEJA',
    pregunta: 'Cuáles son los 3 productos más vendidos y por qué?',
    esperado: 'Debe analizar y recomendar'
  }
]

async function obtenerProductos() {
  const productos = await prisma.product.findMany({
    where: {
      status: 'AVAILABLE'
    },
    select: {
      name: true,
      price: true,
      description: true,
      category: true
    },
    take: 50 // Primeros 50 para no saturar
  })
  
  return productos
}

async function generarRespuestaGroq(pregunta, productos) {
  const productosTexto = productos.map(p => 
    `- ${p.name}: $${p.price.toLocaleString()} COP (${p.category})`
  ).join('\n')
  
  const prompt = `Eres un asesor de ventas profesional experto.

PRODUCTOS DISPONIBLES:
${productosTexto}

CLIENTE PREGUNTA: "${pregunta}"

INSTRUCCIONES:
- Responde de forma natural y profesional
- Usa información REAL de los productos disponibles
- Sé específico con nombres y precios
- Orienta hacia la venta sin ser agresivo
- Máximo 5 líneas
- Si no tienes el producto exacto, sugiere alternativas

Responde ahora:`

  const startTime = Date.now()
  
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 500
  })
  
  const responseTime = Date.now() - startTime
  
  return {
    respuesta: completion.choices[0]?.message?.content || 'Sin respuesta',
    tiempo: responseTime,
    tokens: completion.usage?.total_tokens || 0
  }
}

async function ejecutarTest() {
  console.log('🧪 TEST AUTOMATIZADO CON GROQ\n')
  console.log('='.repeat(80))
  
  try {
    // Obtener productos
    console.log('\n📦 Cargando productos de la base de datos...')
    const productos = await obtenerProductos()
    console.log(`✅ ${productos.length} productos cargados\n`)
    
    let totalTiempo = 0
    let totalTokens = 0
    
    // Ejecutar cada caso de prueba
    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i]
      
      console.log(`\n${'='.repeat(80)}`)
      console.log(`📋 TEST ${i + 1}/${testCases.length} - NIVEL: ${test.nivel}`)
      console.log('='.repeat(80))
      console.log(`\n💬 PREGUNTA: "${test.pregunta}"`)
      console.log(`📝 Esperado: ${test.esperado}`)
      
      console.log(`\n🤖 Consultando Groq...`)
      
      const resultado = await generarRespuestaGroq(test.pregunta, productos)
      
      console.log(`\n✅ RESPUESTA DE GROQ (${resultado.tiempo}ms):`)
      console.log('-'.repeat(80))
      console.log(resultado.respuesta)
      console.log('-'.repeat(80))
      console.log(`📊 Tokens usados: ${resultado.tokens}`)
      
      totalTiempo += resultado.tiempo
      totalTokens += resultado.tokens
      
      // Pausa entre preguntas
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Resumen final
    console.log(`\n${'='.repeat(80)}`)
    console.log('📊 RESUMEN FINAL')
    console.log('='.repeat(80))
    console.log(`✅ Tests ejecutados: ${testCases.length}`)
    console.log(`⏱️  Tiempo total: ${totalTiempo}ms (${(totalTiempo/1000).toFixed(2)}s)`)
    console.log(`⏱️  Tiempo promedio: ${(totalTiempo/testCases.length).toFixed(0)}ms por pregunta`)
    console.log(`🎯 Tokens totales: ${totalTokens}`)
    console.log(`🎯 Tokens promedio: ${(totalTokens/testCases.length).toFixed(0)} por pregunta`)
    
    console.log(`\n✅ TEST COMPLETADO EXITOSAMENTE`)
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    if (error.message.includes('API key')) {
      console.log('\n💡 Asegúrate de tener GROQ_API_KEY en tu .env')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
ejecutarTest()
