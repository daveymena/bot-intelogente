/**
 * Script para arreglar la integración de Baileys con SimpleConversationHandler
 * Revierte el cambio problemático que usa handleNewConversationalSystem
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts');

console.log('🔧 Arreglando integración de Baileys...');

// Leer archivo
let content = fs.readFileSync(filePath, 'utf8');

// Buscar y reemplazar la llamada problemática
const oldCode = `await this.handleNewConversationalSystem(socket, userId, from, messageText, conversation.id, message)`;
const newCode = `await this.handleHybridResponse(socket, userId, from, messageText, conversation.id)`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  
  // También actualizar el comentario
  content = content.replace(
    'USAR ÚNICAMENTE EL NUEVO SISTEMA CONVERSACIONAL MODULAR',
    'USAR SISTEMA HÍBRIDO CON RESPUESTA INTELIGENTE'
  );
  content = content.replace(
    'Usando SISTEMA CONVERSACIONAL MODULAR UNIFICADO',
    'Usando SISTEMA HÍBRIDO INTELIGENTE'
  );
  
  // Guardar
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Archivo arreglado correctamente');
  console.log('');
  console.log('📝 Cambios realizados:');
  console.log('  - Revertido handleNewConversationalSystem → handleHybridResponse');
  console.log('  - El bot ahora usará el sistema híbrido que funciona correctamente');
  console.log('');
  console.log('🚀 Próximos pasos:');
  console.log('  1. Reinicia el servidor: npm run dev');
  console.log('  2. Prueba enviando: "Tienes el curso de piano disponible?"');
  console.log('  3. El bot debe responder con información real del producto');
} else {
  console.log('⚠️  No se encontró el código a reemplazar');
  console.log('El archivo puede ya estar arreglado o tener un formato diferente');
}
