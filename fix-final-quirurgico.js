/**
 * FIX QUIRÚRGICO - Reemplazo exacto del bloque
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts');

console.log('🔧 FIX QUIRÚRGICO - Aplicando cambio exacto...\n');

let content = fs.readFileSync(filePath, 'utf8');

// Buscar el bloque EXACTO que queremos reemplazar
// Desde "// 🎯 SISTEMA 24/7" hasta el catch que dice "Error procesando mensaje"

const oldBlock = `          // 🎯 SISTEMA 24/7 CON ENTRENAMIENTO COMPLETO
          console.log('[Baileys] 🎯 Usando SISTEMA 24/7 ENTRENADO')
          
          try {
            const { Bot24_7Orchestrator } = await import('./bot-24-7-orchestrator')
            
            // Obtener historial de conversación
            const historyMessages = await db.message.findMany({
              where: { conversationId: conversation.id },
              orderBy: { createdAt: 'desc' },
              take: 10
            })
            
            const history = historyMessages.reverse().map(msg => ({
              role: msg.direction === 'INCOMING' ? 'user' as const : 'assistant' as const,
              content: msg.content
            }))
            
            // Procesar mensaje con AI Service (sistema original)
            const { AIService } = await import('./ai-service')
            const aiResponse = await AIService.generateResponse(
              userId,
              messageText,
              from,
              history
            )
            
            console.log(\`[Baileys] ✅ Respuesta generada (confianza: \${(aiResponse.confidence * 100).toFixed(0)}%)\`)
            
            // Enviar respuesta
            await socket.sendMessage(from, { text: aiResponse.message })
            console.log('[Baileys] ✅ Mensaje enviado')
            
            // Guardar respuesta en DB
            await this.saveOutgoingMessage(userId, from, response.message, conversation.id)
            
          } catch (error) {
            console.error('[Baileys] ❌ Error con sistema 24/7:', error)
            
            // FALLBACK: Sistema inteligente anterior
            console.log('[Baileys] 🔄 Usando sistema de fallback')
            const { handleMessageWithIntelligence } = await import('./intelligent-baileys-integration')
            
            const result = await handleMessageWithIntelligence({
              sock: socket,
              userId,
              from,
              messageText,
              conversationId: conversation.id,
              userName: undefined
            })
            
            console.log(\`[Baileys] ✅ Procesado con fallback (confianza: \${(result.confidence || 0) * 100}%)\`)
          }`;

const newBlock = `          // 🎯 SISTEMA SIMPLE Y CONFIABLE - SimpleConversationHandler
          console.log('[Baileys] 🚀 Usando SimpleConversationHandler')
          
          try {
            const { SimpleConversationHandler } = await import('./simple-conversation-handler')
            const handler = new SimpleConversationHandler()
            
            console.log('[Baileys] 📝 Procesando mensaje:', messageText.substring(0, 50))
            
            const result = await handler.handleMessage({
              chatId: from,
              userId: userId,
              message: messageText,
              userName: pushName || 'Cliente'
            })
            
            console.log('[Baileys] ✅ Respuesta generada:', result.text.substring(0, 100))
            
            // Enviar respuesta de texto
            await socket.sendMessage(from, { text: result.text })
            console.log('[Baileys] ✅ Respuesta enviada')
            
            // Guardar en DB
            await this.saveOutgoingMessage(userId, from, result.text, conversation.id)
            
            // 📸 Si hay acciones de foto, enviarlas
            if (result.actions && result.actions.length > 0) {
              console.log(\`[Baileys] 📸 Procesando \${result.actions.length} acciones\`)
              
              for (const action of result.actions) {
                if (action.type === 'send_photo_card' && action.data.product) {
                  try {
                    const { CardPhotoSender } = await import('./card-photo-sender')
                    await CardPhotoSender.sendProductCard(socket, from, action.data.product)
                    console.log('[Baileys] 📸 Foto CARD enviada:', action.data.product.name)
                  } catch (photoError) {
                    console.error('[Baileys] ⚠️ Error enviando foto:', photoError)
                  }
                } else if (action.type === 'send_photo' && action.data.product) {
                  try {
                    const { CardPhotoSender } = await import('./card-photo-sender')
                    await CardPhotoSender.sendProductCard(socket, from, action.data.product)
                    console.log('[Baileys] 📸 Foto enviada:', action.data.product.name)
                  } catch (photoError) {
                    console.error('[Baileys] ⚠️ Error enviando foto:', photoError)
                  }
                }
              }
            }
          } catch (handlerError: any) {
            console.error('[Baileys] ❌ Error en SimpleConversationHandler:', handlerError.message)
            console.error('[Baileys] Stack:', handlerError.stack)
            
            // Fallback simple
            try {
              await socket.sendMessage(from, { 
                text: '😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?' 
              })
            } catch (fallbackError) {
              console.error('[Baileys] ❌ Error en fallback:', fallbackError)
            }
          }`;

if (!content.includes(oldBlock)) {
  console.log('❌ No se encontró el bloque exacto a reemplazar');
  console.log('El archivo puede tener una estructura diferente');
  process.exit(1);
}

console.log('✅ Bloque encontrado, reemplazando...');

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✅ ARCHIVO ARREGLADO CORRECTAMENTE\n');
console.log('📝 Cambios:');
console.log('  - Bot24_7Orchestrator ELIMINADO');
console.log('  - SimpleConversationHandler IMPLEMENTADO');
console.log('  - Manejo de errores mejorado\n');
console.log('🚀 Reinicia el servidor: npm run dev\n');
