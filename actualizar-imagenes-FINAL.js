// Script FINAL para actualizar TODAS las imágenes correctamente
const fs = require('fs');

// Leer el archivo JSON
const catalogoPath = './catalogo-completo-68-productos.json';
const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf8'));

console.log('📸 Actualizando TODAS las imágenes de productos...\n');

let actualizados = 0;
const cambios = {
  megapacks20: 0,
  megapack40: 0,
  moto: 0,
  piano: 0
};

// Actualizar cada producto
catalogo.forEach((producto) => {
  let cambio = false;
  
  // 1. MEGAPACKS DE $20,000 → megacp unitario.png
  if (producto.name && producto.name.toLowerCase().includes('mega pack') && producto.price === 20000) {
    console.log(`📦 Megapack $20k: ${producto.name}`);
    producto.images = ['/fotos/megacp unitario.png'];
    cambios.megapacks20++;
    cambio = true;
  }
  
  // 2. MEGAPACK COMPLETO (precio diferente de $20k) → megapack completo.png
  else if (producto.name && producto.name.toLowerCase().includes('megapack') && producto.price !== 20000) {
    console.log(`📦 Megapack completo: ${producto.name} - $${producto.price.toLocaleString()}`);
    producto.images = ['/fotos/megapack completo.png'];
    cambios.megapack40++;
    cambio = true;
  }
  
  // 3. MOTO BAJAJ → 5 imágenes
  else if (producto.name && producto.name.toLowerCase().includes('moto') && producto.name.toLowerCase().includes('bajaj')) {
    console.log(`🏍️  Moto: ${producto.name}`);
    producto.images = [
      '/fotos/moto2.jpg',
      '/fotos/moto 3.jpg',
      '/fotos/moto4.jpg',
      '/fotos/moto5.png',
      '/fotos/moto6.png'
    ];
    cambios.moto++;
    cambio = true;
  }
  
  // 4. CURSO DE PIANO → curso de piano completo .jpg
  else if (producto.name && producto.name.toLowerCase().includes('piano')) {
    console.log(`🎹 Piano: ${producto.name}`);
    producto.images = ['/fotos/curso de piano completo .jpg'];
    cambios.piano++;
    cambio = true;
  }
  
  if (cambio) {
    actualizados++;
  }
});

// Guardar el archivo actualizado
fs.writeFileSync(catalogoPath, JSON.stringify(catalogo, null, 2), 'utf8');

console.log(`\n✅ ACTUALIZACIÓN COMPLETADA!`);
console.log(`\n📊 RESUMEN:`);
console.log(`   📦 Megapacks $20k: ${cambios.megapacks20} → /fotos/megacp unitario.png`);
console.log(`   📦 Megapack completo: ${cambios.megapack40} → /fotos/megapack completo.png`);
console.log(`   🏍️  Moto Bajaj: ${cambios.moto} → 5 imágenes`);
console.log(`   🎹 Curso Piano: ${cambios.piano} → /fotos/curso de piano completo .jpg`);
console.log(`\n   🎯 TOTAL ACTUALIZADO: ${actualizados} productos`);
console.log(`\n📁 Archivo actualizado: ${catalogoPath}`);
console.log(`\n🚀 Próximos pasos:`);
console.log(`   1. Verificar las imágenes en public/fotos/`);
console.log(`   2. Importar a BD: npm run import:productos`);
console.log(`   3. Reiniciar servidor: npm run dev`);
console.log(`   4. Probar en WhatsApp`);
