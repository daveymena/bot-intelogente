/**
 * 🚀 INTEGRACIÓN COMPLETA DEL SISTEMA HÍBRIDO
 * Aplica el sistema inteligente (BD + IA + Formato) a todo el bot
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 INTEGRANDO SISTEMA HÍBRIDO COMPLETO\n')
console.log('='.repeat(70))

// ============ PASO 1: Verificar archivos necesarios ============
console.log('\n📋 PASO 1: Verificando archivos del sistema híbrido...\n')

const requiredFiles = [
  'src/lib/hybrid-intelligent-response-system.ts',
  'src/lib/intelligent-product-query-system.ts',
  'src/lib/whatsapp-response-formatter.ts',
  'src/lib/custom-greeting-system.ts',
  'src/app/api/user/me/route.ts'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos necesarios. Ejecuta primero los tests.')
  process.exit(1)
}

console.log('\n✅ Todos los archivos del sistema híbrido están presentes')

// ============ PASO 2: Crear integración con Baileys ============
console.log('\n📋 PASO 2: Creando integración con el bot de WhatsApp...\n')

const baileysIntegration = `/**
 * 🤖 INTEGRACIÓN DEL SISTEMA HÍBRIDO CON BAILEYS
 * Conecta el bot de WhatsApp con el sistema inteligente
 */

import { createGroqHybridSystem } from './hybrid-intelligent-response-system'
import { IntelligentProductQuerySystem } from './intelligent-product-query-system'

export class BotHybridIntegration {
  private hybridSystem: any
  private conversationHistory: Map<string, any[]> = new Map()
  private useAI: boolean = true

  constructor(groqApiKey?: string) {
    if (groqApiKey) {
      // Inicializar sistema híbrido con IA
      this.initializeHybridSystem(groqApiKey)
      this.useAI = true
    } else {
      // Usar solo sistema local (sin IA)
      this.useAI = false
      console.log('⚠️  Sistema híbrido: Modo LOCAL (sin IA)')
    }
  }

  private async initializeHybridSystem(groqApiKey: string) {
    try {
      this.hybridSystem = await createGroqHybridSystem(groqApiKey)
      console.log('✅ Sistema híbrido inicializado con IA')
    } catch (error) {
      console.error('❌ Error inicializando sistema híbrido:', error)
      this.useAI = false
    }
  }

  /**
   * Procesar mensaje del cliente
   */
  async processMessage(
    message: string,
    from: string,
    userId: string
  ): Promise<string> {
    try {
      // Obtener historial de conversación
      const history = this.conversationHistory.get(from) || []

      let response: string

      if (this.useAI && this.hybridSystem) {
        // MODO HÍBRIDO: BD + IA + Formato
        console.log('🧠 Procesando con sistema híbrido (BD + IA)')
        response = await this.hybridSystem.processMessage(
          message,
          userId,
          history
        )
      } else {
        // MODO LOCAL: Solo BD + Formato
        console.log('📦 Procesando con sistema local (solo BD)')
        response = await IntelligentProductQuerySystem.processQuery(
          message,
          userId,
          history
        )
      }

      // Actualizar historial
      this.updateHistory(from, message, response)

      return response

    } catch (error) {
      console.error('❌ Error procesando mensaje:', error)
      return '😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?'
    }
  }

