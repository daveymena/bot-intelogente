/**
 * Script para arreglar:
 * 1. NO mencionar otros productos
 * 2. Palabras clave como información interna (no mostrar al cliente)
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'intelligent-conversation-engine.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Arreglando respuestas de producto único...\n');

// 1. Eliminar mención de productos similares en fallback local
const pattern1 = /if \(foundProducts\.length > 1\) \{[\s\S]*?\n\s*\}/g;
const matches1 = content.match(pattern1);

if (matches1) {
  console.log('✅ Encontrado código que menciona productos similares');
  matches1.forEach(match => {
    console.log('   Eliminando:', match.substring(0, 50) + '...');
    content = content.replace(match, '// NO mencionar otros productos - enfocarse solo en el que pidio');
  });
} else {
  console.log('⚠️  No se encontró código de productos similares');
}

// 2. Ocultar "Palabras clave" en logs (hacerlos internos)
const pattern2 = /Palabras clave:/g;
if (content.match(pattern2)) {
  console.log('✅ Encontradas menciones de "Palabras clave"');
  content = content.replace(pattern2, '[DEBUG] Palabras clave:');
}

// 3. Buscar y eliminar línea que muestra productos similares en respuesta
const pattern3 = /response \+= `También tengo.*?\n\n`;/g;
const matches3 = content.match(pattern3);

if (matches3) {
  console.log('✅ Encontrada línea que menciona productos similares en respuesta');
  matches3.forEach(match => {
    console.log('   Eliminando:', match);
    content = content.replace(match, '// NO mencionar otros productos');
  });
}

// Guardar cambios
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✅ Archivo arreglado correctamente');
console.log('\n📋 Cambios realizados:');
console.log('   1. Eliminada mención de productos similares');
console.log('   2. Palabras clave ahora son internas (no se muestran al cliente)');
console.log('   3. Bot se enfoca SOLO en el producto que el cliente pidió');
