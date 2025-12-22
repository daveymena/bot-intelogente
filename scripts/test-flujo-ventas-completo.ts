/**
 * 🧪 TEST PROFUNDO DE FLUJO DE VENTAS COMPLETO
 * 
 * Prueba todos los escenarios de venta:
 * - Productos digitales vs físicos
 * - Objeciones de precio
 * - Preguntas sobre métodos de pago
 * - Confirmaciones de pago
 * - Manejo de contexto
 */

import { Orchestrator } from '../src/agents/orchestrator'
import { SharedMemoryService } from '../src/agents/shared-memory'

interface TestCase {
  nombre: string
  tipo: 'DIGITAL' | 'PHYSICAL'
  mensajes: string[]
  expectativas: {
    mensaje: string
    debeContener: string[]
    noDebeContener?: string[]
    agenteEsperado?: string
  }[]
}

const CASOS_DE_PRUEBA: TestCase[] = [
  // ========================================
  // CASO 1: PRODUCTO DIGITAL - FLUJO COMPLETO
  // ========================================
  {
    nombre: 'Venta de Curso Digital - Flujo Completo',
    tipo: 'DIGITAL',
    mensajes: [
      'Hola',
      'Busco curso de piano',
      'Cuánto cuesta',
      'Qué incluye',
      'Cómo pago',
      'Quiero pagar por MercadoPago',
      'Luego te envío el comprobante'
    ],
    expectativas: [
      {
        mensaje: 'Hola',
        debeContener: ['Hola', 'Bienvenido', 'Tecnovariedades'],
        noDebeContener: ['Mega Pack', 'Curso', 'precio'],
        agenteEsperado: 'greeting'
      },
      {
        mensaje: 'Busco curso de piano',
        debeContener: ['Piano', 'precio', 'COP'],
        noDebeContener: ['laptop', 'moto'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Cuánto cuesta',
        debeContener: ['60.000', 'COP', 'Piano'],
        noDebeContener: ['busco', 'tienes'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Qué incluye',
        debeContener: ['lecciones', 'acceso', 'Piano'],
        noDebeContener: ['envío', 'domicilio'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Cómo pago',
        debeContener: ['MercadoPago', 'PayPal', 'Nequi'],
        noDebeContener: ['contraentrega', 'efectivo'],
        agenteEsperado: 'payment'
      },
      {
        mensaje: 'Quiero pagar por MercadoPago',
        debeContener: ['MercadoPago', 'link', 'Piano'],
        noDebeContener: ['Nequi', 'transferencia'],
        agenteEsperado: 'payment'
      },
      {
        mensaje: 'Luego te envío el comprobante',
        debeContener: ['Perfecto', 'atento', 'comprobante', 'Piano'],
        noDebeContener: ['busco', 'tienes'],
        agenteEsperado: 'closing'
      }
    ]
  },

  // ========================================
  // CASO 2: PRODUCTO FÍSICO - FLUJO COMPLETO
  // ========================================
  {
    nombre: 'Venta de Laptop - Flujo Completo',
    tipo: 'PHYSICAL',
    mensajes: [
      'Hola',
      'Busco laptop para diseño',
      'Cuál me recomiendas',
      'Cuánto cuesta',
      'Cómo es la entrega',
      'Quiero pagar contraentrega',
      'Perfecto, lo quiero'
    ],
    expectativas: [
      {
        mensaje: 'Hola',
        debeContener: ['Hola', 'Bienvenido'],
        noDebeContener: ['laptop', 'precio'],
        agenteEsperado: 'greeting'
      },
      {
        mensaje: 'Busco laptop para diseño',
        debeContener: ['laptop', 'diseño', 'precio', 'COP'],
        noDebeContener: ['curso', 'digital'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Cuál me recomiendas',
        debeContener: ['laptop', 'diseño', 'RAM', 'SSD'],
        noDebeContener: ['curso', 'lecciones'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Cuánto cuesta',
        debeContener: ['COP', 'laptop'],
        noDebeContener: ['acceso inmediato'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Cómo es la entrega',
        debeContener: ['domicilio', 'días', 'envío'],
        noDebeContener: ['acceso inmediato', 'descarga'],
        agenteEsperado: 'closing'
      },
      {
        mensaje: 'Quiero pagar contraentrega',
        debeContener: ['contraentrega', 'efectivo', 'laptop'],
        noDebeContener: ['MercadoPago', 'PayPal'],
        agenteEsperado: 'payment'
      },
      {
        mensaje: 'Perfecto, lo quiero',
        debeContener: ['Excelente', 'compra', 'laptop'],
        noDebeContener: [],
        agenteEsperado: 'closing'
      }
    ]
  },

  // ========================================
  // CASO 3: OBJECIONES DE PRECIO
  // ========================================
  {
    nombre: 'Manejo de Objeción de Precio',
    tipo: 'DIGITAL',
    mensajes: [
      'Busco curso de piano',
      'Es muy caro',
      'Tienes algo más barato',
      'Ok, me interesa el de 20 mil'
    ],
    expectativas: [
      {
        mensaje: 'Busco curso de piano',
        debeContener: ['Piano', 'precio'],
        noDebeContener: [],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Es muy caro',
        debeContener: ['entiendo', 'inversión', 'alternativa'],
        noDebeContener: ['no tengo', 'no hay'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Tienes algo más barato',
        debeContener: ['20.000', 'Mega Pack', 'económico'],
        noDebeContener: [],
        agenteEsperado: 'search'
      },
      {
        mensaje: 'Ok, me interesa el de 20 mil',
        debeContener: ['Mega Pack', '20.000', 'pago'],
        noDebeContener: ['Piano'],
        agenteEsperado: 'product'
      }
    ]
  },

  // ========================================
  // CASO 4: PÉRDIDA DE CONTEXTO
  // ========================================
  {
    nombre: 'Mantener Contexto Durante Conversación',
    tipo: 'DIGITAL',
    mensajes: [
      'Busco curso de piano',
      'Más información',
      'Cuánto cuesta',
      'Dame el link',
      'Luego te pago'
    ],
    expectativas: [
      {
        mensaje: 'Busco curso de piano',
        debeContener: ['Piano'],
        noDebeContener: [],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Más información',
        debeContener: ['Piano', 'lecciones'],
        noDebeContener: ['busco', 'tienes'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Cuánto cuesta',
        debeContener: ['60.000', 'Piano'],
        noDebeContener: ['laptop', 'moto'],
        agenteEsperado: 'product'
      },
      {
        mensaje: 'Dame el link',
        debeContener: ['Piano', 'pago', 'MercadoPago'],
        noDebeContener: ['busco', 'tienes'],
        agenteEsperado: 'payment'
      },
      {
        mensaje: 'Luego te pago',
        debeContener: ['Perfecto', 'Piano', 'atento'],
        noDebeContener: ['busco', 'laptop'],
        agenteEsperado: 'closing'
      }
    ]
  }
]

// ========================================
// EJECUTAR PRUEBAS
// ========================================

async function ejecutarPruebas() {
  console.log('🧪 ========================================')
  console.log('🧪 INICIANDO PRUEBAS DE FLUJO DE VENTAS')
  console.log('🧪 ========================================\n')

  const orchestrator = new Orchestrator()
  const memoryService = SharedMemoryService.getInstance()
  
  let totalPruebas = 0
  let pruebasExitosas = 0
  let pruebasFallidas = 0
  const erroresDetectados: string[] = []

  for (const caso of CASOS_DE_PRUEBA) {
    console.log(`\n📋 CASO: ${caso.nombre}`)
    console.log(`📦 Tipo: ${caso.tipo}`)
    console.log('─'.repeat(60))

    const chatId = `test-${Date.now()}`
    const userId = 'test-user-id'

    for (let i = 0; i < caso.mensajes.length; i++) {
      const mensaje = caso.mensajes[i]
      const expectativa = caso.expectativas[i]

      totalPruebas++

      console.log(`\n💬 Cliente: "${mensaje}"`)

      try {
        const respuesta = await orchestrator.processMessage({
          chatId,
          userId,
          message: mensaje,
          userName: 'Test User'
        })

        console.log(`🤖 Bot: "${respuesta.text.substring(0, 100)}..."`)

        // Verificar expectativas
        let todasLasExpectativasCumplidas = true
        const erroresEnEstaPrueba: string[] = []

        // Verificar que contenga lo esperado
        for (const textoEsperado of expectativa.debeContener) {
          if (!respuesta.text.toLowerCase().includes(textoEsperado.toLowerCase())) {
            todasLasExpectativasCumplidas = false
            erroresEnEstaPrueba.push(`❌ NO contiene: "${textoEsperado}"`)
          }
        }

        // Verificar que NO contenga lo no deseado
        if (expectativa.noDebeContener) {
          for (const textoNoDeseado of expectativa.noDebeContener) {
            if (respuesta.text.toLowerCase().includes(textoNoDeseado.toLowerCase())) {
              todasLasExpectativasCumplidas = false
              erroresEnEstaPrueba.push(`❌ SÍ contiene (no debería): "${textoNoDeseado}"`)
            }
          }
        }

        if (todasLasExpectativasCumplidas) {
          console.log('✅ PRUEBA EXITOSA')
          pruebasExitosas++
        } else {
          console.log('❌ PRUEBA FALLIDA')
          pruebasFallidas++
          erroresEnEstaPrueba.forEach(error => console.log(`   ${error}`))
          erroresDetectados.push(`${caso.nombre} - "${mensaje}": ${erroresEnEstaPrueba.join(', ')}`)
        }

      } catch (error) {
        console.log('❌ ERROR EN PRUEBA:', error)
        pruebasFallidas++
        erroresDetectados.push(`${caso.nombre} - "${mensaje}": Error de ejecución`)
      }

      // Pequeña pausa entre mensajes
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Limpiar memoria después de cada caso
    memoryService.clearMemory(chatId)
  }

  // ========================================
  // REPORTE FINAL
  // ========================================
  console.log('\n\n🧪 ========================================')
  console.log('🧪 REPORTE FINAL DE PRUEBAS')
  console.log('🧪 ========================================\n')

  console.log(`📊 Total de pruebas: ${totalPruebas}`)
  console.log(`✅ Exitosas: ${pruebasExitosas} (${((pruebasExitosas / totalPruebas) * 100).toFixed(1)}%)`)
  console.log(`❌ Fallidas: ${pruebasFallidas} (${((pruebasFallidas / totalPruebas) * 100).toFixed(1)}%)`)

  if (erroresDetectados.length > 0) {
    console.log('\n\n🔍 ERRORES DETECTADOS:\n')
    erroresDetectados.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`)
    })
  }

  console.log('\n\n💡 RECOMENDACIONES:\n')
  
  if (pruebasFallidas > 0) {
    console.log('1. Revisar los agentes que fallaron')
    console.log('2. Ajustar la detección de intenciones en DeepReasoningAgent')
    console.log('3. Mejorar las respuestas de los agentes específicos')
    console.log('4. Verificar que se mantenga el contexto correctamente')
  } else {
    console.log('✅ ¡Todas las pruebas pasaron exitosamente!')
    console.log('✅ El sistema está funcionando correctamente')
  }

  process.exit(pruebasFallidas > 0 ? 1 : 0)
}

// Ejecutar
ejecutarPruebas().catch(console.error)
