/**
 * 🔍 TEST: FORZAR CARGA DE TODOS LOS PRODUCTOS
 * Ver qué pasa cuando cargamos 100 productos
 */

import { OllamaOrchestrator } from '../src/lib/ollama-orchestrator';
import { db } from '../src/lib/db';

async function testForzarTodosProductos() {
  console.log('🔍 TEST: FORZANDO CARGA DE TODOS LOS PRODUCTOS\n');
  console.log('='.repeat(70));
  
  try {
    // Obtener usuario
    const user = await db.user.findFirst({
      where: { email: { contains: '@' } }
    });
    
    if (!user) {
      console.error('❌ No se encontró usuario');
      return;
    }
    
    console.log(`👤 Usuario: ${user.email}`);
    console.log(`📦 ID: ${user.id}\n`);
    
    // FORZAR CARGA DE TODOS LOS PRODUCTOS DEL CATÁLOGO
    console.log('📦 Cargando TODOS los productos del catálogo (sin filtro de usuario)...\n');
    
    const todosLosProductos = await db.product.findMany({
      where: {
        status: 'AVAILABLE'
        // SIN filtro de userId - carga TODO el catálogo
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        description: true,
        tags: true,
        smartTags: true,
        userId: true
      },
      take: 200 // Aumentado a 200 para asegurar que carga todos
    });
    
    console.log(`✅ Productos cargados del catálogo: ${todosLosProductos.length}`);
    
    // Contar por usuario
    const porUsuario: { [key: string]: number } = {};
    todosLosProductos.forEach(p => {
      porUsuario[p.userId] = (porUsuario[p.userId] || 0) + 1;
    });
    
    console.log(`\n👥 Productos por usuario:`);
    Object.entries(porUsuario).forEach(([userId, count]) => {
      console.log(`   Usuario ${userId.substring(0, 10)}...: ${count} productos`);
    });
    
    console.log(`\n📋 Lista de productos (primeros 20):`);
    todosLosProductos.slice(0, 20).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - $${p.price.toLocaleString('es-CO')} (${p.category})`);
    });
    
    if (todosLosProductos.length > 20) {
      console.log(`   ... y ${todosLosProductos.length - 20} productos más`);
    }
    
    // Tests con TODOS los productos
    const tests = [
      {
        name: 'Búsqueda de Laptop',
        message: 'Busco una laptop',
        expected: 'Debe encontrar laptops si existen'
      },
      {
        name: 'Búsqueda de Moto',
        message: 'Busco una moto',
        expected: 'Debe encontrar motos si existen'
      },
      {
        name: 'Curso de Piano',
        message: 'Curso de piano',
        expected: 'Debe encontrar cursos de piano'
      },
      {
        name: 'Producto Más Caro',
        message: 'Cuál es el producto más caro?',
        expected: 'Debe analizar precios y responder'
      },
      {
        name: 'Producto Más Barato',
        message: 'Qué es lo más económico?',
        expected: 'Debe encontrar el producto más barato'
      }
    ];
    
    for (const test of tests) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📝 TEST: ${test.name}`);
      console.log(`💬 Mensaje: "${test.message}"`);
      console.log(`✅ Esperado: ${test.expected}`);
      console.log('-'.repeat(70));
      
      const startTime = Date.now();
      
      try {
        // Crear contexto FORZADO con TODOS los productos
        const context = {
          products: todosLosProductos,
          businessInfo: {
            name: 'Tecnovariedades D&S',
            description: 'Tu tienda de tecnología',
            categories: ['Laptops', 'Motos', 'Cursos', 'Megapacks', 'Accesorios']
          },
          paymentMethods: {
            online: ['MercadoPago', 'PayPal'],
            local: ['Nequi: 313 617 4267', 'Daviplata: 313 617 4267']
          },
          conversationHistory: []
        };
        
        console.log(`\n🔍 Buscando en ${todosLosProductos.length} productos...`);
        
        // Usar el método que carga productos
        const result = await OllamaOrchestrator.generateIntelligentResponse(
          test.message,
          context
        );
        
        const duration = Date.now() - startTime;
        
        console.log(`\n🤖 RESPUESTA (${duration}ms):`);
        console.log(result.text);
        
        console.log(`\n📊 Metadata:`);
        console.log(`   Intención: ${result.intent}`);
        console.log(`   Confianza: ${result.confidence}`);
        console.log(`   Productos encontrados: ${result.selectedProducts.length}`);
        
        if (result.selectedProducts.length > 0) {
          console.log(`\n📦 Productos seleccionados:`);
          result.selectedProducts.forEach(p => {
            console.log(`   - ${p.name} ($${p.price.toLocaleString('es-CO')})`);
          });
        } else {
          console.log(`\n⚠️ NO encontró productos`);
        }
        
        console.log(`\n✅ Test completado en ${duration}ms`);
        
      } catch (error: any) {
        console.error(`\n❌ ERROR:`, error.message);
      }
      
      // Esperar entre tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Análisis final
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 ANÁLISIS FINAL');
    console.log('='.repeat(70));
    
    // Contar productos por categoría
    const porCategoria: { [key: string]: number } = {};
    todosLosProductos.forEach(p => {
      porCategoria[p.category] = (porCategoria[p.category] || 0) + 1;
    });
    
    console.log(`\n📋 Productos por categoría:`);
    Object.entries(porCategoria).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} productos`);
    });
    
    // Rango de precios
    const precios = todosLosProductos.map(p => p.price);
    const minPrecio = Math.min(...precios);
    const maxPrecio = Math.max(...precios);
    
    console.log(`\n💰 Rango de precios:`);
    console.log(`   Más barato: $${minPrecio.toLocaleString('es-CO')}`);
    console.log(`   Más caro: $${maxPrecio.toLocaleString('es-CO')}`);
    
    console.log(`\n✅ TODOS LOS TESTS COMPLETADOS`);
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await db.$disconnect();
  }
}

// Ejecutar
testForzarTodosProductos().catch(console.error);
