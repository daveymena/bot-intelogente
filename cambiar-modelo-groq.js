/**
 * 🔧 CAMBIAR MODELO DE GROQ
 * Cambia de llama-3.3-70b-versatile a llama-3.1-8b-instant
 * para evitar rate limits
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Cambiando modelo de Groq...')
console.log('')

const ENV_FILE = path.join(__dirname, '.env')

// Verificar que el archivo existe
if (!fs.existsSync(ENV_FILE)) {
  console.log('❌ ERROR: No se encontró el archivo .env')
  process.exit(1)
}

// Leer archivo
let content = fs.readFileSync(ENV_FILE, 'utf8')

// Crear backup
const BACKUP_FILE = ENV_FILE + '.backup-' + Date.now()
fs.writeFileSync(BACKUP_FILE, content, 'utf8')
console.log('✅ Backup creado:', path.basename(BACKUP_FILE))
console.log('')

// Cambiar modelo principal
const oldModel = 'llama-3.3-70b-versatile'
const newModel = 'llama-3.1-8b-instant'

console.log('📝 Cambios a realizar:')
console.log(`   ANTES: ${oldModel}`)
console.log(`   AHORA: ${newModel}`)
console.log('')

// Reemplazar en GROQ_MODEL
content = content.replace(
  /GROQ_MODEL=llama-3\.3-70b-versatile/g,
  `GROQ_MODEL=${newModel}`
)

// Reemplazar en GROQ_FALLBACK_MODELS
content = content.replace(
  /GROQ_FALLBACK_MODELS=llama-3\.3-70b-versatile/g,
  `GROQ_FALLBACK_MODELS=${newModel}`
)

// Guardar cambios
fs.writeFileSync(ENV_FILE, content, 'utf8')
console.log('✅ Archivo .env actualizado')
console.log('')

// Verificar cambios
const newContent = fs.readFileSync(ENV_FILE, 'utf8')
if (newContent.includes(newModel)) {
  console.log('✅ Verificación exitosa: Modelo cambiado correctamente')
  console.log('')
  console.log('📊 COMPARACIÓN:')
  console.log('')
  console.log(`   ${oldModel}:`)
  console.log('   - Tokens por consulta: ~22,901')
  console.log('   - Velocidad: Lenta')
  console.log('   - Rate limit: Fácil de alcanzar')
  console.log('')
  console.log(`   ${newModel}:`)
  console.log('   - Tokens por consulta: ~2,000')
  console.log('   - Velocidad: Rápida')
  console.log('   - Rate limit: Difícil de alcanzar')
  console.log('')
  console.log('💡 Ahorro: 10x menos tokens = 10x más consultas')
} else {
  console.log('⚠️ ADVERTENCIA: No se pudo verificar el cambio')
  console.log('   Revisa manualmente el archivo .env')
}

console.log('')
console.log('✅ Script completado')
