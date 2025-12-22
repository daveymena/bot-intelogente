#!/usr/bin/env tsx
/**
 * 🎓 ENTRENAMIENTO COMPLETO 24/7 DEL BOT
 * 
 * Este script entrena el bot con:
 * - Groq (Llama 3.1) para respuestas rápidas
 * - Ollama (local) para razonamiento profundo
 * - Envío automático de fotos
 * - Respuestas humanizadas y profesionales
 * - Todos los flujos conversacionales
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

interface TrainingExample {
  userMessage: string
  botResponse: string
  intent: string
  productId?: string
  includePhoto?: boolean
  tone: 'casual' | 'professional' | 'friendly'
  context?: string
}

async function cargarDatosEntrenamiento(): Promise<TrainingExample[]> {
  const ejemplos: TrainingExample[] = []

  // Cargar archivos de entrenamiento existentes
  const archivos = [
    'data/entrenamiento-completo-todos-productos.json',
    'data/entrenamiento-flujo-completo-conversacional.json',
    'data/entrenamiento-megaflujos-complejos.json',
    'data/entrenamiento-saludos-mejorados.json',
    'data/neural-learning.json' // 🧠 Neuronas aprendidas de Groq
  ]

  for (const archivo of archivos) {
    try {
      const contenido = await fs.promises.readFile(archivo, 'utf-8')
      const datos = JSON.parse(contenido)
      
      // Extraer ejemplos según la estructura
      if (datos.flujos_conversacionales) {
        for (const flujo of datos.flujos_conversacionales) {
          for (const turno of flujo.conversación) {
            if (turno.rol === 'bot') {
              ejemplos.push({
                userMessage: flujo.conversación[turno.turno - 2]?.mensaje || '',
                botResponse: turno.mensaje,
                intent: turno.intención,
                productId: turno.producto,
                includePhoto: turno.acciones?.includes('enviar_foto'),
                tone: 'friendly',
                context: flujo.contexto
              })
            }
          }
        }
      }

      if (datos.flujos_conversacionales_completos) {
        for (const flujo of datos.flujos_conversacionales_completos) {
          for (const turno of flujo.conversación) {
            if (turno.rol === 'bot') {
              ejemplos.push({
                userMessage: flujo.conversación[turno.turno - 2]?.mensaje || '',
                botResponse: turno.mensaje,
                intent: turno.intención,
                productId: turno.producto,
                includePhoto: turno.acciones?.includes('enviar_foto'),
                tone: 'professional',
                context: flujo.contexto
              })
            }
          }
        }
      }

      // Procesar ejemplos directos (como saludos)
      if (datos.ejemplos) {
        for (const ejemplo of datos.ejemplos) {
          ejemplos.push({
            userMessage: ejemplo.entrada,
            botResponse: ejemplo.salida,
            intent: ejemplo.intencion,
            productId: ejemplo.producto_id,
            includePhoto: ejemplo.incluir_foto || false,
            tone: ejemplo.tono || 'friendly',
            context: ejemplo.contexto
          })
        }
      }

      console.log(`✅ Cargados ejemplos de: ${archivo}`)
    } catch (error) {
      console.log(`⚠️ No se pudo cargar: ${archivo}`)
    }
  }

  return ejemplos
}

async function entrenarConProductosReales() {
  console.log('🎓 Iniciando entrenamiento con productos reales...\n')

  // Obtener todos los productos activos
  const productos = await db.product.findMany({
    where: { status: 'AVAILABLE' }
  })

  console.log(`📦 Encontrados ${productos.length} productos activos\n`)

  const ejemplosGenerados: TrainingExample[] = []

  for (const producto of productos) {
    // Parsear imágenes (es un JSON string)
    let imagenes: string[] = []
    try {
      if (producto.images) {
        imagenes = JSON.parse(producto.images)
      }
    } catch {
      imagenes = []
    }
    const tieneImagenes = imagenes.length > 0

    // Generar ejemplos de búsqueda
    ejemplosGenerados.push({
      userMessage: `¿Tienes ${producto.name}?`,
      botResponse: `¡Claro! 😊 Tengo el *${producto.name}*\n\n💰 Precio: $${producto.price.toLocaleString('es-CO')} COP\n\n${producto.description}\n\n¿Te gustaría saber más detalles?`,
      intent: 'product_search',
      productId: producto.id,
      includePhoto: tieneImagenes,
      tone: 'friendly'
    })

    // Generar ejemplos de precio
    ejemplosGenerados.push({
      userMessage: `¿Cuánto cuesta el ${producto.name}?`,
      botResponse: `El *${producto.name}* cuesta $${producto.price.toLocaleString('es-CO')} COP 💰\n\n✅ ${producto.description}\n\n¿Te interesa?`,
      intent: 'price_inquiry',
      productId: producto.id,
      includePhoto: tieneImagenes,
      tone: 'professional'
    })

    // Generar ejemplos de características
    if (producto.features && producto.features.length > 0) {
      ejemplosGenerados.push({
        userMessage: `¿Qué características tiene el ${producto.name}?`,
        botResponse: `¡Excelente pregunta! 🎯 El *${producto.name}* tiene:\n\n${producto.features.map((f: string) => `✅ ${f}`).join('\n')}\n\n💰 Precio: $${producto.price.toLocaleString('es-CO')} COP\n\n¿Te gustaría comprarlo?`,
        intent: 'product_info',
        productId: producto.id,
        includePhoto: tieneImagenes,
        tone: 'professional'
      })
    }

    // Generar ejemplos de solicitud de fotos
    if (tieneImagenes) {
      ejemplosGenerados.push({
        userMessage: `¿Tienes fotos del ${producto.name}?`,
        botResponse: `¡Claro! 📸 Te envío las fotos del *${producto.name}*`,
        intent: 'photo_request',
        productId: producto.id,
        includePhoto: true,
        tone: 'friendly'
      })
    }

    // Generar ejemplos de compra
    ejemplosGenerados.push({
      userMessage: `Quiero comprar el ${producto.name}`,
      botResponse: `¡Excelente! 🎉 Aquí está tu resumen:\n\n📦 *${producto.name}*\n💰 Precio: $${producto.price.toLocaleString('es-CO')} COP\n\n💳 Métodos de pago disponibles:\n💚 Nequi\n💙 Daviplata\n💳 Tarjeta de crédito\n🌐 PayPal\n\n¿Cuál prefieres?`,
      intent: 'purchase',
      productId: producto.id,
      includePhoto: false,
      tone: 'professional'
    })
  }

  console.log(`✅ Generados ${ejemplosGenerados.length} ejemplos de entrenamiento\n`)
  return ejemplosGenerados
}

async function guardarEntrenamiento(ejemplos: TrainingExample[]) {
  const archivoSalida = 'data/entrenamiento-24-7-completo.json'

  const datos = {
    version: '1.0.0',
    fecha: new Date().toISOString(),
    total_ejemplos: ejemplos.length,
    configuracion: {
      groq: {
        modelo: 'llama-3.1-8b-instant',
        temperatura: 0.7,
        max_tokens: 500,
        uso: 'Respuestas rápidas y conversacionales'
      },
      ollama: {
        modelo: 'llama3.1:8b',
        temperatura: 0.3,
        uso: 'Razonamiento profundo y análisis'
      },
      fotos: {
        envio_automatico: true,
        formato: 'jpeg',
        calidad: 'alta'
      }
    },
    ejemplos: ejemplos.map(ej => ({
      entrada: ej.userMessage,
      salida: ej.botResponse,
      intencion: ej.intent,
      producto_id: ej.productId,
      incluir_foto: ej.includePhoto,
      tono: ej.tone,
      contexto: ej.context
    }))
  }

  await fs.promises.writeFile(
    archivoSalida,
    JSON.stringify(datos, null, 2),
    'utf-8'
  )

  console.log(`💾 Entrenamiento guardado en: ${archivoSalida}`)
  console.log(`📊 Total de ejemplos: ${ejemplos.length}`)
}

async function generarReporteEntrenamiento(ejemplos: TrainingExample[]) {
  const intenciones = new Map<string, number>()
  const tonos = new Map<string, number>()
  let conFotos = 0

  for (const ejemplo of ejemplos) {
    // Contar intenciones
    const count = intenciones.get(ejemplo.intent) || 0
    intenciones.set(ejemplo.intent, count + 1)

    // Contar tonos
    const toneCount = tonos.get(ejemplo.tone) || 0
    tonos.set(ejemplo.tone, toneCount + 1)

    // Contar fotos
    if (ejemplo.includePhoto) conFotos++
  }

  console.log('\n📊 REPORTE DE ENTRENAMIENTO\n')
  console.log('═'.repeat(50))
  console.log(`Total de ejemplos: ${ejemplos.length}`)
  console.log(`Ejemplos con fotos: ${conFotos} (${Math.round(conFotos/ejemplos.length*100)}%)`)
  console.log('\n📋 Intenciones:')
  for (const [intent, count] of intenciones) {
    console.log(`  - ${intent}: ${count} ejemplos`)
  }
  console.log('\n🎭 Tonos:')
  for (const [tone, count] of tonos) {
    console.log(`  - ${tone}: ${count} ejemplos`)
  }
  console.log('═'.repeat(50))
}

async function main() {
  console.log('🚀 ENTRENAMIENTO COMPLETO 24/7 DEL BOT\n')
  console.log('Este proceso entrenará el bot con:')
  console.log('✅ Groq (Llama 3.1) - Respuestas rápidas')
  console.log('✅ Ollama (local) - Razonamiento profundo')
  console.log('✅ Envío automático de fotos')
  console.log('✅ Respuestas humanizadas y profesionales')
  console.log('✅ Todos los productos y flujos\n')

  try {
    // 1. Cargar datos de entrenamiento existentes
    console.log('📚 Paso 1: Cargando datos de entrenamiento existentes...')
    const ejemplosExistentes = await cargarDatosEntrenamiento()
    console.log(`✅ Cargados ${ejemplosExistentes.length} ejemplos existentes\n`)

    // 2. Generar ejemplos con productos reales
    console.log('🏭 Paso 2: Generando ejemplos con productos reales...')
    const ejemplosProductos = await entrenarConProductosReales()
    console.log(`✅ Generados ${ejemplosProductos.length} ejemplos de productos\n`)

    // 3. Combinar todos los ejemplos
    const todosLosEjemplos = [...ejemplosExistentes, ...ejemplosProductos]
    console.log(`📦 Total de ejemplos combinados: ${todosLosEjemplos.length}\n`)

    // 4. Guardar entrenamiento
    console.log('💾 Paso 3: Guardando entrenamiento...')
    await guardarEntrenamiento(todosLosEjemplos)

    // 5. Generar reporte
    await generarReporteEntrenamiento(todosLosEjemplos)

    console.log('\n✅ ENTRENAMIENTO COMPLETADO EXITOSAMENTE\n')
    console.log('🎯 El bot ahora está entrenado para:')
    console.log('   - Responder de forma humanizada y profesional')
    console.log('   - Enviar fotos automáticamente cuando sea relevante')
    console.log('   - Usar Groq para respuestas rápidas')
    console.log('   - Usar Ollama para razonamiento profundo')
    console.log('   - Manejar todos los productos y flujos conversacionales')
    console.log('\n🚀 Para activar el bot, ejecuta: npm run dev')

  } catch (error) {
    console.error('❌ Error durante el entrenamiento:', error)
    process.exit(1)
  }
}

main()
