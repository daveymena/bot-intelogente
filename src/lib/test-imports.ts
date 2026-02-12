import { db } from './db'
import { AudioTranscriptionService } from './audio-transcription-service'
import { VoiceGenerationService } from './voice-generation-service'
import { SafeBaileysSender } from './safe-baileys-sender'
import { SafeReconnectManager } from './safe-reconnect-manager'

console.log('✅ Imports in tests-imports.ts working')

async function testDynamic() {
  try {
    const cm = await import('../conversational-module')
    console.log('✅ Dynamic import of conversational-module working')
  } catch (e: any) {
    console.error('❌ Dynamic import of conversational-module FAILED:', e.message)
    console.error(e)
  }
}

testDynamic()
