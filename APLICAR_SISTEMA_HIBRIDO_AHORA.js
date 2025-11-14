/**
 * 🚀 APLICAR SISTEMA HÍBRIDO AL BOT ACTUAL
 * Este script integra el nuevo sistema híbrido con el bot existente
 */

const fs = require('fs')

console.log('🚀 APLICANDO SISTEMA HÍBRIDO AL BOT\n')
console.log('='.repeat(70))

// Leer el archivo actual de Baileys
const baileysPath = 'src/lib/baileys-stable-service.ts'
let content = fs.readFileSync(baileysPath, 'utf8')

console.log('\n📋 PASO 1: Agregando imports del sistema híbrido...\n')

// Agregar imports al inicio del archivo (después de los imports existentes)
const importToAdd = `import { createGroqHybridSystem } from './hybrid-intelligent-response-system'
import { HybridIntelligentResponseSystem } from './hybrid-intelligent-response-system'
import { CustomGreetingSystem } from './custom-greeting-system'
`

// Buscar el último import y agregar después
const lastImportIndex = content.lastIndexOf('import')
const nextLineAfterImport = content.indexOf('\n', lastImportIndex)

if (!content.includes('hybrid-intelligent-response-system')) {
  content = content.slice(0, nextLineAfterImport + 1) + 
            importToAdd + 
            content.slice(nextLineAfterImport + 1)
  console.log('✅ Imports agregados')
} else {
  console.log('⚠️  Imports ya existen')
}

console.log('\n📋 PASO 2: Agregando sistema híbrido a la clase...\n')

// Agregar propiedad estática para el sistema híbrido
const hybridSystemProperty = `  private static hybridSystem: HybridIntelligentResponseSystem | null = null
  private static conversationHistories: Map<string, any[]> = new Map()
`

// Buscar después de "private static keepAliveTimers"
if (!content.includes('private static hybridSystem')) {
  const keepAliveIndex = content.indexOf('private static keepAliveTimers')
  const nextLineAfterKeepAlive = content.indexOf('\n', keepAliveIndex)
  
  content = content.slice(0, nextLineAfterKeepAlive + 1) + 
            '\n' + hybridSystemProperty + 
            content.slice(nextLineAfterKeepAlive + 1)
  console.log('✅ Propiedad del sistema híbrido agregada')
} else {
  console.log('⚠️  Propiedad ya existe')
}

console.log('\n📋 PASO 3: Agregando método de inicialización...\n')

// Agregar método para inicializar el sistema híbrido
const initMethod = `
  /**
   * Inicializar sistema híbrido
   */
  private static async initializeHybridSystem() {
    if (this.hybridSystem) return

    try {
      const groqApiKey = process.env.GROQ_API_KEY
      if (groqApiKey) {
        this.hybridSystem = await createGroqHybridSystem(groqApiKey)
        console.log('[Baileys] ✅ Sistema híbrido inicializado')
      } else {
        console.log('[Baileys] ⚠️  GROQ_API_KEY no encontrada, sistema híbrido desactivado')
      }
    } catch (error) {
      console.error('[Baileys] ❌ Error inicializando sistema híbrido:', error)
    }
  }
`

if (!content.includes('initializeHybridSystem')) {
  // Agregar antes del método initializeConnection
  const initConnectionIndex = content.indexOf('static async initializeConnection')
  content = content.slice(0, initConnectionIndex) + 
            initMethod + '\n' +
            content.slice(initConnectionIndex)
  console.log('✅ Método de inicialización agregado')
} else {
  console.log('⚠️  Método ya existe')
}

console.log('\n📋 PASO 4: Creando nuevo handler de respuesta híbrida...\n')

// Crear el nuevo método de respuesta híbrida
const hybridResponseMethod = `
  /**
   * Manejar respuesta con sistema híbrido (NUEVO)
   */
  private static async handleHybridResponse(
    socket: WASocket,
    userId: string,
    from: string,
    messageText: string,
    conversationId: string
  ) {
    console.log('[Baileys] 🧠 Usando SISTEMA HÍBRIDO')

    try {
      // Inicializar sistema híbrido si no está listo
      if (!this.hybridSystem) {
        await this.initializeHybridSystem()
      }

      // Obtener historial de conversación
      let history = this.conversationHistories.get(from) || []

      let response: string

      if (this.hybridSystem) {
        // Usar sistema híbrido (BD + IA + Formato)
        console.log('[Baileys] 🧠 Procesando con sistema híbrido (BD + IA)')
        response = await this.hybridSystem.processMessage(
          messageText,
          userId,
          history
        )
      } else {
        // Fallback: usar sistema local (solo BD)
        console.log('[Baileys] 📦 Procesando con sistema local (solo BD)')
        const { IntelligentProductQuerySystem } = await import('./intelligent-product-query-system')
        response = await IntelligentProductQuerySystem.processQuery(
          messageText,
          userId,
          history
        )
      }

      // Actualizar historial
      history.push(
        { role: 'user', content: messageText },
        { role: 'assistant', content: response }
      )
      
      // Mantener solo últimos 10 mensajes
      if (history.length > 10) {
        history = history.slice(-10)
      }
      this.conversationHistories.set(from, history)

      // Enviar respuesta
      await socket.sendMessage(from, { text: response })
      console.log('[Baileys] ✅ Respuesta híbrida enviada')

      // Guardar en DB
      await this.saveOutgoingMessage(userId, from, response, conversationId)

    } catch (error) {
      console.error('[Baileys] ❌ Error en respuesta híbrida:', error)
      
      // Fallback a respuesta simple
      const fallbackResponse = '😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?'
      await socket.sendMessage(from, { text: fallbackResponse })
    }
  }
`

if (!content.includes('handleHybridResponse')) {
  // Agregar después del método handleAutoResponse
  const handleAutoResponseIndex = content.lastIndexOf('private static async handleAutoResponse')
  const nextMethodIndex = content.indexOf('\n  /**', handleAutoResponseIndex + 100)
  
  content = content.slice(0, nextMethodIndex) + 
            hybridResponseMethod +
            content.slice(nextMethodIndex)
  console.log('✅ Método de respuesta híbrida agregado')
} else {
  console.log('⚠️  Método ya existe')
}

// Guardar archivo modificado
fs.writeFileSync(baileysPath, content)

console.log('\n' + '='.repeat(70))
console.log('\n✅ SISTEMA HÍBRIDO INTEGRADO\n')

console.log('📝 PRÓXIMOS PASOS:\n')
console.log('1. Reemplaza la llamada a handleAutoResponse por handleHybridResponse')
console.log('2. Reinicia el servidor: npm run dev')
console.log('3. Prueba enviando mensajes al bot')
console.log('4. Verifica los logs para ver "🧠 Usando SISTEMA HÍBRIDO"')

console.log('\n💡 PARA ACTIVAR:\n')
console.log('Busca en baileys-stable-service.ts:')
console.log('  await this.handleAutoResponse(...)')
console.log('Y reemplaza por:')
console.log('  await this.handleHybridResponse(...)')

console.log('\n' + '='.repeat(70))
console.log('\n🎉 ¡Listo! El sistema híbrido está integrado')
