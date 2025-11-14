// Script específico para actualizar SOLO los megapacks de $20,000
const fs = require('fs');

// Leer el archivo JSON
const catalogoPath = './catalogo-completo-68-productos.json';
const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf8'));

console.log('📦 Actualizando megapacks de $20,000 con imagen megapak-20.png\n');

let actualizados = 0;
let megapacksEncontrados = 0;

// Actualizar cada producto
catalogo.forEach((producto, index) => {
  // Buscar megapacks
  if (producto.name && producto.name.toLowerCase().includes('mega pack')) {
    megapacksEncontrados++;
    
    // Solo actualizar los de $20,000
    if (producto.price === 20000) {
      console.log(`📦 ${actualizados + 1}. ${producto.name} - $${producto.price.toLocaleString()}`);
      producto.images = ['/fotos/megapak-20.png'];
      actualizados++;
    }
  }
});

// Guardar el archivo actualizado
const nuevoPath = './catalogo-megapacks-20mil-ACTUALIZADO.json';
fs.writeFileSync(nuevoPath, JSON.stringify(catalogo, null, 2), 'utf8');

console.log(`\n✅ Actualización completada!`);
console.log(`📊 Megapacks encontrados: ${megapacksEncontrados}`);
console.log(`📊 Megapacks de $20k actualizados: ${actualizados}`);
console.log(`📁 Archivo guardado en: ${nuevoPath}`);
console.log(`\n💡 Imagen asignada: /fotos/megapak-20.png`);
console.log(`\n🔍 Verificar imagen:`);
console.log(`   http://localhost:3000/fotos/megapak-20.png`);
