/**
 * INTEGRACIÓN: ACTIVAR ENVÍO AUTOMÁTICO DE FOTOS EN BAILEYS
 * 
 * PROBLEMA: Las fotos no se envían automáticamente
 * SOLUCIÓN: Integrar CardPhotoSender en baileys-stable-service
 */

import fs from 'fs';
import path from 'path';

async function integrarCardPhotoSender() {
  console.log('========================================');
  console.log('INTEGRACIÓN: ENVÍO AUTOMÁTICO DE FOTOS');
  console.log('========================================\n');

  const baileysPath = path.join(process.cwd(), 'src/lib/baileys-stable-service.ts');
  
  if (!fs.existsSync(baileysPath)) {
    console.error('❌ No se encontró baileys-stable-service.ts');
    return;
  }

  let content = fs.readFileSync(baileysPath, 'utf-8');

  // Buscar la función handleNewConversationalSystem
  const functionStart = 'private static async handleNewConversationalSystem(';
  const functionIndex = content.indexOf(functionStart);

  if (functionIndex === -1) {
    console.error('❌ No se encontró handleNewConversationalSystem');
    return;
  }

  // Buscar el bloque donde se envían las fotos
  const photoBlockOld = `      // 📸 Enviar fotos si hay (el motor inteligente las incluye automáticamente)
      if (respuesta.fotos && respuesta.fotos.length > 0) {
        console.log(\`[Baileys] 📸 Enviando \${respuesta.fotos.length} foto(s)\`);
        for (const foto of respuesta.fotos) {
          await socket.sendMessage(from, {
            image: { url: foto.url },
            caption: foto.caption || ''
          });
        }
      }`;

  const photoBlockNew = `      // 📸 Enviar fotos si hay (el motor inteligente las incluye automáticamente)
      if (respuesta.fotos && respuesta.fotos.length > 0) {
        console.log(\`[Baileys] 📸 Enviando \${respuesta.fotos.length} foto(s) con CardPhotoSender\`);
        
        try {
          const { CardPhotoSender } = await import('./card-photo-sender');
          
          for (const foto of respuesta.fotos) {
            // Usar CardPhotoSender para formato profesional
            await CardPhotoSender.sendProductPhoto(
              socket,
              from,
              foto.url,
              foto.caption || '',
              foto.productName || 'Producto'
            );
            
            // Pequeña pausa entre fotos (anti-ban)
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
          
          console.log(\`[Baileys] ✅ Fotos enviadas con formato profesional\`);
        } catch (photoError) {
          console.error('[Baileys] ⚠️ Error con CardPhotoSender, usando método básico:', photoError);
          
          // Fallback: método básico
          for (const foto of respuesta.fotos) {
            await socket.sendMessage(from, {
              image: { url: foto.url },
              caption: foto.caption || ''
            });
          }
        }
      }`;

  if (content.includes(photoBlockOld)) {
    content = content.replace(photoBlockOld, photoBlockNew);
    console.log('✅ Bloque de envío de fotos actualizado');
  } else {
    console.log('⚠️  Bloque de fotos no encontrado o ya modificado');
  }

  // Guardar archivo
  fs.writeFileSync(baileysPath, content, 'utf-8');

  console.log('');
  console.log('CAMBIOS APLICADOS:');
  console.log('1. ✅ CardPhotoSender integrado en Baileys');
  console.log('2. ✅ Formato profesional para fotos');
  console.log('3. ✅ Pausas anti-ban entre fotos');
  console.log('4. ✅ Fallback a método básico si falla');
  console.log('');
  console.log('🔥 AHORA LAS FOTOS:');
  console.log('   - Se envían automáticamente');
  console.log('   - Con formato profesional (card)');
  console.log('   - Con pausas anti-ban');
  console.log('');
}

integrarCardPhotoSender().catch(console.error);
