
import { OpenClawOrchestrator } from './src/lib/bot/openclaw-orchestrator';
import { ProfessionalResponseFormatter } from './src/lib/professional-response-formatter';

async function runTest() {
    console.log('🏁 INICIANDO TEST DEL MODO DIOS DE VENTAS...');
    
    // Mock de contexto
    const context = {
        userId: 'test-user',
        products: [
            { id: 1, name: 'Mouse Gamer Logitech G502 Hero', price: 180000, category: 'GAMING', description: 'El mouse más preciso del mundo.' },
            { id: 2, name: 'Teclado Mecánico Redragon Kumara', price: 140000, category: 'GAMING', description: 'Teclado mecánico TKL.' }
        ],
        business: {
            name: 'Tecnovariedades D&S'
        }
    };

    // 1. Simular Orquestador (simplificado para ver el prompt)
    console.log('\n--- SIMULANDO RESPUESTA DE VENTA DIRECTA ---');
    
    const inputMessage = "Quiero el mouse G502";
    console.log(`👤 Usuario: "${inputMessage}"`);

    // Simulamos la respuesta "cruda" que daría la IA (basado en el prompt)
    const rawResponse = `
━━━━━━━━━━━━━━━━━━━━━━━━
📦 *Mouse Gamer Logitech G502 Hero*
━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Domina cada partida con el sensor más preciso del mercado.

➤ *Lo mejor:* 11 botones programables para macros insanas. ⚡

➤ *Ideal para:* E-sports y Shooters competitivos. 🎯

━━━━━━━━━━━━━━━━━━━━━━━━

💰 *Precio:* $180.000 (Oferta limitada)

💳 *Paga aquí de una:* http://mercadopago.com/link-falso

👉 ¿Te lo envío ya mismo? 🚚
`;

    console.log('\n🤖 Respuesta CRUDA del Bot (antes de formatear):');
    console.log(rawResponse);

    // 2. Probar el Formateador "Aireado"
    console.log('\n--- APLICANDO FORMATEADOR PROFESIONAL ---');
    const formattedResponse = ProfessionalResponseFormatter.cleanOldFormat(rawResponse);
    
    console.log('\n✨ Respuesta FINAL AL CLIENTE (Lo que se ve en WhatsApp):');
    console.log('--------------------------------------------------');
    console.log(formattedResponse);
    console.log('--------------------------------------------------');

    // Verificación de espacios
    if (formattedResponse.includes('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n')) {
        console.log('✅ TEST PASADO: Los separadores tienen aire suficiente.');
    } else {
        console.log('❌ TEST FALLIDO: El texto sigue apilado.');
    }
}

runTest().catch(console.error);
