/**
 * 🎨 APLICAR FORMATO VISUAL AL BOT ACTUAL
 * Script para integrar el sistema de formato visual con tu bot existente
 */

const fs = require('fs')
const path = require('path')

console.log('🎨 APLICANDO FORMATO VISUAL AL BOT\n')
console.log('='.repeat(60))

// 1. Verificar archivos necesarios
console.log('\n📋 Verificando archivos...\n')

const archivosNecesarios = [
  'src/lib/whatsapp-response-formatter.ts',
  'src/lib/custom-greeting-system.ts',
  'src/lib/ai-response-integration.ts'
]

let todosExisten = true
archivosNecesarios.forEach(archivo => {
  const existe = fs.existsSync(archivo)
  console.log(`${existe ? '✅' : '❌'} ${archivo}`)
  if (!existe) todosExisten = false
})

if (!todosExisten) {
  console.log('\n❌ Faltan archivos necesarios. Asegúrate de tener todos los archivos del sistema.')
  process.exit(1)
}

console.log('\n✅ Todos los archivos necesarios están presentes')

// 2. Buscar archivo principal del bot
console.log('\n🔍 Buscando archivo principal del bot...\n')

const posiblesArchivosBot = [
  'src/lib/baileys-stable-service.ts',
  'src/lib/whatsapp-web-service.ts',
  'bot-whatsapp.js',
  'src/lib/bot-service.ts'
]

let archivoBot = null
for (const archivo of posiblesArchivosBot) {
  if (fs.existsSync(archivo)) {
    archivoBot = archivo
    console.log(`✅ Encontrado: ${archivo}`)
    break
  }
}

if (!archivoBot) {
  console.log('⚠️  No se encontró el archivo principal del bot automáticamente.')
  console.log('\nPuedes integrar manualmente siguiendo estas instrucciones:\n')
  mostrarInstruccionesIntegracion()
  process.exit(0)
}

// 3. Leer contenido del bot
console.log('\n📖 Leyendo archivo del bot...')
const contenidoBot = fs.readFileSync(archivoBot, 'utf8')

// 4. Verificar si ya está integrado
if (contenidoBot.includes('AIResponseIntegration') || 
    contenidoBot.includes('WhatsAppResponseFormatter')) {
  console.log('\n✅ El formato visual ya está integrado en tu bot!')
  console.log('\nPuedes probar el sistema con:')
  console.log('  node test-formato-visual-completo.js')
  process.exit(0)
}

// 5. Mostrar instrucciones de integración
console.log('\n📝 INSTRUCCIONES DE INTEGRACIÓN\n')
console.log('='.repeat(60))

mostrarInstruccionesIntegracion()

// 6. Crear archivo de ejemplo
console.log('\n📄 Creando archivo de ejemplo...')

const ejemploIntegracion = `
/**
 * EJEMPLO DE INTEGRACIÓN DEL FORMATO VISUAL
 * Copia este código en tu archivo principal del bot
 */

import { AIResponseIntegration } from './ai-response-integration'
import { WhatsAppResponseFormatter } from './whatsapp-response-formatter'
import { CustomGreetingSystem } from './custom-greeting-system'

// OPCIÓN 1: Integración Completa (Recomendado)
async function handleMessageWithFormat(message: string, userId: string) {
  try {
    const response = await AIResponseIntegration.processMessage({
      userId,
      message,
      conversationHistory: [] // Agregar tu historial aquí
    })
    
    return response
  } catch (error) {
    console.error('Error al procesar mensaje:', error)
    return '😅 Lo siento, tuve un problema. ¿Puedes repetir tu pregunta?'
  }
}

// OPCIÓN 2: Solo Formatear Productos
async function formatProductsResponse(products: any[]) {
  const productInfos = products.map(p => ({
    name: p.name,
    price: p.price,
    currency: p.currency || 'COP',
    specs: WhatsAppResponseFormatter.extractSpecs(p)
  }))
  
  return WhatsAppResponseFormatter.formatProductList(productInfos, 'Productos')
}

// OPCIÓN 3: Detectar Saludos
function handleGreeting(message: string, userId: string) {
  if (CustomGreetingSystem.isGreeting(message)) {
    return CustomGreetingSystem.getCustomGreeting(userId)
  }
  return null
}

// EJEMPLO DE USO EN TU BOT
export class BotService {
  async processMessage(message: string, userId: string) {
    // 1. Verificar si es saludo
    const greeting = await handleGreeting(message, userId)
    if (greeting) {
      return \`\${greeting.greeting}\\n\\n\${greeting.context}\`
    }
    
    // 2. Procesar con formato visual
    return await handleMessageWithFormat(message, userId)
  }
}
`

fs.writeFileSync('ejemplo-integracion-formato-visual.ts', ejemploIntegracion)
console.log('✅ Creado: ejemplo-integracion-formato-visual.ts')

console.log('\n' + '='.repeat(60))
console.log('\n✅ PROCESO COMPLETADO\n')
console.log('Próximos pasos:')
console.log('1. Revisa el archivo: ejemplo-integracion-formato-visual.ts')
console.log('2. Copia el código relevante a tu bot')
console.log('3. Prueba con: node test-formato-visual-completo.js')
console.log('4. Consulta: SISTEMA_FORMATO_VISUAL_WHATSAPP.md para más detalles')

function mostrarInstruccionesIntegracion() {
  console.log(`
1️⃣ INTEGRACIÓN COMPLETA (Recomendado)
   
   Agrega al inicio de tu archivo del bot:
   
   import { AIResponseIntegration } from './ai-response-integration'
   
   En tu handler de mensajes:
   
   const response = await AIResponseIntegration.processMessage({
     userId: userId,
     message: message,
     conversationHistory: []
   })

2️⃣ SOLO FORMATEAR PRODUCTOS
   
   import { WhatsAppResponseFormatter } from './whatsapp-response-formatter'
   
   const productInfos = productos.map(p => ({
     name: p.name,
     price: p.price,
     currency: p.currency,
     specs: WhatsAppResponseFormatter.extractSpecs(p)
   }))
   
   const respuesta = WhatsAppResponseFormatter.formatProductList(
     productInfos, 
     'Portátiles'
   )

3️⃣ ACTUALIZAR PROMPT DE IA
   
   import { CustomGreetingSystem } from './custom-greeting-system'
   
   const systemPrompt = await CustomGreetingSystem.generateSystemPrompt(userId)
   
   // Usar con tu IA (Groq, Ollama, etc.)
`)
}
