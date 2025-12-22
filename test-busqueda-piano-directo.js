/**
 * 🧪 TEST DIRECTO: Búsqueda de "curso de piano"
 * 
 * Este test simula exactamente lo que hace el bot cuando busca
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBusquedaPiano() {
  console.log('🧪 TEST: Búsqueda Directa de "curso de piano"\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const mensaje = "Me interesa el curso de piano";
  
  console.log(`📝 Mensaje del usuario: "${mensaje}"\n`);
  
  // 1. Verificar configuración
  console.log('1️⃣ VERIFICANDO CONFIGURACIÓN:');
  console.log(`   USE_OLLAMA: ${process.env.USE_OLLAMA}`);
  console.log(`   OLLAMA_BASE_URL: ${process.env.OLLAMA_BASE_URL}`);
  console.log(`   OLLAMA_MODEL: ${process.env.OLLAMA_MODEL}`);
  console.log(`   OLLAMA_TIMEOUT: ${process.env.OLLAMA_TIMEOUT}\n`);
  
  if (process.env.USE_OLLAMA !== 'true') {
    console.log('⚠️  ADVERTENCIA: USE_OLLAMA no está en "true"');
    console.log('   Esto significa que Ollama NO está activo\n');
  }
  
  // 2. Buscar productos con "piano"
  console.log('2️⃣ BUSCANDO EN BASE DE DATOS:');
  const productos = await prisma.product.findMany({
    where: {
      status: 'AVAILABLE',
      OR: [
        { name: { contains: 'piano', mode: 'insensitive' } },
        { description: { contains: 'piano', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      description: true,
      tags: true
    }
  });
  
  console.log(`   Productos encontrados: ${productos.length}\n`);
  
  if (productos.length === 0) {
    console.log('❌ NO SE ENCONTRÓ NINGÚN PRODUCTO CON "PIANO"');
    console.log('   Esto es un problema crítico en la base de datos\n');
    return;
  }
  
  productos.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}`);
    console.log(`      ID: ${p.id}`);
    console.log(`      Precio: $${p.price.toLocaleString('es-CO')}`);
    console.log(`      Categoría: ${p.category}`);
    console.log(`      Tags: ${JSON.stringify(p.tags)}\n`);
  });
  
  // 3. Simular búsqueda semántica
  console.log('3️⃣ SIMULANDO BÚSQUEDA SEMÁNTICA:\n');
  
  if (process.env.USE_OLLAMA === 'true') {
    console.log('   ✅ Ollama está ACTIVO');
    console.log('   📡 Intentando conectar a Ollama...\n');
    
    try {
      const { semanticProductSearch } = require('./src/lib/semantic-product-search');
      
      const resultado = await semanticProductSearch(mensaje);
      
      if (!resultado) {
        console.log('   ❌ Ollama NO devolvió resultados');
        console.log('   Posibles causas:');
        console.log('   - Ollama no está corriendo');
        console.log('   - URL incorrecta');
        console.log('   - Timeout muy corto');
        console.log('   - Error en el prompt\n');
        return;
      }
      
      console.log('   ✅ Ollama devolvió resultado:\n');
      console.log(`   📦 Producto: ${resultado.product?.name || 'N/A'}`);
      console.log(`   💰 Precio: $${resultado.product?.price?.toLocaleString('es-CO') || 'N/A'}`);
      console.log(`   📊 Confianza: ${resultado.confidence}%`);
      console.log(`   💡 Razón: ${resultado.reason}`);
      console.log(`   🎯 isGeneralQuery: ${resultado.isGeneralQuery}\n`);
      
      // Verificar si es el producto correcto
      if (resultado.product?.name?.toLowerCase().includes('piano')) {
        console.log('   ✅ ¡CORRECTO! Devolvió un producto de piano\n');
      } else {
        console.log('   ❌ ¡ERROR! Devolvió producto incorrecto');
        console.log(`   Esperado: Curso de Piano`);
        console.log(`   Recibido: ${resultado.product?.name}\n`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error en búsqueda semántica: ${error.message}\n`);
    }
    
  } else {
    console.log('   ❌ Ollama está DESACTIVADO');
    console.log('   El sistema usará búsqueda por keywords (fallback)\n');
    
    // Simular fallback
    const keywords = ['curso', 'piano'];
    const productoFallback = productos.find(p => 
      keywords.every(k => p.name.toLowerCase().includes(k))
    );
    
    if (productoFallback) {
      console.log('   ✅ Fallback encontró:');
      console.log(`   📦 ${productoFallback.name}`);
      console.log(`   💰 $${productoFallback.price.toLocaleString('es-CO')}\n`);
    } else {
      console.log('   ❌ Fallback NO encontró el producto\n');
    }
  }
  
  // 4. Conclusión
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CONCLUSIÓN:\n');
  
  if (process.env.USE_OLLAMA !== 'true') {
    console.log('❌ PROBLEMA PRINCIPAL: Ollama NO está activo');
    console.log('   Solución: Cambiar USE_OLLAMA=true en .env');
    console.log('   Luego reiniciar servidor\n');
  } else if (productos.length > 0) {
    console.log('✅ Base de datos tiene el producto');
    console.log('✅ Ollama está configurado');
    console.log('⚠️  Si sigue fallando, verificar:');
    console.log('   1. Servidor reiniciado después de cambios');
    console.log('   2. Ollama responde (curl test)');
    console.log('   3. Logs del servidor en tiempo real\n');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  await prisma.$disconnect();
}

testBusquedaPiano()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
