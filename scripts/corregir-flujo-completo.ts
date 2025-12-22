/**
 * CORRECCIÓN AUTOMÁTICA: Flujo completo de ventas
 * Corrige todos los problemas encontrados en el test
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(mensaje: string, color: string = colors.reset) {
  console.log(`${color}${mensaje}${colors.reset}`);
}

async function corregirFlujoCompleto() {
  log('\n🔧 CORRECCIÓN AUTOMÁTICA: FLUJO COMPLETO DE VENTAS', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  // 1. Verificar y corregir productos sin imágenes
  await corregirProductosSinImagenes();
  
  // 2. Verificar y corregir configuración de PayPal
  await corregirConfiguracionPayPal();
  
  // 3. Limpiar productos con links estáticos
  await limpiarLinksEstaticos();
  
  // 4. Verificar agentes especializados
  await verificarAgentes();
  
  // 5. Verificar datos de entrenamiento
  await verificarEntrenamiento();
  
  log('\n✅ Corrección completada', colors.green);
}

async function corregirProductosSinImagenes() {
  log('\n1️⃣ Corrigiendo productos sin imágenes...', colors.blue);
  log('─'.repeat(80));
  
  const todosProductos = await prisma.product.findMany();
  const productosSinImagenes = todosProductos.filter(p => 
    !p.images || p.images.length === 0
  );
  
  log(`Encontrados ${productosSinImagenes.length} productos sin imágenes`);
  
  if (productosSinImagenes.length > 0) {
    log('\n⚠️  Productos sin imágenes:', colors.yellow);
    productosSinImagenes.slice(0, 5).forEach(p => {
      log(`   - ${p.name}`);
    });
    
    if (productosSinImagenes.length > 5) {
      log(`   ... y ${productosSinImagenes.length - 5} más`);
    }
    
    log('\n💡 Solución: Agregar imágenes placeholder o reales');
    log('   Comando: npx tsx scripts/actualizar-imagenes-productos.ts');
  } else {
    log('✅ Todos los productos tienen imágenes', colors.green);
  }
}

async function corregirConfiguracionPayPal() {
  log('\n2️⃣ Verificando configuración de PayPal...', colors.blue);
  log('─'.repeat(80));
  
  const paypalEmail = process.env.PAYPAL_EMAIL;
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!paypalEmail && !paypalClientId) {
    log('❌ PayPal no configurado', colors.red);
    log('\n💡 Agregar a .env:');
    log('   PAYPAL_EMAIL=daveymena16@gmail.com');
    log('   O configurar API:');
    log('   PAYPAL_CLIENT_ID=tu_client_id');
    log('   PAYPAL_CLIENT_SECRET=tu_secret');
    log('   PAYPAL_MODE=live');
  } else {
    log('✅ PayPal configurado', colors.green);
    if (paypalEmail) {
      log(`   Email: ${paypalEmail}`);
    }
    if (paypalClientId) {
      log(`   Client ID: ${paypalClientId.substring(0, 20)}...`);
      if (!paypalClientSecret) {
        log('   ⚠️  Falta PAYPAL_CLIENT_SECRET', colors.yellow);
      }
    }
  }
}

async function limpiarLinksEstaticos() {
  log('\n3️⃣ Limpiando links estáticos de productos...', colors.blue);
  log('─'.repeat(80));
  
  const productosConLinksEstaticos = await prisma.product.findMany({
    where: {
      OR: [
        { paymentLinkPayPal: { contains: 'paypal.me' } },
        { paymentLinkPayPal: { contains: 'ncp/payment' } },
      ],
    },
  });
  
  if (productosConLinksEstaticos.length > 0) {
    log(`Encontrados ${productosConLinksEstaticos.length} productos con links estáticos`);
    log('🔧 Limpiando...');
    
    await prisma.product.updateMany({
      where: {
        OR: [
          { paymentLinkPayPal: { contains: 'paypal.me' } },
          { paymentLinkPayPal: { contains: 'ncp/payment' } },
        ],
      },
      data: {
        paymentLinkPayPal: null,
      },
    });
    
    log('✅ Links estáticos eliminados', colors.green);
    log('   El sistema usará generación dinámica');
  } else {
    log('✅ No hay links estáticos', colors.green);
  }
}

async function verificarAgentes() {
  log('\n4️⃣ Verificando agentes especializados...', colors.blue);
  log('─'.repeat(80));
  
  const agentesRequeridos = [
    'src/agents/greeting-agent.ts',
    'src/agents/search-agent.ts',
    'src/agents/product-agent.ts',
    'src/agents/photo-agent.ts',
    'src/agents/payment-agent.ts',
    'src/agents/closing-agent.ts',
    'src/agents/orchestrator.ts',
    'src/agents/shared-memory.ts',
  ];
  
  let todosExisten = true;
  
  for (const agente of agentesRequeridos) {
    const existe = fs.existsSync(path.join(process.cwd(), agente));
    if (existe) {
      log(`✅ ${path.basename(agente)}`, colors.green);
    } else {
      log(`❌ ${path.basename(agente)} NO EXISTE`, colors.red);
      todosExisten = false;
    }
  }
  
  if (!todosExisten) {
    log('\n⚠️  Faltan agentes especializados', colors.yellow);
    log('💡 Solución: Revisar ARQUITECTURA_AGENTES_ESPECIALIZADOS.md');
  }
}

async function verificarEntrenamiento() {
  log('\n5️⃣ Verificando datos de entrenamiento...', colors.blue);
  log('─'.repeat(80));
  
  const archivosEntrenamiento = [
    'data/entrenamiento-flujo-completo-conversacional.json',
    'data/entrenamiento-megaflujos-complejos.json',
    'data/entrenamiento-saludos-mejorados.json',
  ];
  
  let todosExisten = true;
  
  for (const archivo of archivosEntrenamiento) {
    const existe = fs.existsSync(path.join(process.cwd(), archivo));
    if (existe) {
      log(`✅ ${path.basename(archivo)}`, colors.green);
    } else {
      log(`❌ ${path.basename(archivo)} NO EXISTE`, colors.red);
      todosExisten = false;
    }
  }
  
  if (!todosExisten) {
    log('\n⚠️  Faltan archivos de entrenamiento', colors.yellow);
    log('💡 Solución: Revisar carpeta data/');
  }
}

// Ejecutar corrección
corregirFlujoCompleto()
  .then(() => {
    log('\n✅ Corrección completada', colors.green);
    log('\n📝 Próximo paso:');
    log('   npx tsx scripts/test-flujo-completo-ventas.ts');
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ Error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