  /**
   * Actualizar historial de conversación
   */
  private updateHistory(from: string, userMessage: string, botResponse: string) {
    const history = this.conversationHistory.get(from) || []
    
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: botResponse }
    )

    // Mantener solo los últimos 10 mensajes
    if (history.length > 10) {
      history.splice(0, history.length - 10)
    }

    this.conversationHistory.set(from, history)
  }

  /**
   * Limpiar historial de un usuario
   */
  clearHistory(from: string) {
    this.conversationHistory.delete(from)
  }

  /**
   * Cambiar modo de operación
   */
  setAIMode(enabled: boolean) {
    this.useAI = enabled
    console.log(\`🔄 Modo IA: \${enabled ? 'ACTIVADO' : 'DESACTIVADO'}\`)
  }
}
`

fs.writeFileSync('src/lib/bot-hybrid-integration.ts', baileysIntegration)
console.log('✅ Creado: src/lib/bot-hybrid-integration.ts')

// ============ PASO 3: Crear handler de mensajes actualizado ============
console.log('\n📋 PASO 3: Creando handler de mensajes actualizado...\n')

const messageHandler = `/**
 * 💬 HANDLER DE MENSAJES CON SISTEMA HÍBRIDO
 * Procesa todos los mensajes de WhatsApp con inteligencia
 */

import { BotHybridIntegration } from './bot-hybrid-integration'
import { db } from './db'

export class HybridMessageHandler {
  private botIntegration: BotHybridIntegration

  constructor(groqApiKey?: string) {
    this.botIntegration = new BotHybridIntegration(groqApiKey)
  }

  /**
   * Procesar mensaje entrante de WhatsApp
   */
  async handleIncomingMessage(
    message: string,
    from: string,
    userId: string
  ): Promise<string> {
    try {
      console.log(\`📨 Mensaje de \${from}: "\${message}"\`)

      // Procesar con sistema híbrido
      const response = await this.botIntegration.processMessage(
        message,
        from,
        userId
      )

      console.log(\`💬 Respuesta: "\${response.substring(0, 100)}..."\`)

      // Guardar en base de datos
      await this.saveMessage(userId, from, message, response)

      return response

    } catch (error) {
      console.error('❌ Error en handler:', error)
      return '😅 Disculpa, tuve un problema. ¿Puedes intentar de nuevo?'
    }
  }

  /**
   * Guardar mensaje en base de datos
   */
  private async saveMessage(
    userId: string,
    from: string,
    userMessage: string,
    botResponse: string
  ) {
    try {
      await db.message.create({
        data: {
          userId,
          from,
          content: userMessage,
          response: botResponse,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Error guardando mensaje:', error)
    }
  }

  /**
   * Cambiar modo de IA
   */
  setAIMode(enabled: boolean) {
    this.botIntegration.setAIMode(enabled)
  }
}
`

fs.writeFileSync('src/lib/hybrid-message-handler.ts', messageHandler)
console.log('✅ Creado: src/lib/hybrid-message-handler.ts')

// ============ PASO 4: Crear ejemplo de integración ============
console.log('\n📋 PASO 4: Creando ejemplo de integración...\n')

const integrationExample = `/**
 * 📝 EJEMPLO DE INTEGRACIÓN CON TU BOT ACTUAL
 * Copia este código en tu archivo principal del bot
 */

import { HybridMessageHandler } from './lib/hybrid-message-handler'

// Inicializar handler con tu API key de Groq
const messageHandler = new HybridMessageHandler(process.env.GROQ_API_KEY)

// En tu handler de mensajes de Baileys:
socket.ev.on('messages.upsert', async ({ messages }) => {
  for (const msg of messages) {
    if (msg.key.fromMe) continue // Ignorar mensajes propios
    
    const from = msg.key.remoteJid
    const messageText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || ''
    
    if (!messageText) continue

    try {
      // Procesar con sistema híbrido
      const response = await messageHandler.handleIncomingMessage(
        messageText,
        from,
        userId // Tu userId
      )

      // Enviar respuesta
      await socket.sendMessage(from, { text: response })

    } catch (error) {
      console.error('Error:', error)
    }
  }
})

// Para cambiar entre modo IA y modo local:
// messageHandler.setAIMode(false) // Desactivar IA (solo BD)
// messageHandler.setAIMode(true)  // Activar IA (BD + IA)
`

fs.writeFileSync('ejemplo-integracion-bot.ts', integrationExample)
console.log('✅ Creado: ejemplo-integracion-bot.ts')

// ============ PASO 5: Crear variables de entorno ============
console.log('\n📋 PASO 5: Actualizando variables de entorno...\n')

const envExample = `# API Keys
GROQ_API_KEY=tu_groq_api_key_aqui
# o
OPENAI_API_KEY=tu_openai_api_key_aqui

# Base de datos
DATABASE_URL="file:./dev.db"

# Bot Configuration
BOT_NAME="Tecnovariedades D&S"
BOT_PHONE="+57XXXXXXXXXX"

# Sistema Híbrido
USE_AI_MODE=true  # true = BD + IA, false = solo BD
AI_PROVIDER=groq  # groq, openai, ollama

# Configuración de IA
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=500
`

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envExample)
  console.log('✅ Creado: .env')
} else {
  console.log('⚠️  .env ya existe, no se sobrescribió')
}

// ============ RESUMEN ============
console.log('\n' + '='.repeat(70))
console.log('\n✅ INTEGRACIÓN COMPLETADA\n')
console.log('Archivos creados:')
console.log('  1. ✅ src/lib/bot-hybrid-integration.ts')
console.log('  2. ✅ src/lib/hybrid-message-handler.ts')
console.log('  3. ✅ ejemplo-integracion-bot.ts')
console.log('  4. ✅ .env (si no existía)')

console.log('\n📋 PRÓXIMOS PASOS:\n')
console.log('1. Configura tu GROQ_API_KEY en .env')
console.log('2. Revisa ejemplo-integracion-bot.ts')
console.log('3. Integra el código en tu bot principal')
console.log('4. Reinicia el bot')
console.log('5. ¡Prueba con mensajes reales!')

console.log('\n💡 MODOS DE OPERACIÓN:\n')
console.log('  🧠 HÍBRIDO (BD + IA): Mejor experiencia, requiere API key')
console.log('  📦 LOCAL (solo BD): Gratis, respuestas rápidas pero menos naturales')

console.log('\n🎯 PARA CAMBIAR DE MODO:\n')
console.log('  messageHandler.setAIMode(true)  // Activar IA')
console.log('  messageHandler.setAIMode(false) // Solo BD')

console.log('\n' + '='.repeat(70))
console.log('\n🎉 ¡Sistema híbrido listo para usar!')
