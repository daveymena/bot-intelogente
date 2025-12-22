/**
 * Script para generar automáticamente conocimiento de productos nuevos
 * Se puede ejecutar periódicamente o al agregar productos
 */

import { PrismaClient } from '@prisma/client';
import { ProductKnowledgeBaseService } from '../src/lib/product-knowledge-base';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function autoGenerarConocimientoNuevos() {
  try {
    console.log('🔄 Auto-generación de Conocimiento para Productos Nuevos\n');

    // Cargar base de conocimiento existente
    let existingKnowledge: any[] = [];
    const knowledgeFile = 'base-conocimiento-productos.json';

    if (fs.existsSync(knowledgeFile)) {
      const content = fs.readFileSync(knowledgeFile, 'utf-8');
      existingKnowledge = JSON.parse(content);
      console.log(`📚 Base existente: ${existingKnowledge.length} productos\n`);
    }

    // Obtener IDs de productos con conocimiento
    const existingIds = new Set(existingKnowledge.map((k: any) => k.productId));

    // Obtener todos los productos disponibles
    const allProducts = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' }
    });

    // Filtrar productos nuevos (sin conocimiento)
    const newProducts = allProducts.filter(p => !existingIds.has(p.id));

    if (newProducts.length === 0) {
      console.log('✅ No hay productos nuevos. Todos tienen conocimiento generado.\n');
      return;
    }

    console.log(`🆕 Productos nuevos encontrados: ${newProducts.length}\n`);

    // Generar conocimiento para productos nuevos
    const newKnowledge: any[] = [];

    for (const product of newProducts) {
      try {
        console.log(`⚙️  Generando: ${product.name}`);
        
        const knowledge = await ProductKnowledgeBaseService.generateKnowledge(product.id);
        
        if (knowledge) {
          newKnowledge.push({
            productId: knowledge.productId,
            productName: knowledge.productName,
            category: knowledge.category,
            shortDescription: knowledge.shortDescription,
            keyFeatures: knowledge.keyFeatures,
            benefits: knowledge.benefits,
            targetAudience: knowledge.targetAudience,
            useCases: knowledge.useCases,
            commonQuestions: knowledge.commonQuestions,
            differentiators: knowledge.differentiators,
            generated: new Date().toISOString()
          });
          
          console.log(`   ✅ Generado`);
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error}`);
      }
    }

    if (newKnowledge.length > 0) {
      // Combinar con conocimiento existente
      const updatedKnowledge = [...existingKnowledge, ...newKnowledge];

      // Guardar archivo actualizado
      fs.writeFileSync(
        knowledgeFile,
        JSON.stringify(updatedKnowledge, null, 2),
        'utf-8'
      );

      console.log(`\n✅ Base de conocimiento actualizada`);
      console.log(`📊 Total ahora: ${updatedKnowledge.length} productos`);
      console.log(`🆕 Nuevos agregados: ${newKnowledge.length}`);

      // Mostrar productos nuevos
      console.log('\n📋 Productos nuevos con conocimiento:');
      newKnowledge.forEach((k, i) => {
        console.log(`   ${i + 1}. ${k.productName}`);
      });
    }

    console.log('\n🎯 El bot ahora puede asesorar sobre estos productos nuevos\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

autoGenerarConocimientoNuevos();
