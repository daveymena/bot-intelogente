/**
 * ✅ HABILITAR DETECCIÓN AUTOMÁTICA DE MODELOS
 * Configura el bot para que detecte y cambie modelos automáticamente
 */

const fs = require('fs')
const path = require('path')

console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
console.log('║                                                                              ║')
console.log('║              ✅ HABILITAR DETECCIÓN AUTOMÁTICA DE MODELOS                    ║')
console.log('║                                                                              ║')
console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
console.log('')

const ENV_FILE = path.join(__dirname, '.env')

if (!fs.existsSync(ENV_FILE)) {
  console.log('❌ No se encontró el archivo .env')
  process.exit(1)
}

console.log('[1/3] 📝 Creando backup...')
const BACKUP_FILE = ENV_FILE + '.backup-' + Date.now()
fs.copyFileSync(ENV_FILE, BACKUP_FILE)
console.log(`   ✅ Backup creado: ${path.basename(BACKUP_FILE)}`)
console.log('')

console.log('[2/3] 🔧 Actualizando configuración...')
let content = fs.readFileSync(ENV_FILE, 'utf8')

// Agregar o actualizar AI_AUTO_MODEL_DETECTION
if (content.includes('AI_AUTO_MODEL_DETECTION')) {
  content = content.replace(
    /AI_AUTO_MODEL_DETECTION=.*/g,
    'AI_AUTO_MODEL_DETECTION=true'
  )
  console.log('   ✅ AI_AUTO_MODEL_DETECTION actualizado a true')
} else {
  // Agregar al final de la sección de Groq
  const groqSection = content.indexOf('# Groq API')
  if (groqSection !== -1) {
    const nextSection = content.indexOf('\n\n#', groqSection + 1)
    const insertPosition = nextSection !== -1 ? nextSection : content.length
    
    const newLine = '\n# Detección automática de modelos (true = detecta automáticamente el mejor modelo)\nAI_AUTO_MODEL_DETECTION=true\n'
    content = content.slice(0, insertPosition) + newLine + content.slice(insertPosition)
    console.log('   ✅ AI_AUTO_MODEL_DETECTION agregado')
  } else {
    content += '\n# Detección automática de modelos\nAI_AUTO_MODEL_DETECTION=true\n'
    console.log('   ✅ AI_AUTO_MODEL_DETECTION agregado al final')
  }
}

// Cambiar a un modelo ligero por defecto
if (content.includes('GROQ_MODEL=llama-3.3-70b-versatile')) {
  content = content.replace(
    /GROQ_MODEL=llama-3\.3-70b-versatile/g,
    'GROQ_MODEL=llama-3.1-8b-instant'
  )
  console.log('   ✅ GROQ_MODEL cambiado a llama-3.1-8b-instant (más eficiente)')
}

// Reducir max_tokens para ahorrar tokens
if (content.includes('GROQ_MAX_TOKENS=500')) {
  content = content.replace(
    /GROQ_MAX_TOKENS=500/g,
    'GROQ_MAX_TOKENS=400'
  )
  console.log('   ✅ GROQ_MAX_TOKENS reducido a 400 (ahorro de tokens)')
}

fs.writeFileSync(ENV_FILE, content, 'utf8')
console.log('')

console.log('[3/3] ✅ Verificando cambios...')
const newContent = fs.readFileSync(ENV_FILE, 'utf8')

const checks = [
  { name: 'AI_AUTO_MODEL_DETECTION=true', test: newContent.includes('AI_AUTO_MODEL_DETECTION=true') },
  { name: 'GROQ_MODEL optimizado', test: newContent.includes('llama-3.1-8b-instant') },
  { name: 'GROQ_MAX_TOKENS optimizado', test: newContent.includes('GROQ_MAX_TOKENS=400') }
]

checks.forEach(check => {
  console.log(`   ${check.test ? '✅' : '⚠️'} ${check.name}`)
})

console.log('')
console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
console.log('║                                                                              ║')
console.log('║              ✅ DETECCIÓN AUTOMÁTICA HABILITADA                              ║')
console.log('║                                                                              ║')
console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
console.log('')
console.log('🎯 CÓMO FUNCIONA AHORA:')
console.log('')
console.log('   1. Cliente envía mensaje')
console.log('   2. Bot detecta automáticamente el mejor modelo disponible')
console.log('   3. Si encuentra rate limit, cambia a otro modelo automáticamente')
console.log('   4. Si todos los modelos de Groq fallan, usa Ollama')
console.log('   5. Todo sin intervención humana')
console.log('')
console.log('📊 MODELOS QUE PROBARÁ AUTOMÁTICAMENTE:')
console.log('')
console.log('   1. llama-3.1-8b-instant (Rápido, eficiente)')
console.log('   2. llama-3.2-3b-preview (Muy rápido)')
console.log('   3. gemma2-9b-it (Rápido, alta calidad)')
console.log('   4. gemma-7b-it (Rápido)')
console.log('   5. mixtral-8x7b-32768 (Alta calidad)')
console.log('   6. Y más...')
console.log('')
console.log('🚀 PRÓXIMO PASO:')
console.log('   Reinicia el bot: npm run dev')
console.log('')
console.log('✅ El bot ahora cambiará de modelo automáticamente cuando sea necesario')
console.log('')
