import { PrismaClient } from '@prisma/client';
import { ProductKnowledgeBaseService } from '../src/lib/product-knowledge-base';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function generarBaseConocimiento() {
  try {
    console.log('🧠 Generando Base de Conocimiento de Productos\n');
    console.log('='.repeat(50));

    const productos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { name: 'asc' }
    });

    console.log(`\n📦 Total de productos: ${productos.length}\n`);

    const knowledgeBase: any[] = [];
    let generados = 0;

    for (const producto of productos) {
      try {
        console.log(`⚙️  Generando conocimiento: ${producto.name}`);
        
        const knowledge = await ProductKnowledgeBaseService.generateKnowledge(producto.id);
        
        if (knowledge) {
          knowledgeBase.push({
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
          
          generados++;
          console.log(`   ✅ Generado (${generados}/${productos.length})`);
        }
      } catch (error) {
        console.error(`   ❌ Error con ${producto.name}:`, error);
      }
    }

    // Guardar en archivo JSON
    const outputPath = 'base-conocimiento-productos.json';
    fs.writeFileSync(
      outputPath,
      JSON.stringify(knowledgeBase, null, 2),
      'utf-8'
    );

    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Base de conocimiento generada exitosamente`);
    console.log(`📄 Archivo: ${outputPath}`);
    console.log(`📊 Total de productos procesados: ${generados}/${productos.length}`);
    
    // Estadísticas por categoría
    const porCategoria = knowledgeBase.reduce((acc: any, k) => {
      acc[k.category] = (acc[k.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Productos por categoría:');
    Object.entries(porCategoria).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

    // Mostrar ejemplos
    console.log('\n📋 Ejemplos de conocimiento generado:\n');
    
    const ejemplos = knowledgeBase.slice(0, 3);
    ejemplos.forEach((k, i) => {
      console.log(`${i + 1}. ${k.productName}`);
      console.log(`   Descripción: ${k.shortDescription}`);
      console.log(`   Características: ${k.keyFeatures.length}`);
      console.log(`   Preguntas comunes: ${k.commonQuestions.length}`);
      console.log('');
    });

    console.log('🎯 El bot ahora puede dar asesoría informada sobre todos estos productos\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generarBaseConocimiento();
