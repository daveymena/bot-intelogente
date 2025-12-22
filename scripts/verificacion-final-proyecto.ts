/**
 * 🔍 VERIFICACIÓN FINAL DEL PROYECTO
 * Verifica que todo esté en orden antes de producción
 */

import { db } from '../src/lib/db';

async function verificacionFinal() {
  console.log('🔍 VERIFICACIÓN FINAL DEL PROYECTO\n');
  console.log('='.repeat(60));

  const problemas: string[] = [];
  const advertencias: string[] = [];

  try {
    // 1. VERIFICAR PRODUCTOS
    console.log('\n📦 VERIFICANDO PRODUCTOS...');
    
    const productos = await db.product.findMany({
      where: { status: 'AVAILABLE' }
    });

    console.log(`   Total productos disponibles: ${productos.length}`);

    // Verificar productos sin imagen
    const sinImagen = productos.filter(p => !p.imageUrl);
    if (sinImagen.length > 0) {
      advertencias.push(`${sinImagen.length} productos sin imagen`);
      console.log(`   ⚠️ ${sinImagen.length} productos sin imagen`);
    }

    // Verificar productos sin descripción
    const sinDescripcion = productos.filter(p => !p.description || p.description.length < 20);
    if (sinDescripcion.length > 0) {
      advertencias.push(`${sinDescripcion.length} productos sin descripción adecuada`);
      console.log(`   ⚠️ ${sinDescripcion.length} productos sin descripción`);
    }

    // Verificar productos sin subcategoría
    const sinSubcategoria = productos.filter(p => !p.subcategory);
    if (sinSubcategoria.length > 0) {
      advertencias.push(`${sinSubcategoria.length} productos sin subcategoría`);
      console.log(`   ⚠️ ${sinSubcategoria.length} productos sin subcategoría`);
    }

    // Verificar precios
    const preciosInvalidos = productos.filter(p => p.price <= 0);
    if (preciosInvalidos.length > 0) {
      problemas.push(`${preciosInvalidos.length} productos con precio inválido`);
      console.log(`   ❌ ${preciosInvalidos.length} productos con precio inválido`);
    }

    // Verificar duplicados
    const nombres = productos.map(p => p.name.toLowerCase().trim());
    const duplicados = nombres.filter((n, i) => nombres.indexOf(n) !== i);
    if (duplicados.length > 0) {
      problemas.push(`${duplicados.length} productos duplicados`);
      console.log(`   ❌ ${duplicados.length} productos duplicados`);
    }

    // 2. VERIFICAR VARIABLES DE ENTORNO
    console.log('\n🔐 VERIFICANDO VARIABLES DE ENTORNO...');

    const requiredEnvVars = [
      'DATABASE_URL',
      'GROQ_API_KEY',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        problemas.push(`Variable de entorno faltante: ${varName}`);
        console.log(`   ❌ ${varName} no configurada`);
      } else {
        console.log(`   ✅ ${varName} configurada`);
      }
    });

    // 3. VERIFICAR ARCHIVOS CRÍTICOS
    console.log('\n📁 VERIFICANDO ARCHIVOS CRÍTICOS...');

    const fs = require('fs');
    const path = require('path');

    const criticalFiles = [
      'src/lib/dynamic-product-intelligence.ts',
      'src/lib/response-formatter.ts',
      'src/lib/response-validator.ts',
      'src/lib/product-scorer.ts',
      'src/lib/greeting-detector.ts',
      'src/lib/intent-translator-service.ts',
      'src/lib/local-knowledge-base.ts',
      'src/lib/intelligent-conversation-engine.ts'
    ];

    criticalFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
      } else {
        problemas.push(`Archivo faltante: ${file}`);
        console.log(`   ❌ ${file} no encontrado`);
      }
    });

    // 4. VERIFICAR BASE DE CONOCIMIENTO
    console.log('\n🧠 VERIFICANDO BASE DE CONOCIMIENTO...');

    try {
      const conocimiento = await db.conversationKnowledge.count();
      console.log(`   ✅ ${conocimiento} entradas en base de conocimiento`);
      
      if (conocimiento === 0) {
        advertencias.push('Base de conocimiento vacía - se llenará con el uso');
      }
    } catch (error) {
      advertencias.push('Tabla conversationKnowledge no existe aún');
      console.log('   ⚠️ Tabla conversationKnowledge no existe (se creará automáticamente)');
    }

    // 5. VERIFICAR MEGAPACKS CRÍTICOS
    console.log('\n🎓 VERIFICANDO MEGAPACKS CRÍTICOS...');

    const megapacksCriticos = [
      'Mega Pack 01',
      'Mega Pack 03',
      'PACK COMPLETO'
    ];

    for (const nombre of megapacksCriticos) {
      const megapack = await db.product.findFirst({
        where: {
          name: { contains: nombre, mode: 'insensitive' }
        }
      });

      if (megapack) {
        console.log(`   ✅ ${nombre} encontrado`);
        
        // Verificar precio
        if (nombre.includes('COMPLETO') && megapack.price !== 60000) {
          advertencias.push(`${nombre}: Precio incorrecto (${megapack.price}, debe ser 60000)`);
        } else if (!nombre.includes('COMPLETO') && megapack.price !== 20000) {
          advertencias.push(`${nombre}: Precio incorrecto (${megapack.price}, debe ser 20000)`);
        }
      } else {
        problemas.push(`${nombre} no encontrado`);
        console.log(`   ❌ ${nombre} no encontrado`);
      }
    }

    // 6. RESUMEN FINAL
    console.log('\n\n📊 RESUMEN FINAL');
    console.log('='.repeat(60));

    if (problemas.length === 0 && advertencias.length === 0) {
      console.log('\n✅ TODO PERFECTO - Proyecto listo para producción\n');
      console.log('🚀 Puedes iniciar el bot con: npm run dev');
    } else {
      if (problemas.length > 0) {
        console.log('\n❌ PROBLEMAS CRÍTICOS:');
        problemas.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p}`);
        });
      }

      if (advertencias.length > 0) {
        console.log('\n⚠️ ADVERTENCIAS:');
        advertencias.forEach((a, i) => {
          console.log(`   ${i + 1}. ${a}`);
        });
      }

      if (problemas.length > 0) {
        console.log('\n❌ Corrige los problemas críticos antes de continuar');
      } else {
        console.log('\n✅ Puedes continuar - Las advertencias no son críticas');
      }
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error durante verificación:', error);
  } finally {
    await db.$disconnect();
  }
}

verificacionFinal();
