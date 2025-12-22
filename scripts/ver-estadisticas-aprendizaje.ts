/**
 * Script para ver estadísticas del sistema de aprendizaje automático
 */

import { db } from '../src/lib/db';

async function verEstadisticas() {
  console.log('📊 ESTADÍSTICAS DEL SISTEMA DE APRENDIZAJE\n');
  console.log('='.repeat(60));

  try {
    // 1. Estadísticas generales
    const totalEntries = await db.conversationKnowledge.count();
    const avgSuccessRate = await db.conversationKnowledge.aggregate({
      _avg: { successRate: true }
    });
    const totalUsage = await db.conversationKnowledge.aggregate({
      _sum: { usageCount: true }
    });

    console.log('\n📈 RESUMEN GENERAL');
    console.log('='.repeat(60));
    console.log(`Total de respuestas aprendidas: ${totalEntries}`);
    console.log(`Tasa de éxito promedio: ${((avgSuccessRate._avg.successRate || 0) * 100).toFixed(1)}%`);
    console.log(`Total de veces reutilizadas: ${totalUsage._sum.usageCount || 0}`);

    // 2. Top 10 respuestas más usadas
    console.log('\n\n🏆 TOP 10 RESPUESTAS MÁS USADAS');
    console.log('='.repeat(60));

    const topUsed = await db.conversationKnowledge.findMany({
      orderBy: { usageCount: 'desc' },
      take: 10
    });

    topUsed.forEach((entry, index) => {
      console.log(`\n${index + 1}. "${entry.userQuery}"`);
      console.log(`   Usado: ${entry.usageCount} veces`);
      console.log(`   Éxito: ${(entry.successRate * 100).toFixed(0)}%`);
      console.log(`   Confianza: ${(entry.confidence * 100).toFixed(0)}%`);
      console.log(`   Última vez: ${entry.lastUsedAt.toLocaleString('es-CO')}`);
      if (entry.productName) {
        console.log(`   Producto: ${entry.productName}`);
      }
    });

    // 3. Respuestas con mejor tasa de éxito
    console.log('\n\n⭐ TOP 10 RESPUESTAS CON MEJOR TASA DE ÉXITO');
    console.log('='.repeat(60));

    const topSuccess = await db.conversationKnowledge.findMany({
      where: {
        usageCount: { gte: 2 } // Al menos usadas 2 veces
      },
      orderBy: { successRate: 'desc' },
      take: 10
    });

    topSuccess.forEach((entry, index) => {
      console.log(`\n${index + 1}. "${entry.userQuery}"`);
      console.log(`   Éxito: ${(entry.successRate * 100).toFixed(0)}%`);
      console.log(`   Usado: ${entry.usageCount} veces`);
      console.log(`   Confianza: ${(entry.confidence * 100).toFixed(0)}%`);
    });

    // 4. Respuestas recientes
    console.log('\n\n🕐 ÚLTIMAS 10 RESPUESTAS APRENDIDAS');
    console.log('='.repeat(60));

    const recent = await db.conversationKnowledge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    recent.forEach((entry, index) => {
      console.log(`\n${index + 1}. "${entry.userQuery}"`);
      console.log(`   Aprendida: ${entry.createdAt.toLocaleString('es-CO')}`);
      console.log(`   Usado: ${entry.usageCount} veces`);
      console.log(`   Éxito: ${(entry.successRate * 100).toFixed(0)}%`);
    });

    // 5. Respuestas por producto
    console.log('\n\n📦 RESPUESTAS POR PRODUCTO');
    console.log('='.repeat(60));

    const byProduct = await db.conversationKnowledge.groupBy({
      by: ['productName'],
      _count: { id: true },
      where: {
        productName: { not: null }
      },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: 10
    });

    byProduct.forEach((group, index) => {
      console.log(`${index + 1}. ${group.productName}: ${group._count.id} respuestas`);
    });

    // 6. Ahorro estimado de tokens
    console.log('\n\n💰 AHORRO ESTIMADO DE TOKENS');
    console.log('='.repeat(60));

    const totalReutilizaciones = totalUsage._sum.usageCount || 0;
    const tokensAhorrados = totalReutilizaciones * 800; // Promedio 800 tokens por respuesta
    const costoAhorrado = (tokensAhorrados / 1000000) * 1; // $1 por millón de tokens

    console.log(`Total de reutilizaciones: ${totalReutilizaciones}`);
    console.log(`Tokens ahorrados: ${tokensAhorrados.toLocaleString('es-CO')}`);
    console.log(`Costo ahorrado: $${costoAhorrado.toFixed(4)} USD`);

    // 7. Proyección de ahorro
    if (totalEntries > 0) {
      const diasActivo = Math.max(1, Math.floor((Date.now() - recent[recent.length - 1]?.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
      const reutilizacionesPorDia = totalReutilizaciones / diasActivo;
      const ahorroMensual = (reutilizacionesPorDia * 30 * 800 / 1000000) * 1;

      console.log(`\nDías activo: ${diasActivo}`);
      console.log(`Reutilizaciones por día: ${reutilizacionesPorDia.toFixed(1)}`);
      console.log(`Ahorro proyectado mensual: $${ahorroMensual.toFixed(2)} USD`);
    }

    // 8. Calidad del conocimiento
    console.log('\n\n📊 CALIDAD DEL CONOCIMIENTO');
    console.log('='.repeat(60));

    const highQuality = await db.conversationKnowledge.count({
      where: { successRate: { gte: 0.8 } }
    });
    const mediumQuality = await db.conversationKnowledge.count({
      where: { successRate: { gte: 0.5, lt: 0.8 } }
    });
    const lowQuality = await db.conversationKnowledge.count({
      where: { successRate: { lt: 0.5 } }
    });

    console.log(`Alta calidad (≥80%): ${highQuality} (${((highQuality / totalEntries) * 100).toFixed(1)}%)`);
    console.log(`Calidad media (50-80%): ${mediumQuality} (${((mediumQuality / totalEntries) * 100).toFixed(1)}%)`);
    console.log(`Baja calidad (<50%): ${lowQuality} (${((lowQuality / totalEntries) * 100).toFixed(1)}%)`);

    if (lowQuality > 0) {
      console.log(`\n⚠️ Recomendación: Ejecutar limpieza de conocimiento de baja calidad`);
      console.log(`   Comando: npx tsx scripts/limpiar-conocimiento-bajo.ts`);
    }

    console.log('\n\n✅ ESTADÍSTICAS COMPLETADAS');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

verEstadisticas();
