/**
 * 🔍 DETECTAR MODELOS DISPONIBLES
 * Busca automáticamente qué modelos de Groq están disponibles
 * y actualiza el .env con el mejor modelo
 */

const Groq = require('groq-sdk').default
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const MODELOS_GROQ = [
  { id: 'llama-3.1-8b-instant', nombre: 'Llama 3.1 8B Instant', velocidad: 'Rápido', calidad: 'Alta' },
  { id: 'llama-3.2-3b-preview', nombre: 'Llama 3.2 3B Preview', velocidad: 'Rápido', calidad: 'Media' },
  { id: 'llama-3.2-1b-preview', nombre: 'Llama 3.2 1B Preview', velocidad: 'Muy Rápido', calidad: 'Media' },
  { id: 'gemma2-9b-it', nombre: 'Gemma 2 9B', velocidad: 'Rápido', calidad: 'Alta' },
  { id: 'gemma-7b-it', nombre: 'Gemma 7B', velocidad: 'Rápido', calidad: 'Media' },
  { id: 'mixtral-8x7b-32768', nombre: 'Mixtral 8x7B', velocidad: 'Medio', calidad: 'Alta' },
  { id: 'llama-3.3-70b-versatile', nombre: 'Llama 3.3 70B', velocidad: 'Lento', calidad: 'Muy Alta' }
]

console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
console.log('║                                                                              ║')
console.log('║              🔍 DETECTAR MODELOS DISPONIBLES DE GROQ                         ║')
console.log('║                                                                              ║')
console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
console.log('')

async function detectarModelos() {
  console.log('🔍 Probando modelos de Groq...')
  console.log('')

  const modelosDisponibles = []
  const modelosRateLimit = []
  const modelosNoDisponibles = []

  for (const modelo of MODELOS_GROQ) {
    process.stdout.write(`   Probando ${modelo.id}... `)

    try {
      const response = await groq.chat.completions.create({
        model: modelo.id,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        temperature: 0
      })

      if (response.choices && response.choices.length > 0) {
        console.log('✅ Disponible')
        modelosDisponibles.push(modelo)
      }
    } catch (error) {
      const errorMsg = error.message || String(error)

      if (errorMsg.includes('rate_limit_exceeded')) {
        console.log('⏳ Rate limit alcanzado')
        modelosRateLimit.push(modelo)
      } else if (errorMsg.includes('model_not_found') || errorMsg.includes('404')) {
        console.log('❌ No encontrado')
        modelosNoDisponibles.push(modelo)
      } else {
        console.log(`⚠️ Error: ${errorMsg.substring(0, 30)}...`)
        modelosNoDisponibles.push(modelo)
      }
    }

    // Pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('')
  console.log('═'.repeat(78))
  console.log('')
  console.log('📊 RESUMEN:')
  console.log('')
  console.log(`   ✅ Disponibles: ${modelosDisponibles.length}`)
  console.log(`   ⏳ Rate limit: ${modelosRateLimit.length}`)
  console.log(`   ❌ No disponibles: ${modelosNoDisponibles.length}`)
  console.log('')

  if (modelosDisponibles.length > 0) {
    console.log('✅ MODELOS DISPONIBLES:')
    console.log('')
    modelosDisponibles.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.nombre}`)
      console.log(`      ID: ${m.id}`)
      console.log(`      Velocidad: ${m.velocidad}`)
      console.log(`      Calidad: ${m.calidad}`)
      console.log('')
    })

    // Actualizar .env con el mejor modelo
    const mejorModelo = modelosDisponibles[0]
    console.log('═'.repeat(78))
    console.log('')
    console.log(`🎯 MEJOR MODELO DETECTADO: ${mejorModelo.nombre}`)
    console.log('')
    console.log('¿Deseas actualizar el .env con este modelo? (S/N)')
    console.log('')
    console.log('   Si dices S, se actualizará automáticamente')
    console.log('   Si dices N, solo verás la información')
    console.log('')

    // En modo automático, actualizar directamente
    if (process.argv.includes('--auto')) {
      await actualizarEnv(mejorModelo.id, modelosDisponibles)
    } else {
      console.log('💡 Para actualizar automáticamente, ejecuta:')
      console.log('   node detectar-modelos-disponibles.js --auto')
    }
  } else if (modelosRateLimit.length > 0) {
    console.log('⏳ TODOS LOS MODELOS TIENEN RATE LIMIT')
    console.log('')
    console.log('   Espera unos minutos y vuelve a intentar')
    console.log('   O usa Ollama como alternativa')
  } else {
    console.log('❌ NO SE ENCONTRARON MODELOS DISPONIBLES')
    console.log('')
    console.log('   Verifica tu API key de Groq')
  }

  return { modelosDisponibles, modelosRateLimit, modelosNoDisponibles }
}

async function actualizarEnv(modeloId, todosLosModelos) {
  console.log('')
  console.log('📝 Actualizando .env...')

  const envPath = path.join(__dirname, '.env')
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ No se encontró el archivo .env')
    return
  }

  // Crear backup
  const backupPath = envPath + '.backup-' + Date.now()
  fs.copyFileSync(envPath, backupPath)
  console.log(`   ✅ Backup creado: ${path.basename(backupPath)}`)

  // Leer y actualizar
  let content = fs.readFileSync(envPath, 'utf8')

  // Actualizar GROQ_MODEL
  content = content.replace(
    /GROQ_MODEL=.*/g,
    `GROQ_MODEL=${modeloId}`
  )

  // Actualizar GROQ_FALLBACK_MODELS con todos los disponibles
  const fallbackModels = todosLosModelos.slice(1, 4).map(m => m.id).join(',')
  if (fallbackModels) {
    content = content.replace(
      /GROQ_FALLBACK_MODELS=.*/g,
      `GROQ_FALLBACK_MODELS=${fallbackModels}`
    )
  }

  // Guardar
  fs.writeFileSync(envPath, content, 'utf8')
  console.log('   ✅ Archivo .env actualizado')
  console.log('')
  console.log('═'.repeat(78))
  console.log('')
  console.log('✅ CONFIGURACIÓN ACTUALIZADA:')
  console.log('')
  console.log(`   Modelo principal: ${modeloId}`)
  if (fallbackModels) {
    console.log(`   Modelos de respaldo: ${fallbackModels}`)
  }
  console.log('')
  console.log('🚀 PRÓXIMO PASO:')
  console.log('   Reinicia el bot: npm run dev')
  console.log('')
}

// Ejecutar
detectarModelos()
  .then(() => {
    console.log('✅ Detección completada')
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
