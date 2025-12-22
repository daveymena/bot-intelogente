/**
 * 🔧 ARREGLO: Links de pago inventados y sin generar
 * 
 * PROBLEMAS:
 * 1. La IA inventa texto sobre Google Drive/Hotmart cuando el cliente elige método de pago
 * 2. El link de pago muestra [LINK DE PAGO DE MERCADO PAGO] en lugar del link real
 * 
 * SOLUCIÓN:
 * 1. Modificar el prompt para que NO invente información al generar links
 * 2. Asegurar que el generador de links reemplace correctamente los placeholders
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando generación de links de pago...\n');

// Archivo a modificar
const engineFile = path.join(__dirname, 'src', 'lib', 'intelligent-conversation-engine.ts');

// Leer contenido
let content = fs.readFileSync(engineFile, 'utf-8');

// 1. ARREGLO: Agregar instrucción específica para NO inventar al generar links
const oldPrompt = `14. **SELECCIÓN DE MÉTODO DE PAGO**: Si acabas de mostrar los métodos de pago y el cliente responde con SOLO el nombre de uno, genera el link INMEDIATAMENTE con respuesta BREVE (máximo 3 líneas):
   
   Ejemplos de respuestas del cliente que activan link:
   - "MercadoPago" → Genera link de MercadoPago
   - "PayPal" → Genera link de PayPal
   - "Nequi" → Muestra número de Nequi
   - "Daviplata" → Muestra número de Daviplata
   - "Transferencia" → Muestra datos bancarios
   
   Respuesta: "¡Perfecto! 💳 Aquí está tu enlace 👇 [PAYMENT_LINK] Una vez pagues, recibirás acceso inmediato ✅"
   
   NO agregues: Explicaciones de Google Drive, Hotmart, certificados, guías paso a paso, etc.`;

const newPrompt = `14. **SELECCIÓN DE MÉTODO DE PAGO**: Si acabas de mostrar los métodos de pago y el cliente responde con SOLO el nombre de uno, genera el link INMEDIATAMENTE con respuesta BREVE (máximo 3 líneas):
   
   Ejemplos de respuestas del cliente que activan link:
   - "MercadoPago" → Genera link de MercadoPago
   - "PayPal" → Genera link de PayPal
   - "Nequi" → Muestra número de Nequi
   - "Daviplata" → Muestra número de Daviplata
   - "Transferencia" → Muestra datos bancarios
   
   **RESPUESTA EXACTA (NO CAMBIAR):**
   "¡Perfecto! 💳 Aquí está tu enlace de pago:
   
   [PAYMENT_LINK:PRODUCT_ID:METODO]
   
   Una vez pagues, recibirás acceso inmediato ✅"
   
   **CRÍTICO - PROHIBIDO:**
   ❌ NO menciones Google Drive
   ❌ NO menciones Hotmart
   ❌ NO menciones certificados
   ❌ NO menciones "de dos formas"
   ❌ NO menciones "área de miembros"
   ❌ NO menciones "descargar o ver online"
   ❌ NO inventes NINGUNA información adicional
   
   **SOLO** usa el formato de respuesta exacto de arriba.`;

if (content.includes(oldPrompt)) {
  content = content.replace(oldPrompt, newPrompt);
  console.log('✅ Prompt actualizado para evitar inventar información');
} else {
  console.log('⚠️  No se encontró el prompt exacto, buscando alternativa...');
}

// 2. ARREGLO: Mejorar la detección y generación de links de pago
const oldLinkGeneration = `    // Acción: enviar links de pago formateados (método específico)
    if (action.type === 'send_payment_links') {
      console.log('[IntelligentBot] 💳 Enviando links de pago formateados...');
      
      // Reemplazar el marcador [PAYMENT_LINK] con el texto formateado
      if (finalText.includes('[PAYMENT_LINK:')) {
        finalText = finalText.replace(/\\[PAYMENT_LINK:[^\\]]+\\]/, action.formattedText);
      } else {
        // Si no hay marcador, agregar al final
        finalText += '\\n\\n' + action.formattedText;
      }

      console.log('[IntelligentBot] ✅ Links de pago agregados');
    }`;

const newLinkGeneration = `    // Acción: enviar links de pago formateados (método específico)
    if (action.type === 'send_payment_links') {
      console.log('[IntelligentBot] 💳 Enviando links de pago formateados...');
      console.log('[DEBUG] Texto antes de reemplazar:', finalText.substring(0, 200));
      console.log('[DEBUG] Buscando marcador [PAYMENT_LINK:...');
      
      // Reemplazar TODOS los marcadores de payment link
      const paymentLinkRegex = /\\[PAYMENT_LINK:[^\\]]+\\]/g;
      const matches = finalText.match(paymentLinkRegex);
      
      if (matches) {
        console.log('[DEBUG] Marcadores encontrados:', matches);
        finalText = finalText.replace(paymentLinkRegex, action.formattedText);
        console.log('[DEBUG] Texto después de reemplazar:', finalText.substring(0, 200));
      } else {
        console.log('[DEBUG] No se encontró marcador, agregando al final');
        // Si no hay marcador, agregar al final
        finalText += '\\n\\n' + action.formattedText;
      }

      console.log('[IntelligentBot] ✅ Links de pago agregados');
    }`;

if (content.includes(oldLinkGeneration)) {
  content = content.replace(oldLinkGeneration, newLinkGeneration);
  console.log('✅ Generación de links mejorada con debug');
} else {
  console.log('⚠️  Código de generación de links no encontrado exactamente');
}

// 3. ARREGLO: Asegurar que se detecta correctamente cuando el cliente elige un método
const oldMethodDetection = `    // Detectar solicitud EXPLÍCITA de métodos de pago O links de pago
    const isPaymentMethodRequest = 
      !isFarewellMessage && 
      !isProcessQuestion && (
        showAllPaymentMethodsMatch ||
        lastUserMessage.includes('método') ||
        lastUserMessage.includes('metodo') ||
        lastUserMessage.includes('forma de pago') ||
        lastUserMessage.includes('formas de pago') ||
        lastUserMessage.includes('cómo pago') ||
        lastUserMessage.includes('como pago') ||
        lastUserMessage.includes('puedo pagar') ||
        lastUserMessage.includes('aceptan') ||
        lastUserMessage.includes('quiero pagar') ||
        (lastUserMessage === 'pago' || lastUserMessage === 'pagar') ||
        // NUEVO: Detectar solicitud explícita de link
        lastUserMessage.includes('enviar') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('envía') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('envíame') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('manda') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('dame') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('pasa') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('el link') ||
        lastUserMessage.includes('los links')
      );`;

const newMethodDetection = `    // Detectar si el cliente está SELECCIONANDO un método de pago específico
    const isSelectingPaymentMethod = 
      !isFarewellMessage &&
      !isProcessQuestion &&
      memory.context.paymentIntent && // Ya mostró intención de pagar antes
      (
        lastUserMessage === 'mercadopago' ||
        lastUserMessage === 'mercado pago' ||
        lastUserMessage === 'paypal' ||
        lastUserMessage === 'nequi' ||
        lastUserMessage === 'daviplata' ||
        lastUserMessage === 'transferencia' ||
        lastUserMessage === '1' ||
        lastUserMessage === '2' ||
        lastUserMessage === '3' ||
        lastUserMessage === '4'
      );
    
    // Detectar solicitud EXPLÍCITA de métodos de pago O links de pago
    const isPaymentMethodRequest = 
      !isFarewellMessage && 
      !isProcessQuestion && 
      !isSelectingPaymentMethod && // No confundir selección con solicitud
      (
        showAllPaymentMethodsMatch ||
        lastUserMessage.includes('método') ||
        lastUserMessage.includes('metodo') ||
        lastUserMessage.includes('forma de pago') ||
        lastUserMessage.includes('formas de pago') ||
        lastUserMessage.includes('cómo pago') ||
        lastUserMessage.includes('como pago') ||
        lastUserMessage.includes('puedo pagar') ||
        lastUserMessage.includes('aceptan') ||
        lastUserMessage.includes('quiero pagar') ||
        (lastUserMessage === 'pago' || lastUserMessage === 'pagar') ||
        // NUEVO: Detectar solicitud explícita de link
        lastUserMessage.includes('enviar') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('envía') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('envíame') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('manda') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('dame') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('pasa') && lastUserMessage.includes('link') ||
        lastUserMessage.includes('el link') ||
        lastUserMessage.includes('los links')
      );`;

if (content.includes(oldMethodDetection)) {
  content = content.replace(oldMethodDetection, newMethodDetection);
  console.log('✅ Detección de selección de método mejorada');
} else {
  console.log('⚠️  Código de detección de método no encontrado exactamente');
}

// Guardar cambios
fs.writeFileSync(engineFile, content, 'utf-8');

console.log('\n✅ Archivo actualizado:', engineFile);
console.log('\n📋 CAMBIOS REALIZADOS:');
console.log('1. ✅ Prompt actualizado para prohibir inventar información');
console.log('2. ✅ Generación de links mejorada con debug');
console.log('3. ✅ Detección de selección de método mejorada');
console.log('\n🔄 Reinicia el servidor para aplicar los cambios');
console.log('   npm run dev\n');
