// Script para actualizar las imágenes de todos los megapacks
const fs = require('fs');

// Leer el archivo JSON actual (usar el original si existe, sino el actualizado)
let catalogoPath = './catalogo-completo-68-productos.json';
if (!fs.existsSync(catalogoPath)) {
  catalogoPath = './catalogo-completo-68-productos-ACTUALIZADO.json';
}
const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf8'));

console.log('📦 Actualizando imágenes de productos...\n');

let actualizados = 0;

// Actualizar cada producto
catalogo.forEach((producto, index) => {
  let cambio = false;
  
  // 1. Actualizar Moto
  if (producto.name && producto.name.includes('Moto Bajaj')) {
    console.log(`🏍️  Actualizando: ${producto.name}`);
    producto.images = [
      '/fotos/moto2.jpg',
      '/fotos/moto 3.jpg',
      '/fotos/moto4.jpg',
      '/fotos/moto5.png',
      '/fotos/moto6.png'
    ];
    cambio = true;
  }
  
  // 2. Actualizar Megapacks individuales de $20,000
  if (producto.name && producto.name.toLowerCase().includes('megapack') && producto.price === 20000) {
    console.log(`📦 Actualizando Megapack $20k: ${producto.name}`);
    producto.images = [
      '/fotos/megapak-20.png'
    ];
    cambio = true;
  }
  
  // 3. Actualizar Megapack completo (precio diferente)
  if (producto.name && producto.name.toLowerCase().includes('megapack') && producto.price !== 20000) {
    console.log(`📦 Actualizando Megapack completo: ${producto.name}`);
    producto.images = [
      '/fotos/megapack completo.png',
      '/fotos/megapack2.jpg'
    ];
    cambio = true;
  }
  
  // 4. Actualizar Curso de Piano
  if (producto.name && producto.name.toLowerCase().includes('piano')) {
    console.log(`🎹 Actualizando: ${producto.name}`);
    producto.images = [
      '/fotos/curso de piano completo .jpg'
    ];
    cambio = true;
  }
  
  if (cambio) {
    actualizados++;
  }
});

// Guardar el archivo actualizado
const nuevoPath = './catalogo-completo-68-productos-ACTUALIZADO.json';
fs.writeFileSync(nuevoPath, JSON.stringify(catalogo, null, 2), 'utf8');

console.log(`\n✅ Actualización completada!`);
console.log(`📊 Productos actualizados: ${actualizados}`);
console.log(`📁 Archivo guardado en: ${nuevoPath}`);
console.log(`\n💡 Pasos siguientes:`);
console.log(`   1. Revisar el archivo: ${nuevoPath}`);
console.log(`   2. Si está correcto, renombrar a: catalogo-completo-68-productos.json`);
console.log(`   3. Importar a la base de datos con: npm run import:productos`);
