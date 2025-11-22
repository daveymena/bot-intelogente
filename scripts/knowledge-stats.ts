/**
 * 📊 ESTADÍSTICAS DE LA BASE DE CONOCIMIENTO
 * 
 * Muestra estadísticas detalladas del aprendizaje del bot
 */

import { HybridLearningSystem } from '../src/lib/hybrid-learning-system';
import { db } from '../src/lib/db';

async function showStats() {
  console.log('\n📊 ESTADÍSTICAS DE LA BASE DE CONOCIMIENTO\n');
  console.log('═'.repeat(60));
  
  try {
    // Estadísticas del sistema híbrido
    const stats = await HybridLearningSystem.getLearningStats();
    
    console.log('\n🧠 Sistema de Aprendizaje Híbrido:');
    console.log(`   Total de conocimiento: ${stats.totalKnowledge} entradas`);
    console.log(`   Patrones únicos: ${stats.totalPatterns}`);
    console.log(`   Confianza promedio: ${(stats.avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Aprendizaje reciente: ${stats.learningRate}`);
    
    // Estadísticas por tipo de consulta
    const patternsByType = await db.conversationPattern.groupBy({
      by: ['queryType'],
      _count: true,
      _avg: { confidence: true, successRate: true }
    });
    
    console.log('\n📋 Patrones por Tipo de Consulta:');
    console.log('─'.repeat(60));
    
    for (const pattern of patternsByType) {
      console.log(`\n   ${pattern.queryType}:`);
      console.log(`      Cantidad: ${pattern._count}`);
      console.log(`      Confianza: ${((pattern._avg.confidence || 0) * 100).toFixed(1)}%`);
      console.log(`      Éxito: ${((pattern._avg.successRate || 0) * 100).toFixed(1)}%`);
    }
    
    // Top 10 consultas más usadas
    const topQueries = await db.conversationKnowledge.findMany({
      orderBy: { usageCount: 'desc' },
      take: 10,
      select: {
        userQuery: true,
        usageCount: true,
        successRate: true,
        confidence: true
      }
    });
    
    console.log('\n\n🔝 Top 10 Consultas Más Usadas:');
    console.log('─'.repeat(60));
    
    topQueries.forEach((query, index) => {
      console.log(`\n${index + 1}. "${query.userQuery.substring(0, 50)}..."`);
      console.log(`   Usos: ${query.usageCount}`);
      console.log(`   Éxito: ${(query.successRate * 100).toFixed(0)}%`);
      console.log(`   Confianza: ${(query.confidence * 100).toFixed(0)}%`);
    });
    
    // Conocimiento reciente
    const recentKnowledge = await db.conversationKnowledge.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        userQuery: true,
        createdAt: true,
        confidence: true
      }
    });
    
    console.log('\n\n🆕 Conocimiento Reciente (Última Semana):');
    console.log('─'.repeat(60));
    
    recentKnowledge.forEach((knowledge, index) => {
      const date = new Date(knowledge.createdAt);
      console.log(`\n${index + 1}. "${knowledge.userQuery.substring(0, 50)}..."`);
      console.log(`   Fecha: ${date.toLocaleDateString('es-CO')} ${date.toLocaleTimeString('es-CO')}`);
      console.log(`   Confianza: ${(knowledge.confidence * 100).toFixed(0)}%`);
    });
    
    console.log('\n\n✅ Estadísticas completadas\n');
    
  } catch (error) {
    console.error('\n❌ Error obteniendo estadísticas:', error);
  } finally {
    await db.$disconnect();
  }
}

showStats();
