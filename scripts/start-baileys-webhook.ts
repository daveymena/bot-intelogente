/**
 * Script para iniciar Baileys en modo webhook
 * Solo maneja conexión con WhatsApp y envía mensajes a n8n
 */

import { getBaileysWebhookService } from '../src/lib/baileys-webhook-service'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║     🚀 Baileys Webhook Service - Modo Simplificado    ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  
  // Verificar configuración
  const n8nWebhook = process.env.N8N_WEBHOOK_URL
  const n8nApiKey = process.env.N8N_API_KEY
  
  if (!n8nWebhook) {
    console.error('❌ Error: N8N_WEBHOOK_URL no está configurado en .env')
    console.log('   Agrega: N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-incoming')
    process.exit(1)
  }
  
  if (!n8nApiKey) {
    console.warn('⚠️  Advertencia: N8N_API_KEY no está configurado')
    console.log('   Recomendado agregar: N8N_API_KEY=tu-api-key-secreta')
  }
  
  console.log('📋 Configuración:')
  console.log(`   n8n Webhook: ${n8nWebhook}`)
  console.log(`   API Key: ${n8nApiKey ? '✅ Configurada' : '❌ No configurada'}`)
  console.log('')
  
  // Iniciar Baileys
  console.log('🔄 Iniciando conexión con WhatsApp...')
  console.log('')
  
  const baileys = getBaileysWebhookService()
  
  try {
    await baileys.connect()
    
    console.log('')
    console.log('╔════════════════════════════════════════════════════════╗')
    console.log('║              ✅ SISTEMA INICIADO                       ║')
    console.log('╚════════════════════════════════════════════════════════╝')
    console.log('')
    console.log('📱 Baileys está conectado y escuchando mensajes')
    console.log('📨 Los mensajes se enviarán automáticamente a n8n')
    console.log('🔗 n8n procesará la lógica y responderá')
    console.log('')
    console.log('💡 Flujo:')
    console.log('   WhatsApp → Baileys → n8n → Ollama/PostgreSQL → n8n → Baileys → WhatsApp')
    console.log('')
    console.log('🛑 Presiona Ctrl+C para detener')
    console.log('')
    
  } catch (error) {
    console.error('❌ Error iniciando Baileys:', error)
    process.exit(1)
  }
  
  // Manejar cierre graceful
  process.on('SIGINT', async () => {
    console.log('')
    console.log('🛑 Deteniendo servicio...')
    await baileys.disconnect()
    console.log('👋 Servicio detenido')
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
