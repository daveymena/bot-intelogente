/**
 * 🤖 SCRIPT DE INTEGRACIÓN AUTOMÁTICA
 * Integra el sistema de razonamiento profundo automáticamente
 */

const fs = require('fs')
const path = require('path')

console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
console.log('║                                                                              ║')
console.log('║              🤖 INTEGRACIÓN AUTOMÁTICA - RAZONAMIENTO PROFUNDO               ║')
console.log('║                                                                              ║')
console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
console.log('')

const SERVICE_FILE = path.join(__dirname, 'src', 'lib', 'intelligent-response-service.ts')

// Verificar que el archivo existe
if (!fs.existsSync(SERVICE_FILE)) {
  console.log('❌ ERROR: No se encontró el archivo intelligent-response-service.ts')
  console.log('   Ruta esperada:', SERVICE_FILE)
  process.exit(1)
}

console.log('[1/5] 📝 Creando backup del archivo original...')
const BACKUP_FILE = SERVICE_FILE + '.backup-' + Date.now()
fs.copyFileSync(SERVICE_FILE, BACKUP_FILE)
console.log('   ✅ Backup creado:', path.basename(BACKUP_FILE))
console.log('')

console.log('[2/5] 📖 Leyendo archivo...')
let content = fs.readFileSync(SERVICE_FILE, 'utf8')
console.log('   ✅ Archivo leído correctamente')
console.log('')

console.log('[3/5] 🔧 Aplicando cambios...')

// Cambio 1: Agregar importación
if (!content.includes('DeepReasoningAIService')) {
  console.log('   → Agregando importación de DeepReasoningAIService...')
  
  // Buscar la línea de importación de AIService
  const aiServiceImport = "import { AIService } from './ai-service'"
  
  if (content.includes(aiServiceImport)) {
    content = content.replace(
      aiServiceImport,
      aiServiceImport + "\nimport { DeepReasoningAIService } from './deep-reasoning-ai-service'"
    )
    console.log('   ✅ Importación agregada')
  } else {
    console.log('   ⚠️ No se encontró la importación de AIService, agregando al inicio...')
    content = "import { DeepReasoningAIService } from './deep-reasoning-ai-service'\n" + content
    console.log('   ✅ Importación agregada al inicio')
  }
} else {
  console.log('   ℹ️ Importación ya existe, saltando...')
}

// Cambio 2: Reemplazar primera llamada (en useAdvancedAI)
console.log('   → Reemplazando primera llamada a AIService...')
const pattern1 = /response = await AIService\.generateResponse\(\s*userId,\s*customerMessage,\s*customerPhone,\s*conversationHistory\s*\)/g
const replacement1 = 'response = await DeepReasoningAIService.generateIntelligentResponse(\n      userId,\n      customerMessage,\n      customerPhone,\n      conversationHistory\n    )'

if (pattern1.test(content)) {
  content = content.replace(pattern1, replacement1)
  console.log('   ✅ Primera llamada reemplazada')
} else {
  console.log('   ⚠️ No se encontró el patrón exacto, intentando búsqueda más flexible...')
  
  // Búsqueda más flexible
  const flexPattern1 = /response\s*=\s*await\s+AIService\.generateResponse\([^)]+\)/g
  if (flexPattern1.test(content)) {
    content = content.replace(
      flexPattern1,
      'response = await DeepReasoningAIService.generateIntelligentResponse(\n      userId,\n      customerMessage,\n      customerPhone,\n      conversationHistory\n    )'
    )
    console.log('   ✅ Primera llamada reemplazada (búsqueda flexible)')
  } else {
    console.log('   ⚠️ No se pudo reemplazar automáticamente')
  }
}

// Cambio 3: Reemplazar segunda llamada (en generateSimpleResponse)
console.log('   → Reemplazando segunda llamada a AIService...')
const pattern2 = /return await AIService\.generateResponse\(userId,\s*message,\s*_customerPhone,\s*conversationHistory\)/g
const replacement2 = 'return await DeepReasoningAIService.generateIntelligentResponse(userId, message, _customerPhone, conversationHistory)'

