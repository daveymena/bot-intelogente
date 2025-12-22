/**
 * 📥 IMPORTAR BASE DE CONOCIMIENTO
 * 
 * Importa respuestas entrenadas desde archivo JSON
 * Para transferir conocimiento de desarrollo a producción
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importKnowledge() {
  console.log('📥 IMPORTANDO BASE DE CONOCIMIENTO\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Buscar archivo de backup
    const filename = 'knowledge-backup-latest.json';
    const filepath = path.join(process.cwd(), filename);

    if (!fs.existsSync(filepath)) {
      console.log('❌ No se encontró el archivo de backup.');
      console.log(`   Buscando: ${filepath}`);
      console.log('\n   Asegúrate de haber ejecutado: npm run knowledge:export\n');
      return;
    }

    // Leer backup
    const backupContent = fs.readFileSync(filepath, 'utf-8');
    const backup = JSON.parse(backupContent);

    console.log('📦 Información del backup:');
    console.log(`   Fecha: ${new Date(backup.exportDate).toLocaleString()}`);
    console.log(`   Versión: ${backup.version}`);
    console.log(`   Registros: ${backup.totalRecords}`);
    console.log(`   Confianza promedio: ${(backup.avgConfidence * 100).toFixed(1)}%\n`);

    // Verificar si ya hay conocimiento
    const existingCount = await prisma.knowledgeBase.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya hay ${existingCount} respuestas en la base de datos.`);
      console.log('   ¿Deseas:');
      console.log('   1. Reemplazar todo (eliminar existente)');
      console.log('   2. Agregar solo nuevas (mantener existente)');
      console.log('   3. Cancelar\n');
      
      // Para automatización, usar variable de entorno
      const mode = process.env.IMPORT_MODE || 'add';
      
      if (mode === 'replace') {
        console.log('🗑️  Eliminando conocimiento existente...');
        await prisma.knowledgeBase.deleteMany({});
        console.log('✅ Conocimiento existente eliminado\n');
      } else if (mode === 'add') {
        console.log('➕ Agregando solo respuestas nuevas...\n');
      } else {
        console.log('❌ Importación cancelada\n');
        return;
      }
    }

    // Importar conocimiento
    console.log('📥 Importando respuestas...\n');
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of backup.knowledge) {
      try {
        // Verificar si ya existe (por userQuery y productId)
        const existing = await prisma.knowledgeBase.findFirst({
          where: {
            userQuery: item.userQuery,
            productId: item.productId
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Crear nuevo registro
        await prisma.knowledgeBase.create({
          data: {
            userQuery: item.userQuery,
            botResponse: item.botResponse,
            productId: item.productId,
            confidence: item.confidence
          }
        });

        imported++;

        if (imported % 10 === 0) {
          process.stdout.write(`\r   Importadas: ${imported}/${backup.totalRecords}`);
        }

      } catch (error: any) {
        errors++;
        console.error(`\n   ❌ Error importando: ${error.message}`);
      }
    }

    console.log(`\n\n✅ Importación completada\n`);
    console.log('📊 Resumen:');
    console.log(`   ✅ Importadas: ${imported}`);
    console.log(`   ⏭️  Omitidas (ya existían): ${skipped}`);
    console.log(`   ❌ Errores: ${errors}\n`);

    // Verificar total
    const finalCount = await prisma.knowledgeBase.count();
    console.log(`🧠 Total en base de datos: ${finalCount} respuestas\n`);

    console.log('✅ El bot ahora puede funcionar sin tokens de IA\n');

  } catch (error: any) {
    console.error('❌ Error importando:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importKnowledge();
