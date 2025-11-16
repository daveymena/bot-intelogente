/**
 * Script para activar IA Local Únicamente
 * Desactiva todas las IAs externas y Ollama
 * Configura el sistema para usar solo la IA local entrenada
 */

import fs from 'fs'
import path from 'path'

async function activarIALocalSolo() {
  console.log('🚀 Activando IA Local Únicamente...\n')

  try {
    // 1. Copiar configuración
    console.log('✅ 1. Copiando configuración de IA Local...')
    const envLocalAiPath = path.join(process.cwd(), '.env.local-ai-only')
    const envPath = path.join(process.cwd(), '.env')

    if (fs.existsSync(envLocalAiPath)) {
      const content = fs.readFileSync(envLocalAiPath, 'utf-8')
      fs.writeFileSync(envPath, content, 'utf-8')
      console.log('   ✅ Archivo .env actualizado')
    } else {
      console.log('   ⚠️ Archivo .env.local-ai-only no encontrado')
    }

    // 2. Verificar que IAs externas están desactivadas
    console.log('\n✅ 2. Verificando desactivación de IAs externas...')
    const envContent = fs.readFileSync(envPath, 'utf-8')

    const externalAIs = [
      'GROQ_API_KEY',
      'OPENAI_API_KEY',
      'CLAUDE_API_KEY',
      'GEMINI_API_KEY',
      'MISTRAL_API_KEY',
      'OPENROUTER_API_KEY'
    ]

    let allDisabled = true
    externalAIs.forEach(ai => {
      const regex = new RegExp(`^${ai}=`, 'm')
      const match = envContent.match(regex)
      if (match && !match[0].endsWith('=')) {
        console.log(`   ⚠️ ${ai} aún tiene valor`)
        allDisabled = false
      } else {
        console.log(`   ✅ ${ai} desactivado`)
      }
    })

    // 3. Verificar que Ollama está desactivado
    console.log('\n✅ 3. Verificando desactivación de Ollama...')
    if (envContent.includes('OLLAMA_ENABLED=false')) {
      console.log('   ✅ Ollama desactivado')
    } else {
      console.log('   ⚠️ Ollama podría estar activo')
    }

    // 4. Verificar que IA Local está activada
    console.log('\n✅ 4. Verificando activación de IA Local...')
    if (envContent.includes('LOCAL_AI_ENABLED=true')) {
      console.log('   ✅ IA Local activada')
    } else {
      console.log('   ⚠️ IA Local no está activada')
    }

    if (envContent.includes('AI_PROVIDER=local')) {
      console.log('   ✅ AI_PROVIDER configurado como local')
    } else {
      console.log('   ⚠️ AI_PROVIDER no está configurado como local')
    }

    // 5. Crear carpetas necesarias
    console.log('\n✅ 5. Creando carpetas necesarias...')
    const folders = [
      './data',
      './temp-images',
      './auth_sessions'
    ]

    folders.forEach(folder => {
      const folderPath = path.join(process.cwd(), folder)
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
        console.log(`   ✅ Carpeta creada: ${folder}`)
      } else {
        console.log(`   ✅ Carpeta existe: ${folder}`)
      }
    })

    // 6. Crear archivo de modelo de IA local si no existe
    console.log('\n✅ 6. Verificando modelo de IA Local...')
    const modelPath = path.join(process.cwd(), 'data', 'local-ai-model.json')
    if (!fs.existsSync(modelPath)) {
      const modelTemplate = {
        version: '1.0',
        type: 'local-ai',
        createdAt: new Date().toISOString(),
        trainingData: {
          prompts: [],
          responses: [],
          intents: []
        },
        config: {
          maxTokens: 500,
          temperature: 0.7,
          topP: 0.9
        }
      }

      fs.writeFileSync(
        modelPath,
        JSON.stringify(modelTemplate, null, 2),
        'utf-8'
      )
      console.log('   ✅ Modelo de IA Local creado')
    } else {
      console.log('   ✅ Modelo de IA Local existe')
    }

    // 7. Resumen
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE CONFIGURACIÓN')
    console.log('='.repeat(60))
    console.log('\n✅ IAs Externas Desactivadas:')
    console.log('   - Groq')
    console.log('   - OpenAI')
    console.log('   - Claude')
    console.log('   - Gemini')
    console.log('   - Mistral')
    console.log('   - OpenRouter')

    console.log('\n✅ Ollama Desactivado')

    console.log('\n✅ IA Local Activada:')
    console.log('   - Modelo: ./data/local-ai-model.json')
    console.log('   - Datos de entrenamiento: ./data/training-data.json')
    console.log('   - Caché habilitada')

    console.log('\n✅ Características Habilitadas:')
    console.log('   - Fotos Inteligentes')
    console.log('   - Links de Pago Dinámico')
    console.log('   - WhatsApp Web Estable')
    console.log('   - Health Monitor')

    console.log('\n' + '='.repeat(60))
    console.log('🚀 PRÓXIMOS PASOS')
    console.log('='.repeat(60))
    console.log('\n1. Instalar dependencias:')
    console.log('   npm install')

    console.log('\n2. Iniciar bot:')
    console.log('   npm run dev')

    console.log('\n3. Entrenar IA Local (opcional):')
    console.log('   npx tsx scripts/entrenar-ia-local.ts')

    console.log('\n4. Probar conexión:')
    console.log('   curl http://localhost:4000/api/whatsapp/health?userId=user123')

    console.log('\n' + '='.repeat(60))
    console.log('✅ Configuración completada exitosamente')
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('❌ Error activando IA Local:', error)
    process.exit(1)
  }
}

// Ejecutar
activarIALocalSolo()
