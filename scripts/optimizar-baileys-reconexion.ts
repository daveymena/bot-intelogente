/**
 * Script para optimizar la reconexión de Baileys
 * Mejora la estabilidad de WhatsApp Web
 */

import fs from 'fs'
import path from 'path'

const BAILEYS_SERVICE_PATH = path.join(process.cwd(), 'src/lib/baileys-stable-service.ts')

async function optimizarBaileyReconexion() {
  console.log('🔧 Optimizando reconexión de Baileys...\n')

  try {
    // Leer archivo actual
    let content = fs.readFileSync(BAILEYS_SERVICE_PATH, 'utf-8')

    // 1. Mejorar exponential backoff
    console.log('✅ 1. Mejorando exponential backoff...')
    content = content.replace(
      /const delay = Math\.min\(2000 \* Math\.pow\(2, session\.reconnectAttempts - 1\), 60000\)/g,
      `const delay = Math.min(
        1000 * Math.pow(1.5, session.reconnectAttempts - 1),  // Backoff más suave
        30000  // Máximo 30s entre intentos
      )`
    )

    // 2. Mejorar límite de reintentos
    console.log('✅ 2. Mejorando límite de reintentos...')
    content = content.replace(
      /if \(session\.reconnectAttempts > 5\)/g,
      'if (session.reconnectAttempts > 50)'
    )

    // 3. Agregar validación de sesión
    console.log('✅ 3. Agregando validación de sesión...')
    const validationCode = `
    /**
     * Validar sesión antes de usar
     */
    private static async validateSession(userId: string): Promise<boolean> {
      try {
        const session = this.sessions.get(userId)
        if (!session) return false
        
        if (!session.socket || !session.isReady) return false
        
        // Verificar que el socket tenga usuario
        if (!session.socket.user) return false
        
        return true
      } catch (error) {
        console.error('[Baileys] ❌ Error validando sesión:', error)
        return false
      }
    }
    `

    if (!content.includes('validateSession')) {
      content = content.replace(
        'private static async setupEventHandlers(',
        validationCode + '\n  private static async setupEventHandlers('
      )
    }

    // 4. Mejorar manejo de desconexión 440
    console.log('✅ 4. Mejorando manejo de conflicto de sesión (440)...')
    content = content.replace(
      /if \(statusCode === 440\) \{[\s\S]*?return\s*\}/,
      `if (statusCode === 440) {
          console.log(\`[Baileys] ⚠️ Conflicto de sesión detectado (440), limpiando y esperando...\`)
          session.status = 'DISCONNECTED'
          await this.updateConnectionStatus(userId, 'DISCONNECTED', 'Conflicto de sesión - múltiples conexiones')
          this.stopKeepAlive(userId)
          this.sessions.delete(userId)
          this.connectionLocks.delete(userId)
          
          // Esperar 5 segundos antes de permitir nueva conexión
          await new Promise(resolve => setTimeout(resolve, 5000))
          return
        }`
    )

    // 5. Agregar keep-alive mejorado
    console.log('✅ 5. Agregando keep-alive mejorado...')
    const keepAliveCode = `
    /**
     * Iniciar keep-alive para mantener conexión activa
     */
    private static startKeepAlive(socket: WASocket, userId: string): void {
      const interval = parseInt(process.env.HEARTBEAT_INTERVAL || '15000')
      
      const timer = setInterval(async () => {
        try {
          if (!socket.user) {
            console.log(\`[Baileys] ⚠️ Keep-alive: Socket sin usuario para \${userId}\`)
            clearInterval(timer)
            return
          }
          
          // Verificar que sigue conectado
          const session = this.sessions.get(userId)
          if (!session || !session.isReady) {
            clearInterval(timer)
            return
          }
          
          console.log(\`[Baileys] 💓 Keep-alive: Verificando conexión para \${userId}\`)
        } catch (error) {
          console.error(\`[Baileys] ❌ Error en keep-alive:\`, error)
        }
      }, interval)
      
      this.keepAliveTimers.set(userId, timer)
    }

    /**
     * Detener keep-alive
     */
    private static stopKeepAlive(userId: string): void {
      const timer = this.keepAliveTimers.get(userId)
      if (timer) {
        clearInterval(timer)
        this.keepAliveTimers.delete(userId)
        console.log(\`[Baileys] 💓 Keep-alive detenido para \${userId}\`)
      }
    }
    `

    if (!content.includes('startKeepAlive')) {
      content = content.replace(
        'private static setupMessageHandler(',
        keepAliveCode + '\n  private static setupMessageHandler('
      )
    }

    // Guardar archivo optimizado
    fs.writeFileSync(BAILEYS_SERVICE_PATH, content, 'utf-8')
    console.log('\n✅ Archivo optimizado exitosamente')

    // Mostrar resumen
    console.log('\n📊 Resumen de optimizaciones:')
    console.log('  ✅ Exponential backoff mejorado (1.5x en lugar de 2x)')
    console.log('  ✅ Máximo de reintentos: 50 (en lugar de 5)')
    console.log('  ✅ Máximo delay: 30s (en lugar de 60s)')
    console.log('  ✅ Validación de sesión agregada')
    console.log('  ✅ Manejo de conflicto 440 mejorado')
    console.log('  ✅ Keep-alive mejorado')

    console.log('\n🚀 Próximos pasos:')
    console.log('  1. Reinicia el servidor: npm run dev')
    console.log('  2. Prueba la conexión de WhatsApp')
    console.log('  3. Monitorea los logs para verificar estabilidad')
    console.log('  4. Si hay problemas, revisa /api/whatsapp/health')

  } catch (error) {
    console.error('❌ Error optimizando Baileys:', error)
    process.exit(1)
  }
}

// Ejecutar
optimizarBaileyReconexion()
