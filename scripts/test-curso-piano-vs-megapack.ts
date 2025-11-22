/**
 * Test: Curso de Piano vs Mega Pack
 * Verifica que el bot NO confunda cursos individuales con megapacks
 */

import { Orchestrator } from '../src/agents/orchestrator';
import { SharedMemoryService } from '../src/agents/shared-memory';
import { db } from '../src/lib/db';

async function testCursoPianoVsMegapack() {
  console.log('🧪 TEST: Curso de Piano vs Mega Pack\n');
  console.log('='.repeat(60));
  
  // Obtener userId real
  console.log('\n📋 Obteniendo usuario de la base de datos...');
  const user = await db.user.findFirst();
  
  if (!user) {
    console.error('❌ No se encontró ningún usuario en la base de datos');
    console.log('   Crea un usuario primero o inicia sesión en el dashboard');
    return;
  }
  
  console.log('✅ Usuario encontrado:', user.email);
  console.log('   ID:', user.id);
  
  const orchestrator = new Orchestrator();
  const memoryService = SharedMemoryService.getInstance();
  
  const chatId = 'test-piano-' + Date.now();
  const userId = user.id;
  
  try {
    // Test 1: Búsqueda de "curso de piano"
    console.log('\n📝 Test 1: "Estoy interesado en el curso de piano"');
    console.log('-'.repeat(60));
    
    const response1 = await orchestrator.processMessage({
      chatId,
      userId,
      message: 'Estoy interesado en el curso de piano',
      userName: 'Test User',
    });
    
    console.log('\n🤖 Respuesta del bot:');
    console.log(response1.text.substring(0, 300) + '...');
    
    const memory1 = memoryService.get(chatId, userId);
    console.log('\n📊 Productos encontrados:', memory1.interestedProducts.length);
    
    if (memory1.interestedProducts.length > 0) {
      console.log('\n📦 Lista de productos:');
      memory1.interestedProducts.forEach((p, i) => {
        const isPack = p.name.toLowerCase().includes('pack');
        const icon = isPack ? '❌' : '✅';
        console.log(`  ${icon} ${i + 1}. ${p.name}`);
      });
    }
    
    // Verificación 1
    console.log('\n✅ VERIFICACIÓN 1:');
    const hasMegapack = memory1.interestedProducts.some(p => 
      p.name.toLowerCase().includes('mega pack')
    );
    
    if (hasMegapack) {
      console.log('❌ FALLO: Se encontraron Mega Packs cuando NO debería');
      console.log('   El usuario buscó "curso de piano", no "mega pack"');
    } else {
      console.log('✅ CORRECTO: No se encontraron Mega Packs irrelevantes');
    }
    
    const hasPianoCourse = memory1.interestedProducts.some(p => 
      p.name.toLowerCase().includes('piano') && 
      p.name.toLowerCase().includes('curso')
    );
    
    if (hasPianoCourse) {
      console.log('✅ CORRECTO: Se encontró el curso de piano');
    } else {
      console.log('❌ FALLO: NO se encontró el curso de piano');
    }
    
    // Test 2: Búsqueda específica de "mega pack"
    console.log('\n\n📝 Test 2: "Me interesa un mega pack"');
    console.log('-'.repeat(60));
    
    const chatId2 = 'test-megapack-' + Date.now();
    
    const response2 = await orchestrator.processMessage({
      chatId: chatId2,
      userId,
      message: 'Me interesa un mega pack',
      userName: 'Test User',
    });
    
    console.log('\n🤖 Respuesta del bot:');
    console.log(response2.text.substring(0, 300) + '...');
    
    const memory2 = memoryService.get(chatId2, userId);
    console.log('\n📊 Productos encontrados:', memory2.interestedProducts.length);
    
    if (memory2.interestedProducts.length > 0) {
      console.log('\n📦 Lista de productos:');
      memory2.interestedProducts.forEach((p, i) => {
        const isPack = p.name.toLowerCase().includes('pack');
        const icon = isPack ? '✅' : '❌';
        console.log(`  ${icon} ${i + 1}. ${p.name}`);
      });
    }
    
    // Verificación 2
    console.log('\n✅ VERIFICACIÓN 2:');
    const hasMegapack2 = memory2.interestedProducts.some(p => 
      p.name.toLowerCase().includes('mega pack')
    );
    
    if (hasMegapack2) {
      console.log('✅ CORRECTO: Se encontraron Mega Packs (usuario los buscó)');
    } else {
      console.log('❌ FALLO: NO se encontraron Mega Packs cuando debería');
    }
    
    // Test 3: Búsqueda de "curso de piano completo"
    console.log('\n\n📝 Test 3: "El curso de piano completo"');
    console.log('-'.repeat(60));
    
    const chatId3 = 'test-piano-completo-' + Date.now();
    
    const response3 = await orchestrator.processMessage({
      chatId: chatId3,
      userId,
      message: 'El curso de piano completo',
      userName: 'Test User',
    });
    
    console.log('\n🤖 Respuesta del bot:');
    console.log(response3.text.substring(0, 300) + '...');
    
    const memory3 = memoryService.get(chatId3, userId);
    console.log('\n📊 Productos encontrados:', memory3.interestedProducts.length);
    console.log('📦 Producto actual:', memory3.currentProduct?.name || 'ninguno');
    
    // Verificación 3
    console.log('\n✅ VERIFICACIÓN 3:');
    
    if (memory3.currentProduct) {
      const isPianoCourse = memory3.currentProduct.name.toLowerCase().includes('piano') &&
                           memory3.currentProduct.name.toLowerCase().includes('curso');
      const isMegapack = memory3.currentProduct.name.toLowerCase().includes('mega pack');
      
      if (isPianoCourse && !isMegapack) {
        console.log('✅ CORRECTO: Se seleccionó el curso de piano específico');
        console.log(`   Producto: ${memory3.currentProduct.name}`);
      } else if (isMegapack) {
        console.log('❌ FALLO: Se seleccionó un Mega Pack en lugar del curso');
        console.log(`   Producto: ${memory3.currentProduct.name}`);
      } else {
        console.log('❌ FALLO: Se seleccionó un producto incorrecto');
        console.log(`   Producto: ${memory3.currentProduct.name}`);
      }
    } else if (memory3.interestedProducts.length === 1) {
      const product = memory3.interestedProducts[0];
      const isPianoCourse = product.name.toLowerCase().includes('piano') &&
                           product.name.toLowerCase().includes('curso');
      const isMegapack = product.name.toLowerCase().includes('mega pack');
      
      if (isPianoCourse && !isMegapack) {
        console.log('✅ CORRECTO: Se encontró solo el curso de piano');
        console.log(`   Producto: ${product.name}`);
      } else {
        console.log('❌ FALLO: Producto incorrecto en la lista');
        console.log(`   Producto: ${product.name}`);
      }
    } else {
      console.log('⚠️ ADVERTENCIA: Se encontraron múltiples productos');
      console.log('   Debería encontrar solo el curso de piano completo');
    }
    
    // Resumen final
    console.log('\n\n🎯 RESUMEN FINAL:');
    console.log('='.repeat(60));
    
    const test1Pass = !memory1.interestedProducts.some(p => 
      p.name.toLowerCase().includes('mega pack')
    );
    const test2Pass = memory2.interestedProducts.some(p => 
      p.name.toLowerCase().includes('mega pack')
    );
    const test3Pass = (memory3.currentProduct?.name.toLowerCase().includes('piano') &&
                      !memory3.currentProduct?.name.toLowerCase().includes('mega pack')) ||
                      (memory3.interestedProducts.length === 1 &&
                       memory3.interestedProducts[0].name.toLowerCase().includes('piano') &&
                       !memory3.interestedProducts[0].name.toLowerCase().includes('mega pack'));
    
    console.log(`Test 1 (curso de piano): ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2 (mega pack): ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 3 (curso completo): ${test3Pass ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPass = test1Pass && test2Pass && test3Pass;
    
    if (allPass) {
      console.log('\n🎉 TODOS LOS TESTS PASARON');
      console.log('El bot ya NO confunde cursos con megapacks');
    } else {
      console.log('\n⚠️ ALGUNOS TESTS FALLARON');
      console.log('Revisar el algoritmo de scoring');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR en el test:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completado\n');
}

// Ejecutar test
testCursoPianoVsMegapack().catch(console.error);
