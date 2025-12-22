/**
 * Script completo: Scrapear e Importar productos de Disyvar
 * Ejecuta ambos procesos en secuencia
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  console.log('🚀 Proceso Completo: Disyvar Dropshipping\n');
  console.log('=' .repeat(60));
  console.log('\n');

  try {
    // Paso 1: Scrapear
    console.log('📥 PASO 1: Scrapeando productos de Disyvar.com.co...\n');
    const { stdout: scrapeOutput } = await execAsync('npx tsx scripts/scrape-disyvar.ts');
    console.log(scrapeOutput);

    // Paso 2: Importar
    console.log('\n📦 PASO 2: Importando productos a la base de datos...\n');
    const { stdout: importOutput } = await execAsync('npx tsx scripts/import-disyvar.ts');
    console.log(importOutput);

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('\n✅ Catálogo de Disyvar disponible para dropshipping');
    console.log('\n📝 Accede a tus productos en:');
    console.log('   - Dashboard: http://localhost:3000');
    console.log('   - Gestión de productos: Panel de administración');
    console.log('   - Catálogo público: http://localhost:3000/catalogo');
    console.log('   - Tienda: http://localhost:3000/tienda\n');

  } catch (error: any) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.error('\n💡 Intenta ejecutar los scripts por separado:');
    console.error('   1. npx tsx scripts/scrape-disyvar.ts');
    console.error('   2. npx tsx scripts/import-disyvar.ts\n');
    process.exit(1);
  }
}

main();
