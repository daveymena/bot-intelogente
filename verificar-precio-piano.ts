/**
 * 🔍 VERIFICAR Y CORREGIR PRECIO DEL CURSO DE PIANO
 * Asegurar que el precio sea 60.000 COP como especificó el usuario
 */

import { db } from './src/lib/db';

async function verificarPrecioPiano() {
  console.log('🎹 VERIFICANDO PRECIO DEL CURSO DE PIANO\n');

  try {
    // Buscar productos que contengan "piano" en el nombre
    const productosPiano = await db.product.findMany({
      where: {
        AND: [
          { status: 'AVAILABLE' },
          { category: 'DIGITAL' },
          {
            OR: [
              { name: { contains: 'piano' } },
              { name: { contains: 'PIANO' } },
              { name: { contains: 'Piano' } }
            ]
          }
        ]
      }
    });

    console.log(`📊 Encontrados ${productosPiano.length} productos con "piano":\n`);

    productosPiano.forEach((producto, index) => {
      console.log(`${index + 1}. ${producto.name}`);
      console.log(`   ID: ${producto.id}`);
      console.log(`   Precio actual: ${producto.price} COP`);
      console.log(`   Precio formateado: ${producto.price.toLocaleString('es-CO')} COP`);
      console.log(`   Estado: ${producto.status}`);
      console.log(`   Categoría: ${producto.category}`);
      console.log('');
    });

    // Verificar si algún producto tiene precio diferente a 60.000
    const precioCorrecto = 60000;
    const productosIncorrectos = productosPiano.filter(p => p.price !== precioCorrecto);

    if (productosIncorrectos.length > 0) {
      console.log('⚠️  PRODUCTOS CON PRECIO INCORRECTO ENCONTRADOS:');
      console.log('Corrigiendo precios...\n');

      for (const producto of productosIncorrectos) {
        await db.product.update({
          where: { id: producto.id },
          data: { price: precioCorrecto }
        });

        console.log(`✅ Corregido: ${producto.name}`);
        console.log(`   Precio anterior: ${producto.price} → Nuevo precio: ${precioCorrecto}`);
      }

      console.log('\n🎉 TODOS LOS PRECIOS CORREGIDOS!');
    } else {
      console.log('✅ TODOS LOS PRODUCTOS TIENEN EL PRECIO CORRECTO (60.000 COP)');
    }

    // Verificación final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    const productosVerificados = await db.product.findMany({
      where: {
        AND: [
          { status: 'AVAILABLE' },
          { category: 'DIGITAL' },
          {
            OR: [
              { name: { contains: 'piano' } },
              { name: { contains: 'PIANO' } },
              { name: { contains: 'Piano' } }
            ]
          }
        ]
      }
    });

    productosVerificados.forEach(producto => {
      console.log(`✅ ${producto.name}: ${producto.price.toLocaleString('es-CO')} COP`);
    });

  } catch (error) {
    console.error('❌ Error verificando precios:', error);
  }
}

// Ejecutar verificación
verificarPrecioPiano();