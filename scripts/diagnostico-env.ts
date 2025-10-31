// Script para diagnosticar variables de entorno

// Cargar variables de entorno
import { config } from 'dotenv'
config()

console.log('🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO\n')
console.log('=' .repeat(60))

console.log('\n📋 Variables de IA:')
console.log('─'.repeat(60))
console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Configurada' : '❌ NO configurada'}`)
console.log(`GROQ_MODEL: ${process.env.GROQ_MODEL || '❌ No definida'}`)
console.log(`AI_FALLBACK_ENABLED: ${process.env.AI_FALLBACK_ENABLED || '❌ No definida'}`)
console.log(`AI_FALLBACK_ORDER: ${process.env.AI_FALLBACK_ORDER || '❌ No definida'}`)
console.log(`LM_STUDIO_URL: ${process.env.LM_STUDIO_URL || '❌ No definida'}`)
console.log(`LM_STUDIO_MODEL: ${process.env.LM_STUDIO_MODEL || '❌ No definida'}`)
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Configurada' : '⚠️  No configurada (opcional)'}`)

console.log('\n📊 Resumen:')
console.log('─'.repeat(60))

const groqOk = !!process.env.GROQ_API_KEY
const lmStudioOk = !!process.env.LM_STUDIO_URL
const openaiOk = !!process.env.OPENAI_API_KEY

console.log(`Groq: ${groqOk ? '✅' : '❌'}`)
console.log(`LM Studio: ${lmStudioOk ? '✅' : '❌'}`)
console.log(`OpenAI: ${openaiOk ? '✅' : '⚠️  (opcional)'}`)

console.log('\n💡 Recomendaciones:')
console.log('─'.repeat(60))

if (!groqOk) {
  console.log('❌ GROQ_API_KEY no está configurada')
  console.log('   Solución: Verifica tu archivo .env')
}

if (!lmStudioOk) {
  console.log('❌ LM_STUDIO_URL no está configurada')
  console.log('   Solución: Verifica tu archivo .env')
}

if (!groqOk && !lmStudioOk && !openaiOk) {
  console.log('\n⚠️  NINGÚN PROVIDER CONFIGURADO')
  console.log('   El bot NO podrá responder mensajes')
  console.log('   Configura al menos uno en el archivo .env')
}

console.log('\n' + '='.repeat(60))
