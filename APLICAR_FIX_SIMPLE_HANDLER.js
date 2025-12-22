/**
 * APLICAR FIX - SimpleConversationHandler
 * Este script reemplaza el sistema antiguo por el nuevo
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts');

console.log('\n🔧 APLICANDO FIX - SimpleConversationHandler\n');

let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Encontrar línea de inicio
let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// 🎯 SISTEMA 24/7 CON ENTRENAMIENTO COMPLETO')) {
    startLine = i;
    break;
  }
}

if (startLine === -1) {
  console.log('❌ No se encontró el código a reemplazar');
  console.log('El archivo puede ya estar modificado o tener una estructura diferente\n');
  process.exit(1);
}

// Encontrar línea final (el catch externo)
let endLine = -1;
for (let i = startLine; i < lines.length; i++) {
  if (lines[i].includes('} catch (error) {') && 
      lines[i + 1] && lines[i + 1].includes('console.error(\'[Baileys] ❌ Error procesando mensaje:\'')) {
    endLine = i - 1; // Justo antes del catch externo
    break;
  }
}

if (endLine === -1) {
  console.log('❌ No se encontró el final del bloque');
  process.exit(1);
}

console.log(`✅ Bloque encontrado: líneas ${startLine + 1} a ${endLine + 1}`);
console.log(`📊 Reemplazando ${endLine - startLine + 1} líneas\n`);

// Nuevo código
const newLines = [
  '          // 🎯 SISTEMA SIMPLE Y CONFIABLE - SimpleConversationHandler',
  '          console.log(\'[Baileys] 🚀 Usando SimpleConversationHandler\')',
  '          ',
  '          try {',
  '            const { SimpleConversationHandler } = await import(\'./simple-conversation-handler\')',
  '            const handler = new SimpleConversationHandler()',
  '            ',
  '            console.log(\'[Baileys] 📝 Procesando mensaje:\', messageText.substring(0, 50))',
  '            ',
  '            const result = await handler.handleMessage({',
  '              chatId: from,',
  '              userId: userId,',
  '              message: messageText,',
  '              userName: pushName || \'Cliente\'',
  '            })',
  '            ',
  '            console.log(\'[Baileys] ✅ Respuesta generada:\', result.text.substring(0, 100))',
  '            ',
  '            // Enviar respuesta de texto',
  '            await socket.sendMessage(from, { text: result.text })',
  '            console.log(\'[Baileys] ✅ Respuesta enviada\')',
  '            ',
  '            // Guardar en DB',
  '            await this.saveOutgoingMessage(userId, from, result.text, conversation.id)',
  '            ',
  '            // 📸 Si hay acciones de foto, enviarlas',
  '            if (result.actions && result.actions.length > 0) {',
  '              console.log(`[Baileys] 📸 Procesando ${result.actions.length} acciones`)',
  '              ',
  '              for (const action of result.actions) {',
  '                if (action.type === \'send_photo_card\' && action.data.product) {',
  '                  try {',
  '                    const { CardPhotoSender } = await import(\'./card-photo-sender\')',
  '                    await CardPhotoSender.sendProductCard(socket, from, action.data.product)',
  '                    console.log(\'[Baileys] 📸 Foto CARD enviada:\', action.data.product.name)',
  '                  } catch (photoError) {',
  '                    console.error(\'[Baileys] ⚠️ Error enviando foto:\', photoError)',
  '                  }',
  '                } else if (action.type === \'send_photo\' && action.data.product) {',
  '                  try {',
  '                    const { CardPhotoSender } = await import(\'./card-photo-sender\')',
  '                    await CardPhotoSender.sendProductCard(socket, from, action.data.product)',
  '                    console.log(\'[Baileys] 📸 Foto enviada:\', action.data.product.name)',
  '                  } catch (photoError) {',
  '                    console.error(\'[Baileys] ⚠️ Error enviando foto:\', photoError)',
  '                  }',
  '                }',
  '              }',
  '            }',
  '          } catch (handlerError: any) {',
  '            console.error(\'[Baileys] ❌ Error en SimpleConversationHandler:\', handlerError.message)',
  '            console.error(\'[Baileys] Stack:\', handlerError.stack)',
  '            ',
  '            // Fallback simple',
  '            try {',
  '              await socket.sendMessage(from, { ',
  '                text: \'😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?\' ',
  '              })',
  '            } catch (fallbackError) {',
  '              console.error(\'[Baileys] ❌ Error en fallback:\', fallbackError)',
  '            }',
  '          }',
  ''
];

// Reconstruir archivo
const newContent = [
  ...lines.slice(0, startLine),
  ...newLines,
  ...lines.slice(endLine + 1)
].join('\n');

// Guardar
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ FIX APLICADO CORRECTAMENTE\n');
console.log('📝 Cambios:');
console.log('  - Bot24_7Orchestrator ELIMINADO');
console.log('  - SimpleConversationHandler IMPLEMENTADO');
console.log('  - Manejo de errores mejorado\n');
console.log('🚀 Próximos pasos:');
console.log('  1. Reinicia el servidor: npm run dev');
console.log('  2. Envía "Hola" por WhatsApp');
console.log('  3. Busca en los logs:');
console.log('     [Baileys] 🚀 Usando SimpleConversationHandler');
console.log('     [Baileys] ✅ Respuesta enviada\n');
