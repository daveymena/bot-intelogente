/**
 * FIX MANUAL - Reescribir la sección corrupta línea por línea
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts');
const backupPath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts.backup');

console.log('🔧 FIX MANUAL - Reescribiendo sección corrupta...\n');

// Leer backup
const backup = fs.readFileSync(backupPath, 'utf8');
const lines = backup.split('\n');

// Encontrar la línea donde empieza "Guardar mensaje en DB"
let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Guardar mensaje en DB')) {
    startLine = i;
    break;
  }
}

if (startLine === -1) {
  console.log('❌ No se encontró la línea de inicio');
  process.exit(1);
}

console.log(`✅ Línea de inicio encontrada: ${startLine}`);

// Encontrar donde termina el bloque (el catch externo)
let endLine = -1;
for (let i = startLine; i < lines.length; i++) {
  if (lines[i].includes('} catch (error) {') && 
      lines[i + 1] && lines[i + 1].includes('console.error(\'[Baileys] ❌ Error procesando mensaje:\'')) {
    endLine = i;
    break;
  }
}

if (endLine === -1) {
  console.log('❌ No se encontró la línea final');
  process.exit(1);
}

console.log(`✅ Línea final encontrada: ${endLine}`);
console.log(`📊 Reemplazando ${endLine - startLine} líneas\n`);

// Construir el nuevo bloque
const newBlock = `          // Guardar mensaje en DB
          const conversation = await this.saveIncomingMessage(userId, from, messageText)

          // 🎯 SISTEMA SIMPLE Y CONFIABLE - SimpleConversationHandler
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
          }

        `;

// Reconstruir el archivo
const before = lines.slice(0, startLine).join('\n');
const after = lines.slice(endLine).join('\n');
const newContent = before + '\n' + newBlock + '\n' + after;

// Guardar
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ ARCHIVO REESCRITO CORRECTAMENTE\n');
console.log('📝 Cambios:');
console.log('  - Sección corrupta ELIMINADA');
console.log('  - SimpleConversationHandler IMPLEMENTADO');
console.log('  - Código limpio y funcional\n');
console.log('🚀 Reinicia el servidor: npm run dev\n');
