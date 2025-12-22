/**
 * Script para entrenar el sistema de mapeo semántico
 * Guarda ejemplos en la base de conocimiento local
 */

import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';
import { SemanticProductMapper } from '../src/lib/semantic-product-mapper';
import { db } from '../src/lib/db';

async function entrenarMapeoSemantico() {
  console.log('🧠 ENTRENANDO SISTEMA DE MAPEO SEMÁNTICO\n');
  console.log('='.repeat(60));

  // Ejemplos de entrenamiento
  const ejemplos = [
    {
      query: 'curso de inglés',
      expectedProduct: 'Mega Pack 03: Cursos Inglés',
      response: '¡Perfecto! 😊 El Mega Pack 03 incluye cursos completos de inglés.\n\n✨ **Beneficio adicional:** No solo inglés básico, sino desde principiante hasta avanzado, con pronunciación, gramática y conversación.\n\n💰 Precio: $20.000 COP\n🎓 Acceso de por vida\n\n¿Te gustaría más información? 😄'
    },
    {
      query: 'curso de diseño gráfico',
      expectedProduct: 'Mega Pack 01: Cursos Diseño Gráfico',
      response: '¡Perfecto! 😊 El Mega Pack 01 es especializado en diseño gráfico profesional.\n\n✨ **Beneficio adicional:** Photoshop, Illustrator, InDesign, técnicas profesionales, diseño de logos, branding y más.\n\n💰 Precio: $20.000 COP\n🎓 Acceso de por vida\n\n¿Te gustaría más información? 😄'
    },
    {
      query: 'quiero aprender a programar',
      expectedProduct: 'Mega Pack 02: Cursos Programación Web',
      response: '¡Perfecto! 😊 El Mega Pack 02 cubre programación web completa.\n\n✨ **Beneficio adicional:** HTML, CSS, JavaScript, React, Node.js, Python, PHP, bases de datos. De principiante a avanzado.\n\n💰 Precio: $20.000 COP\n🎓 Acceso de por vida\n\n¿Te gustaría más información? 😄'
    },
    {
      query: 'curso de marketing digital',
      expectedProduct: 'Mega Pack 03: Cursos Marketing Digital',
      response: '¡Perfecto! 😊 El Mega Pack 03 especializado en marketing digital.\n\n✨ **Beneficio adicional:** SEO, SEM, Facebook Ads, Instagram Marketing, Google Ads, email marketing, copywriting y analítica.\n\n💰 Precio: $20.000 COP\n🎓 Acceso de por vida\n\n¿Te gustaría más información? 😄'
    },
    {
      query: 'necesito aprender excel',
      expectedProduct: 'Mega Pack 05: Cursos Excel y Office',
      response: '¡Perfecto! 😊 El Mega Pack 05 domina Excel y Office completo.\n\n✨ **Beneficio adicional:** Excel avanzado, macros, Word profesional, PowerPoint impactante, Access y más.\n\n💰 Precio: $20.000 COP\n🎓 Acceso de por vida\n\n¿Te gustaría más información? 😄'
    },
    {
      query: 'curso de edición de video',
      expectedProduct: 'Mega Pack 04: Cursos Edición de Video',
      response: '¡Perfecto! 😊 El Mega Pack 04 para edición de video profesional.\n\n✨ **Beneficio adicional:** Premiere Pro, After Effects, DaVinci Resolve, efectos especiales, motion graphics.\n\n💰 Precio: $20.000 COP\n🎓 Acceso de por vida\n\n¿Te gustaría más información? 😄'
    },
    {
      query: 'quiero todos los cursos',
      expectedProduct: 'PACK COMPLETO 40 Mega Packs',
      response: '¡Perfecto! 😊 El PACK COMPLETO incluye TODOS los 40 Mega Packs.\n\n✨ **Beneficio adicional:** Acceso a TODO el catálogo. Ahorro de $740.000 COP. Más de 5000 cursos en todas las áreas.\n\n💰 Precio: $60.000 COP\n🎓 Acceso de por vida\n\n¿Te gustaría más información? 😄'
    }
  ];

  console.log(`\n📚 Entrenando con ${ejemplos.length} ejemplos...\n`);

  for (const ejemplo of ejemplos) {
    console.log(`\n🔍 Consulta: "${ejemplo.query}"`);
    
    // Verificar mapeo
    const mapping = SemanticProductMapper.findBestMatch(ejemplo.query);
    
    if (mapping) {
      console.log(`   ✅ Mapeado a: ${mapping.productName}`);
      console.log(`   💡 ${mapping.explanation}`);
      
      // Buscar el producto en la BD
      const product = await db.product.findFirst({
        where: {
          name: {
            contains: mapping.productName.split(':')[0].trim(),
            mode: 'insensitive'
          }
        }
      });

      if (product) {
        console.log(`   📦 Producto encontrado en BD: ${product.name}`);
        
        // Guardar en base de conocimiento
        await LocalKnowledgeBase.saveSuccessfulResponse({
          userQuery: ejemplo.query,
          botResponse: ejemplo.response,
          productId: product.id,
          productName: product.name,
          confidence: 0.95
        });
        
        console.log(`   💾 Guardado en base de conocimiento`);
      } else {
        console.log(`   ⚠️ Producto no encontrado en BD`);
      }
    } else {
      console.log(`   ❌ No se encontró mapeo`);
    }
  }

  console.log('\n\n✅ ENTRENAMIENTO COMPLETADO');
  console.log('='.repeat(60));
  console.log('\n📊 Estadísticas:');
  
  const stats = await LocalKnowledgeBase.getStats();
  console.log(`   Total entradas: ${stats.totalEntries}`);
  console.log(`   Tasa de éxito promedio: ${(stats.avgSuccessRate * 100).toFixed(1)}%`);
  console.log(`   Total usos: ${stats.totalUsage}`);

  await db.$disconnect();
}

entrenarMapeoSemantico();
