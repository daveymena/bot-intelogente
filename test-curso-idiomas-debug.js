/**
 * TEST DE DEBUGGING: Curso de Idiomas vs Piano
 * 
 * Este test verifica el scoring detallado para entender
 * por qué el bot responde con Piano en lugar de Idiomas
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testCursoIdiomasDebug() {
  console.log('\n🔍 TEST DE DEBUGGING: Curso de Idiomas vs Piano\n')
  console.log('='.repeat(60))

  try {
    // Obtener usuario de prueba
    const user = await db.user.findFirst({
      where: { email: { contains: '@' } }
    })

    if (!user) {
      console.log('❌ No se encontró usuario de prueba')
      return
    }

    console.log(`✅ Usuario: ${user.email}`)

    // Buscar productos relevantes
    const productos = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: 'idioma', mode: 'insensitive' } },
          { name: { contains: 'piano', mode: 'insensitive' } },
          { name: { contains: 'curso', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true
      }
    })

    console.log(`\n📦 Productos encontrados: ${productos.length}`)
    console.log('-'.repeat(60))

    // Mostrar productos
    productos.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`)
      console.log(`   ID: ${p.id}`)
      console.log(`   Precio: ${p.price.toLocaleString('es-CO')} COP`)
      console.log(`   Categoría: ${p.category}`)
      if (p.description) {
        console.log(`   Descripción: ${p.description.substring(0, 100)}...`)
      }
    })

    // Simular búsqueda con scoring detallado
    console.log('\n\n🎯 SIMULACIÓN DE BÚSQUEDA')
    console.log('='.repeat(60))
    console.log('Query: "Me interesa el curso de idiomas"')
    console.log('-'.repeat(60))

    const query = 'me interesa el curso de idiomas'
    const queryLower = query.toLowerCase()

    // Extraer keywords
    const keywords = extractKeywords(queryLower)
    console.log(`\n📝 Keywords extraídos: ${keywords.join(', ')}`)

    // Categorías específicas
    const categoriasEspecificas = {
      'idiomas': ['idiomas', 'idioma', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones', 'language'],
      'diseño': ['diseño', 'grafico', 'photoshop', 'illustrator', 'corel'],
      'piano': ['piano'],
      'guitarra': ['guitarra'],
      'laptop': ['laptop', 'computador', 'portatil'],
      'moto': ['moto', 'pulsar', 'bajaj', 'yamaha'],
      'album': ['album', 'albumes', 'coleccion']
    }

    // Detectar categoría del usuario
    let categoriaUsuario = null
    for (const [categoria, palabras] of Object.entries(categoriasEspecificas)) {
      if (palabras.some(p => queryLower.includes(p))) {
        categoriaUsuario = categoria
        break
      }
    }

    console.log(`\n🏷️  Categoría detectada: ${categoriaUsuario || 'ninguna'}`)

    // Scoring para cada producto
    console.log('\n\n📊 SCORING DETALLADO')
    console.log('='.repeat(60))

    const scored = productos.map(p => {
      let score = 0
      const nombreLower = p.name.toLowerCase()
      const descLower = (p.description || '').toLowerCase()

      console.log(`\n🔍 Producto: ${p.name}`)
      console.log('-'.repeat(40))

      // CATEGORÍAS ESPECÍFICAS
      if (categoriaUsuario) {
        const palabrasCategoria = categoriasEspecificas[categoriaUsuario]
        const perteneceCategoria = palabrasCategoria.some(p => 
          nombreLower.includes(p) || descLower.includes(p)
        )

        if (perteneceCategoria) {
          console.log(`   ✅ Pertenece a categoría "${categoriaUsuario}": +100`)
          score += 100
        } else {
          console.log(`   ❌ NO pertenece a categoría "${categoriaUsuario}": -100`)
          score -= 100
        }
      }

      // Coincidencia de keywords
      keywords.forEach(kw => {
        if (nombreLower.includes(kw)) {
          console.log(`   ✅ Keyword "${kw}" en nombre: +10`)
          score += 10
        }
        if (descLower.includes(kw)) {
          console.log(`   ✅ Keyword "${kw}" en descripción: +3`)
          score += 3
        }
      })

      // Palabras únicas
      const uniqueWords = ['piano', 'laptop', 'moto', 'pulsar', 'asus', 'bajaj']
      uniqueWords.forEach(uw => {
        if (queryLower.includes(uw) && nombreLower.includes(uw)) {
          console.log(`   ✅ Palabra única "${uw}": +50`)
          score += 50
        }
      })

      console.log(`   📊 SCORE TOTAL: ${score}`)

      return { producto: p, score }
    })

    // Ordenar por score
    scored.sort((a, b) => b.score - a.score)

    // Mostrar top 3
    console.log('\n\n🏆 TOP 3 PRODUCTOS')
    console.log('='.repeat(60))
    scored.slice(0, 3).forEach((item, index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
      console.log(`${emoji} ${index + 1}. ${item.producto.name}`)
      console.log(`   Score: ${item.score}`)
      console.log(`   Precio: ${item.producto.price.toLocaleString('es-CO')} COP`)
    })

    // Resultado final
    console.log('\n\n✅ RESULTADO FINAL')
    console.log('='.repeat(60))
    if (scored.length > 0 && scored[0].score > 0) {
      console.log(`Producto seleccionado: ${scored[0].producto.name}`)
      console.log(`Score: ${scored[0].score}`)
      console.log(`Precio: ${scored[0].producto.price.toLocaleString('es-CO')} COP`)
      
      // Verificar si es correcto
      const esIdiomas = scored[0].producto.name.toLowerCase().includes('idioma')
      if (esIdiomas) {
        console.log('\n✅ ¡CORRECTO! El bot respondería con el curso de idiomas')
      } else {
        console.log('\n❌ ¡ERROR! El bot respondería con el producto incorrecto')
        console.log('   Esperado: Curso de Idiomas')
        console.log(`   Obtenido: ${scored[0].producto.name}`)
      }
    } else {
      console.log('❌ No se encontró producto relevante')
    }

  } catch (error) {
    console.error('\n❌ Error en test:', error)
  } finally {
    await db.$disconnect()
  }
}

function extractKeywords(query) {
  const important = [
    'piano', 'guitarra', 'bateria', 'violin',
    'laptop', 'computador', 'portatil', 'macbook', 'asus', 'hp', 'lenovo',
    'moto', 'pulsar', 'bajaj', 'yamaha',
    'curso', 'megapack', 'pack', 'mega',
    'diseño', 'photoshop', 'illustrator', 'grafico',
    'idiomas', 'idioma', 'lenguaje', 'language', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones',
    'album', 'albumes', 'coleccion'
  ]

  const found = important.filter(w => query.includes(w))
  
  if (found.length === 0) {
    return query
      .split(/\s+/)
      .filter(w => w.length > 3)
      .filter(w => !['para', 'como', 'cual', 'donde', 'tiene', 'tienes', 'interesa'].includes(w))
      .slice(0, 3)
  }

  return found
}

// Ejecutar test
testCursoIdiomasDebug()
