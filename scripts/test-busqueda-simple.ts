/**
 * Test Simple de Búsqueda
 * Verifica que la búsqueda de productos funcione correctamente
 */

import { db } from '../src/lib/db';

async function testBusquedaSimple() {
  console.log('🔍 TEST: Búsqueda Simple de Productos\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Obtener usuario
    console.log('\n📋 Paso 1: Obtener usuario...');
    const user = await db.user.findFirst();
    
    if (!user) {
      console.error('❌ No se encontró ningún usuario');
      return;
    }
    
    console.log('✅ Usuario:', user.email);
    console.log('   ID:', user.id);
    
    // 2. Contar productos totales
    console.log('\n📦 Paso 2: Contar productos...');
    const totalProducts = await db.product.count({
      where: { userId: user.id }
    });
    
    console.log(`✅ Total productos: ${totalProducts}`);
    
    // 3. Buscar productos con "piano"
    console.log('\n🎹 Paso 3: Buscar productos con "piano"...');
    const pianoProducts = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { description: { contains: 'piano', mode: 'insensitive' } },
        ]
      }
    });
    
    console.log(`✅ Encontrados: ${pianoProducts.length} productos`);
    
    if (pianoProducts.length > 0) {
      console.log('\n📋 Productos encontrados:');
      pianoProducts.forEach((p, i) => {
        const isPack = p.name.toLowerCase().includes('pack');
        const icon = isPack ? '📦' : '🎵';
        console.log(`   ${icon} ${i + 1}. ${p.name}`);
      });
      
      // Análisis
      console.log('\n📊 Análisis:');
      const cursoPiano = pianoProducts.filter(p => 
        p.name.toLowerCase().includes('curso') && 
        p.name.toLowerCase().includes('piano') &&
        !p.name.toLowerCase().includes('mega pack')
      );
      const megaPacks = pianoProducts.filter(p => 
        p.name.toLowerCase().includes('mega pack')
      );
      
      console.log(`   🎵 Cursos de piano: ${cursoPiano.length}`);
      console.log(`   📦 Mega packs: ${megaPacks.length}`);
      
      if (cursoPiano.length > 0) {
        console.log('\n✅ Cursos de piano encontrados:');
        cursoPiano.forEach(p => console.log(`      - ${p.name}`));
      }
      
      if (megaPacks.length > 0) {
        console.log('\n📦 Mega packs encontrados:');
        megaPacks.forEach(p => console.log(`      - ${p.name}`));
      }
    }
    
    // 4. Buscar productos con "curso"
    console.log('\n\n📚 Paso 4: Buscar productos con "curso"...');
    const cursoProducts = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE',
        OR: [
          { name: { contains: 'curso', mode: 'insensitive' } },
          { description: { contains: 'curso', mode: 'insensitive' } },
        ]
      },
      take: 10
    });
    
    console.log(`✅ Encontrados: ${cursoProducts.length} productos (mostrando primeros 10)`);
    
    if (cursoProducts.length > 0) {
      console.log('\n📋 Primeros productos:');
      cursoProducts.slice(0, 5).forEach((p, i) => {
        const isPack = p.name.toLowerCase().includes('pack');
        const icon = isPack ? '📦' : '📚';
        console.log(`   ${icon} ${i + 1}. ${p.name}`);
      });
    }
    
    // 5. Buscar "mega pack"
    console.log('\n\n📦 Paso 5: Buscar productos con "mega pack"...');
    const megaPackProducts = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE',
        name: { contains: 'mega pack', mode: 'insensitive' }
      },
      take: 5
    });
    
    console.log(`✅ Encontrados: ${megaPackProducts.length} mega packs`);
    
    if (megaPackProducts.length > 0) {
      console.log('\n📋 Mega packs:');
      megaPackProducts.forEach((p, i) => {
        console.log(`   📦 ${i + 1}. ${p.name}`);
      });
    }
    
    // Resumen
    console.log('\n\n🎯 RESUMEN:');
    console.log('='.repeat(60));
    console.log(`✅ Total productos: ${totalProducts}`);
    console.log(`🎹 Productos con "piano": ${pianoProducts.length}`);
    console.log(`📚 Productos con "curso": ${cursoProducts.length}`);
    console.log(`📦 Mega packs: ${megaPackProducts.length}`);
    
    // Verificación
    const cursoPianoEspecifico = pianoProducts.find(p => 
      p.name.toLowerCase().includes('curso') && 
      p.name.toLowerCase().includes('piano') &&
      p.name.toLowerCase().includes('completo') &&
      !p.name.toLowerCase().includes('mega pack')
    );
    
    if (cursoPianoEspecifico) {
      console.log('\n✅ ÉXITO: Se encontró "Curso Completo de Piano"');
      console.log(`   Nombre: ${cursoPianoEspecifico.name}`);
      console.log(`   ID: ${cursoPianoEspecifico.id}`);
    } else {
      console.log('\n⚠️ ADVERTENCIA: No se encontró "Curso Completo de Piano"');
      console.log('   Verifica que el producto exista en la base de datos');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completado\n');
}

testBusquedaSimple().then(() => process.exit(0));
