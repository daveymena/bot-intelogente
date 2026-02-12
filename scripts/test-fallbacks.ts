
import dotenv from 'dotenv';
dotenv.config();
import { openClawOrchestrator } from '../src/lib/bot/openclaw-orchestrator.js';
import { db } from '../src/lib/db';

async function testFallbacks() {
    console.log('🛡️ TEST DE FALLBACKS (GROQ -> OLLAMA) 🛡️');
    console.log('========================================\n');

    try {
        const realUser = await db.user.findFirst({
            where: { products: { some: {} } },
            include: { products: true }
        });

        if (!realUser) {
            console.error('❌ No se encontró ningún usuario con productos.');
            process.exit(1);
        }

        const userId = realUser.id;
        const customerPhone = '573000000000@s.whatsapp.net';
        const context = { userId, products: realUser.products, conversationId: 'test-conv' };

        console.log('1. PROBANDO FLUJO NORMAL (Si Groq funciona)');
        const normalResponse = await openClawOrchestrator.processMessage('Hola, ¿qué vendes?', customerPhone, context);
        console.log('🤖 Respondió:', normalResponse.text.substring(0, 50) + '...');

        console.log('\n2. PROBANDO FALLBACK (Simulando fallo en Groq)');
        // Corrompemos temporalmente las keys para forzar fallback
        const originalKeys = [...openClawOrchestrator.apiKeys];
        openClawOrchestrator.apiKeys = ['gsk_invalid_key_1', 'gsk_invalid_key_2'];
        
        console.log('📡 Intentando con keys inválidas para forzar Ollama...');
        const fallbackResponse = await openClawOrchestrator.processMessage('Háblame de un producto potente', customerPhone, context);
        
        console.log('\n🤖 RESULTADO FALLBACK:');
        console.log(fallbackResponse.text);

        // Restaurar keys
        openClawOrchestrator.apiKeys = originalKeys;

    } catch (error: any) {
        console.error('❌ Error en test:', error.message);
    }

    process.exit(0);
}

testFallbacks();