if (pattern2.test(content)) {
  content = content.replace(pattern2, replacement2)
  console.log('   ✅ Segunda llamada reemplazada')
} else {
  console.log('   ⚠️ No se encontró el patrón exacto, intentando búsqueda más flexible...')
  
  // Búsqueda más flexible
  const flexPattern2 = /return\s+await\s+AIService\.generateResponse\([^)]+\)/g
  if (flexPattern2.test(content)) {
    content = content.replace(
      flexPattern2,
      'return await DeepReasoningAIService.generateIntelligentResponse(userId, message, _customerPhone, conversationHistory)'
    )
    console.log('   ✅ Segunda llamada reemplazada (búsqueda flexible)')
  } else {
    console.log('   ⚠️ No se pudo reemplazar automáticamente')
  }
}

// Cambio 4: Actualizar mensajes de log
console.log('   → Actualizando mensajes de log...')
content = content.replace(
  /console\.log\(`\[Intelligence\] 🧠 Usando IA AVANZADA para razonamiento complejo`\)/g,
  "console.log(`[Intelligence] 🧠 Usando RAZONAMIENTO PROFUNDO con documentación completa`)"
)
console.log('   ✅ Mensajes de log actualizados')

console.log('')
console.log('[4/5] 💾 Guardando cambios...')
fs.writeFileSync(SERVICE_FILE, content, 'utf8')
console.log('   ✅ Archivo guardado correctamente')
console.log('')

console.log('[5/5] ✅ Verificando cambios...')
const newContent = fs.readFileSync(SERVICE_FILE, 'utf8')

const checks = [
  {
    name: 'Importación de DeepReasoningAIService',
    test: newContent.includes('DeepReasoningAIService')
  },
  {
    name: 'Primera llamada reemplazada',
    test: newContent.includes('DeepReasoningAIService.generateIntelligentResponse')
  },
  {
    name: 'Mensaje de log actualizado',
    test: newContent.includes('RAZONAMIENTO PROFUNDO')
  }
]

let allPassed = true
checks.forEach(check => {
  if (check.test) {
    console.log(`   ✅ ${check.name}`)
  } else {
    console.log(`   ❌ ${check.name}`)
    allPassed = false
  }
})

console.log('')
console.log('╔══════════════════════════════════════════════════════════════════════════════╗')
console.log('║                                                                              ║')

if (allPassed) {
  console.log('║              ✅ INTEGRACIÓN COMPLETADA EXITOSAMENTE                          ║')
  console.log('║                                                                              ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('📋 PRÓXIMOS PASOS:')
  console.log('')
  console.log('1. Reinicia el bot:')
  console.log('   npm run dev')
  console.log('')
  console.log('2. Prueba con un mensaje:')
  console.log('   "Qué megapacks tienes?"')
  console.log('')
  console.log('3. Verifica los logs:')
  console.log('   Deberías ver: [Deep AI] 🧠 Iniciando razonamiento profundo...')
  console.log('')
  console.log('✅ Backup guardado en:', path.basename(BACKUP_FILE))
  console.log('   Si algo sale mal, puedes restaurarlo')
  console.log('')
} else {
  console.log('║              ⚠️ INTEGRACIÓN PARCIAL                                         ║')
  console.log('║                                                                              ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('⚠️ Algunos cambios no se aplicaron correctamente.')
  console.log('')
  console.log('📋 OPCIONES:')
  console.log('')
  console.log('1. Revisar manualmente el archivo:')
  console.log('   ' + SERVICE_FILE)
  console.log('')
  console.log('2. Restaurar el backup y hacer cambios manuales:')
  console.log('   copy "' + BACKUP_FILE + '" "' + SERVICE_FILE + '"')
  console.log('')
  console.log('3. Seguir la guía manual:')
  console.log('   APLICAR_RAZONAMIENTO_PROFUNDO.md')
  console.log('')
}

console.log('🎉 Script completado')
