@echo off
echo ========================================
echo   PRUEBA RAPIDA - DETECCION DE PAGO
echo ========================================
echo.

echo Probando deteccion de intenciones de pago...
echo.

npx tsx -e "
const { IntelligentConversationEngine } = require('./src/lib/intelligent-conversation-engine');

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error('ERROR: GROQ_API_KEY no configurada');
  process.exit(1);
}

const engine = new IntelligentConversationEngine(apiKey);
const chatId = 'test@whatsapp.net';
const userId = 'test-user';

async function test() {
  console.log('1. Usuario pregunta por curso...');
  let r = await engine.processMessage({
    chatId,
    userName: 'Juan',
    message: 'Quiero ver cursos de piano',
    userId
  });
  console.log('Bot:', r.text.substring(0, 100) + '...');
  console.log('');
  
  console.log('2. Usuario pregunta precio...');
  r = await engine.processMessage({
    chatId,
    userName: 'Juan',
    message: 'Cuanto cuesta?',
    userId
  });
  console.log('Bot:', r.text.substring(0, 100) + '...');
  console.log('');
  
  console.log('3. Usuario dice metodo de pago...');
  r = await engine.processMessage({
    chatId,
    userName: 'Juan',
    message: 'Mercado pago ?',
    userId
  });
  console.log('Bot:', r.text);
  console.log('');
  console.log('Acciones generadas:', r.actions.length);
  r.actions.forEach(a => console.log('  -', a.type, a.method || ''));
  console.log('');
  console.log('Contexto:');
  console.log('  - Producto:', r.context.currentProduct?.name || 'ninguno');
  console.log('  - Intencion pago:', r.context.paymentIntent || false);
  console.log('  - Metodo:', r.context.preferredPaymentMethod || 'ninguno');
}

test().catch(console.error);
"

echo.
echo ========================================
echo   PRUEBA COMPLETADA
echo ========================================
pause
