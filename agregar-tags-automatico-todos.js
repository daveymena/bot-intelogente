const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Genera tags automáticamente basándose en el nombre y descripción del producto
 */
function generarTagsAutomaticos(producto) {
  const tags = new Set();
  
  // Extraer palabras del nombre
  const nombre = producto.name.toLowerCase();
  const palabras = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Quitar caracteres especiales
    .split(/\s+/)
    .filter(p => p.length > 2); // Solo palabras de 3+ letras
  
  palabras.forEach(p => tags.add(p));
  
  // Agregar variaciones comunes
  if (nombre.includes('laptop') || nombre.includes('portatil') || nombre.includes('portátil')) {
    tags.add('laptop');
    tags.add('portatil');
    tags.add('portátil');
    tags.add('computador');
    tags.add('notebook');
  }
  
  if (nombre.includes('monitor') || nombre.includes('pantalla')) {
    tags.add('monitor');
    tags.add('pantalla');
    tags.add('display');
  }
  
  if (nombre.includes('mouse') || nombre.includes('raton') || nombre.includes('ratón')) {
    tags.add('mouse');
    tags.add('raton');
    tags.add('ratón');
  }
  
  if (nombre.includes('teclado') || nombre.includes('keyboard')) {
    tags.add('teclado');
    tags.add('keyboard');
  }
  
  if (nombre.includes('gaming') || nombre.includes('gamer')) {
    tags.add('gaming');
    tags.add('gamer');
    tags.add('juegos');
    tags.add('videojuegos');
  }
  
  if (nombre.includes('ryzen')) {
    tags.add('ryzen');
    tags.add('amd');
    const ryzenMatch = nombre.match(/ryzen\s*(\d+)/i);
    if (ryzenMatch) {
      tags.add(`ryzen ${ryzenMatch[1]}`);
      tags.add(`ryzen${ryzenMatch[1]}`);
    }
  }
  
  if (nombre.includes('intel') || nombre.includes('core')) {
    tags.add('intel');
    const intelMatch = nombre.match(/i(\d+)/i);
    if (intelMatch) {
      tags.add(`intel i${intelMatch[1]}`);
      tags.add(`i${intelMatch[1]}`);
      tags.add(`core i${intelMatch[1]}`);
    }
  }
  
  if (nombre.includes('moto') || nombre.includes('motocicleta')) {
    tags.add('moto');
    tags.add('motocicleta');
    tags.add('motorcycle');
  }
  
  // Agregar categoría
  tags.add(producto.category.toLowerCase());
  
  // Agregar marca si está en el nombre
  const marcas = ['asus', 'acer', 'hp', 'lenovo', 'dell', 'lg', 'samsung', 'logitech', 'razer', 'corsair', 'bajaj', 'yamaha', 'honda'];
  marcas.forEach(marca => {
    if (nombre.includes(marca)) {
      tags.add(marca);
    }
  });
  
  return Array.from(tags);
}

async function agregarTagsATodos() {
  try {
    console.log('🔧 Agregando tags automáticamente a TODOS los productos...\n');
    
    // Obtener productos sin tags
    const productosSinTags = await prisma.product.findMany({
      where: {
        OR: [
          { tags: null },
          { tags: '' },
          { tags: '[]' }
        ],
        status: 'AVAILABLE'
      }
    });
    
    console.log(`📊 Productos sin tags: ${productosSinTags.length}\n`);
    
    let procesados = 0;
    let errores = 0;
    
    for (const producto of productosSinTags) {
      try {
        const tags = generarTagsAutomaticos(producto);
        
        if (tags.length > 0) {
          await prisma.product.update({
            where: { id: producto.id },
            data: { tags: JSON.stringify(tags) }
          });
          
          console.log(`✅ ${producto.name}`);
          console.log(`   Tags: ${tags.slice(0, 5).join(', ')}${tags.length > 5 ? '...' : ''} (${tags.length} total)`);
          procesados++;
        }
      } catch (error) {
        console.error(`❌ Error con ${producto.name}:`, error.message);
        errores++;
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESUMEN');
    console.log('═'.repeat(60));
    console.log(`✅ Procesados: ${procesados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📦 Total: ${productosSinTags.length}`);
    
    // Verificar resultado
    const ahoraSinTags = await prisma.product.count({
      where: {
        OR: [
          { tags: null },
          { tags: '' },
          { tags: '[]' }
        ],
        status: 'AVAILABLE'
      }
    });
    
    console.log(`\n🎯 Productos que aún no tienen tags: ${ahoraSinTags}`);
    
    if (ahoraSinTags === 0) {
      console.log('\n✅ ¡TODOS los productos ahora tienen tags!');
    } else {
      console.log(`\n⚠️ Aún quedan ${ahoraSinTags} productos sin tags`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

agregarTagsATodos();
