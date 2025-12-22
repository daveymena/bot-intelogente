/**
 * Actualizar catálogo completo usando los scrapers existentes
 * - SmartJoys (scrape-smartjoys-final.ts)
 * - Disyvar (scrape-disyvar.ts)
 * - MegaComputer (scraper-megacomputer-puppeteer.js)
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ResumenImportacion {
  tienda: string;
  productosNuevos: number;
  productosActualizados: number;
  errores: number;
  tiempo: number;
}

async function ejecutarScraper(comando: string, tienda: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏪 SCRAPEANDO: ${tienda.toUpperCase()}`);
  console.log('='.repeat(60));
  console.log(`📝 Comando: ${comando}\n`);

  const inicio = Date.now();

  try {
    execSync(comando, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    const tiempo = Math.round((Date.now() - inicio) / 1000);
    console.log(`\n✅ ${tienda} completado en ${tiempo}s`);
  } catch (error) {
    console.error(`\n❌ Error en ${tienda}:`, error);
    throw error;
  }
}

async function contarProductos(): Promise<number> {
  return await prisma.product.count({
    where: { status: 'AVAILABLE' }
  });
}

async function main() {
  console.log('🚀 ACTUALIZACIÓN COMPLETA DEL CATÁLOGO\n');
  console.log('='.repeat(60));
  console.log('Este proceso va a:');
  console.log('1. ✅ Scrapear SmartJoys (productos nuevos)');
  console.log('2. ✅ Importar SmartJoys a la BD');
  console.log('3. ✅ Scrapear Disyvar (catálogo amplio)');
  console.log('4. ✅ Importar Disyvar a la BD');
  console.log('5. ✅ Scrapear MegaComputer (tecnología)');
  console.log('6. ✅ Importar MegaComputer a la BD');
  console.log('='.repeat(60) + '\n');

  const productosInicio = await contarProductos();
  console.log(`📦 Productos actuales en BD: ${productosInicio}\n`);

  const resumenes: ResumenImportacion[] = [];
  const inicioTotal = Date.now();

  // 1. SMARTJOYS
  try {
    console.log('\n' + '█'.repeat(60));
    console.log('█  PASO 1/3: SMARTJOYS');
    console.log('█'.repeat(60));

    const inicioSmartJoys = Date.now();
    
    // Scrapear
    await ejecutarScraper(
      'npx tsx scripts/scrape-smartjoys-final.ts',
      'SmartJoys'
    );

    // Importar
    await ejecutarScraper(
      'npx tsx scripts/importar-smartjoys.ts',
      'SmartJoys Import'
    );

    const tiempoSmartJoys = Math.round((Date.now() - inicioSmartJoys) / 1000);
    const productosAhora = await contarProductos();
    const nuevos = productosAhora - productosInicio;

    resumenes.push({
      tienda: 'SmartJoys',
      productosNuevos: nuevos > 0 ? nuevos : 0,
      productosActualizados: 0,
      errores: 0,
      tiempo: tiempoSmartJoys,
    });

    console.log(`\n✅ SmartJoys completado: +${nuevos} productos en ${tiempoSmartJoys}s`);
  } catch (error) {
    console.error('\n❌ Error en SmartJoys, continuando...');
    resumenes.push({
      tienda: 'SmartJoys',
      productosNuevos: 0,
      productosActualizados: 0,
      errores: 1,
      tiempo: 0,
    });
  }

  // 2. DISYVAR
  try {
    console.log('\n' + '█'.repeat(60));
    console.log('█  PASO 2/3: DISYVAR');
    console.log('█'.repeat(60));

    const inicioDisyvar = Date.now();
    const productosAntes = await contarProductos();
    
    // Scrapear
    await ejecutarScraper(
      'npx tsx scripts/scrape-disyvar.ts',
      'Disyvar'
    );

    // Importar
    await ejecutarScraper(
      'npx tsx scripts/import-disyvar.ts',
      'Disyvar Import'
    );

    const tiempoDisyvar = Math.round((Date.now() - inicioDisyvar) / 1000);
    const productosAhora = await contarProductos();
    const nuevos = productosAhora - productosAntes;

    resumenes.push({
      tienda: 'Disyvar',
      productosNuevos: nuevos > 0 ? nuevos : 0,
      productosActualizados: 0,
      errores: 0,
      tiempo: tiempoDisyvar,
    });

    console.log(`\n✅ Disyvar completado: +${nuevos} productos en ${tiempoDisyvar}s`);
  } catch (error) {
    console.error('\n❌ Error en Disyvar, continuando...');
    resumenes.push({
      tienda: 'Disyvar',
      productosNuevos: 0,
      productosActualizados: 0,
      errores: 1,
      tiempo: 0,
    });
  }

  // 3. MEGACOMPUTER
  try {
    console.log('\n' + '█'.repeat(60));
    console.log('█  PASO 3/3: MEGACOMPUTER');
    console.log('█'.repeat(60));

    const inicioMega = Date.now();
    const productosAntes = await contarProductos();
    
    // Scrapear e importar (el script hace ambas cosas)
    await ejecutarScraper(
      'npx tsx scripts/re-importar-megacomputer.ts',
      'MegaComputer'
    );

    const tiempoMega = Math.round((Date.now() - inicioMega) / 1000);
    const productosAhora = await contarProductos();
    const nuevos = productosAhora - productosAntes;

    resumenes.push({
      tienda: 'MegaComputer',
      productosNuevos: nuevos > 0 ? nuevos : 0,
      productosActualizados: 0,
      errores: 0,
      tiempo: tiempoMega,
    });

    console.log(`\n✅ MegaComputer completado: +${nuevos} productos en ${tiempoMega}s`);
  } catch (error) {
    console.error('\n❌ Error en MegaComputer, continuando...');
    resumenes.push({
      tienda: 'MegaComputer',
      productosNuevos: 0,
      productosActualizados: 0,
      errores: 1,
      tiempo: 0,
    });
  }

  // RESUMEN FINAL
  const tiempoTotal = Math.round((Date.now() - inicioTotal) / 1000);
  const productosFinal = await contarProductos();
  const totalNuevos = productosFinal - productosInicio;

  console.log('\n\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL DE ACTUALIZACIÓN');
  console.log('='.repeat(60));
  console.log(`\n📦 Productos iniciales: ${productosInicio}`);
  console.log(`📦 Productos finales: ${productosFinal}`);
  console.log(`✨ Productos nuevos: ${totalNuevos}`);
  console.log(`⏱️  Tiempo total: ${Math.floor(tiempoTotal / 60)}m ${tiempoTotal % 60}s\n`);

  console.log('📊 Detalle por tienda:');
  console.log('-'.repeat(60));
  
  resumenes.forEach(r => {
    const estado = r.errores > 0 ? '❌' : '✅';
    console.log(`${estado} ${r.tienda.padEnd(15)} | +${r.productosNuevos.toString().padStart(3)} productos | ${r.tiempo}s`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✨ ACTUALIZACIÓN COMPLETADA');
  console.log('='.repeat(60));
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Verificar productos en dashboard');
  console.log('   2. Revisar fotos de productos nuevos');
  console.log('   3. Ajustar precios si es necesario');
  console.log('   4. Probar bot con productos actualizados\n');

  console.log('🌐 Dashboard: http://localhost:3000/dashboard');
  console.log('🛍️  Catálogo: http://localhost:3000/catalogo\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
