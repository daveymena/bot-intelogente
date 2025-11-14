/**
 * 🚀 APLICAR SISTEMA DE BÚSQUEDA INTELIGENTE
 * 
 * Este script verifica que todo esté listo para usar el sistema
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verificarSistema() {
  console.log('🔍 VERIFICANDO SISTEMA DE BÚSQUEDA INTELIGENTE\n');
  console.log('='.repeat(60));

  let todoBien = true;

  // 1. Verificar GROQ_API_KEY
  console.log('\n1️⃣ Verificando GROQ_API_KEY...');
  if (process.env.GROQ_API_KEY) {
    console.log('   ✅ GROQ_API_KEY configurada');
  } else {
    console.log('   ❌ GROQ_API_KEY NO configurada');
    console.log('   → Agrega GROQ_API_KEY a tu archivo .env');
    todoBien = false;
  }

  // 2. Verificar archivos creados
  console.log('\n2️⃣ Verificando archivos del sistema...');
  const archivos = [
    'src/lib/intelligent-product-search.ts',
    'src/lib/media-service.ts',
    'src/lib/baileys-stable-service.ts'
  ];

  for (const archivo of archivos) {
    const rutaCompleta = path.join(process.cwd(), archivo);
    if (fs.existsSync(rutaCompleta)) {
      console.log(`   ✅ ${archivo}`);
    } else {
      console.log(`   ❌ ${archivo} NO ENCONTRADO`);
      todoBien = false;
    }
  }

  // 3. Verificar productos en BD
  console.log('\n3️⃣ Verificando productos en base de datos...');
  try {
    const productos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        category: true
      }
    });

    console.log(`   📦 Total de productos: ${productos.length}`);

    if (productos.length === 0) {
      console.log('   ⚠️  No hay productos en la BD');
      console.log('   → Agrega productos desde el dashboard');
      todoBien = false;
    } else {
      // Verificar productos con fotos
      const conFotos = productos.filter(p => {
        if (!p.images) return false;
        try {
          const imgs = JSON.parse(p.images);
          return Array.isArray(imgs) && imgs.length > 0;
        } catch {
          return false;
        }
      });

      console.log(`   📸 Productos con fotos: ${conFotos.length}`);
      
      if (conFotos.length === 0) {
        console.log('   ⚠️  Ningún producto tiene fotos');
        console.log('   → Agrega fotos a tus productos');
      }

      // Mostrar algunos productos
      console.log('\n   Productos disponibles:');
      productos.slice(0, 5).forEach((p, idx) => {
        const tieneFotos = conFotos.some(cf => cf.id === p.id);
        console.log(`   ${idx + 1}. ${p.name}`);
        console.log(`      💰 $${p.price.toLocaleString('es-CO')} COP`);
        console.log(`      📸 Fotos: ${tieneFotos ? 'Sí' : 'No'}`);
      });
    }
  } catch (error) {
    console.log('   ❌ Error consultando productos:', error.message);
    todoBien = false;
  }

  // 4. Verificar conexión WhatsApp
  console.log('\n4️⃣ Verificando conexión WhatsApp...');
  try {
    const conexiones = await prisma.whatsAppConnection.findMany({
      where: { isConnected: true }
    });

    if (conexiones.length > 0) {
      console.log(`   ✅ ${conexiones.length} conexión(es) activa(s)`);
      conexiones.forEach(c => {
        console.log(`      📱 ${c.phoneNumber} - ${c.status}`);
      });
    } else {
      console.log('   ⚠️  No hay conexiones activas');
      console.log('   → Conecta WhatsApp desde el dashboard');
    }
  } catch (error) {
    console.log('   ⚠️  Error verificando conexiones:', error.message);
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  if (todoBien) {
    console.log('\n✅ SISTEMA LISTO PARA USAR\n');
    console.log('El bot ahora puede:');
    console.log('  • Entender nombres parciales de productos');
    console.log('  • Usar contexto de conversación');
    console.log('  • Enviar foto + información juntos');
    console.log('  • Razonar con lógica profunda\n');
    console.log('Prueba enviando mensajes como:');
    console.log('  - "Me interesa el ryzen 3 720u"');
    console.log('  - "Necesito uno para trabajo"');
    console.log('  - "Ese, envíame fotos"\n');
  } else {
    console.log('\n⚠️  HAY PROBLEMAS QUE RESOLVER\n');
    console.log('Revisa los errores arriba y corrígelos antes de usar el sistema.\n');
  }

  return todoBien;
}

// Ejecutar verificación
verificarSistema()
  .then((exito) => {
    process.exit(exito ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
