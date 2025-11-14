/**
 * Script para arreglar la consistencia entre imagen y texto del producto
 * Asegurar que siempre se hable del MISMO producto cuya imagen se envía
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'intelligent-conversation-engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Arreglando consistencia de producto...\n');

// Buscar la sección donde se genera la respuesta local
const searchPattern = /\/\/ CRITICO: Si el usuario dice mas informacion, usar el producto en contexto[\s\S]*?let product = foundProducts\[0\];/;

if (content.match(searchPattern)) {
  console.log('✅ Encontrada sección de fallback local');
  
  // Reemplazar para que SIEMPRE use el producto en contexto si existe
  const replacement = `// CRITICO: SIEMPRE usar el producto en contexto si existe
      const memory = this.getOrCreateMemory(chatId, userName);
      
      // Si hay producto en contexto, usar ESE (para mantener consistencia con la imagen)
      let product = memory.context.currentProduct || foundProducts[0];
      
      console.log('[IntelligentEngine] Producto para respuesta:', product.name);
      console.log('[IntelligentEngine] Producto en contexto:', memory.context.currentProduct?.name || 'ninguno');`;
  
  content = content.replace(searchPattern, replacement);
  
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Archivo arreglado correctamente\n');
  console.log('📋 Cambio realizado:');
  console.log('   - Ahora SIEMPRE usa el producto en contexto si existe');
  console.log('   - Esto asegura que imagen y texto hablen del MISMO producto');
  console.log('   - Evita confusión cuando el cliente pregunta por un producto específico');
} else {
  console.log('⚠️  No se encontró el patrón exacto');
  console.log('Intentando enfoque alternativo...\n');
  
  // Buscar solo la línea clave
  if (content.includes('let product = foundProducts[0];')) {
    console.log('✅ Encontrada línea de asignación de producto');
    
    // Agregar verificación antes de esa línea
    content = content.replace(
      'let product = foundProducts[0];',
      `// CRITICO: Usar producto en contexto si existe (para consistencia con imagen)
      const memory = this.getOrCreateMemory(chatId, userName);
      let product = memory.context.currentProduct || foundProducts[0];
      console.log('[IntelligentEngine] Usando producto:', product.name);`
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Archivo arreglado con enfoque alternativo');
  } else {
    console.log('❌ No se pudo encontrar el código a modificar');
  }
}
