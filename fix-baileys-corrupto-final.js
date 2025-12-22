/**
 * 🚨 FIX DEFINITIVO - Archivo corrupto
 * Restaurar desde backup y aplicar SimpleConversationHandler
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts');
const backupPath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts.backup');

console.log('🚨 ARREGLANDO ARCHIVO CORRUPTO...\n');

// 1. Verificar backup
if (!fs.existsSync(backupPath)) {
  console.log('❌ No se encontró el backup');
  process.exit(1);
}

console.log('✅ Backup encontrado');

// 2. Restaurar desde backup
console.log('📋 Restaurando desde backup...');
let content = fs.readFileSync(backupPath, 'utf8');
console.log('✅ Archivo restaurado\n');

// 3. Buscar el bloque que usa Bot24_7Orchestrator
console.log('🔍 Buscando código a reemplazar...');

// El backup tiene este código después de saveIncomingMessage:
const searchText1 = `// 🎯 SISTEMA 24/7 CON ENTRENAMIENTO COMPLETO`;
const searchText2 = `console.log('[Baileys] 🎯 Usando SISTEMA 24/7 ENTRENADO')`;

if (!content.includes(searchText1) || !content.includes(searchText2)) {
  console.log('❌ No se encontró el código esperado en el backup');
  console.log('Buscando alternativas...');
  
  // Buscar cualquier referencia a Bot24_7Orchestrator
  if (!content.includes('Bot24_7Orchestrator')) {
    console.log('❌ El backup no tiene Bot24_7Orchestrator');
    console.log('Puede que ya esté modificado o sea muy antiguo');
    process.exit(1);
  }
}

console.log('✅ Código encontrado\n');

// 4. Reemplazar TODO el bloque desde "// 🎯 SISTEMA 24/7" hasta el final del try-catch
console.log('🔧 Aplicando SimpleConversationHandler...\n');

// Buscar desde el comentario hasta el catch externo
const blockStart = content.indexOf('// 🎯 SISTEMA 24/7 CON ENTRENAMIENTO COMPLETO');

// Buscar el catch EXTERNO que dice "Error procesando mensaje"
// Este es el que cierra TODO el bloque de procesamiento
const catchExterno = 'console.error(\'[Baileys] ❌ Error procesando mensaje:\', error)';
const blockEnd = content.indexOf(catchExterno, blockStart);

if (blockStart === -1 || blockEnd === -1) {
  console.log('❌ No se pudo encontrar el bloque completo');
  console.log('blockStart:', blockStart);
  console.log('blockEnd:', blockEnd);
  
  // Intentar buscar solo hasta el primer catch después del blockStart
  const anyCatch = content.indexOf('} catch (error) {', blockStart);
  console.log('Primer catch encontrado en:', anyCatch);
  
  process.exit(1);
}

// Retroceder hasta el inicio de la línea del catch
const lineStart = content.lastIndexOf('\n', blockEnd) + 1;

// Extraer el bloque completo
const beforeBlock = content.substring(0, blockStart);
const afterBlock = content.substring(lineStart);

// Nuevo código con SimpleConversationHandler
const newBlock = `// 🎯 SISTEMA SIMPLE Y CONFIABLE - SimpleConversationHandler
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
          `;

// Reconstruir el archivo
content = beforeBlock + newBlock + afterBlock;

// 5. Guardar
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ ARCHIVO ARREGLADO CORRECTAMENTE\n');
console.log('📝 Cambios aplicados:');
console.log('  1. ✅ Archivo restaurado desde backup');
console.log('  2. ✅ Bot24_7Orchestrator ELIMINADO');
console.log('  3. ✅ SimpleConversationHandler IMPLEMENTADO');
console.log('  4. ✅ Manejo de errores mejorado con logs detallados');
console.log('  5. ✅ Fallback en caso de error\n');
console.log('🚀 Próximos pasos:');
console.log('  1. Reinicia el servidor: npm run dev');
console.log('  2. Envía "Hola" por WhatsApp');
console.log('  3. Si hay error, copia TODO el mensaje de error\n');
console.log('📋 Qué buscar en los logs:');
console.log('  - [Baileys] 🚀 Usando SimpleConversationHandler');
console.log('  - [Baileys] 📝 Procesando mensaje: ...');
console.log('  - [Baileys] ✅ Respuesta generada: ...');
console.log('  - [Baileys] ✅ Respuesta enviada\n');
console.log('❌ Si ves error, busca:');
console.log('  - [Baileys] ❌ Error en SimpleConversationHandler:');
console.log('  - Stack: at ... (líneas que empiezan con "at")\n');
