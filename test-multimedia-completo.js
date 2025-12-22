/**
 * 🎬 TEST SISTEMA MULTIMEDIA COMPLETO
 * Prueba todas las funcionalidades multimedia del bot
 */

console.log('🎬 SISTEMA MULTIMEDIA - TEST COMPLETO\n')

// 1. Verificar configuración
console.log('📋 CONFIGURACIÓN ACTUAL:')
console.log('━'.repeat(50))

const config = {
  photos: process.env.PHOTOS_ENABLED === 'true',
  audio: process.env.AUDIO_ENABLED === 'true',
  voice: process.env.VOICE_ENABLED === 'true',
  voiceProvider: process.env.VOICE_PROVIDER || 'no configurado',
  groqKey: !!process.env.GROQ_API_KEY,
  elevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
  openaiKey: !!process.env.OPENAI_API_KEY
}

console.log(`📸 Fotos:           ${config.photos ? '✅ ACTIVO' : '❌ DESACTIVADO'}`)
console.log(`🎤 Transcripción:   ${config.audio ? '✅ ACTIVO' : '❌ DESACTIVADO'}`)
console.log(`🎙️  Generación Voz:  ${config.voice ? '✅ ACTIVO' : '⏸️  DESACTIVADO'}`)
console.log(`🔧 Proveedor Voz:   ${config.voiceProvider}`)
console.log()

console.log('🔑 API KEYS:')
console.log('━'.repeat(50))
console.log(`Groq (Transcripción): ${config.groqKey ? '✅ Configurada' : '❌ Falta'}`)
console.log(`ElevenLabs (Voz):     ${config.elevenLabsKey ? '✅ Configurada' : '⏸️  No configurada'}`)
console.log(`OpenAI (Voz):         ${config.openaiKey ? '✅ Configurada' : '⏸️  No configurada'}`)
console.log()

// 2. Estado de funcionalidades
console.log('🎯 FUNCIONALIDADES DISPONIBLES:')
console.log('━'.repeat(50))

const features = []

if (config.photos) {
  features.push('✅ Envío automático de fotos de productos')
}

if (config.audio && config.groqKey) {
  features.push('✅ Transcripción de audios recibidos')
}

if (config.voice) {
  if (config.voiceProvider === 'elevenlabs' && config.elevenLabsKey) {
    features.push('✅ Respuestas de voz con ElevenLabs')
  } else if (config.voiceProvider === 'openai' && config.openaiKey) {
    features.push('✅ Respuestas de voz con OpenAI')
  } else {
    features.push('⚠️  Voz activada pero falta configurar API key')
  }
}

if (features.length === 0) {
  console.log('⚠️  No hay funcionalidades multimedia activas')
} else {
  features.forEach(f => console.log(f))
}
console.log()

// 3. Flujos de conversación
console.log('💬 FLUJOS DE CONVERSACIÓN DISPONIBLES:')
console.log('━'.repeat(50))

console.log('\n1️⃣  FLUJO BÁSICO (Siempre disponible):')
console.log('   Cliente: "Hola"')
console.log('   Bot: [Texto] "¡Hola! ¿En qué puedo ayudarte?"')

if (config.photos) {
  console.log('\n2️⃣  FLUJO CON FOTOS:')
  console.log('   Cliente: "Tienes portátiles?"')
  console.log('   Bot: [Texto] "¡Claro! Tengo estas opciones..."')
  console.log('        📸 [Foto 1]')
  console.log('        📸 [Foto 2]')
  console.log('        📸 [Foto 3]')
}

if (config.audio && config.groqKey) {
  console.log('\n3️⃣  FLUJO CON AUDIO ENTRANTE:')
  console.log('   Cliente: 🎤 [Audio] "Quiero un portátil"')
  console.log('   Bot: [Transcribe] "Quiero un portátil"')
  console.log('        [Responde] "¡Claro! Tengo estas opciones..."')
}

if (config.voice) {
  console.log('\n4️⃣  FLUJO CON AUDIO SALIENTE:')
  console.log('   Cliente: "Hola"')
  console.log('   Bot: [Texto] "¡Hola! ¿En qué puedo ayudarte?"')
  console.log('        🎙️  [Audio con voz]')
}

if (config.photos && config.audio && config.voice && config.groqKey) {
  console.log('\n5️⃣  FLUJO COMPLETO (Audio → Audio + Fotos):')
  console.log('   Cliente: 🎤 [Audio] "Quiero un portátil"')
  console.log('   Bot: [Transcribe] "Quiero un portátil"')
  console.log('        [Texto] "¡Claro! Tengo estas opciones..."')
  console.log('        🎙️  [Audio con voz]')
  console.log('        📸 [Fotos de productos]')
}

console.log()

// 4. Recomendaciones
console.log('💡 RECOMENDACIONES:')
console.log('━'.repeat(50))

const recommendations = []

if (!config.photos) {
  recommendations.push('📸 Activa fotos: PHOTOS_ENABLED=true')
}

if (!config.audio) {
  recommendations.push('🎤 Activa transcripción: AUDIO_ENABLED=true')
}

if (!config.groqKey) {
  recommendations.push('🔑 Configura Groq API Key para transcripción')
}

if (!config.voice) {
  recommendations.push('🎙️  Considera activar voz: VOICE_ENABLED=true')
  recommendations.push('   Opciones:')
  recommendations.push('   - OpenAI TTS (fácil, económico)')
  recommendations.push('   - ElevenLabs (mejor calidad, clona tu voz)')
}

if (config.voice && !config.elevenLabsKey && !config.openaiKey) {
  recommendations.push('⚠️  Voz activada pero falta API key')
  recommendations.push('   Configura ELEVENLABS_API_KEY o OPENAI_API_KEY')
}

if (recommendations.length === 0) {
  console.log('✅ ¡Todo configurado perfectamente!')
} else {
  recommendations.forEach(r => console.log(r))
}

console.log()

// 5. Próximos pasos
console.log('🚀 PRÓXIMOS PASOS:')
console.log('━'.repeat(50))

if (!config.voice) {
  console.log('1. Prueba el sistema actual (fotos + transcripción)')
  console.log('2. Si quieres voz, elige un proveedor:')
  console.log('   a) OpenAI TTS (recomendado para empezar)')
  console.log('   b) ElevenLabs (para clonar tu voz)')
  console.log('3. Actualiza .env con las credenciales')
  console.log('4. Reinicia el bot: npm run dev')
} else {
  console.log('1. ✅ Sistema multimedia completo activado')
  console.log('2. Prueba enviando mensajes al bot')
  console.log('3. Monitorea los logs para ver el funcionamiento')
  console.log('4. Ajusta según feedback de clientes')
}

console.log()
console.log('📖 Documentación completa: SISTEMA_MULTIMEDIA_COMPLETO.md')
console.log()
