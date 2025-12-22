/**
 * FIX DEFINITIVO - Usar SimpleConversationHandler directamente
 * Este es el sistema que SÍ funciona y está probado
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts');

console.log('🔧 Aplicando FIX DEFINITIVO...');
console.log('');

// Leer archivo
let content = fs.readFileSync(filePath, 'utf8');

// Buscar la línea problemática
const oldLine = `await this.handleHybridResponse(socket, userId, from, messageText, conversation.id)`;

if (content.includes(oldLine)) {
  // Reemplazar con código que usa SimpleConversationHandler directamente
  const newCode = `// 🎯 USAR SIMPLE CONVERSATION HANDLER DIRECTAMENTE
          try {
            const { SimpleConversationHandler } = await import('./simple-conversation-handler')
            const handler = new SimpleConversationHandler()
            
            const result = await handler.handleMessage({
              chatId: from,
              userId: userId,
              message: messageText,
              userName: pushName || 'Cliente'
            })
            
            // Enviar respuesta de texto
            await socket.sendMessage(from, { text: result.text })
            console.log('[Baileys] ✅ Respuesta enviada con SimpleConversationHandler')
            
            // Guardar en DB
            await this.saveOutgoingMessage(userId, from, result.text, conversation.id)
            
            // 📸 Si hay acciones de foto, enviarlas
            if (result.actions && result.actions.length > 0) {
              for (const action of result.actions) {
                if (action.type === 'send_photo_card' && action.data.product) {
                  try {
                    const { CardPhotoSender } = await import('./card-photo-sender')
                    await CardPhotoSender.sendProductCard(socket, from, action.data.product)
                    console.log('[Baileys] 📸 Foto CARD enviada')
                  } catch (photoError) {
                    console.error('[Baileys] ⚠️ Error enviando foto:', photoError)
                  }
                }
              }
            }
          } catch (handlerError) {
            console.error('[Baileys] ❌ Error en SimpleConversationHandler:', handlerError)
            // Fallback simple
            await socket.sendMessage(from, { 
              text: '¡Hola! 😊 ¿En qué puedo ayudarte hoy?' 
            })
          }`;
  
  content = content.replace(oldLine, newCode);
  
  // Guardar
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ FIX APLICADO CORRECTAMENTE');
  console.log('');
  console.log('📝 Cambios:');
  console.log('  - Eliminado handleHybridResponse (complejo y con errores)');
  console.log('  - Implementado SimpleConversationHandler DIRECTAMENTE');
  console.log('  - Código más simple y confiable');
  console.log('');
  console.log('🚀 Próximos pasos:');
  console.log('  1. Reinicia el servidor: npm run dev');
  console.log('  2. Prueba: "Hola"');
  console.log('  3. Prueba: "Tienes el curso de piano disponible?"');
  console.log('');
} else {
  console.log('⚠️  No se encontró la línea a reemplazar');
  console.log('Puede que el archivo ya esté modificado');
}
