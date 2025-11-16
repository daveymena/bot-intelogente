#!/usr/bin/env tsx
/**
 * 📊 Ver Estadísticas de Entrenamiento
 */

import { PrismaClient } from '@prisma/client';
import { trainedResponseService } from '../src/lib/trained-response-service';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ESTADÍSTICAS DEL SISTEMA DE ENTRENAMIENTO');
  console.log('='.repeat(70) + '\n');

  // Estadísticas generales
  const total = await prisma.conversationKnowledge.count();
  console.log(`📝 Total de respuestas entrenadas: ${total}`);

  if (total === 0) {
    console.log('\n⚠️  No hay respuestas entrenadas aún.');
    console.log('   Ejecuta: npm run train:24-7\n');
    return;
  }

  // Por contexto
  console.log('\n📂 Por Contexto:');
  console.log('-'.repeat(70));
  
  const byContext = await prisma.conversationKnowledge.groupBy({
    by: ['context'],
    _count: true,
    _avg: {
      confidence: true,
      successRate: true,
      usageCount: true
    },
    orderBy: {
      _count: {
        context: 'desc'
      }
    }
  });

  for (const ctx of byContext) {
    const avgConf = (ctx._avg.confidence || 0).toFixed(2);
    const avgSuccess = ((ctx._avg.successRate || 0) * 100).toFixed(1);
    const avgUsage = (ctx._avg.usageCount || 0).toFixed(1);
    
    console.log(`  ${ctx.context.padEnd(20)} | ${String(ctx._count).padStart(5)} respuestas | Confianza: ${avgConf} | Éxito: ${avgSuccess}% | Uso: ${avgUsage}`);
  }

  // Más usadas
  console.log('\n🔥 Top 10 Respuestas Más Usadas:');
  console.log('-'.repeat(70));
  
  const topUsed = await prisma.conversationKnowledge.findMany({
    orderBy: { usageCount: 'desc' },
    take: 10,
    select: {
      userQuery: true,
      usageCount: true,
      successRate: true,
      confidence: true,
      context: true
    }
  });

  for (let i = 0; i < topUsed.length; i++) {
    const item = topUsed[i];
    const query = item.userQuery.substring(0, 40).padEnd(40);
    const success = (item.successRate * 100).toFixed(0);
    console.log(`  ${i + 1}. ${query} | ${item.usageCount} usos | ${success}% éxito | ${item.context}`);
  }

  // Mejor calidad
  console.log('\n⭐ Top 10 Respuestas de Mayor Calidad:');
  console.log('-'.repeat(70));
  
  const topQuality = await prisma.conversationKnowledge.findMany({
    where: {
      usageCount: { gte: 2 } // Al menos 2 usos
    },
    orderBy: [
      { successRate: 'desc' },
      { confidence: 'desc' }
    ],
    take: 10,
    select: {
      userQuery: true,
      successRate: true,
      confidence: true,
      usageCount: true,
      context: true
    }
  });

  for (let i = 0; i < topQuality.length; i++) {
    const item = topQuality[i];
    const query = item.userQuery.substring(0, 40).padEnd(40);
    const success = (item.successRate * 100).toFixed(0);
    const conf = item.confidence.toFixed(2);
    console.log(`  ${i + 1}. ${query} | ${success}% éxito | ${conf} conf | ${item.usageCount} usos`);
  }

  // Estadísticas de calidad
  console.log('\n📈 Calidad General:');
  console.log('-'.repeat(70));
  
  const avgStats = await prisma.conversationKnowledge.aggregate({
    _avg: {
      confidence: true,
      successRate: true,
      usageCount: true
    }
  });

  const highQuality = await prisma.conversationKnowledge.count({
    where: {
      AND: [
        { confidence: { gte: 0.8 } },
        { successRate: { gte: 0.8 } }
      ]
    }
  });

  const lowQuality = await prisma.conversationKnowledge.count({
    where: {
      OR: [
        { confidence: { lt: 0.5 } },
        { successRate: { lt: 0.5 } }
      ]
    }
  });

  console.log(`  Confianza promedio: ${(avgStats._avg.confidence || 0).toFixed(2)}`);
  console.log(`  Tasa de éxito promedio: ${((avgStats._avg.successRate || 0) * 100).toFixed(1)}%`);
  console.log(`  Uso promedio: ${(avgStats._avg.usageCount || 0).toFixed(1)} veces`);
  console.log(`  Alta calidad (>80%): ${highQuality} (${((highQuality / total) * 100).toFixed(1)}%)`);
  console.log(`  Baja calidad (<50%): ${lowQuality} (${((lowQuality / total) * 100).toFixed(1)}%)`);

  // Productos con más respuestas
  console.log('\n🏷️  Top 10 Productos con Más Respuestas:');
  console.log('-'.repeat(70));
  
  const byProduct = await prisma.conversationKnowledge.groupBy({
    by: ['productId', 'productName'],
    where: {
      productId: { not: null }
    },
    _count: true,
    orderBy: {
      _count: {
        productId: 'desc'
      }
    },
    take: 10
  });

  for (const prod of byProduct) {
    if (prod.productName) {
      const name = prod.productName.substring(0, 45).padEnd(45);
      console.log(`  ${name} | ${prod._count} respuestas`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Estadísticas generadas correctamente');
  console.log('='.repeat(70) + '\n');

  await prisma.$disconnect();
}

main().catch(console.error);
