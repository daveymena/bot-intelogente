/**
 * 🚨 ARREGLO URGENTE - Archivo corrupto
 * El archivo baileys-stable-service.ts está corrupto en línea 567
 * Vamos a restaurar desde backup y aplicar el fix correctamente
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts');
const backupPath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts.backup');

console.log('🚨 ARREGLANDO ARCHIVO CORRUPTO...\n');

// 1. Verificar que existe el backup
if (!fs.existsSync(backupPath)) {
  console.log('❌ No se encontró el backup');
  process.exit(1);
}

console.log('✅ Backup encontrado');

// 2. Restaurar desde backup
console.log('📋 Restaurando desde backup...');
const backupContent = fs.readFileSync(backupPath, 'utf8');
fs.writeFileSync(filePath, backupContent, 'utf8');
console.log('✅ Archivo restaurado\n');

// 3. Ahora aplicar el fix correctamente
console.log('🔧 Aplicando fix con SimpleConversationHandler...\n');

let content = fs.readFileSync(filePath, 'utf8');

// Buscar donde se llama a handleNewConversationalSystem
const searchPattern = /await this\.handleNewConversationalSystem\([^)]+\)/;
const match = content.match(searchPattern);

if (!match) {
  console.log('⚠️  No se encontró la llamada a handleNewConversationalSystem');
  console.log('Buscando patrón alternativo...');
  
  // Buscar patrón más amplio
  const altPattern = /\/\/ 🚀 USAR ÚNICAMENTE EL NUEVO SISTEMA CONVERSACIONAL MODULAR[\s\S]{0,200}await this\.handleNewConversationalSystem/;
  const altMatch = content.match(altPattern);
  
  if (!altMatch) {
    console.log('❌ No se pudo encontrar el código a reemplazar');
    console.log('El archivo puede tener una estructura diferente');
    process.exit(1);
  }
}

// Reemplazar TODO el bloque de handleNewConversationalSystem con SimpleConversationHandler
const replacementCode = `// 🎯 SISTEMA SIMPLE Y CONFIABLE - SimpleConversationHandler
          console.log('[Baileys] 🚀 Usando SimpleConversationHandler')
          
          try {
            const { SimpleConversationHandler } = await import('./simple-conversation-handler')
            const handler = new SimpleConversationHandler()
            
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
                }
              }
            }
          } catch (handlerError) {
            console.error('[Baileys] ❌ Error en SimpleConversationHandler:', handlerError)
            console.error('[Baileys] Stack:', handlerError.stack)
            
            // Fallback simple
            await socket.sendMessage(from, { 
              text: '😅 Disculpa, tuve un problema procesando tu mensaje. ¿Puedes intentar de nuevo?' 
            })
          }`;

// Buscar el bloque completo desde el comentario hasta el final del try-catch
const blockPattern = /\/\/ 🚀 USAR ÚNICAMENTE EL NUEVO SISTEMA CONVERSACIONAL MODULAR[\s\S]*?await this\.handleNewConversationalSystem\([^)]+\)/;

if (content.match(blockPattern)) {
  content = content.replace(blockPattern, replacementCode);
  console.log('✅ Código reemplazado correctamente');
} else {
  // Intentar patrón más simple
  const simplePattern = /await this\.handleNewConversationalSystem\([^)]+\)/;
  if (content.match(simplePattern)) {
    content = content.replace(simplePattern, replacementCode);
    console.log('✅ Código reemplazado (patrón simple)');
  } else {
    console.log('❌ No se pudo reemplazar el código');
    process.exit(1);
  }
}

// Guardar
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✅ ARCHIVO ARREGLADO CORRECTAMENTE\n');
console.log('📝 Cambios aplicados:');
console.log('  1. ✅ Archivo restaurado desde backup');
console.log('  2. ✅ SimpleConversationHandler implementado');
console.log('  3. ✅ Manejo de errores mejorado con logs detallados');
console.log('  4. ✅ Fallback en caso de error\n');
console.log('🚀 Próximos pasos:');
console.log('  1. Reinicia el servidor: npm run dev');
console.log('  2. Envía "Hola" por WhatsApp');
console.log('  3. Revisa los logs en la consola');
console.log('  4. Si hay error, copia TODO el stack trace\n');
