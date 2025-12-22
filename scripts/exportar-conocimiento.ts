/**
 * 📤 EXPORTAR BASE DE CONOCIMIENTO
 * 
 * Exporta todas las respuestas entrenadas a un archivo JSON
 * Para transferir conocimiento de desarrollo a producción
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportKnowledge() {
  console.log('📤 EXPORTANDO BASE DE CONOCIMIENTO\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Obtener todas las respuestas de la base de conocimiento
    const knowledge = await prisma.knowledgeBase.findMany({
      orderBy: {
        confidence: 'desc'
      }
    });

    console.log(`🧠 Respuestas encontradas: ${knowledge.length}\n`);

    if (knowledge.length === 0) {
      console.log('⚠️  No hay conocimiento para exportar.');
      console.log('   Ejecuta primero: npm run train:quick\n');
      return;
    }

    // Estadísticas
    const avgConfidence = knowledge.reduce((sum, k) => sum + k.confidence, 0) / knowledge.length;
    const highConfidence = knowledge.filter(k => k.confidence >= 0.8).length;

    console.log('📊 Estadísticas:');
    console.log(`   Total: ${knowledge.length} respuestas`);
    console.log(`   Confianza promedio: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Alta confianza (>80%): ${highConfidence}\n`);

    // Crear backup
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalRecords: knowledge.length,
      avgConfidence,
      knowledge: knowledge.map(k => ({
        userQuery: k.userQuery,
        botResponse: k.botResponse,
        productId: k.productId,
        confidence: k.confidence,
        createdAt: k.createdAt.toISOString()
      }))
    };

    // Guardar archivo
    const filename = `knowledge-backup-${Date.now()}.json`;
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf-8');

    console.log(`✅ Conocimiento exportado a: ${filename}`);
    console.log(`📦 Tamaño: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB\n`);

    // También crear un backup "latest"
    const latestPath = path.join(process.cwd(), 'knowledge-backup-latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(backup, null, 2), 'utf-8');
    console.log(`✅ Backup "latest" creado: knowledge-backup-latest.json\n`);

    console.log('📝 Próximos pasos:');
    console.log('1. Subir a Git: git add knowledge-backup-latest.json');
    console.log('2. Commit: git commit -m "feat: Base de conocimiento actualizada"');
    console.log('3. Push: git push');
    console.log('4. En producción: npm run knowledge:import\n');

  } catch (error: any) {
    console.error('❌ Error exportando:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

exportKnowledge();
