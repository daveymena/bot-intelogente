import { openClawOrchestrator } from '../src/lib/bot/openclaw-orchestrator';
import dotenv from 'dotenv';
dotenv.config();

async function testRealLinks() {
    console.log('🚀 TEST DE LINKS REALES (MERCADOPAGO & PAYPAL)');
    const orchestrator = openClawOrchestrator;
    
    // Simular un mensaje para un producto digital
    const userId = 'user_test_real_links';
    const message = 'quiero comprar el mega pack';
    
    console.log(`\n--- ENTRADA: "${message}" ---`);
    
    const context = {
        userId,
        products: [
            {
                id: 'cmjggqipw0001km1w9sqycjz3',
                name: 'MEGA PACK COMPLETO - 81 Cursos Profesionales',
                price: 60000,
                category: 'DIGITAL',
                tipo_producto: 'megapack',
                description: 'Acceso de por vida a los mejores cursos.',
                images: '["https://img.freepik.com/vector-gratis/diseno-plantilla-banner-venta-cursos-linea_23-2149109404.jpg"]'
            }
        ],
        currentStage: 'viendo_producto'
    };

    const result = await orchestrator.processMessage(message, userId, context);
    
    console.log('\n--- RESPUESTA DEL BOT ---');
    console.log(result.text);
    
    if (result.text.includes('mercadopago.com')) {
        console.log('\n✅ Link de MercadoPago encontrado!');
    } else {
        console.log('\n❌ Link de MercadoPago NO encontrado o falló.');
    }

    if (result.text.includes('paypal.com')) {
        console.log('✅ Link de PayPal encontrado!');
    } else {
        console.log('❌ Link de PayPal NO encontrado (esperado si no hay USD o falló).');
    }
}

testRealLinks().catch(console.error);
